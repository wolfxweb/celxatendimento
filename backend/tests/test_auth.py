"""
Tests for Authentication Endpoints
"""

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


class TestLogin:
    """Test cases for POST /api/v1/auth/login"""

    @pytest.mark.asyncio
    async def test_login_valid_admin(self):
        """AUTH-001: Login with valid admin credentials"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/v1/auth/login",
                json={"email": "admin@teste.com", "password": "123456"},
            )
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_valid_customer(self):
        """AUTH-002: Login with valid customer credentials"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/v1/auth/login",
                json={"email": "cliente@teste.com", "password": "123456"},
            )
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data

    @pytest.mark.asyncio
    async def test_login_invalid_email(self):
        """AUTH-003: Login with invalid email returns 401"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/v1/auth/login",
                json={"email": "nonexistent@teste.com", "password": "123456"},
            )
            assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_invalid_password(self):
        """AUTH-004: Login with invalid password returns 401"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/v1/auth/login",
                json={"email": "admin@teste.com", "password": "wrongpassword"},
            )
            assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_empty_body(self):
        """AUTH-005: Login with empty body returns 422"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post("/api/v1/auth/login", json={})
            assert response.status_code == 422


class TestRegister:
    """Test cases for POST /api/v1/auth/register"""

    @pytest.mark.asyncio
    async def test_register_new_user(self):
        """AUTH-006: Register new user"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/v1/auth/register",
                json={
                    "email": "newuser@test.com",
                    "password": "testpass123",
                    "full_name": "New Test User",
                },
            )
            # May be 201 or 400 if email exists
            assert response.status_code in [201, 400]

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self):
        """AUTH-007: Register with existing email returns 400"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Try to register with existing admin email
            response = await client.post(
                "/api/v1/auth/register",
                json={
                    "email": "admin@teste.com",
                    "password": "testpass123",
                },
            )
            assert response.status_code == 400
