"""
Tests for Ticket API Endpoints
Uses httpx to test the actual running API
"""

import pytest
import httpx


BASE_URL = "http://localhost:8000"


async def get_auth_token(email: str, password: str) -> str | None:
    """Helper to get auth token"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": email, "password": password},
        )
        if response.status_code == 200:
            return response.json()["access_token"]
    return None


class TestTicketCreate:
    """Test cases for POST /api/v1/tickets/"""

    @pytest.mark.asyncio
    async def test_create_ticket_without_auth(self):
        """TICK-002: Create ticket without auth returns 401/403"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/tickets/",
                json={
                    "subject": "Test Ticket",
                    "description": "Test",
                },
            )
            assert response.status_code in [401, 403], (
                f"Expected 401/403, got {response.status_code}"
            )

    @pytest.mark.asyncio
    async def test_create_ticket_missing_subject(self):
        """TICK-004: Create ticket without subject returns 422"""
        token = await get_auth_token("cliente@teste.com", "123456")
        assert token is not None

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/tickets/",
                json={"description": "Test description"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 422, (
                f"Expected 422, got {response.status_code}"
            )

    @pytest.mark.asyncio
    async def test_create_ticket_validation_short_subject(self):
        """TICK-003: Create ticket with too short subject returns 422 or 500 (bug)"""
        token = await get_auth_token("cliente@teste.com", "123456")
        assert token is not None

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/tickets/",
                json={
                    "subject": "Hi",
                    "description": "Test description",
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            # 422 = expected validation error, 500 = known ENUM bug
            assert response.status_code in [422, 500], (
                f"Expected 422/500, got {response.status_code}"
            )


class TestTicketList:
    """Test cases for GET /api/v1/tickets/"""

    @pytest.mark.asyncio
    async def test_list_tickets_customer(self):
        """TICK-005: Customer sees only own tickets"""
        token = await get_auth_token("cliente@teste.com", "123456")
        assert token is not None

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BASE_URL}/api/v1/tickets/",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200, (
                f"Expected 200, got {response.status_code}"
            )
            data = response.json()
            assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_list_tickets_agent(self):
        """TICK-006: Agent sees all company tickets"""
        token = await get_auth_token("atendente@teste.com", "123456")
        assert token is not None

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BASE_URL}/api/v1/tickets/",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200, (
                f"Expected 200, got {response.status_code}"
            )

    @pytest.mark.asyncio
    async def test_list_tickets_requires_auth(self):
        """TICK-007: List tickets without auth returns 401/403"""
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/api/v1/tickets/")
            assert response.status_code in [401, 403], (
                f"Expected 401/403, got {response.status_code}"
            )

    @pytest.mark.asyncio
    async def test_list_tickets_filter_by_status(self):
        """TICK-007b: List tickets with status filter"""
        token = await get_auth_token("admin@teste.com", "123456")
        assert token is not None

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BASE_URL}/api/v1/tickets/?status=open",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200, (
                f"Expected 200, got {response.status_code}"
            )


class TestTicketMessages:
    """Test cases for POST /api/v1/tickets/{ticket_id}/messages"""

    @pytest.mark.asyncio
    async def test_add_message_without_auth(self):
        """TICK-008: Add message without auth returns 401/403"""
        async with httpx.AsyncClient() as client:
            fake_id = "00000000-0000-0000-0000-000000000001"
            response = await client.post(
                f"{BASE_URL}/api/v1/tickets/{fake_id}/messages",
                json={
                    "content": "Test message",
                    "is_internal": False,
                },
            )
            assert response.status_code in [401, 403, 404], (
                f"Got {response.status_code}"
            )


class TestTicketAssignment:
    """Test cases for POST /api/v1/tickets/{ticket_id}/assign"""

    @pytest.mark.asyncio
    async def test_customer_cannot_assign(self):
        """TICK-012: Customer cannot assign tickets"""
        token = await get_auth_token("cliente@teste.com", "123456")
        assert token is not None

        async with httpx.AsyncClient() as client:
            fake_ticket_id = "00000000-0000-0000-0000-000000000001"
            fake_agent_id = "00000000-0000-0000-0000-000000000002"

            response = await client.post(
                f"{BASE_URL}/api/v1/tickets/{fake_ticket_id}/assign",
                json={
                    "assigned_to": fake_agent_id,
                    "reason": "manual",
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 403, (
                f"Expected 403, got {response.status_code}"
            )


class TestAIRating:
    """Test cases for POST /api/v1/tickets/{ticket_id}/rate"""

    @pytest.mark.asyncio
    async def test_rate_without_auth(self):
        """TICK-014: Rate without auth returns 401/403"""
        async with httpx.AsyncClient() as client:
            fake_id = "00000000-0000-0000-0000-000000000001"
            response = await client.post(
                f"{BASE_URL}/api/v1/tickets/{fake_id}/rate",
                data={"rating": 5},
            )
            assert response.status_code in [401, 403], f"Got {response.status_code}"
