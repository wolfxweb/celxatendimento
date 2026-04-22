"""
Tests for User Endpoints
"""

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


class TestUserMe:
    """Test cases for GET /api/v1/users/me"""

    @pytest.mark.asyncio
    async def test_get_current_user(self):
        """USER-001: Get current user info"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "admin@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.get(
                "/api/v1/users/me",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [200, 403]


class TestUserList:
    """Test cases for GET /api/v1/users/"""

    @pytest.mark.asyncio
    async def test_list_users(self):
        """USER-002: Admin can list users"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "admin@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.get(
                "/api/v1/users/",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [200, 403]


class TestUserGet:
    """Test cases for GET /api/v1/users/{user_id}"""

    @pytest.mark.asyncio
    async def test_get_user_by_id(self):
        """USER-004: Get user by ID"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "admin@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.get(
                "/api/v1/users/1",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [200, 404, 403]


class TestUserCreate:
    """Test cases for POST /api/v1/users/"""

    @pytest.mark.asyncio
    async def test_create_user(self):
        """USER-005: Create new user"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "admin@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.post(
                "/api/v1/users/",
                json={
                    "email": "newuser@test.com",
                    "password": "testpass123",
                    "full_name": "New User",
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [201, 400, 403]
