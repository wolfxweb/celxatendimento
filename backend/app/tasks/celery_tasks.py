"""
Celery Tasks for Background Processing

Contains all async tasks for:
- AI response generation
- Notifications
- Cleanup jobs
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.celery_app import celery_app
from app.database import AsyncSessionLocal
from app.models.ticket import Ticket
from app.models.ticket_ai_response import TicketAIResponse
from app.models.ticket_message import TicketMessage
from app.models.company_ai_config import CompanyAIConfig
from app.ai.callbacks import get_langfuse_callbacks


async def get_db_session():
    """Get async database session"""
    async with AsyncSessionLocal() as session:
        return session


async def generate_ai_response_async(ticket_id: str) -> dict:
    """
    Async function to generate AI response for a ticket
    """
    async with AsyncSessionLocal() as db:
        # Get ticket
        result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
        ticket = result.scalar_one_or_none()

        if not ticket:
            return {"status": "error", "message": "Ticket not found"}

        # Get company AI config
        config_result = await db.execute(
            select(CompanyAIConfig).where(
                CompanyAIConfig.company_id == ticket.company_id
            )
        )
        ai_config = config_result.scalar_one_or_none()

        if not ai_config or not ai_config.api_key_is_set:
            return {"status": "error", "message": "AI not configured"}

        # Update ticket status
        ticket.status = "pending_ai"
        await db.commit()

        try:
            # Simulate AI processing (in production, call LangGraph agent)
            # This is where you would call process_ticket from ticket_agent.py

            # For now, generate a placeholder response
            generated_text = (
                f"Olá! Recebemos seu ticket sobre: '{ticket.subject}'\n\n"
                f"Nosso time está analisando sua solicitação e retornará em breve "
                f"com uma solução. Tempo estimado de resposta: 24 horas.\n\n"
                f"Seu número de protocolo: {ticket.ticket_number}"
            )

            processing_time_ms = 1500  # Simulated

            # Save AI response
            ai_response = TicketAIResponse(
                ticket_id=ticket.id,
                response_text=generated_text,
                context_used={
                    "rag_sources": [],
                    "ticket_subject": ticket.subject,
                    "ticket_category": str(ticket.category_id)
                    if ticket.category_id
                    else None,
                    "retrieval_score": 0.0,
                },
                config_snapshot={
                    "model": ai_config.llm_model,
                    "temperature": ai_config.temperature,
                    "autonomy_level": ai_config.autonomy_level,
                    "tools_used": ["rag"],
                },
                generated_at=datetime.now(),
                processing_time_ms=processing_time_ms,
                status="pending",
            )

            db.add(ai_response)
            await db.commit()

            return {
                "status": "success",
                "ai_response_id": ai_response.id,
                "processing_time_ms": processing_time_ms,
            }

        except Exception as e:
            # Rollback and set status back
            ticket.status = "open"
            await db.commit()

            return {"status": "error", "message": str(e)}


def run_async_task(coro):
    """Run async task in sync context"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, name="app.tasks.celery_tasks.generate_ai_response")
def generate_ai_response(self, ticket_id: str):
    """
    Celery task to generate AI response for a ticket

    This task:
    1. Updates ticket status to pending_ai
    2. Calls the LangGraph agent to generate response
    3. Saves the AI response to database
    4. Notifies agents if configured
    """
    try:
        result = run_async_task(generate_ai_response_async(ticket_id))

        if result["status"] == "success":
            # Notify agents about pending approval
            run_async_task(
                send_notification_async(
                    ticket_id=ticket_id,
                    notification_type="ai_response_pending",
                    message="Nova resposta de IA aguardando aprovação",
                )
            )
            return {"status": "success", "data": result}
        else:
            # Retry on failure
            raise Exception(result.get("message", "Unknown error"))

    except Exception as e:
        # Retry with backoff
        raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))


async def send_notification_async(
    ticket_id: str,
    notification_type: str,
    message: str,
    user_id: Optional[str] = None,
) -> dict:
    """
    Send notification to user or agents
    """
    async with AsyncSessionLocal() as db:
        # Get ticket
        result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
        ticket = result.scalar_one_or_none()

        if not ticket:
            return {"status": "error", "message": "Ticket not found"}

        # In production, you would:
        # 1. Send email notification
        # 2. Send push notification
        # 3. Send websocket notification for real-time UI update

        # For now, just log it
        print(
            f"[NOTIFICATION] {notification_type}: {message} for ticket {ticket.ticket_number}"
        )

        return {"status": "success"}


@celery_app.task(bind=True, name="app.tasks.celery_tasks.send_notification")
def send_notification(
    self,
    ticket_id: str,
    notification_type: str,
    message: str,
    user_id: Optional[str] = None,
):
    """
    Celery task to send notifications
    """
    try:
        result = run_async_task(
            send_notification_async(ticket_id, notification_type, message, user_id)
        )
        return result
    except Exception as e:
        print(f"[NOTIFICATION ERROR] {e}")
        return {"status": "error", "message": str(e)}


@celery_app.task(name="app.tasks.celery_tasks.cleanup_old_tickets")
def cleanup_old_tickets():
    """
    Periodic task to cleanup old closed tickets
    """

    async def _cleanup():
        async with AsyncSessionLocal() as db:
            try:
                # Find tickets closed more than 90 days ago
                cutoff_date = datetime.now() - timedelta(days=90)

                result = await db.execute(
                    select(Ticket).where(
                        and_(
                            Ticket.status == "closed",
                            Ticket.closed_at < cutoff_date,
                            Ticket.deleted_at.is_(None),
                        )
                    )
                )
                tickets = result.scalars().all()

                # Soft delete old tickets
                for ticket in tickets:
                    ticket.deleted_at = datetime.now()

                await db.commit()

                return {"status": "success", "deleted": len(tickets)}

            except Exception as e:
                print(f"[CLEANUP ERROR] {e}")
                return {"status": "error", "message": str(e)}

    return run_async_task(_cleanup())


@celery_app.task(name="app.tasks.celery_tasks.check_sla_breach")
def check_sla_breach():
    """
    Periodic task to check and mark SLA breaches
    """

    async def _check_sla():
        async with AsyncSessionLocal() as db:
            try:
                # Find open tickets past SLA deadline
                result = await db.execute(
                    select(Ticket).where(
                        and_(
                            Ticket.status.in_(["open", "pending_agent", "pending_ai"]),
                            Ticket.sla_due_at < datetime.now(),
                            Ticket.sla_breached == False,
                        )
                    )
                )
                tickets = result.scalars().all()

                # Mark as breached
                for ticket in tickets:
                    ticket.sla_breached = True

                    # Create system message
                    message = TicketMessage(
                        ticket_id=ticket.id,
                        content="⚠️ Este ticket estoura o SLA!",
                        message_type="system",
                        is_internal=True,
                    )
                    db.add(message)

                await db.commit()

                return {"status": "success", "breached": len(tickets)}

            except Exception as e:
                print(f"[SLA CHECK ERROR] {e}")
                return {"status": "error", "message": str(e)}

    return run_async_task(_check_sla())


# ===========================================
# Workflow Integration
# ===========================================


def trigger_ai_for_ticket(ticket_id: str):
    """
    Trigger AI processing for a newly created ticket

    Call this when a new ticket is created to start the AI workflow.
    """
    # Queue the task for background processing
    generate_ai_response.delay(ticket_id)


def notify_agents(ticket_id: str, message: str):
    """
    Send notification to agents about a ticket
    """
    send_notification.delay(
        ticket_id=ticket_id,
        notification_type="agent_notification",
        message=message,
    )
