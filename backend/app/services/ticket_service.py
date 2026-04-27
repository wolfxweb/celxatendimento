from datetime import datetime, timedelta
from typing import Optional
import uuid

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert

from app.models.ticket import Ticket
from app.models.category import Category
from app.schemas.ticket import TicketCreate


class TicketService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_ticket_number(self, company_id: uuid.UUID) -> str:
        """Generate a ticket number in format TKT-YYYYMM000001"""
        year = datetime.now().year
        month = datetime.now().month

        # Get the current sequence value for this company/month
        result = await self.db.execute(
            select(func.count(Ticket.id)).where(
                and_(
                    Ticket.company_id == company_id,
                    func.to_char(Ticket.created_at, "YYYYMM") == f"{year}{month:02d}",
                )
            )
        )
        count = result.scalar() or 0

        return f"TKT-{year}{month:02d}{count + 1:06d}"

    async def get_sla_due_at(
        self, priority: str, category_id: Optional[int] = None
    ) -> datetime:
        """Calculate SLA due date based on priority"""
        sla_minutes = {
            "critical": 60,
            "high": 240,
            "medium": 1440,
            "low": 2880,
        }.get(priority, 1440)

        # If category has SLA override, use it
        if category_id:
            result = await self.db.execute(
                select(Category).where(Category.id == category_id)
            )
            category = result.scalar_one_or_none()
            if category and category.sla_minutes:
                sla_minutes = category.sla_minutes

        return datetime.now() + timedelta(minutes=sla_minutes)

    async def create_ticket(
        self,
        ticket_data: TicketCreate,
        user_id: uuid.UUID,
        company_id: uuid.UUID,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        trigger_ai: bool = True,
    ) -> Ticket:
        """Create a new ticket with all required fields"""

        ticket_number = await self.generate_ticket_number(company_id)
        sla_due_at = await self.get_sla_due_at(
            ticket_data.priority, ticket_data.category_id
        )

        ticket = Ticket(
            company_id=company_id,
            user_id=user_id,
            ticket_number=ticket_number,
            category_id=ticket_data.category_id,
            priority=ticket_data.priority,
            subject=ticket_data.subject,
            description=ticket_data.description,
            status="open",
            sla_due_at=sla_due_at,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        self.db.add(ticket)
        await self.db.commit()
        await self.db.refresh(ticket)

        # Trigger AI processing in background if enabled
        if trigger_ai:
            self._trigger_ai_processing(str(ticket.id))

        return ticket

    def _trigger_ai_processing(self, ticket_id: str):
        """
        Trigger AI processing for the ticket using Celery.
        This runs in background to not block the request.
        """
        try:
            from app.tasks.celery_tasks import trigger_ai_for_ticket

            trigger_ai_for_ticket(ticket_id)
        except Exception as e:
            # Log but don't fail ticket creation
            print(f"[WARNING] Failed to trigger AI processing: {e}")

    async def get_ticket_by_id(self, ticket_id: uuid.UUID) -> Optional[Ticket]:
        """Get ticket by ID"""
        result = await self.db.execute(select(Ticket).where(Ticket.id == ticket_id))
        return result.scalar_one_or_none()

    async def get_tickets_by_user(
        self,
        user_id: uuid.UUID,
        company_id: uuid.UUID,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Ticket]:
        """Get tickets for a user with optional filters"""
        query = select(Ticket).where(
            and_(
                Ticket.user_id == user_id,
                Ticket.company_id == company_id,
                Ticket.deleted_at.is_(None),
            )
        )

        if status:
            query = query.where(Ticket.status == status)

        query = query.order_by(Ticket.created_at.desc()).limit(limit).offset(offset)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_tickets_by_company(
        self,
        company_id: uuid.UUID,
        status: Optional[str] = None,
        assigned_to: Optional[uuid.UUID] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Ticket]:
        """Get tickets for a company with filters"""
        query = select(Ticket).where(
            and_(
                Ticket.company_id == company_id,
                Ticket.deleted_at.is_(None),
            )
        )

        if status:
            query = query.where(Ticket.status == status)
        if assigned_to:
            query = query.where(Ticket.assigned_to == assigned_to)

        query = query.order_by(Ticket.created_at.desc()).limit(limit).offset(offset)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def update_ticket_status(
        self,
        ticket_id: uuid.UUID,
        new_status: str,
    ) -> Optional[Ticket]:
        """Update ticket status and related timestamps"""
        ticket = await self.get_ticket_by_id(ticket_id)
        if not ticket:
            return None

        old_status = ticket.status
        ticket.status = new_status

        # Update timestamps based on status
        if new_status in ["pending_agent", "pending_customer_feedback"] and not ticket.first_response_at:
            ticket.first_response_at = datetime.now()
        elif new_status in ["resolved", "closed"]:
            ticket.resolved_at = datetime.now()
            if ticket.created_at:
                ticket.resolution_time_minutes = int(
                    (ticket.resolved_at - ticket.created_at).total_seconds() / 60
                )

        await self.db.commit()
        await self.db.refresh(ticket)
        return ticket

    async def assign_ticket(
        self,
        ticket_id: uuid.UUID,
        assigned_to: uuid.UUID,
        assigned_by: uuid.UUID,
        reason: str = "manual",
    ) -> Optional[Ticket]:
        """Assign ticket to an agent"""
        ticket = await self.get_ticket_by_id(ticket_id)
        if not ticket:
            return None

        ticket.assigned_to = assigned_to
        await self.db.commit()
        await self.db.refresh(ticket)
        return ticket

    async def add_message(
        self,
        ticket_id: uuid.UUID,
        author_id: uuid.UUID,
        content: str,
        message_type: str = "agent",
        is_internal: bool = False,
    ) -> Ticket:
        """Add a message to a ticket"""
        from app.models.ticket_message import TicketMessage

        message = TicketMessage(
            ticket_id=ticket_id,
            author_id=author_id,
            content=content,
            message_type=message_type,
            is_internal=is_internal,
        )

        self.db.add(message)

        # Update ticket timestamp
        ticket = await self.get_ticket_by_id(ticket_id)
        if ticket:
            ticket.updated_at = datetime.now()

        await self.db.commit()

        return ticket
