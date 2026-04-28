"""
Agent Configuration Model

Handles multiple AI agents per company with their own configs and prompts.
"""

import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class AgentType(str):
    CUSTOMER_SERVICE = "customer_service"
    KNOWLEDGE_QUERY = "knowledge_query"


class AutonomyLevel(str):
    LOW = "low"       # All responses need approval
    HIGH = "high"     # AI auto-responds


class AgentConfig(Base, TimestampMixin):
    """
    Agent configuration per company.
    Each company can have multiple agents (e.g., customer service, knowledge query).
    """
    __tablename__ = "agent_configs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    company_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("companies.id"), nullable=False
    )

    # Agent identity
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Agent type
    agent_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=AgentType.CUSTOMER_SERVICE
    )

    # LLM Settings
    llm_model: Mapped[str] = mapped_column(
        String(100), default="google/gemini-2.5-flash-lite"
    )
    temperature: Mapped[float] = mapped_column(Float, default=0.7)
    max_tokens: Mapped[int] = mapped_column(Integer, default=2048)

    # Embedding Settings
    embedding_model: Mapped[str] = mapped_column(
        String(100), default="text-embedding-3-small"
    )
    embedding_dimensions: Mapped[int] = mapped_column(Integer, default=1536)

    # System prompt reference
    system_prompt_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("agent_prompts.id"), nullable=True
    )
    # Fallback system prompt (for backwards compatibility)
    system_prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Tools (JSON array of tool names)
    tools: Mapped[List[str]] = mapped_column(JSONB, default=lambda: ["rag"])

    # Autonomy level
    autonomy_level: Mapped[str] = mapped_column(
        String(20), default=AutonomyLevel.LOW
    )

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Order for display
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    # system_prompt_rel = relationship("AgentPrompt", foreign_keys=[system_prompt_id])
    prompts = relationship("AgentPrompt", back_populates="agent", foreign_keys="AgentPrompt.agent_id")

    def get_system_prompt(self) -> Optional[str]:
        """Get the effective system prompt (from relationship or fallback)"""
        if self.system_prompt:
            return self.system_prompt
        # Could also load from system_prompt_rel if needed
        return None

    def get_allowed_tools(self) -> List[str]:
        """Get list of allowed tools for this agent"""
        return self.tools or []

    def get_autonomy_level(self) -> str:
        """Get autonomy level"""
        return self.autonomy_level or AutonomyLevel.LOW