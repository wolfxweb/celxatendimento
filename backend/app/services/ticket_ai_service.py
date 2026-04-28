"""
AI response generation for tickets.
"""

import io
import json
import os
from datetime import datetime

import httpx
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decrypt_api_key
from app.database import AsyncSessionLocal
from app.models.company_ai_config import CompanyAIConfig
from app.models.ticket import Ticket
from app.models.ticket_attachment import TicketAttachment
from app.models.ticket_ai_response import TicketAIResponse
from app.models.user import User
from app.services.rag_service import RAGService
from app.ai.callbacks import get_langfuse_callbacks, get_langfuse_client

LEGACY_LLM_MODEL_REPLACEMENTS = {
    "google/gemini-1.5-flash": "google/gemini-2.5-flash-lite",
    "google/gemini-1.5-flash-8b": "google/gemini-2.5-flash-lite",
    "google/gemini-2.0-flash-exp": "google/gemini-2.5-flash-lite",
}


def _json_text(data: dict) -> str:
    return json.dumps(data, ensure_ascii=False)


def parse_json_text(value):
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return {}
    return value or {}


def _extract_attachment_text(filename: str, content: bytes) -> str:
    ext = os.path.splitext(filename)[1].lower()

    if ext in {".txt", ".md"}:
        return content.decode("utf-8", errors="replace").strip()

    if ext == ".docx":
        from docx import Document

        document = Document(io.BytesIO(content))
        return "\n".join(p.text for p in document.paragraphs if p.text.strip()).strip()

    if ext == ".pdf":
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages).strip()

    return ""


async def _load_ticket_attachment_context(
    db: AsyncSession,
    ticket_id: int,
) -> list[dict]:
    result = await db.execute(
        select(TicketAttachment).where(
            and_(
                TicketAttachment.ticket_id == ticket_id,
                TicketAttachment.is_active == True,
                TicketAttachment.deleted_at.is_(None),
            )
        )
    )
    attachments = result.scalars().all()
    extracted = []

    for attachment in attachments:
        ext = os.path.splitext(attachment.original_filename)[1].lower()
        if ext not in {".txt", ".md", ".pdf", ".docx"}:
            continue

        try:
            with open(attachment.storage_path, "rb") as file:
                content = file.read()
            text = _extract_attachment_text(attachment.original_filename, content)
        except Exception as exc:
            extracted.append(
                {
                    "id": attachment.id,
                    "filename": attachment.original_filename,
                    "mime_type": attachment.mime_type,
                    "content": "",
                    "error": str(exc),
                }
            )
            continue

        if text:
            extracted.append(
                {
                    "id": attachment.id,
                    "filename": attachment.original_filename,
                    "mime_type": attachment.mime_type,
                    "content": text[:12000],
                }
            )

    return extracted


def _build_prompt(
    ticket: Ticket,
    customer: User | None,
    system_prompt: str,
    rag_sources: list[dict],
    attachment_context: list[dict],
) -> str:
    context = "Nenhuma informação relevante encontrada na base de conhecimento."
    if rag_sources:
        context = "\n\n".join(
            f"[{index}] {source['title']}\n{source['content']}"
            for index, source in enumerate(rag_sources, start=1)
        )

    customer_name = customer.full_name if customer else "Cliente"
    customer_email = customer.email if customer else ""
    attachments = "Nenhum anexo de texto/PDF com conteúdo extraído."
    if attachment_context:
        attachments = "\n\n".join(
            (
                f"Anexo: {attachment['filename']}\n"
                f"{attachment.get('content') or 'Não foi possível extrair conteúdo deste anexo.'}"
            )
            for attachment in attachment_context
        )

    return f"""
{system_prompt}

Você é um agente de atendimento. Gere uma resposta para o cliente, mas ela será revisada por um atendente antes do envio.

Cliente: {customer_name}
Email: {customer_email}
Assunto do chamado: {ticket.subject}
Descrição do chamado:
{ticket.description}

Prioridade: {ticket.priority}

Base de conhecimento:
{context}

Anexos do chamado:
{attachments}

Instruções:
- Responda em português brasileiro.
- Seja profissional, claro e útil.
- Use a base de conhecimento e os anexos quando trouxerem informações aplicáveis.
- Se houver conflito entre a descrição e os anexos, mencione que precisa de confirmação.
- Não diga que a resposta já foi enviada ou aprovada.
- Se faltarem informações, peça objetivamente o que é necessário.
""".strip()


async def _call_openrouter_chat(
    api_key: str,
    model: str,
    temperature: float,
    prompt: str,
    callbacks: list = None,
    trace_metadata: dict | None = None,
) -> tuple[str, int]:
    start = datetime.now()

    async with httpx.AsyncClient(timeout=90) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
            },
        )

    if response.status_code >= 400:
        try:
            detail = response.json()
        except ValueError:
            detail = response.text
        raise ValueError(f"OpenRouter retornou {response.status_code}: {detail}")

    payload = response.json()
    content = (
        payload.get("choices", [{}])[0]
        .get("message", {})
        .get("content")
    )
    if not content:
        raise ValueError("OpenRouter não retornou conteúdo para a resposta")

    processing_time_ms = int((datetime.now() - start).total_seconds() * 1000)
    langfuse = get_langfuse_client()
    if langfuse:
        try:
            trace = langfuse.trace(
                name="ticket-ai-response",
                metadata=trace_metadata or {},
            )
            trace.generation(
                name="openrouter-chat-completion",
                model=model,
                input=prompt,
                output=content,
                model_parameters={"temperature": temperature},
            )
            langfuse.flush()
        except Exception:
            pass

    return content.strip(), processing_time_ms


async def generate_pending_ai_response(
    db: AsyncSession,
    ticket_id: int,
    replace_pending: bool = False,
) -> dict:
    ticket_result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = ticket_result.scalar_one_or_none()
    if not ticket:
        return {"status": "error", "message": "Ticket not found"}

    config_result = await db.execute(
        select(CompanyAIConfig).where(
            and_(
                CompanyAIConfig.company_id == ticket.company_id,
                CompanyAIConfig.is_active == True,
            )
        )
    )
    ai_config = config_result.scalar_one_or_none()
    if not ai_config or not ai_config.api_key_is_set or not ai_config.api_key_encrypted:
        return {"status": "error", "message": "AI not configured"}

    llm_model = LEGACY_LLM_MODEL_REPLACEMENTS.get(
        ai_config.llm_model,
        ai_config.llm_model,
    )
    if llm_model != ai_config.llm_model:
        ai_config.llm_model = llm_model
        await db.commit()

    existing_result = await db.execute(
        select(TicketAIResponse).where(
            and_(
                TicketAIResponse.ticket_id == ticket.id,
                TicketAIResponse.status == "pending",
            )
        )
    )
    existing_response = existing_result.scalar_one_or_none()
    if existing_response and not replace_pending:
        return {"status": "skipped", "message": "Pending AI response already exists"}
    if existing_response and replace_pending:
        await db.delete(existing_response)
        await db.flush()

    customer_result = await db.execute(select(User).where(User.id == ticket.user_id))
    customer = customer_result.scalar_one_or_none()

    ticket.status = "pending_ai"
    await db.commit()

    rag_service = RAGService(db)
    rag_sources = await rag_service.search_similar(
        company_id=ticket.company_id,
        query=f"{ticket.subject} {ticket.description}",
        top_k=5,
    )
    attachment_context = await _load_ticket_attachment_context(db, ticket.id)

    api_key = decrypt_api_key(ai_config.api_key_encrypted)
    prompt = _build_prompt(
        ticket=ticket,
        customer=customer,
        system_prompt=ai_config.system_prompt,
        rag_sources=rag_sources,
        attachment_context=attachment_context,
    )

    try:
        langfuse_callbacks = get_langfuse_callbacks()
        response_text, processing_time_ms = await _call_openrouter_chat(
            api_key=api_key,
            model=llm_model,
            temperature=ai_config.temperature,
            prompt=prompt,
            callbacks=langfuse_callbacks,
            trace_metadata={
                "ticket_id": ticket.id,
                "ticket_number": ticket.ticket_number,
                "company_id": ticket.company_id,
                "category_id": ticket.category_id,
                "priority": ticket.priority,
            },
        )

        ai_response = TicketAIResponse(
            ticket_id=ticket.id,
            response_text=response_text,
            context_used=_json_text(
                {
                    "rag_sources": rag_sources,
                    "attachments": attachment_context,
                    "ticket_subject": ticket.subject,
                    "ticket_category": ticket.category_id,
                }
            ),
            config_snapshot=_json_text(
                {
                    "model": llm_model,
                    "temperature": ai_config.temperature,
                    "autonomy_level": ai_config.autonomy_level,
                    "tools_used": ["rag"],
                }
            ),
            generated_at=datetime.now(),
            processing_time_ms=processing_time_ms,
            status="pending",
        )
        db.add(ai_response)
        await db.commit()
        await db.refresh(ai_response)

        return {
            "status": "pending_approval",
            "ai_response_id": ai_response.id,
            "processing_time_ms": processing_time_ms,
        }
    except Exception as exc:
        ticket.status = "open"
        await db.commit()
        return {"status": "error", "message": str(exc)}


async def generate_pending_ai_response_background(
    ticket_id: int,
    replace_pending: bool = False,
) -> None:
    async with AsyncSessionLocal() as db:
        await generate_pending_ai_response(db, ticket_id, replace_pending=replace_pending)
