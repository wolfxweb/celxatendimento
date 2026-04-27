"""
AI Configuration Service

Handles AI provider, model, and tool configuration per company.
"""

from datetime import datetime
from typing import Optional, List

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company_ai_config import CompanyAIConfig
from app.models.ai_provider import AIProvider
from app.models.ai_model import AIModel
from app.models.ai_tool import AITool
from app.core.security import encrypt_api_key, decrypt_api_key


DEFAULT_LLM_MODELS = [
    ("openrouter/free", "OpenRouter Free Router (FREE)", 262000, False),
    ("google/gemini-2.5-flash-lite", "Gemini 2.5 Flash Lite (baixo custo)", 1048576, True),
    ("google/gemini-2.5-flash", "Gemini 2.5 Flash", 1048576, True),
    ("google/gemma-3n-e4b-it:free", "Gemma 3n 4B (FREE)", 8192, False),
    ("google/gemma-3-12b-it:free", "Gemma 3 12B (FREE)", 32768, True),
    ("google/gemma-3-27b-it:free", "Gemma 3 27B (FREE)", 131072, True),
    ("qwen/qwen3-4b:free", "Qwen3 4B (FREE)", 40960, False),
    ("qwen/qwen3-coder:free", "Qwen3 Coder 480B A35B (FREE)", 262000, True),
    ("meta-llama/llama-3.1-8b-instruct", "Llama 3.1 8B (FREE)", 8192, False),
    ("mistralai/mistral-7b-instruct", "Mistral 7B (FREE)", 32768, False),
    ("google/gemma-3n-e4b-it", "Gemma 3n 4B (barato)", 32768, False),
    ("qwen/qwen3-4b", "Qwen3 4B (barato)", 128000, False),
    ("deepseek/deepseek-chat-v3.1", "DeepSeek V3.1 (barato)", 32768, True),
    ("deepseek/deepseek-v3.2", "DeepSeek V3.2 (barato)", 163840, True),
    ("qwen/qwen3-coder", "Qwen3 Coder 480B A35B (barato)", 262144, True),
    ("openai/gpt-4o-mini", "GPT-4o Mini (baixo custo)", 128000, True),
    ("openai/gpt-4o", "GPT-4o (premium)", 128000, True),
    ("anthropic/claude-3.5-sonnet", "Claude 3.5 Sonnet (premium)", 200000, True),
    ("anthropic/claude-3-haiku", "Claude 3 Haiku (premium)", 200000, False),
]

DEFAULT_EMBEDDING_MODELS = [
    ("qwen/qwen3-embedding-4b", "Qwen3 Embedding 4B (barato)", 2560),
    ("text-embedding-3-small", "Text Embedding 3 Small", 1536),
    ("text-embedding-3-large", "Text Embedding 3 Large", 3072),
    ("text-embedding-ada-002", "Text Embedding Ada v2", 1536),
]

DEFAULT_TOOLS = [
    (
        "rag",
        "Busca na Base de Conhecimento",
        "Busca em documentos PDF e artigos da empresa",
        "search",
        False,
        None,
    ),
    (
        "abrir_ticket",
        "Abertura de Ticket Internamente",
        "Cria tickets automaticamente para o setor certo",
        "ticket",
        False,
        None,
    ),
]


class AIConfigService:
    """Service for managing AI configuration"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def ensure_default_catalog(self) -> int:
        """Ensure the default OpenRouter catalog exists and return its provider id."""

        provider_result = await self.db.execute(
            select(AIProvider).where(AIProvider.name == "openrouter")
        )
        provider = provider_result.scalar_one_or_none()

        if not provider:
            provider = AIProvider(
                name="openrouter",
                display_name="OpenRouter",
                api_url="https://openrouter.ai/api/v1",
                is_active=True,
            )
            self.db.add(provider)
            await self.db.flush()

        model_result = await self.db.execute(
            select(AIModel.name, AIModel.model_type).where(
                AIModel.provider_id == provider.id
            )
        )
        existing_models = set(model_result.all())

        for name, display_name, max_tokens, supports_function_calling in DEFAULT_LLM_MODELS:
            if (name, "llm") not in existing_models:
                self.db.add(
                    AIModel(
                        provider_id=provider.id,
                        name=name,
                        display_name=display_name,
                        model_type="llm",
                        max_tokens=max_tokens,
                        supports_function_calling=supports_function_calling,
                        is_active=True,
                    )
                )

        for name, display_name, dimensions in DEFAULT_EMBEDDING_MODELS:
            if (name, "embedding") not in existing_models:
                self.db.add(
                    AIModel(
                        provider_id=provider.id,
                        name=name,
                        display_name=display_name,
                        model_type="embedding",
                        embedding_dimensions=dimensions,
                        is_active=True,
                    )
                )

        tool_result = await self.db.execute(select(AITool.name))
        existing_tools = {name for (name,) in tool_result.all()}

        for name, display_name, description, icon, requires_integration, schema in DEFAULT_TOOLS:
            if name not in existing_tools:
                self.db.add(
                    AITool(
                        name=name,
                        display_name=display_name,
                        description=description,
                        icon=icon,
                        requires_integration=requires_integration,
                        schema_definition=schema,
                        is_active=True,
                    )
                )

        await self.db.commit()
        return provider.id

    async def get_or_create_config(self, company_id: int) -> CompanyAIConfig:
        """Get or create AI config for a company"""
        provider_id = await self.ensure_default_catalog()

        result = await self.db.execute(
            select(CompanyAIConfig).where(CompanyAIConfig.company_id == company_id)
        )
        config = result.scalar_one_or_none()

        if not config:
            # Create default config
            config = CompanyAIConfig(
                company_id=company_id,
                provider_id=provider_id,
                llm_model="google/gemini-2.5-flash-lite",
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
        elif not config.provider_id:
            config.provider_id = provider_id
            await self.db.commit()
            await self.db.refresh(config)

        return config

    async def update_api_key(
        self,
        company_id: int,
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

    async def test_api_key(self, company_id: int) -> dict:
        """Test if the API key is valid by making a test request"""

        config = await self.get_or_create_config(company_id)

        if not config.api_key_is_set or not config.api_key_encrypted:
            return {"status": "error", "message": "API key not configured"}

        # Decrypt key
        api_key = decrypt_api_key(config.api_key_encrypted)

        # Test the key with OpenRouter API
        import httpx

        try:
            response = httpx.get(
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

    async def get_available_tools(self, company_id: int) -> List[dict]:
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
        company_id: int,
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

    async def get_full_config(self, company_id: int) -> dict:
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
