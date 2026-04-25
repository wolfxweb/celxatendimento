"""
RAG Service for Knowledge Base management and search
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.knowledge_base import KnowledgeBase


class RAGService:
    """Service for managing knowledge base and RAG operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_article(
        self,
        company_id: uuid.UUID,
        title: str,
        content: str,
        source_type: str = "text",
        source_url: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> KnowledgeBase:
        """Create a new knowledge base article"""

        article = KnowledgeBase(
            company_id=company_id,
            title=title,
            content=content,
            source_type=source_type,
            source_url=source_url,
            metadata=metadata or {},
            is_active=True,
            is_indexed=False,
        )

        self.db.add(article)
        await self.db.commit()
        await self.db.refresh(article)

        return article

    async def create_from_pdf(
        self,
        company_id: uuid.UUID,
        title: str,
        content: str,
        original_filename: str,
    ) -> KnowledgeBase:
        """Create a knowledge base entry from PDF content"""

        article = KnowledgeBase(
            company_id=company_id,
            title=title,
            content=content,
            source_type="pdf",
            original_filename=original_filename,
            is_active=True,
            is_indexed=False,
        )

        self.db.add(article)
        await self.db.commit()
        await self.db.refresh(article)

        return article

    async def get_article(self, article_id: int) -> Optional[KnowledgeBase]:
        """Get a knowledge base article by ID"""
        result = await self.db.execute(
            select(KnowledgeBase).where(KnowledgeBase.id == article_id)
        )
        return result.scalar_one_or_none()

    async def get_articles_by_company(
        self,
        company_id: uuid.UUID,
        include_inactive: bool = False,
    ) -> list[KnowledgeBase]:
        """Get all articles for a company"""

        query = select(KnowledgeBase).where(KnowledgeBase.company_id == company_id)

        if not include_inactive:
            query = query.where(KnowledgeBase.is_active == True)

        query = query.order_by(KnowledgeBase.created_at.desc())

        result = await self.db.execute(query)
        return result.scalars().all()

    async def update_article(
        self,
        article_id: int,
        title: Optional[str] = None,
        content: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Optional[KnowledgeBase]:
        """Update a knowledge base article"""

        article = await self.get_article(article_id)
        if not article:
            return None

        if title is not None:
            article.title = title
        if content is not None:
            article.content = content
            # Mark as needing re-indexing
            article.is_indexed = False
        if is_active is not None:
            article.is_active = is_active

        await self.db.commit()
        await self.db.refresh(article)

        return article

    async def delete_article(self, article_id: int) -> bool:
        """Soft delete a knowledge base article"""

        article = await self.get_article(article_id)
        if not article:
            return False

        article.deleted_at = datetime.now()
        article.is_active = False

        await self.db.commit()
        return True

    async def search_similar(
        self,
        company_id: uuid.UUID,
        query: str,
        top_k: int = 5,
    ) -> list[dict]:
        """
        Search for similar articles using embeddings

        In production, this would use pgvector or a vector database.
        For now, we do simple text matching.
        """

        # Get all active articles for company
        articles = await self.get_articles_by_company(
            company_id, include_inactive=False
        )

        results = []
        query_lower = query.lower()

        for article in articles:
            # Simple scoring based on keyword matching
            score = 0
            title_words = article.title.lower().split()
            content_words = article.content.lower().split()
            query_words = query_lower.split()

            # Title match (higher weight)
            for word in query_words:
                if word in title_words:
                    score += 2

            # Content match
            for word in query_words:
                if word in content_words:
                    score += 1

            # Partial match bonus
            if any(word in article.title.lower() for word in query_words):
                score += 0.5

            if score > 0:
                results.append(
                    {
                        "id": article.id,
                        "title": article.title,
                        "content": article.content[:500] + "..."
                        if len(article.content) > 500
                        else article.content,
                        "score": score,
                        "source_type": article.source_type,
                    }
                )

        # Sort by score and return top_k
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    async def mark_as_indexed(self, article_id: int) -> bool:
        """Mark an article as indexed in the vector store"""

        article = await self.get_article(article_id)
        if not article:
            return False

        article.is_indexed = True
        article.last_indexed_at = datetime.now()
        article.index_error = None

        await self.db.commit()
        return True

    async def mark_indexing_failed(
        self,
        article_id: int,
        error: str,
    ) -> bool:
        """Mark an article as failed indexing"""

        article = await self.get_article(article_id)
        if not article:
            return False

        article.index_error = error
        article.last_indexed_at = datetime.now()

        await self.db.commit()
        return True

    async def get_indexing_status(self, company_id: uuid.UUID) -> dict:
        """Get indexing status for all articles"""

        articles = await self.get_articles_by_company(
            company_id, include_inactive=False
        )

        total = len(articles)
        indexed = sum(1 for a in articles if a.is_indexed)
        pending = sum(1 for a in articles if not a.is_indexed and not a.index_error)
        failed = sum(1 for a in articles if a.index_error)

        return {
            "total": total,
            "indexed": indexed,
            "pending": pending,
            "failed": failed,
            "articles": [
                {
                    "id": a.id,
                    "title": a.title,
                    "is_indexed": a.is_indexed,
                    "last_indexed_at": a.last_indexed_at,
                    "index_error": a.index_error,
                }
                for a in articles
            ],
        }
