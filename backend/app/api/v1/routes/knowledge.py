import os
from typing import Optional, List
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import select, and_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.knowledge_base import KnowledgeBase
from app.models.user import User
from app.services.ai_config_service import AIConfigService
from app.services.rag_service import RAGService

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

ALLOWED_KNOWLEDGE_EXTENSIONS = {".pdf", ".txt", ".md", ".docx"}
MAX_KNOWLEDGE_FILE_SIZE = 10 * 1024 * 1024


class KnowledgeCreate(BaseModel):
    title: str
    content: str
    source_type: str = "text"
    source_url: Optional[str] = None


class KnowledgeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_active: Optional[bool] = None


def _validate_knowledge_file(filename: str, size: int) -> None:
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_KNOWLEDGE_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_KNOWLEDGE_EXTENSIONS))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Extensão {ext or '(sem extensão)'} não permitida. Permitidas: {allowed}",
        )

    if size > MAX_KNOWLEDGE_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo excede o limite de 10MB",
        )


def _extract_text_from_upload(filename: str, content: bytes) -> str:
    ext = os.path.splitext(filename)[1].lower()

    if ext in {".txt", ".md"}:
        return content.decode("utf-8", errors="replace").strip()

    if ext == ".docx":
        import io
        from docx import Document

        document = Document(io.BytesIO(content))
        return "\n".join(p.text for p in document.paragraphs if p.text.strip()).strip()

    if ext == ".pdf":
        try:
            import io
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages).strip()
        except ImportError:
            return ""

    return ""


def _save_knowledge_file(company_id: int, filename: str, content: bytes) -> str:
    safe_filename = os.path.basename(filename)
    unique_filename = f"{uuid.uuid4()}_{safe_filename}"
    upload_dir = os.path.join(
        os.getenv("ATTACHMENTS_UPLOAD_PATH", "./uploads"),
        str(company_id),
        "knowledge",
    )
    os.makedirs(upload_dir, exist_ok=True)

    filepath = os.path.join(upload_dir, unique_filename)
    with open(filepath, "wb") as f:
        f.write(content)

    return filepath


@router.get("/status/indexing")
async def get_indexing_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get indexing status for all articles"""

    company_id = current_user.company_id
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    rag_service = RAGService(db)
    try:
        status = await rag_service.get_indexing_status(company_id)
    except SQLAlchemyError:
        await db.rollback()
        status = {"total": 0, "indexed": 0, "pending": 0, "errors": 0}

    return status


@router.get("", response_model=List[dict], include_in_schema=False)
@router.get("/", response_model=List[dict])
async def list_articles(
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all knowledge base articles for the user's company"""

    company_id = current_user.company_id
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    rag_service = RAGService(db)
    try:
        articles = await rag_service.get_articles_by_company(company_id, include_inactive)
    except SQLAlchemyError:
        await db.rollback()
        articles = []

    return [
        {
            "id": a.id,
            "title": a.title,
            "content": a.content,
            "source_type": a.source_type,
            "source_url": a.source_url,
            "original_filename": a.original_filename,
            "is_active": a.is_active,
            "is_indexed": a.is_indexed,
            "index_error": a.index_error,
            "last_indexed_at": a.last_indexed_at,
            "created_at": a.created_at,
            "updated_at": a.updated_at,
        }
        for a in articles
    ]


@router.post("", status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_article(
    article_data: KnowledgeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new knowledge base article"""

    # Only admins can create articles
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create knowledge base articles",
        )

    company_id = current_user.company_id
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    rag_service = RAGService(db)
    article = await rag_service.create_article(
        company_id=company_id,
        title=article_data.title,
        content=article_data.content,
        source_type=article_data.source_type,
        source_url=article_data.source_url,
    )

    return {"id": article.id, "message": "Article created successfully"}


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_article_file(
    title: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a knowledge base article from an uploaded file"""

    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create knowledge base articles",
        )

    company_id = current_user.company_id
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    filename = file.filename or "arquivo"
    content = await file.read()
    _validate_knowledge_file(filename, len(content))

    extracted_text = _extract_text_from_upload(filename, content)
    if not extracted_text:
        extracted_text = (
            f"Arquivo anexado: {filename}\n\n"
            "Não foi possível extrair texto automaticamente deste arquivo."
        )

    storage_path = _save_knowledge_file(company_id, filename, content)
    ext = os.path.splitext(filename)[1].lower().lstrip(".") or "file"
    source_type = "pdf" if ext == "pdf" else "text" if ext in {"txt", "md"} else "file"

    rag_service = RAGService(db)
    article = await rag_service.create_article(
        company_id=company_id,
        title=title or os.path.splitext(filename)[0],
        content=extracted_text,
        source_type=source_type,
        metadata={"storage_path": storage_path},
    )
    article.original_filename = filename
    await db.commit()
    await db.refresh(article)

    return {"id": article.id, "message": "Arquivo adicionado à base de conhecimento"}


@router.get("/{article_id}")
async def get_article(
    article_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific article"""

    rag_service = RAGService(db)
    article = await rag_service.get_article(article_id)

    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    # Check company access
    if article.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    return {
        "id": article.id,
        "title": article.title,
        "content": article.content,
        "source_type": article.source_type,
        "source_url": article.source_url,
        "original_filename": article.original_filename,
        "is_active": article.is_active,
        "is_indexed": article.is_indexed,
        "index_error": article.index_error,
        "last_indexed_at": article.last_indexed_at,
        "created_at": article.created_at,
        "updated_at": article.updated_at,
    }


@router.post("/{article_id}/embedding/recreate")
async def recreate_article_embedding(
    article_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create or recreate the embedding for a knowledge base article"""

    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can recreate knowledge base embeddings",
        )

    company_id = current_user.company_id
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    rag_service = RAGService(db)
    article = await rag_service.get_article(article_id)

    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    if article.company_id != company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    ai_config_service = AIConfigService(db)
    ai_config = await ai_config_service.get_or_create_config(company_id)

    try:
        article = await rag_service.recreate_embedding(article_id, ai_config)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Erro ao criar embedding: {str(exc)}",
        )

    return {
        "id": article.id,
        "message": "Embedding recriado com sucesso",
        "is_indexed": article.is_indexed,
        "last_indexed_at": article.last_indexed_at,
    }


@router.post("/embeddings/recreate")
async def recreate_company_embeddings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create or recreate embeddings for all active company articles"""

    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can recreate knowledge base embeddings",
        )

    company_id = current_user.company_id
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    ai_config_service = AIConfigService(db)
    ai_config = await ai_config_service.get_or_create_config(company_id)

    rag_service = RAGService(db)
    result = await rag_service.recreate_embeddings_for_company(company_id, ai_config)

    return {
        "message": (
            f"Embeddings processados: {result['recreated']} criados/recriados"
            f" e {result['failed']} com erro"
        ),
        **result,
    }


@router.put("/{article_id}")
async def update_article(
    article_id: int,
    article_data: KnowledgeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update an article"""

    # Only admins can update articles
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update knowledge base articles",
        )

    rag_service = RAGService(db)
    article = await rag_service.update_article(
        article_id=article_id,
        title=article_data.title,
        content=article_data.content,
        is_active=article_data.is_active,
    )

    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    return {"message": "Article updated successfully"}


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete an article (soft delete)"""

    # Only admins can delete articles
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete knowledge base articles",
        )

    rag_service = RAGService(db)
    success = await rag_service.delete_article(article_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )
