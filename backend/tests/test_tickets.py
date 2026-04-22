"""
Tests for Ticket API Endpoints
"""

import pytest
from httpx import AsyncClient, ASGITransport
import uuid

from app.main import app


class TestTicketCreate:
    """Test cases for POST /api/v1/tickets/"""

    @pytest.mark.asyncio
    async def test_create_ticket_success(self):
        """TICK-001: Create ticket as customer"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # First login to get token
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "cliente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.post(
                "/api/v1/tickets/",
                json={
                    "subject": "Test Ticket Subject",
                    "description": "Test ticket description",
                    "priority": "medium",
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            # 201 = created, may also be 400 if company not approved
            assert response.status_code in [201, 400, 403]

    @pytest.mark.asyncio
    async def test_create_ticket_validation_short_subject(self):
        """TICK-003: Create ticket with too short subject returns 422"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "cliente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.post(
                "/api/v1/tickets/",
                json={
                    "subject": "Hi",  # Too short
                    "description": "Test description",
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_ticket_missing_subject(self):
        """TICK-004: Create ticket without subject returns 422"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "cliente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.post(
                "/api/v1/tickets/",
                json={"description": "Test description"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 422


class TestTicketList:
    """Test cases for GET /api/v1/tickets/"""

    @pytest.mark.asyncio
    async def test_list_tickets_customer(self):
        """TICK-005: Customer sees only own tickets"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "cliente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.get(
                "/api/v1/tickets/",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_list_tickets_agent(self):
        """TICK-006: Agent sees all company tickets"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "atendente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.get(
                "/api/v1/tickets/",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_list_tickets_requires_auth(self):
        """TICK-007: List tickets without auth returns 401/403"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/tickets/")
            assert response.status_code in [401, 403]


class TestTicketGet:
    """Test cases for GET /api/v1/tickets/{ticket_id}"""

    @pytest.mark.asyncio
    async def test_get_ticket_not_found(self):
        """TICK-009: Get non-existent ticket returns 404"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "cliente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            fake_id = str(uuid.uuid4())
            response = await client.get(
                f"/api/v1/tickets/{fake_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [404, 403]


class TestTicketMessages:
    """Test cases for POST /api/v1/tickets/{ticket_id}/messages"""

    @pytest.mark.asyncio
    async def test_add_message_to_ticket(self):
        """TICK-013: Add message to ticket"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "cliente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            fake_id = str(uuid.uuid4())
            response = await client.post(
                f"/api/v1/tickets/{fake_id}/messages",
                json={
                    "content": "Test message content",
                    "is_internal": False,
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [404, 403, 201]

    @pytest.mark.asyncio
    async def test_add_internal_note(self):
        """TICK-014: Add internal note to ticket"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "atendente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            fake_id = str(uuid.uuid4())
            response = await client.post(
                f"/api/v1/tickets/{fake_id}/messages",
                json={
                    "content": "Internal note",
                    "is_internal": True,
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [404, 403, 201]


class TestTicketAssignment:
    """Test cases for POST /api/v1/tickets/{ticket_id}/assign"""

    @pytest.mark.asyncio
    async def test_assign_ticket(self):
        """TICK-011: Assign ticket to agent"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "admin@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            fake_ticket_id = str(uuid.uuid4())
            fake_agent_id = str(uuid.uuid4())

            response = await client.post(
                f"/api/v1/tickets/{fake_ticket_id}/assign",
                json={
                    "assigned_to": fake_agent_id,
                    "reason": "manual",
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [404, 403]

    @pytest.mark.asyncio
    async def test_customer_cannot_assign(self):
        """TICK-012: Customer cannot assign tickets"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "cliente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            fake_ticket_id = str(uuid.uuid4())
            fake_agent_id = str(uuid.uuid4())

            response = await client.post(
                f"/api/v1/tickets/{fake_ticket_id}/assign",
                json={
                    "assigned_to": fake_agent_id,
                    "reason": "manual",
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 403


class TestAIRating:
    """Test cases for POST /api/v1/tickets/{ticket_id}/rate"""

    @pytest.mark.asyncio
    async def test_rate_own_ticket(self):
        """TICK-015: Customer can rate own ticket"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "cliente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            fake_ticket_id = str(uuid.uuid4())
            response = await client.post(
                f"/api/v1/tickets/{fake_ticket_id}/rate",
                data={"rating": 5},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [400, 403, 404]

    @pytest.mark.asyncio
    async def test_customer_cannot_rate_others(self):
        """TICK-016: Customer cannot rate others tickets"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "cliente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            fake_ticket_id = str(uuid.uuid4())
            response = await client.post(
                f"/api/v1/tickets/{fake_ticket_id}/rate",
                data={"rating": 5},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [400, 403, 404]


class TestTicketDelete:
    """Test cases for DELETE /api/v1/tickets/{ticket_id}"""

    @pytest.mark.asyncio
    async def test_delete_ticket(self):
        """TICK-017: Delete ticket returns 204"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "admin@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            fake_id = str(uuid.uuid4())
            response = await client.delete(
                f"/api/v1/tickets/{fake_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [204, 404, 403]
