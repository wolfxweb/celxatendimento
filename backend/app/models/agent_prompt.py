"""
Agent Prompt Model

Stores prompts for agents in the database instead of hardcoded.
"""

import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class PromptType(str):
    SYSTEM = "system"
    QUERY = "query"
    RESPONSE = "response"


class AgentPrompt(Base, TimestampMixin):
    """
    Prompt templates for agents.
    Each agent can have multiple prompts for different purposes.
    """
    __tablename__ = "agent_prompts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    agent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("agent_configs.id"), nullable=False
    )
    company_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("companies.id"), nullable=False
    )

    # Prompt identity
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Prompt type
    prompt_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default=PromptType.SYSTEM
    )

    # Prompt content
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Variables available in this prompt
    variables: Mapped[List[str]] = mapped_column(
        JSONB, default=lambda: []
    )

    # Versioning
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    agent = relationship("AgentConfig", back_populates="prompts", foreign_keys=[agent_id])

    def render(self, **kwargs) -> str:
        """Render prompt with provided variables"""
        result = self.content
        for key, value in kwargs.items():
            placeholder = f"{{{key}}}"
            result = result.replace(placeholder, str(value))
        return result

    def get_available_variables(self) -> List[str]:
        """Extract variables from prompt content"""
        import re
        return re.findall(r'\{(\w+)\}', self.content)