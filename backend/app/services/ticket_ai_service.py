"""
AI response generation for tickets.
"""

import json
from datetime import datetime

import httpx
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decrypt_api_key
from app.database import AsyncSessionLocal
from app.models.company_ai_config import CompanyAIConfig
from app.models.ticket import Ticket
from app.models.ticket_ai_response import TicketAIResponse
from app.models.user import User
from app.services.rag_service import RAGService


def _json_text(data: dict) -> str:
    return json.dumps(data, ensure_ascii=False)


def parse_json_text(value):
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return {}
    return value or {}


def _build_prompt(
    ticket: Ticket,
    customer: User | None,
    system_prompt: str,
    rag_sources: list[dict],
) -> str:
    context = "Nenhuma informação relevante encontrada na base de conhecimento."
    if rag_sources:
        context = "\n\n".join(
            f"[{index}] {source['title']}\n{source['content']}"
            for index, source in enumerate(rag_sources, start=1)
        )

    customer_name = customer.full_name if customer else "Cliente"
    customer_email = customer.email if customer else ""

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

Instruções:
- Responda em português brasileiro.
- Seja profissional, claro e útil.
- Use a base de conhecimento quando ela trouxer uma solução aplicável.
- Não diga que a resposta já foi enviada ou aprovada.
- Se faltarem informações, peça objetivamente o que é necessário.
""".strip()


async def _call_openrouter_chat(
    api_key: str,
    model: str,
    temperature: float,
    prompt: str,
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
    return content.strip(), processing_time_ms


async def generate_pending_ai_response(
    db: AsyncSession,
    ticket_id: int,
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

    existing_result = await db.execute(
        select(TicketAIResponse).where(
            and_(
                TicketAIResponse.ticket_id == ticket.id,
                TicketAIResponse.status == "pending",
            )
        )
    )
    if existing_result.scalar_one_or_none():
        return {"status": "skipped", "message": "Pending AI response already exists"}

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

    api_key = decrypt_api_key(ai_config.api_key_encrypted)
    prompt = _build_prompt(
        ticket=ticket,
        customer=customer,
        system_prompt=ai_config.system_prompt,
        rag_sources=rag_sources,
    )

    try:
        response_text, processing_time_ms = await _call_openrouter_chat(
            api_key=api_key,
            model=ai_config.llm_model,
            temperature=ai_config.temperature,
            prompt=prompt,
        )

        ai_response = TicketAIResponse(
            ticket_id=ticket.id,
            response_text=response_text,
            context_used=_json_text(
                {
                    "rag_sources": rag_sources,
                    "ticket_subject": ticket.subject,
                    "ticket_category": ticket.category_id,
                }
            ),
            config_snapshot=_json_text(
                {
                    "model": ai_config.llm_model,
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


async def generate_pending_ai_response_background(ticket_id: int) -> None:
    async with AsyncSessionLocal() as db:
        await generate_pending_ai_response(db, ticket_id)
