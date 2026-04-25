from typing import Optional, List
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.category import Category
from app.models.user import User
from app.models.ticket import Ticket
from app.schemas.ticket import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    CategoryActiveResponse,
    CategoryWithCountResponse,
)


router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/active", response_model=dict)
async def list_active_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    List active categories for the user's company.
    Optimized response for dropdown/combo selection.
    Returns only id and name.
    """
    company_id = current_user.company_id
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    query = (
        select(Category)
        .where(
            and_(
                Category.company_id == company_id,
                Category.is_active == True,
            )
        )
        .order_by(Category.name)
    )

    result = await db.execute(query)
    categories = result.scalars().all()

    return {
        "categories": [
            CategoryActiveResponse(id=cat.id, name=cat.name)
            for cat in categories
        ]
    }


@router.get("/", response_model=List[CategoryWithCountResponse])
async def list_categories(
    include_inactive: bool = Query(False, description="Include inactive categories"),
    include_stats: bool = Query(False, description="Include ticket count"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all categories for the user's company with optional stats"""

    company_id = current_user.company_id
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    query = select(Category).where(Category.company_id == company_id)

    if not include_inactive:
        query = query.where(Category.is_active == True)

    query = query.order_by(Category.name)

    result = await db.execute(query)
    categories = result.scalars().all()

    response = []
    for cat in categories:
        ticket_count = 0
        if include_stats:
            count_result = await db.execute(
                select(func.count(Ticket.id)).where(Ticket.category_id == cat.id)
            )
            ticket_count = count_result.scalar() or 0

        response.append(
            CategoryWithCountResponse(
                id=cat.id,
                company_id=cat.company_id,
                name=cat.name,
                description=cat.description,
                sla_minutes=cat.sla_minutes,
                icon=cat.icon,
                color=cat.color,
                is_active=cat.is_active,
                is_default=cat.is_default,
                require_approval=cat.require_approval,
                parent_category_id=cat.parent_category_id,
                ticket_count=ticket_count,
                created_at=cat.created_at,
            )
        )

    return response


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new category"""

    # Only admins can create categories
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create categories",
        )

    company_id = current_user.company_id
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    # Check if category name already exists (case-insensitive)
    result = await db.execute(
        select(Category).where(
            and_(
                Category.company_id == company_id,
                func.lower(Category.name) == func.lower(category_data.name),
            )
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Categoria já existe",
        )

    category = Category(
        company_id=company_id,
        name=category_data.name,
        description=category_data.description,
        sla_minutes=category_data.sla_minutes,
        icon=category_data.icon,
        color=category_data.color,
        require_approval=category_data.require_approval,
    )

    db.add(category)
    await db.commit()
    await db.refresh(category)

    return CategoryResponse(
        id=category.id,
        company_id=category.company_id,
        name=category.name,
        description=category.description,
        sla_minutes=category.sla_minutes,
        icon=category.icon,
        color=category.color,
        is_active=category.is_active,
        is_default=category.is_default,
        require_approval=category.require_approval,
        parent_category_id=category.parent_category_id,
        created_at=category.created_at,
    )


async def _get_category_or_404(
    category_id: int,
    db: AsyncSession,
    current_user: User,
) -> Category:
    """Helper to get category with company validation"""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    if category.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    return category


async def _check_category_in_use(category_id: int, db: AsyncSession) -> int:
    """Check how many tickets are using this category. Returns ticket count."""
    from sqlalchemy import select, func
    from app.models.ticket import Ticket

    count_result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.category_id == category_id)
    )
    return count_result.scalar() or 0


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific category"""
    category = await _get_category_or_404(category_id, db, current_user)

    return CategoryResponse(
        id=category.id,
        company_id=category.company_id,
        name=category.name,
        description=category.description,
        sla_minutes=category.sla_minutes,
        icon=category.icon,
        color=category.color,
        is_active=category.is_active,
        is_default=category.is_default,
        require_approval=category.require_approval,
        parent_category_id=category.parent_category_id,
        created_at=category.created_at,
    )


@router.patch("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a category"""

    # Only admins can update categories
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update categories",
        )

    category = await _get_category_or_404(category_id, db, current_user)

    # Check for duplicate name (case-insensitive) if name is being changed
    if category_data.name and category_data.name.lower() != category.name.lower():
        existing = await db.execute(
            select(Category).where(
                and_(
                    Category.company_id == current_user.company_id,
                    Category.id != category_id,
                    func.lower(Category.name) == func.lower(category_data.name),
                )
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Categoria já existe",
            )

    # If trying to deactivate, check if category is in use
    if category_data.is_active is False and category.is_active is True:
        ticket_count = await _check_category_in_use(category_id, db)
        if ticket_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Categoria está em uso por {ticket_count} tickets",
            )

    # Update fields that were provided
    update_data = category_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(category, key):
            setattr(category, key, value)

    await db.commit()
    await db.refresh(category)

    return CategoryResponse(
        id=category.id,
        company_id=category.company_id,
        name=category.name,
        description=category.description,
        sla_minutes=category.sla_minutes,
        icon=category.icon,
        color=category.color,
        is_active=category.is_active,
        is_default=category.is_default,
        require_approval=category.require_approval,
        parent_category_id=category.parent_category_id,
        created_at=category.created_at,
    )


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a category (soft delete - marks as inactive)"""

    # Only admins can delete categories
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete categories",
        )

    category = await _get_category_or_404(category_id, db, current_user)

    # Check if category is in use
    ticket_count = await _check_category_in_use(category_id, db)
    if ticket_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Categoria está em uso por {ticket_count} tickets",
        )

    # Soft delete
    category.is_active = False

    await db.commit()
