"""
pytest configuration and fixtures
"""

import asyncio
import os
import pytest
import pytest_asyncio
from typing import AsyncGenerator

# Set test database URL
os.environ["DATABASE_URL"] = (
    "postgresql://postgres:postgres@localhost:5432/celx_atendimento_test"
)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator:
    """Get async database session for tests"""
    from app.database import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def test_company(db_session):
    """Create a test company"""
    from app.models.company import Company

    company = Company(
        name="Test Company",
        domain="test.com",
        contact_email="test@test.com",
        status="active",
    )
    db_session.add(company)
    await db_session.commit()
    await db_session.refresh(company)

    yield company


@pytest_asyncio.fixture
async def test_user(db_session, test_company):
    """Create a test user"""
    from app.models.user import User
    from app.core.security import get_password_hash

    user = User(
        company_id=test_company.id,
        email="test@test.com",
        hashed_password=get_password_hash("testpass123"),
        full_name="Test User",
        role="admin",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    yield user


@pytest_asyncio.fixture
async def test_agent(db_session, test_company):
    """Create a test agent"""
    from app.models.user import User
    from app.core.security import get_password_hash

    agent = User(
        company_id=test_company.id,
        email="agent@test.com",
        hashed_password=get_password_hash("agentpass123"),
        full_name="Test Agent",
        role="agent",
        is_active=True,
    )
    db_session.add(agent)
    await db_session.commit()
    await db_session.refresh(agent)

    yield agent


@pytest_asyncio.fixture
async def test_customer(db_session, test_company):
    """Create a test customer"""
    from app.models.user import User
    from app.core.security import get_password_hash

    customer = User(
        company_id=test_company.id,
        email="customer@test.com",
        hashed_password=get_password_hash("customerpass123"),
        full_name="Test Customer",
        role="customer",
        is_active=True,
    )
    db_session.add(customer)
    await db_session.commit()
    await db_session.refresh(customer)

    yield customer


@pytest_asyncio.fixture
async def test_category(db_session, test_company):
    """Create a test category"""
    from app.models.category import Category

    category = Category(
        company_id=test_company.id,
        name="Test Category",
        description="A test category",
        sla_minutes=1440,
        is_active=True,
    )
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)

    yield category


@pytest_asyncio.fixture
async def test_ticket(db_session, test_company, test_customer, test_category):
    """Create a test ticket"""
    from app.models.ticket import Ticket

    ticket = Ticket(
        company_id=test_company.id,
        user_id=test_customer.id,
        ticket_number="TKT-TEST-000001",
        subject="Test Ticket",
        description="This is a test ticket",
        status="open",
        priority="medium",
        category_id=test_category.id,
    )
    db_session.add(ticket)
    await db_session.commit()
    await db_session.refresh(ticket)

    yield ticket


@pytest.fixture
def auth_headers(test_user):
    """Get auth headers for test user"""
    from app.core.security import create_access_token

    token = create_access_token(data={"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}
