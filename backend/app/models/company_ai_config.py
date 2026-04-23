from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class CompanyAIConfig(Base, TimestampMixin):
    __tablename__ = "company_ai_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("companies.id"), nullable=False
    )

    # Provider & Credentials
    provider_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("ai_providers.id"), nullable=True
    )
    api_key_encrypted: Mapped[str] = mapped_column(Text, nullable=True)
    api_key_is_set: Mapped[bool] = mapped_column(Boolean, default=False)

    # LLM Settings
    llm_model: Mapped[str] = mapped_column(
        String(100), default="google/gemini-1.5-flash"
    )
    temperature: Mapped[float] = mapped_column(Float, default=0.7)
    max_tokens: Mapped[int] = mapped_column(Integer, default=2048)

    # Embedding Settings
    embedding_model: Mapped[str] = mapped_column(
        String(100), default="openai/text-embedding-3-small"
    )
    embedding_dimensions: Mapped[int] = mapped_column(Integer, default=1536)

    # Prompt
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)

    # Tools (JSON array of tool names)
    tools: Mapped[list[str]] = mapped_column(JSONB, default=lambda: ["rag"])

    # Autonomy
    autonomy_level: Mapped[str] = mapped_column(
        String(20), default="low"
    )  # low, medium, high

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
