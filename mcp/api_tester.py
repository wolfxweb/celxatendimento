# =====================================================
# celx-atendimento - MCP Server for API Testing
# FastMCP implementation using official Python SDK
# =====================================================

import os
import httpx
from mcp.server.fastmcp import FastMCP

API_URL = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")

mcp = FastMCP("celx-api-tester", json_response=True)


@mcp.tool()
async def health_check() -> dict:
    """Check if the API is healthy"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{API_URL}/health")
        return resp.json()


@mcp.tool()
async def login(email: str, password: str) -> dict:
    """Test login endpoint and return token"""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{API_URL}/api/v1/auth/login",
            json={"email": email, "password": password},
        )
        return resp.json()


@mcp.tool()
async def list_tickets(token: str) -> dict:
    """List all tickets (requires auth token)"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{API_URL}/api/v1/tickets/",
            headers={"Authorization": f"Bearer {token}"},
        )
        return resp.json()


@mcp.tool()
async def create_ticket(
    token: str, subject: str, description: str, priority: str = "medium"
) -> dict:
    """Create a new ticket"""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{API_URL}/api/v1/tickets/",
            json={"subject": subject, "description": description, "priority": priority},
            headers={"Authorization": f"Bearer {token}"},
        )
        return resp.json()


@mcp.tool()
async def get_ticket(ticket_id: str, token: str) -> dict:
    """Get a specific ticket by ID"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{API_URL}/api/v1/tickets/{ticket_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        return resp.json()


@mcp.tool()
async def list_companies(token: str) -> dict:
    """List all companies (admin only)"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{API_URL}/api/v1/companies/",
            headers={"Authorization": f"Bearer {token}"},
        )
        return resp.json()


@mcp.tool()
async def list_categories(token: str) -> dict:
    """List all categories"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{API_URL}/api/v1/categories/",
            headers={"Authorization": f"Bearer {token}"},
        )
        return resp.json()


if __name__ == "__main__":
    mcp.run(transport="stdio")
