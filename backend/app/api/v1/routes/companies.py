from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import String, cast, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user, get_current_superuser
from app.database import get_db
from app.models.company import Company
from app.models.user import User

router = APIRouter(prefix="/companies", tags=["companies"])


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
