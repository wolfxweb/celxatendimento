from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class KnowledgeBase(Base, TimestampMixin):
    __tablename__ = "knowledge_base"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("companies.id"), nullable=False
    )

    # Content
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Source
    source_type: Mapped[str] = mapped_column(
        String(10), default="text"
    )  # pdf, text, url
    source_url: Mapped[str] = mapped_column(String(1000), nullable=True)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=True)

    # Embeddings (for vector search)
    embedding: Mapped[list] = mapped_column(Text, nullable=True)

    # Chunking info
    chunks_count: Mapped[int] = mapped_column(Integer, default=1)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=True)
    parent_doc_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("knowledge_base.id"), nullable=True
    )

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_indexed: Mapped[bool] = mapped_column(Boolean, default=False)
    index_error: Mapped[str] = mapped_column(Text, nullable=True)
    last_indexed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Config
    extra_data: Mapped[dict] = mapped_column(Text, default=dict)

    # Soft delete
    deleted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
