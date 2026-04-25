from typing import Optional, List
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.services.ai_config_service import AIConfigService, DEFAULT_SYSTEM_PROMPT

router = APIRouter(prefix="/ai-config", tags=["ai-config"])


class AIConfigUpdate(BaseModel):
    llm_model: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    embedding_model: Optional[str] = None
    system_prompt: Optional[str] = None
    autonomy_level: Optional[str] = None
    tools: Optional[List[str]] = None


class APIKeyUpdate(BaseModel):
    api_key: str


def default_ai_config_response(company_id: int) -> dict:
    return {
        "config": {
            "id": None,
            "company_id": str(company_id),
            "provider_id": 1,
            "api_key_is_set": False,
            "llm_model": "google/gemini-1.5-flash",
            "temperature": 0.7,
            "max_tokens": 2048,
            "embedding_model": "text-embedding-3-small",
            "system_prompt": DEFAULT_SYSTEM_PROMPT,
            "tools": ["rag"],
            "autonomy_level": "low",
            "is_active": True,
        },
        "llm_models": [],
        "embedding_models": [],
        "tools": [],
    }


@router.get("", include_in_schema=False)
@router.get("/")
async def get_ai_config(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get full AI configuration including available models and tools"""

    company_id = current_user.company_id
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    service = AIConfigService(db)
    try:
        result = await service.get_full_config(company_id)
    except SQLAlchemyError:
        await db.rollback()
        result = default_ai_config_response(company_id)

    return result


@router.put("", include_in_schema=False)
@router.put("/")
async def update_ai_config(
    config_data: AIConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update AI configuration (model, temperature, tools, etc.)"""

    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update AI configuration",
        )

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    service = AIConfigService(db)

    # Validate autonomy level
    if config_data.autonomy_level and config_data.autonomy_level not in [
        "low",
        "medium",
        "high",
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid autonomy level. Must be: low, medium, or high",
        )

    # Validate temperature
    if config_data.temperature is not None:
        if not 0.0 <= config_data.temperature <= 2.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Temperature must be between 0.0 and 2.0",
            )

    config = await service.update_config(
        company_id=current_user.company_id,
        llm_model=config_data.llm_model,
        temperature=config_data.temperature,
        max_tokens=config_data.max_tokens,
        embedding_model=config_data.embedding_model,
        system_prompt=config_data.system_prompt,
        autonomy_level=config_data.autonomy_level,
        tools=config_data.tools,
    )

    return {"message": "Configuration updated successfully"}


@router.post("/api-key")
async def save_api_key(
    api_key_data: APIKeyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Save encrypted API key for the company"""

    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can save API keys",
        )

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    if not api_key_data.api_key or len(api_key_data.api_key) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid API key",
        )

    service = AIConfigService(db)
    result = await service.update_api_key(
        company_id=current_user.company_id,
        api_key=api_key_data.api_key,
    )

    return result


@router.post("/test")
async def test_api_key(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Test if the configured API key is valid"""

    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can test API keys",
        )

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    service = AIConfigService(db)
    result = await service.test_api_key(current_user.company_id)

    if result["status"] == "error":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"],
        )

    return result


@router.get("/models")
async def get_available_models(
    provider_id: int = 1,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get available AI models for a provider"""

    service = AIConfigService(db)
    models = await service.get_available_models(provider_id)

    return {
        "llm_models": [m for m in models if m["model_type"] == "llm"],
        "embedding_models": [m for m in models if m["model_type"] == "embedding"],
    }


@router.get("/tools")
async def get_available_tools(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get available AI tools"""

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    service = AIConfigService(db)
    tools = await service.get_available_tools(current_user.company_id)

    return tools


@router.put("/tools")
async def update_enabled_tools(
    tools: List[str],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update enabled AI tools"""

    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update AI tools",
        )

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    service = AIConfigService(db)
    config = await service.update_config(
        company_id=current_user.company_id,
        tools=tools,
    )

    return {"message": "Tools updated successfully", "enabled_tools": config.tools}
