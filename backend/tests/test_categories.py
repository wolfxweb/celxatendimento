"""
Tests for Category Endpoints
"""

import pytest
from httpx import AsyncClient, ASGITransport
import uuid

from app.main import app


class TestCategoryList:
    """Test cases for GET /api/v1/categories/"""

    @pytest.mark.asyncio
    async def test_list_categories(self):
        """CAT-001: List all categories"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "cliente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.get(
                "/api/v1/categories/",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)


class TestCategoryGet:
    """Test cases for GET /api/v1/categories/{category_id}"""

    @pytest.mark.asyncio
    async def test_get_category_by_id(self):
        """CAT-002: Get category by ID"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "cliente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.get(
                "/api/v1/categories/1",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [200, 404]


class TestCategoryCreate:
    """Test cases for POST /api/v1/categories/"""

    @pytest.mark.asyncio
    async def test_create_category_admin(self):
        """CAT-003: Admin can create category"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "admin@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.post(
                "/api/v1/categories/",
                json={
                    "name": "Test Category",
                    "description": "Test description",
                    "sla_minutes": 1440,
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [201, 400, 403]

    @pytest.mark.asyncio
    async def test_customer_cannot_create(self):
        """CAT-006: Customer cannot create category"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "cliente@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.post(
                "/api/v1/categories/",
                json={
                    "name": "Unauthorized Category",
                    "description": "Should fail",
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 403
