"""
LangGraph Agent for Ticket AI Response Generation

This agent handles the workflow:
1. Receive ticket information
2. Search knowledge base (RAG)
3. Generate response using LLM
4. Route based on autonomy level:
   - low: always needs approval
   - medium: responds and notifies
   - high: responds directly
"""

import json
from typing import TypedDict, Optional
from datetime import datetime

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate


# State definition
class AgentState(TypedDict):
    ticket_id: str
    company_id: str
    ticket_subject: str
    ticket_description: str
    customer_email: str
    priority: str
    # RAG context
    rag_sources: list
    # AI Response
    generated_response: Optional[str]
    response_confidence: Optional[float]
    processing_time_ms: Optional[int]
    # Config
    llm_model: str
    temperature: float
    autonomy_level: str
    system_prompt: str
    # Error handling
    error: Optional[str]
    retry_count: int


def create_ticket_agent(
    api_key: str,
    model: str = "google/gemini-1.5-flash",
    temperature: float = 0.7,
    callbacks: list = None,
):
    """
    Create a ticket processing agent with LangGraph
    """

    # Initialize LLM
    llm = ChatOpenAI(
        api_key=api_key,
        model=model,
        temperature=temperature,
    )

    # Build the graph
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("search_knowledge", search_knowledge_base)
    workflow.add_node("generate_response", generate_ai_response)
    workflow.add_node("evaluate_confidence", evaluate_response_confidence)
    workflow.add_node("route_response", route_based_on_autonomy)
    workflow.add_node("send_to_customer", send_response_to_customer)
    workflow.add_node("notify_agents", notify_agents_pending_approval)
    workflow.add_node("save_pending_approval", save_for_manual_approval)
    workflow.add_node("handle_error", handle_error)

    # Set entry point
    workflow.set_entry_point("search_knowledge")

    # Edges
    workflow.add_edge("search_knowledge", "generate_response")
    workflow.add_edge("generate_response", "evaluate_confidence")
    workflow.add_edge("evaluate_confidence", "route_response")

    # Conditional routing
    workflow.add_conditional_edges(
        "route_response",
        lambda state: state["autonomy_level"],
        {
            "high": "send_to_customer",
            "medium": "send_to_customer",
            "low": "save_pending_approval",
        },
    )

    # Post-processing edges
    workflow.add_edge("send_to_customer", END)
    workflow.add_edge("save_pending_approval", END)
    workflow.add_edge("notify_agents", END)
    workflow.add_edge("handle_error", END)

    return workflow.compile()


async def search_knowledge_base(state: AgentState) -> AgentState:
    """
    Search the knowledge base for relevant information
    """
    try:
        # In production, this would query the vector database
        # For now, we'll simulate RAG search

        # Simulated RAG search - in production use pgvector or similar
        knowledge_context = []

        # This would be replaced with actual RAG implementation
        # Example:
        # results = await vector_store.similarity_search(
        #     query=state["ticket_subject"] + " " + state["ticket_description"],
        #     k=5,
        #     filter={"company_id": state["company_id"]}
        # )
        # knowledge_context = [doc.text for doc in results]

        state["rag_sources"] = knowledge_context
        return state

    except Exception as e:
        state["error"] = f"RAG search failed: {str(e)}"
        state["retry_count"] = state.get("retry_count", 0) + 1
        return state


async def generate_ai_response(state: AgentState) -> AgentState:
    """
    Generate AI response using the LLM
    """
    start_time = datetime.now()

    try:
        # Build prompt with context
        system_prompt = state.get("system_prompt", DEFAULT_SYSTEM_PROMPT)

        # Prepare context
        context_parts = []
        if state["rag_sources"]:
            context_parts.append("=== Base de Conhecimento ===")
            for i, source in enumerate(state["rag_sources"][:5], 1):
                context_parts.append(f"[{i}] {source}")

        context = (
            "\n\n".join(context_parts)
            if context_parts
            else "Nenhuma informação relevante encontrada na base de conhecimento."
        )

        # Create prompt
        prompt = f"""Você é um agente de atendimento ao cliente.{system_prompt}

        === Ticket do Cliente ===
        Assunto: {state["ticket_subject"]}
        Descrição: {state["ticket_description"]}
        Email: {state["customer_email"]}
        Prioridade: {state["priority"]}

        === Contexto (RAG) ===
        {context}

        === Instruções ===
        Responda ao ticket do cliente de forma profissional, amigável e útil.
        Se houver informações relevantes na base de conhecimento, use-as para fundamentar sua resposta.
        Se a pergunta estiver fora do escopo do atendimento, dirija o cliente para os canais adequados.
        Responda em português brasileiro.
        """

        # Generate response
        response = await llm.ainvoke(prompt, config={"callbacks": callbacks} if callbacks else {})
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


async def evaluate_response_confidence(state: AgentState) -> AgentState:
    """
    Evaluate the confidence of the generated response
    """
    try:
        response_text = state.get("generated_response", "")

        # Simple confidence heuristics
        # In production, could use a separate evaluation chain
        confidence = 0.5  # Base confidence

        # Higher confidence if RAG sources found
        if state.get("rag_sources"):
            confidence += 0.3

        # Lower confidence if response is very short
        if len(response_text) < 50:
            confidence -= 0.2

        # Higher confidence if response is substantial
        if len(response_text) > 200:
            confidence += 0.1

        # Clamp to 0-1
        state["response_confidence"] = max(0.0, min(1.0, confidence))

        return state

    except Exception as e:
        state["error"] = f"Confidence evaluation failed: {str(e)}"
        return state


async def route_based_on_autonomy(state: AgentState) -> AgentState:
    """
    Route the response based on company's autonomy level
    """
    # If there was an error, go to error handling
    if state.get("error"):
        return state

    # If confidence is very low, always route to manual approval
    if state.get("response_confidence", 0) < 0.3:
        state["autonomy_level"] = "low"

    # Return the autonomy level to trigger conditional edge
    return state


async def send_response_to_customer(state: AgentState) -> AgentState:
    """
    Send response directly to customer (high/medium autonomy)
    """
    # In production, this would:
    # 1. Save the AI response to ticket_messages with type "ai_approved"
    # 2. Update ticket status
    # 3. Send email notification to customer
    # 4. If medium autonomy, also notify agents

    try:
        # This would integrate with ticket service
        # await ticket_service.add_message(
        #     ticket_id=state["ticket_id"],
        #     content=state["generated_response"],
        #     message_type="ai_approved",
        #     is_internal=False,
        # )

        return state

    except Exception as e:
        state["error"] = f"Failed to send response: {str(e)}"
        return state


async def notify_agents_pending_approval(state: AgentState) -> AgentState:
    """
    Notify agents that a response is pending approval
    """
    # In production, this would:
    # 1. Create notification for all agents
    # 2. Update ticket status to "pending_ai"
    # 3. Send push notification / email

    return state


async def save_for_manual_approval(state: AgentState) -> AgentState:
    """
    Save response for manual approval (low autonomy)
    """
    try:
        # Save AI response with status "pending"
        # await ai_response_service.create_pending_response(
        #     ticket_id=state["ticket_id"],
        #     response_text=state["generated_response"],
        #     context_used={"rag_sources": state["rag_sources"]},
        #     config_snapshot={
        #         "model": state["llm_model"],
        #         "temperature": state["temperature"],
        #         "autonomy_level": state["autonomy_level"],
        #     },
        #     processing_time_ms=state["processing_time_ms"],
        # )
        return state

    except Exception as e:
        state["error"] = f"Failed to save for approval: {str(e)}"
        return state


async def handle_error(state: AgentState) -> AgentState:
    """
    Handle errors in the pipeline
    """
    # If we have retries left, we could loop back
    if state.get("retry_count", 0) < 3:
        # Could implement retry logic here
        pass

    # Log the error and continue
    print(f"Agent error for ticket {state['ticket_id']}: {state.get('error')}")

    return state


DEFAULT_SYSTEM_PROMPT = """

## Regras de Comunicação
    1. **Seja profissional e amigável** - Tratamento respeitoso em todas as interações
    2. **Seja claro e objetivo** - Respondas diretas, evitando rodeios
    3. **Use linguagem acessível** - Evite jargões técnicos desnecessários
    4. **Agradeça o contato** - Demonstre valorização pelo tempo do cliente

    ## Respondendo Tickets
    1. **Entenda o problema** - Leia atentamente a descrição do ticket
    2. **Identifique a categoria** - Determine se é dúvida, problema técnico, solicitação, etc.
    3. **Forneça a solução** - Se souber a resposta, forneça imediatamente
    4. **Se precisar de informações** - Solicite de forma clara e objetiva
    5. **Defina próximos passos** - Informe o cliente sobre o que acontece a seguir

    ## Quando Não Souber a Resposta
    1. Não invente informações
    2. Informe que vai verificar e retornará
    3. Se necessário, escalone para um atendente humano

    ## Informações da Empresa
    - Nome da Empresa: {company_name}
    - Suporte: Segunda a Sexta, 9h às 18h
    - Email: suporte@empresa.com
"""


async def process_ticket(
    ticket_data: dict,
    ai_config: dict,
    api_key: str,
    callbacks: list = None,
) -> dict:
    """
    Main entry point to process a ticket with AI

    Args:
        ticket_data: {
            "ticket_id": str,
            "company_id": str,
            "ticket_subject": str,
            "ticket_description": str,
            "customer_email": str,
            "priority": str,
        }
        ai_config: {
            "llm_model": str,
            "temperature": float,
            "autonomy_level": str,
            "system_prompt": str,
        }
        api_key: str

    Returns:
        {
            "status": "success" | "pending_approval" | "error",
            "response": str | None,
            "sources": list | None,
            "processing_time_ms": int | None,
            "error": str | None,
        }
    """

    # Initialize state
    initial_state: AgentState = {
        "ticket_id": ticket_data["ticket_id"],
        "company_id": ticket_data["company_id"],
        "ticket_subject": ticket_data["ticket_subject"],
        "ticket_description": ticket_data["ticket_description"],
        "customer_email": ticket_data["customer_email"],
        "priority": ticket_data.get("priority", "medium"),
        "rag_sources": [],
        "generated_response": None,
        "response_confidence": None,
        "processing_time_ms": None,
        "llm_model": ai_config.get("llm_model", "google/gemini-1.5-flash"),
        "temperature": ai_config.get("temperature", 0.7),
        "autonomy_level": ai_config.get("autonomy_level", "low"),
        "system_prompt": ai_config.get("system_prompt", DEFAULT_SYSTEM_PROMPT),
        "error": None,
        "retry_count": 0,
    }

    # Create and run agent
    agent = create_ticket_agent(
        api_key, initial_state["llm_model"], initial_state["temperature"], callbacks=callbacks
    )

    result = await agent.ainvoke(initial_state, config={"callbacks": callbacks} if callbacks else {})

    # Process result
    if result.get("error") and result["retry_count"] >= 3:
        return {
            "status": "error",
            "response": None,
            "sources": None,
            "processing_time_ms": result.get("processing_time_ms"),
            "error": result["error"],
        }

    if result["autonomy_level"] == "low":
        return {
            "status": "pending_approval",
            "response": result.get("generated_response"),
            "sources": result.get("rag_sources", []),
            "processing_time_ms": result.get("processing_time_ms"),
            "error": None,
        }

    return {
        "status": "success",
        "response": result.get("generated_response"),
        "sources": result.get("rag_sources", []),
        "processing_time_ms": result.get("processing_time_ms"),
        "error": None,
    }
