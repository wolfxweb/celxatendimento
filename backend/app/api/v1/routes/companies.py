from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import String, cast, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user, get_current_superuser
from app.database import get_db
from app.models.company import Company
from app.models.user import User

router = APIRouter(prefix="/companies", tags=["companies"])


class CompanyCreateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    domain: Optional[str] = Field(None, max_length=255)
    contact_name: str = Field(..., min_length=1, max_length=255)
    contact_email: str = Field(..., min_length=5, max_length=255)
    contact_phone: Optional[str] = Field(None, max_length=50)
    billing_email: Optional[str] = Field(None, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    timezone: str = Field(default="America/Sao_Paulo", max_length=50)
    locale: str = Field(default="pt-BR", max_length=10)


class RejectCompanyRequest(BaseModel):
    reason: str


@router.get("", response_model=List[dict], include_in_schema=False)
@router.get("/", response_model=List[dict])
async def list_companies(
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all companies (for superadmin)"""

    # Only superadmins can list all companies
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins can list all companies",
        )

    query = select(Company)

    if status_filter:
        query = query.where(cast(Company.status, String) == status_filter)

    query = query.order_by(Company.created_at.desc())

    result = await db.execute(query)
    companies = result.scalars().all()

    return [
        {
            "id": str(c.id),
            "name": c.name,
            "domain": c.domain,
            "contact_email": c.contact_email,
            "contact_name": c.contact_name,
            "status": c.status,
            "status_reason": c.status_reason,
            "total_users": c.total_users,
            "total_tickets": c.total_tickets,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "approved_at": c.approved_at.isoformat() if c.approved_at else None,
        }
        for c in companies
    ]


@router.get("/{company_id}", response_model=dict)
async def get_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get company details"""

    # Users can get their own company, superadmins can get any
    if current_user.role != "superadmin" and current_user.company_id != company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    return {
        "id": str(company.id),
        "name": company.name,
        "domain": company.domain,
        "contact_email": company.contact_email,
        "contact_name": company.contact_name,
        "status": company.status,
        "status_reason": company.status_reason,
        "total_users": company.total_users,
        "total_tickets": company.total_tickets,
        "settings": company.settings,
        "timezone": company.timezone,
        "locale": company.locale,
        "created_at": company.created_at.isoformat() if company.created_at else None,
        "approved_at": company.approved_at.isoformat() if company.approved_at else None,
    }


@router.post("/{company_id}/approve", status_code=status.HTTP_200_OK)
async def approve_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """Approve a pending company"""

    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    if company.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending companies can be approved",
        )

    company.status = "active"
    company.approved_by = current_user.id
    company.approved_at = datetime.now()

    await db.commit()

    return {"message": "Company approved successfully"}


@router.post("/{company_id}/reject", status_code=status.HTTP_200_OK)
async def reject_company(
    company_id: int,
    reject_data: RejectCompanyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """Reject a pending company"""

    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    if company.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending companies can be rejected",
        )

    company.status = "cancelled"
    company.status_reason = reject_data.reason
    company.approved_by = current_user.id
    company.approved_at = datetime.now()

    await db.commit()

    return {"message": "Company rejected"}


@router.post("/{company_id}/suspend", status_code=status.HTTP_200_OK)
async def suspend_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """Suspend an active company"""

    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    company.status = "suspended"

    await db.commit()

    return {"message": "Company suspended"}


@router.post("", status_code=status.HTTP_201_CREATED, response_model=dict, include_in_schema=False)
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=dict)
async def create_company(
    company_data: CompanyCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """Create a new company (superadmin only) with admin user"""

    from app.models.user import User
    from app.core.security import get_password_hash

    if company_data.domain:
        result = await db.execute(
            select(Company).where(Company.domain == company_data.domain)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Domain already registered",
            )

    result = await db.execute(
        select(Company).where(Company.contact_email == company_data.contact_email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    new_company = Company(
        name=company_data.name,
        domain=company_data.domain,
        contact_name=company_data.contact_name,
        contact_email=company_data.contact_email,
        contact_phone=company_data.contact_phone,
        billing_email=company_data.billing_email,
        timezone=company_data.timezone,
        locale=company_data.locale,
        status="pending",
        settings={},
    )

    db.add(new_company)
    await db.flush()

    admin_user = User(
        company_id=new_company.id,
        email=company_data.contact_email,
        hashed_password=get_password_hash(company_data.password),
        full_name=company_data.contact_name,
        role="admin",
        is_active=True,
        is_email_verified=True,
    )

    db.add(admin_user)
    await db.commit()
    await db.refresh(new_company)

    return {
        "id": str(new_company.id),
        "name": new_company.name,
        "domain": new_company.domain,
        "contact_email": new_company.contact_email,
        "contact_name": new_company.contact_name,
        "status": new_company.status,
        "created_at": new_company.created_at.isoformat() if new_company.created_at else None,
    }
