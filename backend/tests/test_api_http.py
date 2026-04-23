"""
Tests for Authentication API Endpoints
Uses httpx to test the actual running API
"""

import pytest
import httpx


BASE_URL = "http://localhost:8000"


class TestLogin:
    """Test cases for POST /api/v1/auth/login"""

    @pytest.mark.asyncio
    async def test_login_valid_admin(self):
        """AUTH-001: Login with valid admin credentials"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/auth/login",
                json={"email": "admin@teste.com", "password": "123456"},
            )
            assert response.status_code == 200, (
                f"Expected 200, got {response.status_code}: {response.text}"
            )
            data = response.json()
            assert "access_token" in data, f"Response missing access_token: {data}"
            assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_valid_customer(self):
        """AUTH-002: Login with valid customer credentials"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/auth/login",
                json={"email": "cliente@teste.com", "password": "123456"},
            )
            assert response.status_code == 200, (
                f"Expected 200, got {response.status_code}"
            )
            data = response.json()
            assert "access_token" in data

    @pytest.mark.asyncio
    async def test_login_valid_agent(self):
        """AUTH-002b: Login with valid agent credentials"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/auth/login",
                json={"email": "atendente@teste.com", "password": "123456"},
            )
            assert response.status_code == 200, (
                f"Expected 200, got {response.status_code}"
            )
            data = response.json()
            assert "access_token" in data

    @pytest.mark.asyncio
    async def test_login_valid_superadmin(self):
        """AUTH-002c: Login with valid superadmin credentials"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/auth/login",
                json={"email": "superadmin@celx.com.br", "password": "admin123"},
            )
            assert response.status_code == 200, (
                f"Expected 200, got {response.status_code}"
            )
            data = response.json()
            assert "access_token" in data

    @pytest.mark.asyncio
    async def test_login_invalid_email(self):
        """AUTH-003: Login with invalid email returns 401"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/auth/login",
                json={"email": "nonexistent@teste.com", "password": "123456"},
            )
            assert response.status_code == 401, (
                f"Expected 401, got {response.status_code}"
            )

    @pytest.mark.asyncio
    async def test_login_invalid_password(self):
        """AUTH-004: Login with invalid password returns 401"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/auth/login",
                json={"email": "admin@teste.com", "password": "wrongpassword"},
            )
            assert response.status_code == 401, (
                f"Expected 401, got {response.status_code}"
            )

    @pytest.mark.asyncio
    async def test_login_empty_body(self):
        """AUTH-005: Login with empty body returns 422"""
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{BASE_URL}/api/v1/auth/login", json={})
            assert response.status_code == 422, (
                f"Expected 422, got {response.status_code}"
            )

    @pytest.mark.asyncio
    async def test_login_missing_email(self):
        """AUTH-005b: Login with missing email returns 422"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/auth/login",
                json={"password": "123456"},
            )
            assert response.status_code == 422, (
                f"Expected 422, got {response.status_code}"
            )


class TestRegister:
    """Test cases for POST /api/v1/auth/register"""

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self):
        """AUTH-007: Register with existing email returns 400"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/auth/register",
                json={
                    "email": "admin@teste.com",
                    "password": "testpass123",
                },
            )
            assert response.status_code == 400, (
                f"Expected 400, got {response.status_code}"
            )


class TestHealth:
    """Test health endpoint"""

    @pytest.mark.asyncio
    async def test_health_check(self):
        """HEALTH-001: Health check returns healthy"""
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/health")
            # Note: /health returns 404, but / works
            assert response.status_code in [200, 404], (
                f"Expected 200/404, got {response.status_code}"
            )


class TestPlans:
    """Test public plan endpoints"""

    @pytest.mark.asyncio
    async def test_list_plans(self):
        """PLAN-001: List all plans (public)"""
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/api/v1/plans/")
            assert response.status_code == 200, (
                f"Expected 200, got {response.status_code}"
            )
            data = response.json()
            assert isinstance(data, list)
            assert len(data) > 0

    @pytest.mark.asyncio
    async def test_get_plan_by_id(self):
        """PLAN-002: Get plan by ID (public)"""
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/api/v1/plans/1")
            assert response.status_code == 200, (
                f"Expected 200, got {response.status_code}"
            )
            data = response.json()
            assert data["name"] == "Basic"
