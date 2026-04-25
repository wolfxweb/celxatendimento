from typing import Optional, List
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.knowledge_base import KnowledgeBase
from app.models.user import User
from app.services.rag_service import RAGService

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


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
    title: str,
    content: str,
    source_type: str = "text",
    source_url: Optional[str] = None,
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
        title=title,
        content=content,
        source_type=source_type,
        source_url=source_url,
    )

    return {"id": article.id, "message": "Article created successfully"}


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


@router.put("/{article_id}")
async def update_article(
    article_id: int,
    title: Optional[str] = None,
    content: Optional[str] = None,
    is_active: Optional[bool] = None,
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
        title=title,
        content=content,
        is_active=is_active,
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
