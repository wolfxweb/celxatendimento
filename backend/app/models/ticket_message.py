from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class TicketMessage(Base, TimestampMixin):
    __tablename__ = "ticket_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    ticket_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("tickets.id"), nullable=False
    )
    author_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )

    # Content
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Message type
    message_type: Mapped[str] = mapped_column(
        String(30), default="agent"
    )  # customer, agent, ai_initial, ai_approved, note, system

    # AI response reference
    ai_response_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("ticket_ai_response.id"), nullable=True
    )

    # If it was edited by agent
    was_edited: Mapped[bool] = mapped_column(Boolean, default=False)
    original_ai_text: Mapped[str] = mapped_column(Text, nullable=True)

    # Visibility
    is_internal: Mapped[bool] = mapped_column(Boolean, default=False)

    # Status
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    deleted_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    deleted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
