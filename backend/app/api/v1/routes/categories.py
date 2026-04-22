from typing import Optional, List
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.ticket import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=List[CategoryResponse])
async def list_categories(
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all categories for the user's company"""

    # Get company ID from user
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

    return [
        CategoryResponse(
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
            created_at=cat.created_at,
        )
        for cat in categories
    ]


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

    # Check if category name already exists
    result = await db.execute(
        select(Category).where(
            and_(
                Category.company_id == company_id,
                Category.name == category_data.name,
            )
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists",
        )

    category = Category(
        company_id=company_id,
        name=category_data.name,
        description=category_data.description,
        sla_minutes=category_data.sla_minutes,
        icon=category_data.icon,
        color=category_data.color,
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


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific category"""

    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    # Check company access
    if category.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

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
    category_data: dict,
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

    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    # Check company access
    if category.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # Update fields
    for key, value in category_data.items():
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
    """Delete a category (soft delete)"""

    # Only admins can delete categories
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete categories",
        )

    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    # Check company access
    if category.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # Soft delete
    from datetime import datetime

    category.is_active = False

    await db.commit()
