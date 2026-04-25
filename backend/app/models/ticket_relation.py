from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class TicketRelation(Base, TimestampMixin):
    __tablename__ = "ticket_relations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("tickets.id"), nullable=False
    )
    related_ticket_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("tickets.id"), nullable=False
    )

    # Relation type
    relation_type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # duplicate, causes, caused_by, related, subticket, parent

    # Description
    description: Mapped[str] = mapped_column(Text, nullable=True)

    # Metadata
    created_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
