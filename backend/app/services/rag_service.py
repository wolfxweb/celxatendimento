"""
RAG Service for Knowledge Base management and search
"""

import json
import re
import uuid
from datetime import datetime
from typing import Optional

import httpx
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decrypt_api_key
from app.models.company_ai_config import CompanyAIConfig
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
            extra_data=json.dumps(metadata or {}),
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
        Search for similar articles using embeddings (vector similarity)
        Falls back to keyword matching if embeddings not available.
        """

        # First, try to use embeddings if available
        articles = await self.get_articles_by_company(
            company_id, include_inactive=False
        )

        # Get articles that have embeddings
        articles_with_embeddings = [
            a for a in articles if a.embedding and a.is_indexed
        ]
        semantic_results = []

        if articles_with_embeddings and articles_with_embeddings[0].embedding:
            # Get embedding model from company config
            from app.services.ai_config_service import AIConfigService
            ai_service = AIConfigService(self.db)
            ai_config = await ai_service.get_or_create_config(
                int(company_id) if isinstance(company_id, uuid.UUID) else company_id
            )

            if ai_config and ai_config.api_key_is_set and ai_config.api_key_encrypted:
                from app.core.security import decrypt_api_key
                api_key = decrypt_api_key(ai_config.api_key_encrypted)
                model = ai_config.embedding_model or "text-embedding-3-small"

                # Generate query embedding
                try:
                    async with httpx.AsyncClient(timeout=60) as client:
                        response = await client.post(
                            "https://openrouter.ai/api/v1/embeddings",
                            headers={
                                "Authorization": f"Bearer {api_key}",
                                "Content-Type": "application/json",
                            },
                            json={
                                "model": model,
                                "input": query,
                            },
                        )

                    if response.status_code == 200:
                        payload = response.json()
                        query_embedding = payload.get("data", [{}])[0].get("embedding")

                        if query_embedding:
                            # Calculate cosine similarity for all articles
                            results_with_scores = []
                            for article in articles_with_embeddings:
                                try:
                                    article_embedding = json.loads(article.embedding)
                                    similarity = self._cosine_similarity(
                                        query_embedding, article_embedding
                                    )
                                    results_with_scores.append({
                                        "article": article,
                                        "score": similarity,
                                    })
                                except (json.JSONDecodeError, TypeError):
                                    continue

                            # Sort by similarity
                            results_with_scores.sort(key=lambda x: x["score"], reverse=True)

                            # Return top_k semantic results
                            for item in results_with_scores[:top_k]:
                                article = item["article"]
                                semantic_results.append(
                                    self._format_search_result(
                                        article=article,
                                        query=query,
                                        score=round(item["score"], 3),
                                    )
                                )
                except Exception:
                    # Fall back to keyword search on error
                    pass

        # Fallback: Simple keyword matching
        keyword_results = []
        indexed_article_ids = {article.id for article in articles_with_embeddings}
        query_lower = query.lower()

        for article in articles:
            if semantic_results and article.id in indexed_article_ids:
                continue

            # Simple scoring based on keyword matching
            score = 0
            title_words = article.title.lower().split()
            filename = (article.original_filename or "").lower()
            filename_words = filename.replace("_", " ").replace("-", " ").split()
            content_words = article.content.lower().split()
            query_words = query_lower.split()

            # Title match (higher weight)
            for word in query_words:
                if word in title_words:
                    score += 2
                if word in filename_words:
                    score += 2

            # Content match
            for word in query_words:
                if word in content_words:
                    score += 1

            # Partial match bonus
            if any(word in article.title.lower() for word in query_words):
                score += 0.5
            if any(word in filename for word in query_words):
                score += 0.5

            if score > 0:
                keyword_results.append(
                    self._format_search_result(
                        article=article,
                        query=query,
                        score=score,
                    )
                )

        if semantic_results:
            return (semantic_results + keyword_results)[:top_k]

        merged_results = {}
        for result in semantic_results + keyword_results:
            current = merged_results.get(result["id"])
            if not current or result["score"] > current["score"]:
                merged_results[result["id"]] = result

        results = list(merged_results.values())
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def _format_search_result(
        self,
        *,
        article: KnowledgeBase,
        query: str,
        score: float,
    ) -> dict:
        return {
            "id": article.id,
            "title": article.title,
            "content": self._extract_relevant_snippet(article.content or "", query),
            "score": score,
            "source_type": article.source_type,
            "original_filename": article.original_filename,
        }

    def _extract_relevant_snippet(
        self,
        content: str,
        query: str,
        max_length: int = 1800,
    ) -> str:
        content = content.strip()
        if len(content) <= max_length:
            return content

        query_terms = [
            re.escape(term.lower())
            for term in query.split()
            if len(term.strip()) >= 3
        ]
        if not query_terms:
            return content[:max_length].strip() + "..."

        lower_content = content.lower()
        match_positions = [
            match.start()
            for term in query_terms
            for match in re.finditer(term, lower_content)
        ]

        if not match_positions:
            return content[:max_length].strip() + "..."

        center = min(match_positions)
        start = max(0, center - max_length // 3)
        end = min(len(content), start + max_length)

        snippet = content[start:end].strip()
        if start > 0:
            snippet = "..." + snippet
        if end < len(content):
            snippet = snippet + "..."
        return snippet

    def _cosine_similarity(self, vec1: list, vec2: list) -> float:
        """Calculate cosine similarity between two vectors"""
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0

        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = sum(a * a for a in vec1) ** 0.5
        magnitude2 = sum(b * b for b in vec2) ** 0.5

        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0

        return dot_product / (magnitude1 * magnitude2)

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

    async def recreate_embedding(
        self,
        article_id: int,
        ai_config: CompanyAIConfig,
    ) -> KnowledgeBase:
        """Remove any existing embedding and generate a fresh one."""

        article = await self.get_article(article_id)
        if not article:
            raise ValueError("Article not found")

        article.embedding = None
        article.is_indexed = False
        article.index_error = None
        article.last_indexed_at = None
        await self.db.flush()

        if not ai_config.api_key_is_set or not ai_config.api_key_encrypted:
            article.index_error = "Chave de API não configurada"
            article.last_indexed_at = datetime.now()
            await self.db.commit()
            raise ValueError(article.index_error)

        api_key = decrypt_api_key(ai_config.api_key_encrypted)
        model = ai_config.embedding_model or "text-embedding-3-small"
        embedding_input = article.content[:24000]

        try:
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/embeddings",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "input": embedding_input,
                    },
                )

            if response.status_code >= 400:
                try:
                    detail = response.json()
                except ValueError:
                    detail = response.text
                raise ValueError(f"OpenRouter retornou {response.status_code}: {detail}")

            payload = response.json()
            embedding = payload.get("data", [{}])[0].get("embedding")
            if not embedding:
                raise ValueError("OpenRouter não retornou embedding para este artigo")

            article.embedding = json.dumps(embedding)
            article.is_indexed = True
            article.index_error = None
            article.last_indexed_at = datetime.now()
            await self.db.commit()
            await self.db.refresh(article)
            return article
        except Exception as exc:
            article.embedding = None
            article.is_indexed = False
            article.index_error = str(exc)
            article.last_indexed_at = datetime.now()
            await self.db.commit()
            raise

    async def recreate_embeddings_for_company(
        self,
        company_id: uuid.UUID,
        ai_config: CompanyAIConfig,
    ) -> dict:
        """Recreate embeddings for every active article in a company."""

        articles = await self.get_articles_by_company(company_id, include_inactive=False)
        results = []
        recreated = 0
        failed = 0

        for article in articles:
            try:
                indexed_article = await self.recreate_embedding(article.id, ai_config)
                results.append(
                    {
                        "id": indexed_article.id,
                        "title": indexed_article.title,
                        "is_indexed": indexed_article.is_indexed,
                        "index_error": indexed_article.index_error,
                    }
                )
                recreated += 1
            except Exception as exc:
                results.append(
                    {
                        "id": article.id,
                        "title": article.title,
                        "is_indexed": False,
                        "index_error": str(exc),
                    }
                )
                failed += 1

        return {
            "total": len(articles),
            "recreated": recreated,
            "failed": failed,
            "articles": results,
        }

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
