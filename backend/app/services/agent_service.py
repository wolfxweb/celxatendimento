"""
Agent Service

Handles CRUD operations for agents and prompts, and chat with knowledge base.
"""

import json
import uuid
import re
from datetime import datetime
from typing import Optional, List, Dict, Any

import httpx
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.agent_config import AgentConfig, AgentType, AutonomyLevel
from app.models.agent_prompt import AgentPrompt, PromptType
from app.models.company_ai_config import CompanyAIConfig
from app.ai.callbacks import get_langfuse_client
from app.services.rag_service import RAGService


# Default prompts for different agent types
DEFAULT_CUSTOMER_SERVICE_PROMPT = """Você é um agente de atendimento ao cliente.

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


DEFAULT_KNOWLEDGE_QUERY_PROMPT = """Você é um assistente de consulta à base de conhecimento.

## Contexto
Você ajuda atendentes e administradores a encontrar informações na base de conhecimento da empresa.

## Regras de Comunicação
1. Seja claro e objetivo
2. Responda em português brasileiro
3. Use informações da base de conhecimento
4. Cite as fontes quando possível
5. Se a informação não estiver na base, diga que não encontrou

## Formato da Resposta
- Responda diretamente à pergunta
- Cite o título do artigo/fonte entre colchetes [ ]
- Informe a confiança na resposta (alta/baixa)"""


class AgentService:
    """Service for managing agents and their prompts"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.rag_service = RAGService(db)

    def _trace_chat_kb(
        self,
        *,
        query: str,
        response: str,
        agent: AgentConfig,
        company_id: int,
        user_id: Optional[str],
        user_name: Optional[str],
        sources: List[dict],
        confidence: str,
        processing_time_ms: Optional[int],
        mode: str,
    ) -> None:
        langfuse = get_langfuse_client()
        if not langfuse:
            return

        try:
            trace = langfuse.trace(
                name="chat-kb",
                user_id=user_id or "unknown",
                metadata={
                    "company_id": company_id,
                    "agent_id": str(agent.id),
                    "agent_name": agent.name,
                    "user_name": user_name,
                    "confidence": confidence,
                    "processing_time_ms": processing_time_ms,
                    "mode": mode,
                    "sources_count": len(sources),
                },
            )
            trace.generation(
                name="chat-kb-response",
                model=agent.llm_model,
                input=query,
                output=response,
                model_parameters={"temperature": agent.temperature},
                metadata={"sources": sources},
            )
            langfuse.flush()
        except Exception as exc:
            print(f"Langfuse chat-kb trace failed: {exc}")

    def _is_useful_kb_source(self, source: dict) -> bool:
        content = (source.get("content") or "").strip()
        if not content:
            return False

        useless_messages = [
            "Não foi possível extrair texto automaticamente deste arquivo.",
        ]
        if any(message in content for message in useless_messages):
            return False

        score = source.get("score")
        if isinstance(score, (int, float)) and 0 <= score <= 1:
            return score >= 0.3

        return True

    def _build_kb_prompt(
        self,
        *,
        query: str,
        sources: List[dict],
        system_prompt: Optional[str],
        user_name: Optional[str],
    ) -> str:
        context_blocks = []
        for index, source in enumerate(sources, start=1):
            context_blocks.append(
                f"[{index}] {source.get('title', 'Fonte sem título')}\n"
                f"{source.get('content', '').strip()}"
            )

        instructions = system_prompt or DEFAULT_KB_AGENT_PROMPT
        return f"""
{instructions}

Usuário: {user_name or "Atendente"}
Pergunta:
{query}

Fontes recuperadas por busca semântica/embedding:
{chr(10).join(context_blocks)}

Instruções para a resposta:
- Responda em português brasileiro.
- Use apenas as fontes acima como base factual.
- Não copie a lista de fontes literalmente.
- Não mencione scores, embeddings ou detalhes técnicos internos.
- Se as fontes não responderem à pergunta, diga isso de forma objetiva.
- Quando usar uma fonte, cite o título entre colchetes, por exemplo: [Sem internet].
""".strip()

    async def _generate_kb_ai_response(
        self,
        *,
        api_key: str,
        model: str,
        temperature: float,
        prompt: str,
    ) -> tuple[str, int]:
        start = datetime.now()

        async with httpx.AsyncClient(timeout=90) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": temperature,
                },
            )

        if response.status_code >= 400:
            try:
                detail = response.json()
            except ValueError:
                detail = response.text
            raise ValueError(f"OpenRouter retornou {response.status_code}: {detail}")

        payload = response.json()
        content = (
            payload.get("choices", [{}])[0]
            .get("message", {})
            .get("content")
        )
        if not content:
            raise ValueError("OpenRouter não retornou conteúdo para a resposta")

        processing_time_ms = int((datetime.now() - start).total_seconds() * 1000)
        return content.strip(), processing_time_ms

    # ==================== AGENT CRUD ====================

    async def create_agent(
        self,
        company_id: int,
        name: str,
        agent_type: str = AgentType.CUSTOMER_SERVICE,
        description: Optional[str] = None,
        llm_model: str = "google/gemini-2.5-flash-lite",
        temperature: float = 0.7,
        max_tokens: int = 2048,
        embedding_model: str = "text-embedding-3-small",
        tools: Optional[List[str]] = None,
        autonomy_level: str = AutonomyLevel.LOW,
    ) -> AgentConfig:
        """Create a new agent with default prompts"""

        agent = AgentConfig(
            company_id=company_id,
            name=name,
            description=description,
            agent_type=agent_type,
            llm_model=llm_model,
            temperature=temperature,
            max_tokens=max_tokens,
            embedding_model=embedding_model,
            tools=tools or (["rag"] if agent_type == AgentType.KNOWLEDGE_QUERY else ["rag"]),
            autonomy_level=autonomy_level,
            is_active=True,
        )

        self.db.add(agent)
        await self.db.flush()

        # Create default prompt for the agent
        await self._create_default_prompt(agent.id, company_id, agent_type)

        await self.db.commit()
        await self.db.refresh(agent)
        return agent

    async def _create_default_prompt(
        self,
        agent_id: uuid.UUID,
        company_id: int,
        agent_type: str,
    ) -> AgentPrompt:
        """Create default prompt based on agent type"""

        if agent_type == AgentType.KNOWLEDGE_QUERY:
            content = DEFAULT_KNOWLEDGE_QUERY_PROMPT
            name = "Prompt Padrão Consulta KB"
        else:
            content = DEFAULT_CUSTOMER_SERVICE_PROMPT
            name = "Prompt Padrão Atendimento"

        prompt = AgentPrompt(
            agent_id=agent_id,
            company_id=company_id,
            name=name,
            description="Prompt padrão criado automaticamente",
            prompt_type=PromptType.SYSTEM,
            content=content,
            variables=self._extract_variables(content),
            version=1,
            is_active=True,
            is_default=True,
        )

        self.db.add(prompt)

        # Link prompt to agent
        agent_result = await self.db.execute(
            select(AgentConfig).where(AgentConfig.id == agent_id)
        )
        agent = agent_result.scalar_one()
        agent.system_prompt_id = prompt.id
        agent.system_prompt = content  # Fallback

        return prompt

    async def get_agents(self, company_id: int) -> List[AgentConfig]:
        """Get all agents for a company"""
        result = await self.db.execute(
            select(AgentConfig)
            .where(AgentConfig.company_id == company_id)
            .order_by(AgentConfig.display_order, AgentConfig.created_at)
        )
        return result.scalars().all()

    async def get_agent(self, agent_id: uuid.UUID) -> Optional[AgentConfig]:
        """Get agent by ID"""
        result = await self.db.execute(
            select(AgentConfig)
            .options(selectinload(AgentConfig.prompts))
            .where(AgentConfig.id == agent_id)
        )
        return result.scalar_one_or_none()

    async def get_agent_by_type(
        self,
        company_id: int,
        agent_type: str,
    ) -> Optional[AgentConfig]:
        """Get active agent by type for a company"""
        result = await self.db.execute(
            select(AgentConfig).where(
                and_(
                    AgentConfig.company_id == company_id,
                    AgentConfig.agent_type == agent_type,
                    AgentConfig.is_active == True,
                )
            )
        )
        return result.scalar_one_or_none()

    async def update_agent(
        self,
        agent_id: uuid.UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
        llm_model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        embedding_model: Optional[str] = None,
        tools: Optional[List[str]] = None,
        autonomy_level: Optional[str] = None,
        is_active: Optional[bool] = None,
        display_order: Optional[int] = None,
    ) -> Optional[AgentConfig]:
        """Update agent configuration"""
        agent = await self.get_agent(agent_id)
        if not agent:
            return None

        if name is not None:
            agent.name = name
        if description is not None:
            agent.description = description
        if llm_model is not None:
            agent.llm_model = llm_model
        if temperature is not None:
            agent.temperature = temperature
        if max_tokens is not None:
            agent.max_tokens = max_tokens
        if embedding_model is not None:
            agent.embedding_model = embedding_model
        if tools is not None:
            agent.tools = tools
        if autonomy_level is not None:
            agent.autonomy_level = autonomy_level
        if is_active is not None:
            agent.is_active = is_active
        if display_order is not None:
            agent.display_order = display_order

        await self.db.commit()
        await self.db.refresh(agent)
        return agent

    async def delete_agent(self, agent_id: uuid.UUID) -> bool:
        """Soft delete an agent"""
        agent = await self.get_agent(agent_id)
        if not agent:
            return False

        agent.is_active = False
        await self.db.commit()
        return True

    # ==================== PROMPT CRUD ====================

    async def get_prompts(self, agent_id: uuid.UUID) -> List[AgentPrompt]:
        """Get all prompts for an agent"""
        result = await self.db.execute(
            select(AgentPrompt)
            .where(AgentPrompt.agent_id == agent_id)
            .order_by(AgentPrompt.version.desc())
        )
        return result.scalars().all()

    async def get_prompt(self, prompt_id: uuid.UUID) -> Optional[AgentPrompt]:
        """Get prompt by ID"""
        result = await self.db.execute(
            select(AgentPrompt).where(AgentPrompt.id == prompt_id)
        )
        return result.scalar_one_or_none()

    async def create_prompt(
        self,
        agent_id: uuid.UUID,
        company_id: int,
        name: str,
        content: str,
        prompt_type: str = PromptType.SYSTEM,
        description: Optional[str] = None,
    ) -> AgentPrompt:
        """Create a new prompt for an agent"""
        prompt = AgentPrompt(
            agent_id=agent_id,
            company_id=company_id,
            name=name,
            description=description,
            prompt_type=prompt_type,
            content=content,
            variables=self._extract_variables(content),
            version=1,
            is_active=True,
            is_default=False,
        )

        self.db.add(prompt)
        await self.db.commit()
        await self.db.refresh(prompt)
        return prompt

    async def update_prompt(
        self,
        prompt_id: uuid.UUID,
        name: Optional[str] = None,
        content: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Optional[AgentPrompt]:
        """Update a prompt (creates new version)"""
        prompt = await self.get_prompt(prompt_id)
        if not prompt:
            return None

        # Create new version instead of updating
        new_prompt = AgentPrompt(
            agent_id=prompt.agent_id,
            company_id=prompt.company_id,
            name=name or prompt.name,
            description=description or prompt.description,
            prompt_type=prompt.prompt_type,
            content=content or prompt.content,
            variables=self._extract_variables(content or prompt.content),
            version=prompt.version + 1,
            is_active=True,
            is_default=False,
        )

        # Deactivate old version
        prompt.is_active = False

        self.db.add(new_prompt)
        await self.db.commit()
        await self.db.refresh(new_prompt)
        return new_prompt

    async def delete_prompt(self, prompt_id: uuid.UUID) -> bool:
        """Soft delete a prompt"""
        prompt = await self.get_prompt(prompt_id)
        if not prompt:
            return False

        prompt.is_active = False
        await self.db.commit()
        return True

    # ==================== CHAT COM BASE DE CONHECIMENTO ====================

    async def chat_knowledge_base(
        self,
        company_id: int,
        query: str,
        agent_id: Optional[uuid.UUID] = None,
        user_id: Optional[str] = None,
        user_name: Optional[str] = None,
        include_sources: bool = True,
    ) -> Dict[str, Any]:
        """
        Chat with the knowledge base using RAG.
        If agent_id is provided, uses that agent's config.
        Otherwise, finds the knowledge_query agent for the company.
        """
        # Get agent (knowledge_query type by default)
        if agent_id:
            agent = await self.get_agent(agent_id)
        else:
            agent = await self.get_agent_by_type(
                company_id, AgentType.KNOWLEDGE_QUERY
            )

        if not agent:
            return {
                "success": False,
                "error": "Agente de consulta à base de conhecimento não encontrado",
            }

        # Get system prompt
        system_prompt = agent.system_prompt
        if agent.system_prompt_id:
            active_prompt = await self.get_prompt(agent.system_prompt_id)
            if active_prompt and active_prompt.is_active:
                system_prompt = active_prompt.content

        # Get API key from company config
        from app.services.ai_config_service import AIConfigService
        ai_service = AIConfigService(self.db)
        ai_config = await ai_service.get_or_create_config(company_id)

        if not ai_config.api_key_is_set or not ai_config.api_key_encrypted:
            return {
                "success": False,
                "error": "Chave de API não configurada. Configure em Configuração da IA.",
            }

        from app.core.security import decrypt_api_key
        api_key = decrypt_api_key(ai_config.api_key_encrypted)

        # Use LangGraph KB Query Agent for better responses
        try:
            from app.agents.langgraph.kb_query_agent import process_kb_query
            from app.ai.callbacks import get_langfuse_callbacks

            langfuse_callbacks = get_langfuse_callbacks()

            result = await process_kb_query(
                query=query,
                company_id=str(company_id),
                user_id=user_id or "unknown",
                user_name=user_name or "Atendente",
                agent_config={
                    "llm_model": agent.llm_model,
                    "temperature": agent.temperature,
                    "system_prompt": system_prompt or "",
                },
                api_key=api_key,
                callbacks=langfuse_callbacks,
            )

            # Only use result if it has a response (agent succeeded)
            if result and result.get("response"):
                self._trace_chat_kb(
                    query=query,
                    response=result["response"],
                    agent=agent,
                    company_id=company_id,
                    user_id=user_id,
                    user_name=user_name,
                    sources=result.get("sources", []),
                    confidence=result.get("confidence", "medium"),
                    processing_time_ms=result.get("processing_time_ms"),
                    mode="langgraph",
                )
                return result

            # If no response, log and continue to fallback
            print(f"KB Agent returned empty result: {result}")

        except Exception as e:
            # Log error but continue to fallback
            print(f"KB Agent failed with exception: {e}")

        # Fallback to simple RAG search if agent fails or returns empty
        search_results = await self.rag_service.search_similar(
            company_id=company_id,
            query=query,
            top_k=5,
        )

        useful_results = [
            source for source in search_results if self._is_useful_kb_source(source)
        ]

        if not useful_results:
            response = "Não encontrei informações relevantes na base de conhecimento para sua pergunta."
            self._trace_chat_kb(
                query=query,
                response=response,
                agent=agent,
                company_id=company_id,
                user_id=user_id,
                user_name=user_name,
                sources=[],
                confidence="low",
                processing_time_ms=None,
                mode="fallback-no-sources",
            )
            return {
                "success": True,
                "response": response,
                "confidence": "low",
                "sources": [],
            }

        prompt = self._build_kb_prompt(
            query=query,
            sources=useful_results,
            system_prompt=system_prompt,
            user_name=user_name,
        )

        try:
            response, processing_time_ms = await self._generate_kb_ai_response(
                api_key=api_key,
                model=agent.llm_model,
                temperature=agent.temperature,
                prompt=prompt,
            )
        except Exception as exc:
            print(f"KB fallback LLM failed with exception: {exc}")
            context = self._build_context(useful_results)
            response = (
                "Encontrei informações relacionadas na base de conhecimento, "
                f"mas não consegui gerar uma resposta automática agora.\n\n{context[:500]}..."
            )
            processing_time_ms = None

        self._trace_chat_kb(
            query=query,
            response=response,
            agent=agent,
            company_id=company_id,
            user_id=user_id,
            user_name=user_name,
            sources=useful_results if include_sources else [],
            confidence="medium",
            processing_time_ms=processing_time_ms,
            mode="fallback-rag-llm",
        )

        return {
            "success": True,
            "response": response,
            "confidence": "medium",
            "sources": useful_results if include_sources else [],
            "agent_id": str(agent.id),
            "agent_name": agent.name,
        }

    def _build_context(self, search_results: List[dict]) -> str:
        """Build context string from search results"""
        context_parts = []
        for i, result in enumerate(search_results, 1):
            context_parts.append(
                f"[{i}] {result['title']}\n{result['content']}"
            )
        return "\n\n".join(context_parts)

    def _generate_response(
        self,
        query: str,
        context: str,
        system_prompt: str,
        agent: AgentConfig,
    ) -> Dict[str, Any]:
        """
        Generate response using the LLM.
        For now, returns a simple structured response.
        In production, this would call the LLM via OpenRouter.
        """
        # Simple response generation (placeholder for LLM call)
        # In production, this would use httpx to call OpenRouter API

        return {
            "text": f"Baseando-me na base de conhecimento, aqui está o que encontrei para sua pergunta: '{query}'\n\n{context[:500]}...",
            "confidence": "medium" if context else "low",
        }

    # ==================== HELPERS ====================

    def _extract_variables(self, content: str) -> List[str]:
        """Extract variables from prompt content"""
        return re.findall(r'\{(\w+)\}', content)

    async def get_agent_full_config(
        self,
        company_id: int,
    ) -> Dict[str, Any]:
        """Get full configuration for all agents including prompts"""
        agents = await self.get_agents(company_id)

        agent_list = []
        for agent in agents:
            prompts = await self.get_prompts(agent.id)
            active_prompt = next(
                (p for p in prompts if p.is_active and p.is_default),
                prompts[0] if prompts else None
            )

            agent_list.append({
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
                "system_prompt": active_prompt.content if active_prompt else agent.system_prompt,
                "prompts": [
                    {
                        "id": str(p.id),
                        "name": p.name,
                        "prompt_type": p.prompt_type,
                        "version": p.version,
                        "is_active": p.is_active,
                        "is_default": p.is_default,
                    }
                    for p in prompts
                ],
            })

        return {
            "agents": agent_list,
            "total": len(agent_list),
        }

    # ==================== MIGRATION HELPERS ====================

    async def migrate_existing_config(
        self,
        company_id: int,
    ) -> List[AgentConfig]:
        """
        Migrate existing CompanyAIConfig to new AgentConfig structure.
        Creates customer_service agent from existing config.
        """
        from app.services.ai_config_service import AIConfigService

        ai_service = AIConfigService(self.db)
        old_config = await ai_service.get_or_create_config(company_id)

        # Check if already migrated
        existing = await self.get_agent_by_type(
            company_id, AgentType.CUSTOMER_SERVICE
        )
        if existing:
            return await self.get_agents(company_id)

        # Create customer_service agent from old config
        agent = await self.create_agent(
            company_id=company_id,
            name="Agente de Atendimento",
            agent_type=AgentType.CUSTOMER_SERVICE,
            description="Agente principal de atendimento ao cliente",
            llm_model=old_config.llm_model,
            temperature=old_config.temperature,
            max_tokens=old_config.max_tokens,
            embedding_model=old_config.embedding_model,
            tools=old_config.tools,
            autonomy_level=old_config.autonomy_level,
        )

        # Update agent with existing system prompt
        if old_config.system_prompt:
            prompt_result = await self.db.execute(
                select(AgentPrompt).where(
                    and_(
                        AgentPrompt.agent_id == agent.id,
                        AgentPrompt.is_default == True,
                    )
                )
            )
            prompt = prompt_result.scalar_one_or_none()
            if prompt:
                prompt.content = old_config.system_prompt
                agent.system_prompt = old_config.system_prompt
                await self.db.commit()

        return await self.get_agents(company_id)
