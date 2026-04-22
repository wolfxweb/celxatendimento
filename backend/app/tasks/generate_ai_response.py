"""
Celery task to generate AI response for tickets

In production, this would be a Celery task that:
1. Receives ticket creation event
2. Triggers the LangGraph agent
3. Saves the AI response
4. Notifies agents if needed
"""

import asyncio
from datetime import datetime
from typing import Optional

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ticket import Ticket
from app.models.ticket_ai_response import TicketAIResponse
from app.models.company_ai_config import CompanyAIConfig
from app.agents.langgraph.ticket_agent import process_ticket


async def generate_ai_response_task(
    db: AsyncSession,
    ticket_id: str,
) -> dict:
    """
    Celery task to generate AI response for a ticket

    Args:
        db: Database session
        ticket_id: UUID of the ticket

    Returns:
        dict with status and result
    """

    # Get ticket
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()

    if not ticket:
        return {
            "status": "error",
            "message": "Ticket not found",
        }

    # Get company AI config
    config_result = await db.execute(
        select(CompanyAIConfig).where(CompanyAIConfig.company_id == ticket.company_id)
    )
    ai_config = config_result.scalar_one_or_none()

    if not ai_config or not ai_config.api_key_is_set:
        return {
            "status": "error",
            "message": "AI not configured for this company",
        }

    # Update ticket status to pending_ai
    ticket.status = "pending_ai"
    await db.commit()

    try:
        # Prepare ticket data
        ticket_data = {
            "ticket_id": str(ticket.id),
            "company_id": str(ticket.company_id),
            "ticket_subject": ticket.subject,
            "ticket_description": ticket.description,
            "customer_email": "",  # Would get from user
            "priority": ticket.priority,
        }

        # Prepare AI config
        config = {
            "llm_model": ai_config.llm_model,
            "temperature": ai_config.temperature,
            "autonomy_level": ai_config.autonomy_level,
            "system_prompt": ai_config.system_prompt,
        }

        # Process ticket with AI agent
        result = await process_ticket(
            ticket_data=ticket_data,
            ai_config=config,
            api_key=ai_config.api_key_encrypted,
        )

        if result["status"] == "error":
            return result

        # Save AI response
        ai_response = TicketAIResponse(
            ticket_id=ticket.id,
            response_text=result["response"],
            context_used={
                "rag_sources": result.get("sources", []),
                "ticket_subject": ticket.subject,
                "ticket_category": ticket.category_id,
                "retrieval_score": 0.85,  # Would come from actual RAG
            },
            config_snapshot={
                "model": config["llm_model"],
                "temperature": config["temperature"],
                "autonomy_level": config["autonomy_level"],
                "tools_used": ["rag"],
            },
            generated_at=datetime.now(),
            processing_time_ms=result.get("processing_time_ms"),
            status="pending" if result["status"] == "pending_approval" else "approved",
        )

        db.add(ai_response)

        # If high autonomy, immediately approve and add message
        if result["status"] == "success":
            from app.models.ticket_message import TicketMessage

            message = TicketMessage(
                ticket_id=ticket.id,
                content=result["response"],
                message_type="ai_approved",
                ai_response_id=ai_response.id,
            )
            db.add(message)

            ticket.status = "pending_agent"

        await db.commit()

        return {
            "status": result["status"],
            "ai_response_id": ai_response.id,
            "processing_time_ms": result.get("processing_time_ms"),
        }

    except Exception as e:
        # Log error and update ticket status
        ticket.status = "open"
        await db.commit()

        return {
            "status": "error",
            "message": str(e),
        }


# Synchronous wrapper for Celery
def generate_ai_response_sync(db_session, ticket_id: str):
    """
    Synchronous wrapper to run the async task
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(generate_ai_response_task(db_session, ticket_id))
    finally:
        loop.close()
