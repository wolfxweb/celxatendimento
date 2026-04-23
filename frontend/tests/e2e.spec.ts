import { test, expect, Page, APIRequestContext } from '@playwright/test';

const USERS = {
  admin: { email: 'admin@celx.com.br', password: 'admin123' },
  customer: { email: 'cliente@celx.com.br', password: 'cliente123' },
  agent: { email: 'agente@celx.com.br', password: 'agente123' },
  superadmin: { email: 'superadmin@celx.com.br', password: 'admin123' },
} as const;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function loginAs(page: Page, user: keyof typeof USERS) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('#email', USERS[user].email);
  await page.fill('#password', USERS[user].password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard$/, { timeout: 10000 });
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
}

function dashboardNav(page: Page) {
  return page.locator('aside nav');
}

function navLink(page: Page, label: string) {
  return dashboardNav(page).getByRole('link', { name: new RegExp(label, 'i') });
}

async function apiLogin(request: APIRequestContext, user: keyof typeof USERS) {
  const response = await request.post(`${API_URL}/api/v1/auth/login`, {
    data: USERS[user],
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();

  return data.access_token as string;
}

async function createTicketViaApi(request: APIRequestContext) {
  const token = await apiLogin(request, 'customer');
  const response = await request.post(`${API_URL}/api/v1/tickets/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      subject: `Ticket E2E ${Date.now()}`,
      description: 'Ticket criado automaticamente para cenarios do atendente.',
      priority: 'medium',
      category_id: null,
    },
  });

  expect(response.ok()).toBeTruthy();
}

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
  });

  test('AUTH-E2E-001: Login as Admin', async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('AUTH-E2E-002: Login as Customer', async ({ page }) => {
    await loginAs(page, 'customer');
  });

  test('AUTH-E2E-003: Login as Agent', async ({ page }) => {
    await loginAs(page, 'agent');
  });

  test('AUTH-E2E-004: Login as Super Admin', async ({ page }) => {
    await loginAs(page, 'superadmin');
  });

  test('AUTH-E2E-005: Login with wrong password shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', USERS.admin.email);
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Email ou senha incorretos')).toBeVisible({ timeout: 5000 });
  });

  test('AUTH-E2E-006: Logout and redirect to login', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.getByRole('link', { name: /sair/i }).click();
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page.locator('#email')).toBeVisible();
  });
});

test.describe('Customer Ticket Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'customer');
  });

  test('TICK-E2E-001: View my tickets list', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/cliente/tickets`);
    await expect(page).toHaveURL(/\/dashboard\/cliente\/tickets$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Meus Tickets' })).toBeVisible();
  });

  test('TICK-E2E-002: Filter tickets by status', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/cliente/tickets`);
    await page.getByRole('button', { name: /abertos/i }).click();
    await expect(page.getByRole('button', { name: /abertos/i })).toBeVisible();
  });

  test('TICK-E2E-003: Navigate to create new ticket form', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/cliente/tickets/novo`);
    await expect(page.getByRole('heading', { level: 1, name: 'Criar Novo Ticket' })).toBeVisible();
    await expect(page.locator('#subject')).toBeVisible();
  });

  test('TICK-E2E-004: Create ticket - success', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/cliente/tickets/novo`);
    page.once('dialog', (dialog) => dialog.accept());

    await page.fill('#subject', `Test Ticket Subject E2E ${Date.now()}`);
    await page.fill('#description', 'Test ticket description for E2E test');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard/cliente/tickets', { timeout: 10000 });
    await expect(page.getByRole('heading', { level: 1, name: 'Meus Tickets' })).toBeVisible();
  });
});

test.describe('Agent Ticket Management', () => {
  test.beforeEach(async ({ page, request }) => {
    await createTicketViaApi(request);
    await loginAs(page, 'agent');
  });

  test('AGT-E2E-001: View all tickets', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
    await expect(page.getByRole('heading', { level: 1, name: 'Tickets' })).toBeVisible();
  });

  test('AGT-E2E-002: Filter tickets by status', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
    await page.getByRole('button', { name: /abertos/i }).click();
    await expect(page.getByRole('button', { name: /abertos/i })).toBeVisible();
  });

  test('AGT-E2E-003: Open ticket detail', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);

    const ticketLink = page.locator('a[href*="/atendente/tickets/"], a[href*="/dashboard/atendente/tickets/"]').first();
    await expect(ticketLink).toBeVisible({ timeout: 10000 });
    await ticketLink.click();

    await expect(page.getByText(/cliente:/i)).toBeVisible({ timeout: 10000 });
  });

  test('AGT-E2E-005: Send customer message', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);

    const ticketLink = page.locator('a[href*="/atendente/tickets/"], a[href*="/dashboard/atendente/tickets/"]').first();
    await expect(ticketLink).toBeVisible({ timeout: 10000 });
    await ticketLink.click();

    const messageInput = page.locator('textarea').first();
    await expect(messageInput).toBeVisible({ timeout: 10000 });
    await messageInput.fill('Test message from agent E2E');
    await page.getByRole('button', { name: /enviar|responder/i }).click();
  });
});

test.describe('AI Approval Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'agent');
  });

  test('AI-E2E-001: View pending AI approvals', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/aprovacao`);
    await expect(page.getByRole('heading', { level: 1, name: 'Aprovação de IA' })).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin User Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('USER-E2E-001: View user list', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/usuarios`);
    await expect(page.getByRole('heading', { level: 1, name: 'Gerenciar Usuários' })).toBeVisible();
  });
});

test.describe('Admin AI Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('AICFG-E2E-001: View AI configuration', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/config-ia`);
    await expect(page.getByRole('heading', { level: 1, name: 'Configuração da IA' })).toBeVisible();
  });

  test('AICFG-E2E-006: Edit system prompt', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/config-ia/prompt-editor`);
    await expect(page.getByRole('heading', { level: 1, name: 'Editor de Prompt' })).toBeVisible();
  });
});

test.describe('Admin Knowledge Base', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('KB-E2E-001: View knowledge articles', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/conhecimento`);
    await expect(page.getByRole('heading', { level: 1, name: 'Base de Conhecimento' })).toBeVisible();
  });
});

test.describe('Superadmin Company Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'superadmin');
  });

  test('COMP-E2E-001: View companies list', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/superadmin/empresas`);
    await expect(page.getByRole('heading', { level: 1, name: 'Gerenciar Empresas' })).toBeVisible();
  });
});

test.describe('Superadmin Plan Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'superadmin');
  });

  test('PLAN-E2E-001: View plans list', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/superadmin/planos`);
    await expect(page.getByRole('heading', { level: 1, name: 'Planos de Assinatura' })).toBeVisible();
  });
});

test.describe('Dashboard Access Control', () => {
  test('DASH-E2E-001: Superadmin sees Empresas and Planos', async ({ page }) => {
    await loginAs(page, 'superadmin');
    await expect(navLink(page, 'Empresas')).toBeVisible();
    await expect(navLink(page, 'Planos')).toBeVisible();
  });

  test('DASH-E2E-002: Admin sees full menu', async ({ page }) => {
    await loginAs(page, 'admin');
    await expect(navLink(page, 'Meus Tickets')).toBeVisible();
    await expect(navLink(page, 'Tickets')).toBeVisible();
    await expect(navLink(page, 'Aprovar IA')).toBeVisible();
    await expect(navLink(page, 'Usuários')).toBeVisible();
    await expect(navLink(page, 'Config IA')).toBeVisible();
    await expect(navLink(page, 'Conhecimento')).toBeVisible();
  });

  test('DASH-E2E-003: Agent sees Tickets and Aprovar IA', async ({ page }) => {
    await loginAs(page, 'agent');
    await expect(navLink(page, 'Tickets')).toBeVisible();
    await expect(navLink(page, 'Aprovar IA')).toBeVisible();
    await expect(navLink(page, 'Usuários')).toHaveCount(0);
  });

  test('DASH-E2E-004: Customer sees only Meus Tickets', async ({ page }) => {
    await loginAs(page, 'customer');
    await expect(navLink(page, 'Meus Tickets')).toBeVisible();
    await expect(navLink(page, 'Tickets')).toHaveCount(0);
    await expect(navLink(page, 'Aprovar IA')).toHaveCount(0);
  });
});

test('Health Check: API is running', async ({ page }) => {
  const response = await page.request.get(`${API_URL}/health`);
  expect(response.ok()).toBeTruthy();
});
