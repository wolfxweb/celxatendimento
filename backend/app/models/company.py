from datetime import datetime

from sqlalchemy import DateTime, Enum, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class Company(Base, TimestampMixin):
    __tablename__ = "companies"

    # Primary key - integer in DB
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    domain: Mapped[str] = mapped_column(String(255), nullable=True)
    logo_url: Mapped[str] = mapped_column(String(500), nullable=True)

    # Status - use Enum to match PostgreSQL enum type
    status: Mapped[str] = mapped_column(
        Enum("pending", "active", "suspended", "cancelled", name="company_status", native_enum=True, create_type=False),
        default="pending",
    )
    status_reason: Mapped[str] = mapped_column(Text, nullable=True)
    approved_by: Mapped[int] = mapped_column(Integer, nullable=True)
    approved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Settings - jsonb in DB
    settings: Mapped[dict] = mapped_column(JSONB, default=dict)

    # Localization
    timezone: Mapped[str] = mapped_column(String(50), default="America/Sao_Paulo")
    locale: Mapped[str] = mapped_column(String(10), default="pt-BR")

    # Contact
    contact_name: Mapped[str] = mapped_column(String(255), nullable=True)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(50), nullable=True)

    # Billing
    billing_email: Mapped[str] = mapped_column(String(255), nullable=True)
    billing_address: Mapped[dict] = mapped_column(JSONB, nullable=True)

    # Counters
    total_users: Mapped[int] = mapped_column(Integer, default=0)
    total_tickets: Mapped[int] = mapped_column(Integer, default=0)
    tickets_this_month: Mapped[int] = mapped_column(Integer, default=0)
