from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class Ticket(Base, TimestampMixin):
    __tablename__ = "tickets"

    # Primary key - integer in DB
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Company/Tenant - integer in DB
    company_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("companies.id"), nullable=False
    )

    # Ticket identification
    ticket_number: Mapped[str] = mapped_column(String(20), nullable=False)

    # Relations - integer in DB
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    category_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("categories.id"), nullable=True
    )
    assigned_to: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )

    # Status and Priority
    status: Mapped[str] = mapped_column(
        Enum(
            "open",
            "pending_ai",
            "pending_agent",
            "resolved",
            "closed",
            "rejected",
            name="ticket_status",
            native_enum=True,
            create_type=False,
        ),
        default="open",
        nullable=False,
    )
    priority: Mapped[str] = mapped_column(
        Enum(
            "critical",
            "high",
            "medium",
            "low",
            name="ticket_priority",
            native_enum=True,
            create_type=False,
        ),
        default="medium",
        nullable=False,
    )

    # Content
    subject: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Channel
    channel: Mapped[str] = mapped_column(String(50), default="website")

    # Timestamps
    first_response_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    resolved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    closed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # SLA
    sla_due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    sla_breached: Mapped[bool] = mapped_column(Boolean, default=False)

    # Tracking
    resolution_time_minutes: Mapped[int] = mapped_column(Integer, nullable=True)
    response_time_minutes: Mapped[int] = mapped_column(Integer, nullable=True)

    # Rating
    rating: Mapped[int] = mapped_column(Integer, nullable=True)
    rating_comment: Mapped[str] = mapped_column(Text, nullable=True)
    rated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Tags - jsonb in DB
    tags: Mapped[list] = mapped_column(JSONB, default=list)

    # Lock - integer in DB
    locked_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    locked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Extra data - use 'extra_data_json' mapped to 'metadata' column
    # SQLAlchemy reserves 'metadata', so we use column() to map it
    extra_data_json: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)

    # IP Address and User Agent
    ip_address: Mapped[str] = mapped_column(INET, nullable=True)
    user_agent: Mapped[str] = mapped_column(Text, nullable=True)

    # Soft delete
    deleted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    # company = relationship("Company", back_populates="tickets")
    # user = relationship("User", foreign_keys=[user_id])
    # assigned_user = relationship("User", foreign_keys=[assigned_to])
    # category = relationship("Category")
