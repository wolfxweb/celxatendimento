from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class AIFeedbackLog(Base, TimestampMixin):
    __tablename__ = "ai_feedback_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("tickets.id"), nullable=False
    )
    ai_response_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("ticket_ai_response.id"), nullable=True
    )
    agent_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )

    # Action type
    action: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # approved, rejected, edited, rated

    # Data
    previous_state: Mapped[str] = mapped_column(Text, nullable=True)
    new_state: Mapped[str] = mapped_column(Text, nullable=True)

    # Feedback
    rating: Mapped[int] = mapped_column(Integer, nullable=True)
    feedback_text: Mapped[str] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[str] = mapped_column(String(100), nullable=True)
