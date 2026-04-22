import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Company/Tenant
    company_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("companies.id"), nullable=True
    )

    # Auth
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    hashed_password: Mapped[str] = mapped_column(
        "password_hash", String(255), nullable=False
    )

    # Profile - map to existing 'name' column using full_name
    full_name: Mapped[str | None] = mapped_column("name", String(255), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Role
    role: Mapped[str] = mapped_column(
        String(20), default="customer"
    )  # customer, agent, admin, superadmin
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # Permissions (JSON for flexibility)
    permissions: Mapped[list] = mapped_column(String, default=list)

    # Login tracking
    last_login_at: Mapped[str | None] = mapped_column(String, nullable=True)
    last_login_ip: Mapped[str | None] = mapped_column(String, nullable=True)
    login_count: Mapped[int] = mapped_column(Integer, default=0)
    failed_login_count: Mapped[int] = mapped_column(Integer, default=0)

    # Password reset
    password_reset_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    password_reset_expires_at: Mapped[str | None] = mapped_column(String, nullable=True)

    # Metadata - map to existing 'metadata' column using extra_data
    extra_data: Mapped[dict] = mapped_column("metadata", String, default=dict)

    # Soft delete
    deleted_at: Mapped[str | None] = mapped_column(String, nullable=True)
