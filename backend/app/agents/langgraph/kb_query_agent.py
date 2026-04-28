"""
LangGraph Agent for Knowledge Base Query

This agent handles the workflow for internal users (agents/admins)
to query the knowledge base:

1. Receive user query
2. Search knowledge base (RAG)
3. Generate response using LLM
4. Return response with sources
"""

import json
from typing import TypedDict, Optional, List, Dict, Any
from datetime import datetime

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate


# State definition for Knowledge Query Agent
class KBQueryState(TypedDict):
    query: str
    company_id: str
    user_id: str
    user_name: str
    # RAG context
    rag_results: List[Dict[str, Any]]
    rag_context: str
    # AI Response
    generated_response: Optional[str]
    response_confidence: Optional[str]
    sources: List[Dict[str, Any]]
    processing_time_ms: Optional[int]
    # Config
    llm_model: str
    temperature: float
    system_prompt: str
    # Langfuse callbacks for tracing
    callbacks: Optional[List[Any]]
    # Error handling
    error: Optional[str]
    retry_count: int


DEFAULT_KB_SYSTEM_PROMPT = """Você é um assistente de consulta à base de conhecimento.

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
- Informe a confiança na resposta (alta/baixa)
"""


def create_kb_query_agent(
    api_key: str,
    model: str = "google/gemini-2.5-flash-lite",
    temperature: float = 0.7,
    callbacks: list = None,
):
    """
    Create a knowledge base query agent with LangGraph
    """

    # Initialize LLM with callbacks for Langfuse tracing
    llm = ChatOpenAI(
        api_key=api_key,
        model=model,
        temperature=temperature,
    )

    # Wrap LLM with callbacks if provided
    if callbacks:
        llm = llm.with_config({"callbacks": callbacks})

    # Build the graph
    workflow = StateGraph(KBQueryState)

    # Add nodes
    workflow.add_node("search_knowledge", search_knowledge_base)
    workflow.add_node("build_context", build_rag_context)
    workflow.add_node("generate_response", generate_kb_response)
    workflow.add_node("evaluate_confidence", evaluate_response_confidence)
    workflow.add_node("format_output", format_final_response)
    workflow.add_node("handle_error", handle_error)

    # Set entry point
    workflow.set_entry_point("search_knowledge")

    # Edges
    workflow.add_edge("search_knowledge", "build_context")
    workflow.add_edge("build_context", "generate_response")
    workflow.add_edge("generate_response", "evaluate_confidence")
    workflow.add_edge("evaluate_confidence", "format_output")
    workflow.add_edge("format_output", END)
    workflow.add_edge("handle_error", END)

    return workflow.compile()


async def search_knowledge_base(state: KBQueryState) -> KBQueryState:
    """
    Search the knowledge base for relevant information
    """
    try:
        from app.services.rag_service import RAGService
        from app.database import AsyncSessionLocal
        import uuid

        # Create DB session
        async with AsyncSessionLocal() as db:
            rag_service = RAGService(db)

            # Search knowledge base
            company_uuid = uuid.UUID(state["company_id"]) if state["company_id"] else None
            results = await rag_service.search_similar(
                company_id=company_uuid,
                query=state["query"],
                top_k=5,
            )

            state["rag_results"] = results
            state["sources"] = [
                {
                    "id": r.get("id"),
                    "title": r.get("title"),
                    "score": r.get("score", 0),
                    "source_type": r.get("source_type", "text"),
                }
                for r in results
            ]

        return state

    except Exception as e:
        state["error"] = f"RAG search failed: {str(e)}"
        state["retry_count"] = state.get("retry_count", 0) + 1
        return state


async def build_rag_context(state: KBQueryState) -> KBQueryState:
    """
    Build context string from RAG search results
    """
    try:
        context_parts = []

        if state["rag_results"]:
            context_parts.append("=== Base de Conhecimento ===\n")
            for i, result in enumerate(state["rag_results"], 1):
                title = result.get("title", "Sem título")
                content = result.get("content", "")
                score = result.get("score", 0)

                # Truncate long content
                if len(content) > 1000:
                    content = content[:1000] + "..."

                context_parts.append(
                    f"[{i}] {title}\n"
                    f"Relevância: {score:.2f}\n"
                    f"Conteúdo: {content}\n"
                )
        else:
            context_parts.append("Nenhuma informação relevante encontrada na base de conhecimento.")

        state["rag_context"] = "\n\n".join(context_parts)
        return state

    except Exception as e:
        state["error"] = f"Context building failed: {str(e)}"
        state["retry_count"] = state.get("retry_count", 0) + 1
        return state


async def generate_kb_response(state: KBQueryState) -> KBQueryState:
    """
    Generate response using the LLM
    """
    start_time = datetime.now()

    try:
        # Get system prompt
        system_prompt = state.get("system_prompt", DEFAULT_KB_SYSTEM_PROMPT)

        # Prepare prompt
        prompt = f"""{system_prompt}

=== Pergunta do Usuário ===
{state["query"]}

=== Contexto (Base de Conhecimento) ===
{state["rag_context"]}

=== Usuário ===
Nome: {state.get("user_name", "Atendente")}
ID: {state.get("user_id", "desconhecido")}

=== Instruções ===
Responda à pergunta do usuário usando as informações da base de conhecimento.
Se encontrar informações relevantes, cite-as usando [nome do artigo].
Se não encontrar informações relevantes, diga claramente que não encontrou.
Informe o nível de confiança na resposta.
Responda em português brasileiro.
"""

        # Generate response (callbacks already set in LLM via with_config)
        response = await llm.ainvoke(prompt)
        generated_text = (
            response.content if hasattr(response, "content") else str(response)
        )

        # Calculate processing time
        processing_time = int((datetime.now() - start_time).total_seconds() * 1000)

        state["generated_response"] = generated_text
        state["processing_time_ms"] = processing_time

        return state

    except Exception as e:
        state["error"] = f"Response generation failed: {str(e)}"
        state["retry_count"] = state.get("retry_count", 0) + 1
        return state


async def evaluate_response_confidence(state: KBQueryState) -> KBQueryState:
    """
    Evaluate the confidence of the generated response
    """
    try:
        response_text = state.get("generated_response", "")
        rag_results = state.get("rag_results", [])

        # Determine confidence based on RAG results
        if not rag_results:
            confidence = "low"
        elif len(rag_results) >= 3 and rag_results[0].get("score", 0) > 5:
            confidence = "high"
        elif len(rag_results) >= 1 and rag_results[0].get("score", 0) > 2:
            confidence = "medium"
        else:
            confidence = "low"

        # Adjust based on response characteristics
        if confidence != "low" and len(response_text) < 50:
            confidence = "medium"

        state["response_confidence"] = confidence

        return state

    except Exception as e:
        state["error"] = f"Confidence evaluation failed: {str(e)}"
        state["response_confidence"] = "low"
        return state


async def format_final_response(state: KBQueryState) -> KBQueryState:
    """
    Format the final response with sources
    """
    # Add metadata to response
    response = state.get("generated_response", "")

    # Add confidence indicator
    confidence = state.get("response_confidence", "low")
    confidence_emoji = {
        "high": "✅",
        "medium": "⚠️",
        "low": "❌"
    }.get(confidence, "❌")

    # Add sources section if available
    sources = state.get("sources", [])
    if sources:
        sources_text = "\n\n---\n**Fontes consultadas:**\n"
        for i, source in enumerate(sources, 1):
            title = source.get("title", "Sem título")
            sources_text += f"{i}. {title}\n"
        response += sources_text

    state["generated_response"] = f"{confidence_emoji} Confiança: {confidence.upper()}\n\n{response}"

    return state


async def handle_error(state: KBQueryState) -> KBQueryState:
    """
    Handle errors in the pipeline
    """
    print(f"KB Query Agent error for query '{state['query'][:50]}...': {state.get('error')}")

    # Return a user-friendly error message
    state["generated_response"] = (
        "❌ Desculpe, ocorreu um erro ao processar sua consulta à base de conhecimento. "
        "Tente novamente ou entre em contato com o administrador."
    )
    state["response_confidence"] = "low"

    return state


async def process_kb_query(
    query: str,
    company_id: str,
    user_id: str,
    user_name: str,
    agent_config: Dict[str, Any],
    api_key: str,
    callbacks: list = None,
) -> Dict[str, Any]:
    """
    Main entry point to query the knowledge base

    Args:
        query: User's question
        company_id: Company UUID
        user_id: User ID making the query
        user_name: User name for context
        agent_config: {
            "llm_model": str,
            "temperature": float,
            "system_prompt": str,
        }
        api_key: OpenRouter API key

    Returns:
        {
            "success": bool,
            "response": str,
            "confidence": str,
            "sources": list,
            "processing_time_ms": int,
            "error": str | None,
        }
    """

    # Initialize state
    initial_state: KBQueryState = {
        "query": query,
        "company_id": company_id,
        "user_id": user_id,
        "user_name": user_name,
        "rag_results": [],
        "rag_context": "",
        "generated_response": None,
        "response_confidence": None,
        "sources": [],
        "processing_time_ms": None,
        "llm_model": agent_config.get("llm_model", "google/gemini-2.5-flash-lite"),
        "temperature": agent_config.get("temperature", 0.7),
        "system_prompt": agent_config.get("system_prompt", DEFAULT_KB_SYSTEM_PROMPT),
        "callbacks": callbacks,
        "error": None,
        "retry_count": 0,
    }

    # Create and run agent
    try:
        agent = create_kb_query_agent(
            api_key,
            initial_state["llm_model"],
            initial_state["temperature"],
            callbacks=callbacks,
        )

        result = await agent.ainvoke(
            initial_state,
            config={"callbacks": callbacks} if callbacks else {}
        )

        # Process result
        if result.get("error") and result["retry_count"] >= 3:
            return {
                "success": False,
                "response": None,
                "confidence": "low",
                "sources": [],
                "processing_time_ms": result.get("processing_time_ms"),
                "error": result["error"],
            }

        return {
            "success": True,
            "response": result.get("generated_response"),
            "confidence": result.get("response_confidence", "medium"),
            "sources": result.get("sources", []),
            "processing_time_ms": result.get("processing_time_ms"),
            "error": result.get("error"),
        }

    except Exception as e:
        return {
            "success": False,
            "response": None,
            "confidence": "low",
            "sources": [],
            "processing_time_ms": None,
            "error": str(e),
        }