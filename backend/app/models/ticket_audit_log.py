import uuid

from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class TicketAuditLog(Base, TimestampMixin):
    __tablename__ = "ticket_audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tickets.id"), nullable=False
    )

    # Action type
    action_type: Mapped[str] = mapped_column(Text, nullable=False)

    # Who did it
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    user_role: Mapped[str] = mapped_column(Text, nullable=True)

    # Details
    old_values: Mapped[dict] = mapped_column(Text, nullable=True)
    new_values: Mapped[dict] = mapped_column(Text, nullable=True)

    # Context
    ip_address: Mapped[str] = mapped_column(Text, nullable=True)
    user_agent: Mapped[str] = mapped_column(Text, nullable=True)
