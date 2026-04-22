from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_superuser
from app.database import get_db
from app.models.user import User

# For now, we'll use a simple in-memory store for plans
# In production, this would be a database table
PLANS = [
    {
        "id": 1,
        "name": "Basic",
        "price_monthly": 99.00,
        "price_yearly": 990.00,
        "max_users": 5,
        "max_tickets": 100,
        "features": [
            "Suporte por email",
            "Relatórios básicos",
            "até 5 usuários",
            "100 tickets/mês",
        ],
        "is_active": True,
    },
    {
        "id": 2,
        "name": "Pro",
        "price_monthly": 299.00,
        "price_yearly": 2990.00,
        "max_users": -1,  # unlimited
        "max_tickets": -1,  # unlimited
        "features": [
            "Suporte prioritário 24/7",
            "Relatórios avançados",
            "Usuários ilimitados",
            "Tickets ilimitados",
            "Integrações CRM",
            "API disponível",
        ],
        "is_active": True,
    },
    {
        "id": 3,
        "name": "Enterprise",
        "price_monthly": 999.00,
        "price_yearly": 9990.00,
        "max_users": -1,
        "max_tickets": -1,
        "features": [
            "Suporte dedicado",
            "Relatórios customizados",
            "SLA garantido",
            "Treinamento incluído",
            "Customização completa",
            "Multi-empresa",
        ],
        "is_active": True,
    },
]

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("/", response_model=List[dict])
async def list_plans(
    db: AsyncSession = Depends(get_db),
):
    """List all available plans"""
    return [p for p in PLANS if p["is_active"]]


@router.get("/{plan_id}", response_model=dict)
async def get_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific plan"""
    plan = next((p for p in PLANS if p["id"] == plan_id), None)

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found",
        )

    return plan


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_plan(
    name: str,
    price_monthly: float,
    price_yearly: float,
    max_users: int,
    max_tickets: int,
    features: List[str],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """Create a new plan (superadmin only)"""

    new_id = max(p["id"] for p in PLANS) + 1

    new_plan = {
        "id": new_id,
        "name": name,
        "price_monthly": price_monthly,
        "price_yearly": price_yearly,
        "max_users": max_users,
        "max_tickets": max_tickets,
        "features": features,
        "is_active": True,
    }

    PLANS.append(new_plan)

    return new_plan


@router.put("/{plan_id}", response_model=dict)
async def update_plan(
    plan_id: int,
    name: Optional[str] = None,
    price_monthly: Optional[float] = None,
    price_yearly: Optional[float] = None,
    max_users: Optional[int] = None,
    max_tickets: Optional[int] = None,
    features: Optional[List[str]] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """Update a plan (superadmin only)"""

    plan = next((p for p in PLANS if p["id"] == plan_id), None)

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found",
        )

    if name is not None:
        plan["name"] = name
    if price_monthly is not None:
        plan["price_monthly"] = price_monthly
    if price_yearly is not None:
        plan["price_yearly"] = price_yearly
    if max_users is not None:
        plan["max_users"] = max_users
    if max_tickets is not None:
        plan["max_tickets"] = max_tickets
    if features is not None:
        plan["features"] = features
    if is_active is not None:
        plan["is_active"] = is_active

    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """Delete a plan (soft delete - just deactivate)"""

    plan = next((p for p in PLANS if p["id"] == plan_id), None)

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found",
        )

    plan["is_active"] = False
