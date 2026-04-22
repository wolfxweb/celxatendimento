"""
Test Summary and Running Instructions
=====================================

## Backend API Tests (pytest)
Location: backend/tests/

### Running Backend Tests:
```bash
cd backend

# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py -v

# Run with coverage
pytest --cov=app tests/

# Run only authentication tests
pytest tests/test_auth.py -v

# Run only ticket tests
pytest tests/test_tickets.py -v
```

### Backend Test Files:
- test_auth.py - Authentication (login, register)
- test_tickets.py - Ticket CRUD, messages, assignment
- test_ai_approval.py - AI approve/reject/edit/feedback
- test_categories.py - Category management
- test_users.py - User management
- test_companies.py - Company management

### Test Database:
Uses DATABASE_URL = postgresql://postgres:postgres@localhost:5432/celx_atendimento_test

---

## Frontend E2E Tests (Playwright)
Location: frontend/tests/

### Running Frontend E2E Tests:
```bash
cd frontend

# Install Playwright browsers (first time only)
npx playwright install

# Install dependencies
npm install

# Run all E2E tests
npm run test:e2e

# Run with UI (visual mode)
npm run test:e2e:ui

# Run headed (see browser)
npm run test:e2e:headed

# Run specific test
npx playwright test e2e.spec.ts --grep "Login"
```

### Frontend Test Files:
- e2e.spec.ts - All E2E tests
- tickets.test.ts - Existing ticket unit tests (jest)

### Test Users:
| Email | Senha | Role |
|-------|-------|------|
| superadmin@celx.com.br | 123456 | Super Admin |
| admin@teste.com | 123456 | Admin |
| atendente@teste.com | 123456 | Atendente |
| cliente@teste.com | 123456 | Cliente |

---

## Test Priority Matrix

| Priority | Test Cases |
|----------|------------|
| P0 (Critical) | Login, Create Ticket, List Tickets |
| P1 (High) | Ticket Assignment, AI Approve/Reject |
| P2 (Medium) | Categories, Attachments, Knowledge |
| P3 (Low) | Plans, Companies (admin only) |

---

## Prerequisites

### For Backend Tests:
```bash
# Database must be running and accessible
# Required environment variables (or .env):
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/celx_atendimento_test
```

### For Frontend E2E Tests:
```bash
# Backend API must be running at http://localhost:8000
# Frontend must be running at http://localhost:3000
# Database must be accessible
```

---

## CI/CD Integration

To run in CI:
```bash
# Backend
cd backend && pip install -r requirements.txt && pytest tests/ --junitxml=report.xml

# Frontend
cd frontend && npm install && npx playwright install && npm run test:e2e
```
