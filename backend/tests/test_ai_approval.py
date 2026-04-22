"""
Tests for AI Approval Endpoints
"""

import pytest
from httpx import AsyncClient, ASGITransport
import uuid

from app.main import app


class TestAIApprove:
    """Test cases for POST /api/v1/tickets/{ticket_id}/ai/approve"""

    @pytest.mark.asyncio
    async def test_approve_ai_response(self):
        """AI-001: Approve AI response"""
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
                f"/api/v1/tickets/{fake_id}/ai/approve",
                json={"rating": 5, "feedback": "Great response!"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [404, 403]


class TestAIReject:
    """Test cases for POST /api/v1/tickets/{ticket_id}/ai/reject"""

    @pytest.mark.asyncio
    async def test_reject_ai_response(self):
        """AI-002: Reject AI response"""
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
                f"/api/v1/tickets/{fake_id}/ai/reject",
                json={"rejection_reason": "Not accurate enough"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [404, 403]

    @pytest.mark.asyncio
    async def test_reject_without_reason(self):
        """AI-003: Reject without reason returns 422"""
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
                f"/api/v1/tickets/{fake_id}/ai/reject",
                json={"rejection_reason": ""},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 422


class TestAIEdit:
    """Test cases for POST /api/v1/tickets/{ticket_id}/ai/edit"""

    @pytest.mark.asyncio
    async def test_edit_ai_response(self):
        """AI-004: Edit AI response"""
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
                f"/api/v1/tickets/{fake_id}/ai/edit",
                json={"edited_response": "Fixed response text"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [404, 403]


class TestAIFeedback:
    """Test cases for POST /api/v1/tickets/{ticket_id}/ai/feedback"""

    @pytest.mark.asyncio
    async def test_submit_ai_feedback(self):
        """AI-005: Submit AI feedback"""
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
                f"/api/v1/tickets/{fake_id}/ai/feedback",
                data={"rating": 4, "feedback": "Good response"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [404, 403]


class TestAIExample:
    """Test cases for POST /api/v1/tickets/{ticket_id}/ai/example"""

    @pytest.mark.asyncio
    async def test_mark_as_good_example(self):
        """AI-006: Mark as good example"""
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
                f"/api/v1/tickets/{fake_id}/ai/example",
                data={"is_good": True},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [404, 403]


class TestAIStats:
    """Test cases for GET /api/v1/tickets/ai/stats"""

    @pytest.mark.asyncio
    async def test_get_ai_stats(self):
        """AI-007: Get AI stats"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "atendente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.get(
                "/api/v1/tickets/ai/stats",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [200, 403]


class TestCustomerAI:
    """Test cases for customer access to AI endpoints"""

    @pytest.mark.asyncio
    async def test_customer_cannot_approve(self):
        """AI-008: Customer cannot approve AI response"""
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
                f"/api/v1/tickets/{fake_id}/ai/approve",
                json={"rating": 5},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 403
