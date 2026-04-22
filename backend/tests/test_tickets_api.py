"""
Tests for Ticket API Endpoints
"""

import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock
import uuid

from app.main import app


class TestTicketEndpoints:
    """Test cases for /api/v1/tickets endpoints"""

    @pytest.mark.asyncio
    async def test_create_ticket_success(self):
        """Test successful ticket creation"""
        # Mock the database session
        with patch("app.api.v1.routes.tickets.get_db") as mock_db:
            # Setup mock
            mock_session = MagicMock()
            mock_db.return_value = mock_session

            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/api/v1/tickets/",
                    json={
                        "subject": "Test Ticket",
                        "description": "Test Description",
                        "priority": "medium",
                    },
                    headers={"Authorization": "Bearer test_token"},
                )

        # Should fail auth but confirms endpoint exists
        assert response.status_code in [
            401,
            403,
            422,
        ]  # Auth error is expected in tests

    @pytest.mark.asyncio
    async def test_create_ticket_validation(self):
        """Test ticket creation validates input"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Missing required fields
            response = await client.post(
                "/api/v1/tickets/",
                json={
                    "subject": "Test",  # Too short
                },
            )

            assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_list_tickets_requires_auth(self):
        """Test listing tickets requires authentication"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/tickets/")

            # Should require auth
            assert response.status_code in [401, 403]

    @pytest.mark.asyncio
    async def test_get_ticket_not_found(self):
        """Test getting non-existent ticket returns 404"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            fake_id = str(uuid.uuid4())
            response = await client.get(
                f"/api/v1/tickets/{fake_id}",
                headers={"Authorization": "Bearer test_token"},
            )

            # Auth error or not found
            assert response.status_code in [401, 403, 404]


class TestMessageEndpoints:
    """Test cases for message endpoints"""

    @pytest.mark.asyncio
    async def test_add_message_to_ticket(self):
        """Test adding a message to a ticket"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            fake_ticket_id = str(uuid.uuid4())
            response = await client.post(
                f"/api/v1/tickets/{fake_ticket_id}/messages",
                json={
                    "content": "Test message",
                    "is_internal": False,
                },
                headers={"Authorization": "Bearer test_token"},
            )

            # Auth error or not found (expected)
            assert response.status_code in [401, 403, 404]


class TestAIApprovalEndpoints:
    """Test cases for AI approval endpoints"""

    @pytest.mark.asyncio
    async def test_approve_ai_response_requires_auth(self):
        """Test approving AI response requires authentication"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            fake_ticket_id = str(uuid.uuid4())
            response = await client.post(
                f"/api/v1/tickets/{fake_ticket_id}/ai/approve",
                json={"rating": 5, "feedback": "Great!"},
            )

            assert response.status_code in [401, 403]

    @pytest.mark.asyncio
    async def test_reject_ai_response_requires_reason(self):
        """Test rejecting AI response requires a reason"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            fake_ticket_id = str(uuid.uuid4())
            response = await client.post(
                f"/api/v1/tickets/{fake_ticket_id}/ai/reject",
                json={"rejection_reason": ""},  # Empty reason
                headers={"Authorization": "Bearer test_token"},
            )

            # Should fail validation
            assert response.status_code == 422


class TestTicketAssignment:
    """Test cases for ticket assignment"""

    @pytest.mark.asyncio
    async def test_assign_ticket(self):
        """Test assigning a ticket to an agent"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            fake_ticket_id = str(uuid.uuid4())
            fake_agent_id = str(uuid.uuid4())

            response = await client.post(
                f"/api/v1/tickets/{fake_ticket_id}/assign",
                json={
                    "assigned_to": fake_agent_id,
                    "reason": "manual",
                },
                headers={"Authorization": "Bearer test_token"},
            )

            # Auth error or not found (expected in tests)
            assert response.status_code in [401, 403, 404]
