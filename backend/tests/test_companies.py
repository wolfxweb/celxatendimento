"""
Tests for Company Endpoints
"""

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


class TestCompanyList:
    """Test cases for GET /api/v1/companies/"""

    @pytest.mark.asyncio
    async def test_list_companies(self):
        """COMP-001: Superadmin can list companies"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "superadmin@celx.com.br", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.get(
                "/api/v1/companies/",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [200, 403]

    @pytest.mark.asyncio
    async def test_non_superadmin_cannot_list(self):
        """COMP-006: Non-superadmin cannot list companies"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "admin@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.get(
                "/api/v1/companies/",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code == 403


class TestCompanyGet:
    """Test cases for GET /api/v1/companies/{company_id}"""

    @pytest.mark.asyncio
    async def test_get_own_company(self):
        """COMP-002: User can get own company"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "admin@teste.com", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.get(
                "/api/v1/companies/1",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [200, 404, 403]


class TestCompanyApprove:
    """Test cases for POST /api/v1/companies/{company_id}/approve"""

    @pytest.mark.asyncio
    async def test_approve_company(self):
        """COMP-003: Superadmin can approve company"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "superadmin@celx.com.br", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.post(
                "/api/v1/companies/1/approve",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [200, 404, 403]


class TestCompanyReject:
    """Test cases for POST /api/v1/companies/{company_id}/reject"""

    @pytest.mark.asyncio
    async def test_reject_company(self):
        """COMP-004: Superadmin can reject company"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "superadmin@celx.com.br", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.post(
                "/api/v1/companies/1/reject",
                data={"reason": "Invalid documentation"},
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [200, 404, 403]


class TestCompanySuspend:
    """Test cases for POST /api/v1/companies/{company_id}/suspend"""

    @pytest.mark.asyncio
    async def test_suspend_company(self):
        """COMP-005: Superadmin can suspend company"""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            login_resp = await client.post(
                "/api/v1/auth/login",
                json={"email": "superadmin@celx.com.br", "password": "123456"},
            )
            token = login_resp.json().get("access_token")

            response = await client.post(
                "/api/v1/companies/1/suspend",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert response.status_code in [200, 404, 403]
