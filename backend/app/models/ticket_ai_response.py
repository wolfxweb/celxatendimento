from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class TicketAIResponse(Base, TimestampMixin):
    __tablename__ = "ticket_ai_response"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("tickets.id"), nullable=False
    )

    # AI generated response
    response_text: Mapped[str] = mapped_column(Text, nullable=False)

    # Context used (RAG + ticket info)
    context_used: Mapped[dict] = mapped_column(Text, default=dict)

    # Config snapshot
    config_snapshot: Mapped[dict] = mapped_column(Text, default=dict)

    # Timing
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now
    )
    processing_time_ms: Mapped[int] = mapped_column(Integer, nullable=True)

    # Approval status
    status: Mapped[str] = mapped_column(
        String(20), default="pending"
    )  # pending, approved, rejected, edited

    # Reviewer
    reviewed_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    reviewed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Feedback
    ai_rating: Mapped[int] = mapped_column(Integer, nullable=True)
    ai_feedback: Mapped[str] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[str] = mapped_column(String(100), nullable=True)

    # Learning flags
    is_example_good: Mapped[bool] = mapped_column(Boolean, default=False)
    is_example_bad: Mapped[bool] = mapped_column(Boolean, default=False)
