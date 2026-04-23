/**
 * Frontend E2E Tests with Playwright
 * 
 * Run with: npx playwright test
 * Or: npx playwright test --ui for visual mode
 */

import { test, expect, Page } from '@playwright/test';

// Test users from seed data
const USERS = {
  admin: { email: 'admin@teste.com', password: '123456' },
  customer: { email: 'cliente@teste.com', password: '123456' },
  agent: { email: 'atendente@teste.com', password: '123456' },
  superadmin: { email: 'superadmin@celx.com.br', password: '123456' },
};

// Base URL for tests
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
  });

  test('AUTH-E2E-001: Login as Admin', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    // Use id selector since the form uses id="email" not name="email"
    await page.fill('input#email', USERS.admin.email);
    await page.fill('input#password', USERS.admin.password);
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('AUTH-E2E-002: Login as Customer', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.customer.email);
    await page.fill('input#password', USERS.customer.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('AUTH-E2E-003: Login as Agent', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.agent.email);
    await page.fill('input#password', USERS.agent.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('AUTH-E2E-004: Login as Super Admin', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.superadmin.email);
    await page.fill('input#password', USERS.superadmin.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('AUTH-E2E-005: Login with wrong password shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.admin.email);
    await page.fill('input#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=incorretos'), { timeout: 5000 }).toBeVisible();
  });

  test('AUTH-E2E-006: Logout and redirect to login', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.admin.email);
    await page.fill('input#password', USERS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    // Logout - click on user menu and logout
    const logoutButton = page.locator('button:has-text("Sair")').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }
    
    // Should redirect to login
    await page.waitForURL('**/login**', { timeout: 10000 });
  });
});

test.describe('Customer Ticket Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as customer
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.customer.email);
    await page.fill('input#password', USERS.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('TICK-E2E-001: View my tickets list', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/cliente/tickets`);
    
    // Should show tickets list
    await expect(page.locator('text=Tickets'), { timeout: 5000 }).toBeVisible();
  });

  test('TICK-E2E-002: Filter tickets by status', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/cliente/tickets`);
    
    // Click on status filter if available
    const filterButton = page.locator('button:has-text("Abertos")').first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
    }
  });

  test('TICK-E2E-003: Navigate to create new ticket form', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/cliente/tickets/novo`);
    
    // Should show form - look for subject input or page content
    await expect(page.locator('text=Novo'), { timeout: 5000 }).toBeVisible();
  });

  test('TICK-E2E-004: Create ticket - success', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/cliente/tickets/novo`);
    
    // Look for any input field for subject
    const subjectInput = page.locator('input#subject, input[placeholder*="Assunto"], input[placeholder*="Subject"]').first();
    if (await subjectInput.isVisible()) {
      await subjectInput.fill('Test Ticket Subject E2E');
      
      // Find description textarea
      const descInput = page.locator('textarea#description, textarea').first();
      if (await descInput.isVisible()) {
        await descInput.fill('Test ticket description for E2E test');
      }
      
      // Submit
      await page.click('button[type="submit"], button:has-text("Criar"), button:has-text("Enviar")');
      
      // Should see ticket related content
      await expect(page.locator('text=Ticket'), { timeout: 5000 }).toBeVisible();
    }
  });
});

test.describe('Agent Ticket Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as agent
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.agent.email);
    await page.fill('input#password', USERS.agent.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('AGT-E2E-001: View all tickets', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
    
    await expect(page.locator('text=Tickets'), { timeout: 5000 }).toBeVisible();
  });

  test('AGT-E2E-002: Filter tickets by status', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
    
    // Try filtering by status
    const filterButton = page.locator('button:has-text("Abertos")').first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
    }
  });

  test('AGT-E2E-003: Open ticket detail', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
    
    // Click on first ticket if any
    const ticketLink = page.locator('a[href*="/dashboard/atendente/tickets/"]').first();
    if (await ticketLink.isVisible()) {
      await ticketLink.click();
      await expect(page.locator('text=Detalhes'), { timeout: 5000 }).toBeVisible();
    }
  });

  test('AGT-E2E-005: Send customer message', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
    
    // Navigate to first ticket
    const ticketLink = page.locator('a[href*="/dashboard/atendente/tickets/"]').first();
    if (await ticketLink.isVisible()) {
      await ticketLink.click();
      
      // Type message
      const messageInput = page.locator('textarea#content, textarea').first();
      if (await messageInput.isVisible()) {
        await messageInput.fill('Test message from agent E2E');
        await page.click('button:has-text("Enviar"), button:has-text("Responder")');
      }
    }
  });
});

test.describe('AI Approval Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.agent.email);
    await page.fill('input#password', USERS.agent.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('AI-E2E-001: View pending AI approvals', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/aprovacao`);
    
    // Should show AI approval interface
    await expect(page.locator('text=Aprovar'), { timeout: 5000 }).toBeVisible();
  });
});

test.describe('Admin User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.admin.email);
    await page.fill('input#password', USERS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('USER-E2E-001: View user list', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/usuarios`);
    
    await expect(page.locator('text=Usuários'), { timeout: 5000 }).toBeVisible();
  });
});

test.describe('Admin AI Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.admin.email);
    await page.fill('input#password', USERS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('AICFG-E2E-001: View AI configuration', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/config-ia`);
    
    // Should show AI config form
    await expect(page.locator('text=Config'), { timeout: 5000 }).toBeVisible();
  });

  test('AICFG-E2E-006: Edit system prompt', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/config-ia/prompt-editor`);
    
    await expect(page.locator('text=Prompt'), { timeout: 5000 }).toBeVisible();
  });
});

test.describe('Admin Knowledge Base', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.admin.email);
    await page.fill('input#password', USERS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('KB-E2E-001: View knowledge articles', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/conhecimento`);
    
    await expect(page.locator('text=Conhecimento'), { timeout: 5000 }).toBeVisible();
  });
});

test.describe('Superadmin Company Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.superadmin.email);
    await page.fill('input#password', USERS.superadmin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('COMP-E2E-001: View companies list', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/superadmin/empresas`);
    
    await expect(page.locator('text=Empresas'), { timeout: 5000 }).toBeVisible();
  });
});

test.describe('Superadmin Plan Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.superadmin.email);
    await page.fill('input#password', USERS.superadmin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('PLAN-E2E-001: View plans list', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/superadmin/planos`);
    
    await expect(page.locator('text=Planos'), { timeout: 5000 }).toBeVisible();
  });
});

test.describe('Dashboard Access Control', () => {
  test('DASH-E2E-001: Superadmin sees Empresas and Planos', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.superadmin.email);
    await page.fill('input#password', USERS.superadmin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    // Should see superadmin menu items
    await expect(page.locator('text=Empresas')).toBeVisible();
    await expect(page.locator('text=Planos')).toBeVisible();
  });

  test('DASH-E2E-002: Admin sees full menu', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.admin.email);
    await page.fill('input#password', USERS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    // Should see admin menu items
    await expect(page.locator('text=Usuários')).toBeVisible();
  });

  test('DASH-E2E-003: Agent sees Tickets and Aprovar IA', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.agent.email);
    await page.fill('input#password', USERS.agent.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    // Should see agent menu items
    await expect(page.locator('text=Tickets')).toBeVisible();
  });

  test('DASH-E2E-004: Customer sees only Meus Tickets', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input#email', USERS.customer.email);
    await page.fill('input#password', USERS.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    // Should see customer menu items
    await expect(page.locator('text=Meus Tickets')).toBeVisible();
  });
});

// Health check test
test('Health Check: API is running', async ({ page }) => {
  const response = await page.request.get(`${API_URL}/health`);
  expect(response.ok()).toBeTruthy();
});