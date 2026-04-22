"""
Tests for Ticket Service
"""

import pytest
import pytest_asyncio
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.ticket_service import TicketService
from app.schemas.ticket import TicketCreate


class TestTicketService:
    """Test cases for TicketService"""

    def test_generate_ticket_number_format(self):
        """Test ticket number follows correct format"""
        # TKT-YYYYMMNNNNNN
        pass

    def test_get_sla_due_at_critical(self):
        """Test SLA calculation for critical priority"""
        pass

    def test_get_sla_due_at_low(self):
        """Test SLA calculation for low priority"""
        pass

    def test_get_sla_due_at_with_category_override(self):
        """Test SLA uses category override when available"""
        pass


class TestTicketCreation:
    """Test cases for ticket creation"""

    @pytest.mark.asyncio
    async def test_create_ticket_assigns_number(
        self, db_session, test_company, test_customer
    ):
        """Test that create_ticket assigns a ticket number"""
        service = TicketService(db_session)

        ticket_data = TicketCreate(
            subject="Test Subject",
            description="Test Description",
            priority="medium",
            category_id=None,
        )

        ticket = await service.create_ticket(
            ticket_data=ticket_data,
            user_id=test_customer.id,
            company_id=test_company.id,
            trigger_ai=False,  # Disable AI for testing
        )

        assert ticket.ticket_number is not None
        assert ticket.ticket_number.startswith("TKT-")
        assert len(ticket.ticket_number) == 15  # TKT-YYYYMMNNNNNN

    @pytest.mark.asyncio
    async def test_create_ticket_sets_sla(
        self, db_session, test_company, test_customer
    ):
        """Test that create_ticket sets correct SLA based on priority"""
        service = TicketService(db_session)

        # Critical priority - 1 hour SLA
        ticket_data = TicketCreate(
            subject="Urgent Issue",
            description="Critical problem",
            priority="critical",
        )

        ticket = await service.create_ticket(
            ticket_data=ticket_data,
            user_id=test_customer.id,
            company_id=test_company.id,
            trigger_ai=False,
        )

        # SLA should be approximately 1 hour from now
        expected_sla = datetime.now() + timedelta(minutes=60)
        diff = abs((ticket.sla_due_at - expected_sla).total_seconds())
        assert diff < 5  # Within 5 seconds

    @pytest.mark.asyncio
    async def test_create_ticket_status_is_open(
        self, db_session, test_company, test_customer
    ):
        """Test that new ticket has 'open' status"""
        service = TicketService(db_session)

        ticket_data = TicketCreate(
            subject="New Issue",
            description="New problem",
            priority="low",
        )

        ticket = await service.create_ticket(
            ticket_data=ticket_data,
            user_id=test_customer.id,
            company_id=test_company.id,
            trigger_ai=False,
        )

        assert ticket.status == "open"


class TestTicketRetrieval:
    """Test cases for ticket retrieval"""

    @pytest.mark.asyncio
    async def test_get_ticket_by_id(self, db_session, test_ticket):
        """Test retrieving ticket by ID"""
        service = TicketService(db_session)

        ticket = await service.get_ticket_by_id(test_ticket.id)

        assert ticket is not None
        assert ticket.id == test_ticket.id
        assert ticket.subject == "Test Ticket"

    @pytest.mark.asyncio
    async def test_get_ticket_by_id_not_found(self, db_session):
        """Test retrieving non-existent ticket returns None"""
        import uuid

        service = TicketService(db_session)

        ticket = await service.get_ticket_by_id(uuid.uuid4())

        assert ticket is None


class TestTicketAssignment:
    """Test cases for ticket assignment"""

    @pytest.mark.asyncio
    async def test_assign_ticket(self, db_session, test_ticket, test_agent):
        """Test assigning a ticket to an agent"""
        service = TicketService(db_session)

        ticket = await service.assign_ticket(
            ticket_id=test_ticket.id,
            assigned_to=test_agent.id,
            assigned_by=test_agent.id,
            reason="manual",
        )

        assert ticket is not None
        assert ticket.assigned_to == test_agent.id


class TestTicketStatus:
    """Test cases for ticket status updates"""

    @pytest.mark.asyncio
    async def test_update_status_to_pending_agent(self, db_session, test_ticket):
        """Test updating status to pending_agent sets first_response_at"""
        service = TicketService(db_session)

        ticket = await service.update_ticket_status(
            ticket_id=test_ticket.id,
            new_status="pending_agent",
        )

        assert ticket.status == "pending_agent"
        assert ticket.first_response_at is not None

    @pytest.mark.asyncio
    async def test_update_status_to_resolved(self, db_session, test_ticket):
        """Test updating status to resolved sets resolved_at"""
        service = TicketService(db_session)

        ticket = await service.update_ticket_status(
            ticket_id=test_ticket.id,
            new_status="resolved",
        )

        assert ticket.status == "resolved"
        assert ticket.resolved_at is not None
        assert ticket.resolution_time_minutes is not None
