"""
Agent Routes

Handles CRUD operations for agents and prompts.
"""

from typing import Optional, List
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.models.agent_config import AgentType, AutonomyLevel
from app.services.agent_service import AgentService

router = APIRouter(prefix="/agentes", tags=["agentes"])


# ==================== REQUEST/RESPONSE MODELS ====================

class AgentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    agent_type: str = Field(default=AgentType.CUSTOMER_SERVICE)
    llm_model: str = Field(default="google/gemini-2.5-flash-lite")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=2048, ge=256, le=128000)
    embedding_model: str = Field(default="text-embedding-3-small")
    tools: Optional[List[str]] = None
    autonomy_level: str = Field(default=AutonomyLevel.LOW)


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    llm_model: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    embedding_model: Optional[str] = None
    tools: Optional[List[str]] = None
    autonomy_level: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class PromptCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)
    prompt_type: str = Field(default="system")
    description: Optional[str] = None


class PromptUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    description: Optional[str] = None


class ChatKBRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    agent_id: Optional[str] = None
    include_sources: bool = True


# ==================== AGENT ROUTES ====================

@router.get("")
async def list_agents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all agents for the company"""

    if not current_user.company_id:
        return {"agents": [], "total": 0}

    service = AgentService(db)
    agents = await service.get_agents(current_user.company_id)

    return {
        "agents": [
            {
                "id": str(a.id),
                "name": a.name,
                "description": a.description,
                "agent_type": a.agent_type,
                "llm_model": a.llm_model,
                "temperature": a.temperature,
                "max_tokens": a.max_tokens,
                "tools": a.tools,
                "autonomy_level": a.autonomy_level,
                "is_active": a.is_active,
                "display_order": a.display_order,
            }
            for a in agents
        ],
        "total": len(agents),
    }


@router.post("")
async def create_agent(
    agent_data: AgentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new agent"""

    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create agents",
        )

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    # Validate agent_type
    valid_types = [AgentType.CUSTOMER_SERVICE, AgentType.KNOWLEDGE_QUERY]
    if agent_data.agent_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid agent_type. Must be one of: {valid_types}",
        )

    # Validate autonomy_level
    valid_levels = [AutonomyLevel.LOW, AutonomyLevel.HIGH]
    if agent_data.autonomy_level not in valid_levels:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid autonomy_level. Must be one of: {valid_levels}",
        )

    service = AgentService(db)
    agent = await service.create_agent(
        company_id=current_user.company_id,
        name=agent_data.name,
        agent_type=agent_data.agent_type,
        description=agent_data.description,
        llm_model=agent_data.llm_model,
        temperature=agent_data.temperature,
        max_tokens=agent_data.max_tokens,
        embedding_model=agent_data.embedding_model,
        tools=agent_data.tools,
        autonomy_level=agent_data.autonomy_level,
    )

    return {
        "message": "Agent created successfully",
        "agent": {
            "id": str(agent.id),
            "name": agent.name,
            "agent_type": agent.agent_type,
        },
    }


@router.get("/{agent_id}")
async def get_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific agent with full configuration"""

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    try:
        agent_uuid = uuid.UUID(agent_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid agent ID format",
        )

    service = AgentService(db)
    agent = await service.get_agent(agent_uuid)

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    if agent.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # Get prompts
    prompts = await service.get_prompts(agent.id)

    return {
        "agent": {
            "id": str(agent.id),
            "name": agent.name,
            "description": agent.description,
            "agent_type": agent.agent_type,
            "llm_model": agent.llm_model,
            "temperature": agent.temperature,
            "max_tokens": agent.max_tokens,
            "embedding_model": agent.embedding_model,
            "tools": agent.tools,
            "autonomy_level": agent.autonomy_level,
            "is_active": agent.is_active,
            "display_order": agent.display_order,
            "system_prompt": agent.system_prompt,
        },
        "prompts": [
            {
                "id": str(p.id),
                "name": p.name,
                "prompt_type": p.prompt_type,
                "content": p.content,
                "version": p.version,
                "is_active": p.is_active,
                "is_default": p.is_default,
                "variables": p.variables,
            }
            for p in prompts
        ],
    }


@router.put("/{agent_id}")
async def update_agent(
    agent_id: str,
    agent_data: AgentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update an agent"""

    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update agents",
        )

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    try:
        agent_uuid = uuid.UUID(agent_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid agent ID format",
        )

    # Validate autonomy_level if provided
    if agent_data.autonomy_level:
        valid_levels = [AutonomyLevel.LOW, AutonomyLevel.MEDIUM, AutonomyLevel.HIGH]
        if agent_data.autonomy_level not in valid_levels:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid autonomy_level. Must be one of: {valid_levels}",
            )

    # Validate temperature if provided
    if agent_data.temperature is not None:
        if not 0.0 <= agent_data.temperature <= 2.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Temperature must be between 0.0 and 2.0",
            )

    service = AgentService(db)
    agent = await service.update_agent(
        agent_id=agent_uuid,
        name=agent_data.name,
        description=agent_data.description,
        llm_model=agent_data.llm_model,
        temperature=agent_data.temperature,
        max_tokens=agent_data.max_tokens,
        embedding_model=agent_data.embedding_model,
        tools=agent_data.tools,
        autonomy_level=agent_data.autonomy_level,
        is_active=agent_data.is_active,
        display_order=agent_data.display_order,
    )

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    return {"message": "Agent updated successfully"}


@router.delete("/{agent_id}")
async def delete_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete an agent (soft delete)"""

    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete agents",
        )

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    try:
        agent_uuid = uuid.UUID(agent_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid agent ID format",
        )

    service = AgentService(db)
    success = await service.delete_agent(agent_uuid)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    return {"message": "Agent deleted successfully"}


# ==================== PROMPT ROUTES ====================

@router.get("/{agent_id}/prompts")
async def list_prompts(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all prompts for an agent"""

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    try:
        agent_uuid = uuid.UUID(agent_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid agent ID format",
        )

    service = AgentService(db)
    agent = await service.get_agent(agent_uuid)

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    if agent.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    prompts = await service.get_prompts(agent_uuid)

    return {
        "prompts": [
            {
                "id": str(p.id),
                "name": p.name,
                "prompt_type": p.prompt_type,
                "content": p.content,
                "version": p.version,
                "is_active": p.is_active,
                "is_default": p.is_default,
                "variables": p.variables,
            }
            for p in prompts
        ],
        "total": len(prompts),
    }


@router.post("/{agent_id}/prompts")
async def create_prompt(
    agent_id: str,
    prompt_data: PromptCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new prompt for an agent"""

    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create prompts",
        )

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    try:
        agent_uuid = uuid.UUID(agent_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid agent ID format",
        )

    service = AgentService(db)
    agent = await service.get_agent(agent_uuid)

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found",
        )

    if agent.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    prompt = await service.create_prompt(
        agent_id=agent_uuid,
        company_id=current_user.company_id,
        name=prompt_data.name,
        content=prompt_data.content,
        prompt_type=prompt_data.prompt_type,
        description=prompt_data.description,
    )

    return {
        "message": "Prompt created successfully",
        "prompt": {
            "id": str(prompt.id),
            "name": prompt.name,
            "prompt_type": prompt.prompt_type,
        },
    }


@router.put("/{agent_id}/prompts/{prompt_id}")
async def update_prompt(
    agent_id: str,
    prompt_id: str,
    prompt_data: PromptUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a prompt (creates new version)"""

    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update prompts",
        )

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    try:
        prompt_uuid = uuid.UUID(prompt_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid prompt ID format",
        )

    service = AgentService(db)
    prompt = await service.update_prompt(
        prompt_id=prompt_uuid,
        name=prompt_data.name,
        content=prompt_data.content,
        description=prompt_data.description,
    )

    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found",
        )

    return {
        "message": "Prompt updated successfully",
        "prompt": {
            "id": str(prompt.id),
            "version": prompt.version,
        },
    }


@router.delete("/{agent_id}/prompts/{prompt_id}")
async def delete_prompt(
    agent_id: str,
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a prompt (soft delete)"""

    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete prompts",
        )

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    try:
        prompt_uuid = uuid.UUID(prompt_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid prompt ID format",
        )

    service = AgentService(db)
    success = await service.delete_prompt(prompt_uuid)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found",
        )

    return {"message": "Prompt deleted successfully"}


# ==================== CHAT COM BASE DE CONHECIMENTO ====================

@router.post("/chat-kb")
async def chat_knowledge_base(
    chat_data: ChatKBRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Chat with the knowledge base using RAG"""

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    agent_id = None
    if chat_data.agent_id:
        try:
            agent_id = uuid.UUID(chat_data.agent_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid agent ID format",
            )

    service = AgentService(db)
    result = await service.chat_knowledge_base(
        company_id=current_user.company_id,
        query=chat_data.query,
        agent_id=agent_id,
        user_id=str(current_user.id),
        user_name=current_user.full_name or current_user.email,
        include_sources=chat_data.include_sources,
    )

    if not result.get("success", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to process query"),
        )

    return result


# ==================== FULL CONFIG ====================

@router.get("/config/full")
async def get_full_config(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get full configuration for all agents including prompts"""

    if not current_user.company_id:
        return {"agents": [], "total": 0}


    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view full configuration",
        )

    service = AgentService(db)
    result = await service.get_agent_full_config(current_user.company_id)

    return result


@router.post("/migrate")
async def migrate_existing_config(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Migrate existing CompanyAIConfig to new AgentConfig structure"""

    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can migrate configuration",
        )

    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a company",
        )

    service = AgentService(db)
    agents = await service.migrate_existing_config(current_user.company_id)

    return {
        "message": "Migration completed successfully",
        "agents_created": len(agents),
    }