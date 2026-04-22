"""
AI Configuration Service

Handles AI provider, model, and tool configuration per company.
"""

import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company_ai_config import CompanyAIConfig
from app.models.ai_provider import AIProvider
from app.models.ai_model import AIModel
from app.models.ai_tool import AITool
from app.core.security import encrypt_api_key, decrypt_api_key


class AIConfigService:
    """Service for managing AI configuration"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_config(self, company_id: uuid.UUID) -> CompanyAIConfig:
        """Get or create AI config for a company"""
        result = await self.db.execute(
            select(CompanyAIConfig).where(CompanyAIConfig.company_id == company_id)
        )
        config = result.scalar_one_or_none()

        if not config:
            # Create default config
            config = CompanyAIConfig(
                company_id=company_id,
                provider_id=1,  # OpenRouter default
                llm_model="google/gemini-1.5-flash",
                temperature=0.7,
                max_tokens=2048,
                embedding_model="text-embedding-3-small",
                system_prompt=DEFAULT_SYSTEM_PROMPT,
                tools=["rag"],
                autonomy_level="low",
                is_active=True,
            )
            self.db.add(config)
            await self.db.commit()
            await self.db.refresh(config)

        return config

    async def update_api_key(
        self,
        company_id: uuid.UUID,
        api_key: str,
    ) -> dict:
        """Save and encrypt API key for a company"""

        config = await self.get_or_create_config(company_id)

        # Encrypt the API key
        encrypted_key = encrypt_api_key(api_key)

        config.api_key_encrypted = encrypted_key
        config.api_key_is_set = True
        config.updated_at = datetime.now()

        await self.db.commit()

        return {"status": "success", "message": "API key saved securely"}

    async def test_api_key(self, company_id: uuid.UUID) -> dict:
        """Test if the API key is valid by making a test request"""

        config = await self.get_or_create_config(company_id)

        if not config.api_key_is_set or not config.api_key_encrypted:
            return {"status": "error", "message": "API key not configured"}

        # Decrypt key
        api_key = decrypt_api_key(config.api_key_encrypted)

        # Test the key with OpenRouter API
        import httpx

        try:
            response = httpx.post(
                "https://openrouter.ai/api/v1/models",
                headers={
                    "Authorization": f"Bearer {api_key}",
                },
                timeout=10,
            )

            if response.status_code == 200:
                return {"status": "success", "message": "API key is valid"}
            else:
                return {
                    "status": "error",
                    "message": f"API error: {response.status_code}",
                }
        except Exception as e:
            return {"status": "error", "message": f"Connection failed: {str(e)}"}

    async def get_available_models(self, provider_id: int = 1) -> List[dict]:
        """Get available LLM and embedding models for a provider"""

        result = await self.db.execute(
            select(AIModel).where(
                and_(
                    AIModel.provider_id == provider_id,
                    AIModel.is_active == True,
                )
            )
        )
        models = result.scalars().all()

        return [
            {
                "id": m.id,
                "name": m.name,
                "display_name": m.display_name,
                "model_type": m.model_type,
                "max_tokens": m.max_tokens,
                "embedding_dimensions": m.embedding_dimensions,
                "supports_function_calling": m.supports_function_calling,
            }
            for m in models
        ]

    async def get_available_tools(self, company_id: uuid.UUID) -> List[dict]:
        """Get available AI tools for a company"""

        result = await self.db.execute(select(AITool).where(AITool.is_active == True))
        tools = result.scalars().all()

        # Get current config to know which tools are enabled
        config = await self.get_or_create_config(company_id)
        enabled_tools = config.tools or []

        return [
            {
                "id": t.id,
                "name": t.name,
                "display_name": t.display_name,
                "description": t.description,
                "icon": t.icon,
                "requires_integration": t.requires_integration,
                "integration_type": t.integration_type,
                "is_enabled": t.name in enabled_tools,
            }
            for t in tools
        ]

    async def update_config(
        self,
        company_id: uuid.UUID,
        llm_model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        embedding_model: Optional[str] = None,
        system_prompt: Optional[str] = None,
        autonomy_level: Optional[str] = None,
        tools: Optional[List[str]] = None,
    ) -> CompanyAIConfig:
        """Update AI configuration"""

        config = await self.get_or_create_config(company_id)

        if llm_model is not None:
            config.llm_model = llm_model
        if temperature is not None:
            config.temperature = temperature
        if max_tokens is not None:
            config.max_tokens = max_tokens
        if embedding_model is not None:
            config.embedding_model = embedding_model
        if system_prompt is not None:
            config.system_prompt = system_prompt
        if autonomy_level is not None:
            config.autonomy_level = autonomy_level
        if tools is not None:
            config.tools = tools

        config.updated_at = datetime.now()

        await self.db.commit()
        await self.db.refresh(config)

        return config

    async def get_full_config(self, company_id: uuid.UUID) -> dict:
        """Get full AI config including available models and tools"""

        config = await self.get_or_create_config(company_id)

        # Get models grouped by type
        models = await self.get_available_models(config.provider_id or 1)
        llm_models = [m for m in models if m["model_type"] == "llm"]
        embedding_models = [m for m in models if m["model_type"] == "embedding"]

        # Get tools
        tools = await self.get_available_tools(company_id)

        return {
            "config": {
                "id": config.id,
                "company_id": str(config.company_id),
                "provider_id": config.provider_id,
                "api_key_is_set": config.api_key_is_set,
                "llm_model": config.llm_model,
                "temperature": config.temperature,
                "max_tokens": config.max_tokens,
                "embedding_model": config.embedding_model,
                "system_prompt": config.system_prompt,
                "tools": config.tools,
                "autonomy_level": config.autonomy_level,
                "is_active": config.is_active,
            },
            "llm_models": llm_models,
            "embedding_models": embedding_models,
            "tools": tools,
        }


DEFAULT_SYSTEM_PROMPT = """Você é um agente de atendimento ao cliente.

## Regras de Comunicação
1. Seja profissional e amigável
2. Seja claro e objetivo
3. Responda em português brasileiro
4. Se não souber a resposta, não invente - escalone para um atendente

## Respondendo Tickets
1. Entenda o problema
2. Forneça a solução quando possível
3. Se precisar de informações, solicite de forma clara
4. Defina próximos passos"""
