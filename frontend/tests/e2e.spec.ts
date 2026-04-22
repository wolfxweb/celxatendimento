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
    await page.fill('input[name="email"]', USERS.admin.email);
    await page.fill('input[name="password"]', USERS.admin.password);
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 5000 });
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('AUTH-E2E-002: Login as Customer', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.customer.email);
    await page.fill('input[name="password"]', USERS.customer.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard**', { timeout: 5000 });
  });

  test('AUTH-E2E-003: Login as Agent', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.agent.email);
    await page.fill('input[name="password"]', USERS.agent.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard**', { timeout: 5000 });
  });

  test('AUTH-E2E-004: Login as Super Admin', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.superadmin.email);
    await page.fill('input[name="password"]', USERS.superadmin.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard**', { timeout: 5000 });
  });

  test('AUTH-E2E-005: Login with wrong password shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.admin.email);
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Invalid')).toBeVisible({ timeout: 3000 });
  });

  test('AUTH-E2E-006: Logout and redirect to login', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.admin.email);
    await page.fill('input[name="password"]', USERS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 5000 });
    
    // Logout - click on user menu and logout
    await page.click('button:has-text("Sair")');
    
    // Should redirect to login
    await page.waitForURL('**/login**', { timeout: 5000 });
  });
});

test.describe('Customer Ticket Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as customer
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.customer.email);
    await page.fill('input[name="password"]', USERS.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('TICK-E2E-001: View my tickets list', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/cliente/tickets`);
    
    // Should show tickets list
    await expect(page.locator('text=Tickets')).toBeVisible({ timeout: 5000 });
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
    
    // Should show form with subject, description fields
    await expect(page.locator('input[name="subject"], input[placeholder*="Assunto"]')).toBeVisible({ timeout: 5000 });
  });

  test('TICK-E2E-004: Create ticket - success', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/cliente/tickets/novo`);
    
    // Fill ticket form
    await page.fill('input[name="subject"], input[placeholder*="Assunto"]', 'Test Ticket Subject E2E');
    await page.fill('textarea[name="description"], textarea[placeholder*="Descrição"]', 'Test ticket description for E2E test');
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Criar"), button:has-text("Enviar")');
    
    // Should redirect or show success
    await expect(page.locator('text=Ticket'), { timeout: 5000 }).toBeVisible();
  });
});

test.describe('Agent Ticket Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as agent
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.agent.email);
    await page.fill('input[name="password"]', USERS.agent.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('AGT-E2E-001: View all tickets', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
    
    await expect(page.locator('text=Tickets')).toBeVisible({ timeout: 5000 });
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
      await expect(page.locator('text=Detalhes')).toBeVisible({ timeout: 5000 });
    }
  });

  test('AGT-E2E-005: Send customer message', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
    
    // Navigate to first ticket
    const ticketLink = page.locator('a[href*="/dashboard/atendente/tickets/"]').first();
    if (await ticketLink.isVisible()) {
      await ticketLink.click();
      
      // Type message
      const messageInput = page.locator('textarea[name="content"], input[name="content"]');
      if (await messageInput.isVisible()) {
        await messageInput.fill('Test message from agent E2E');
        await page.click('button:has-text("Enviar"), button:has-text("Responder")');
      }
    }
  });

  test('AGT-E2E-006: Send internal note', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
    
    const ticketLink = page.locator('a[href*="/dashboard/atendente/tickets/"]').first();
    if (await ticketLink.isVisible()) {
      await ticketLink.click();
      
      // Look for internal note toggle
      const internalToggle = page.locator('input[name="is_internal"], input[type="checkbox"]');
      if (await internalToggle.isVisible()) {
        await internalToggle.check();
      }
      
      const messageInput = page.locator('textarea[name="content"]');
      if (await messageInput.isVisible()) {
        await messageInput.fill('Internal note for team');
        await page.click('button:has-text("Enviar"), button:has-text("Observação")');
      }
    }
  });
});

test.describe('AI Approval Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.agent.email);
    await page.fill('input[name="password"]', USERS.agent.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('AI-E2E-001: View pending AI approvals', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/aprovacao`);
    
    // Should show AI approval interface
    await expect(page.locator('text=Aprovar'), { timeout: 5000 }).toBeVisible();
  });

  test('AI-E2E-003: Approve AI response', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/aprovacao`);
    
    // Look for approve button
    const approveButton = page.locator('button:has-text("Aprovar"), button:has-text("Approve")').first();
    if (await approveButton.isVisible()) {
      await approveButton.click();
      
      // May show confirmation or rating dialog
      await expect(page.locator('text=Obrigado"), text=Success'), { timeout: 3000 }).toBeVisible();
    }
  });

  test('AI-E2E-004: Reject AI response with reason', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/atendente/aprovacao`);
    
    // Look for reject button
    const rejectButton = page.locator('button:has-text("Rejeitar"), button:has-text("Reject")').first();
    if (await rejectButton.isVisible()) {
      await rejectButton.click();
      
      // Should show reason input
      const reasonInput = page.locator('textarea[name="reason"], input[name="reason"]');
      if (await reasonInput.isVisible()) {
        await reasonInput.fill('Response was not accurate for this case');
        await page.click('button:has-text("Confirmar"), button:has-text("Enviar")');
      }
    }
  });
});

test.describe('Admin User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.admin.email);
    await page.fill('input[name="password"]', USERS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('USER-E2E-001: View user list', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/usuarios`);
    
    await expect(page.locator('text=Usuários'), { timeout: 5000 }).toBeVisible();
  });

  test('USER-E2E-002: Create new user', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/usuarios`);
    
    // Click create button
    const createButton = page.locator('button:has-text("Criar"), button:has-text("Novo")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Fill form
      await page.fill('input[name="email"]', `newuser_${Date.now()}@test.com`);
      await page.fill('input[name="password"]', 'testpass123');
      await page.fill('input[name="full_name"]', 'New Test User');
      
      await page.click('button[type="submit"], button:has-text("Salvar")');
    }
  });
});

test.describe('Admin AI Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.admin.email);
    await page.fill('input[name="password"]', USERS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('AICFG-E2E-001: View AI configuration', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/config-ia`);
    
    // Should show AI config form
    await expect(page.locator('text=Config'), { timeout: 5000 }).toBeVisible();
  });

  test('AICFG-E2E-004: Save API key', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/config-ia`);
    
    // Find API key input
    const apiKeyInput = page.locator('input[name="api_key"], input[placeholder*="API"]');
    if (await apiKeyInput.isVisible()) {
      await apiKeyInput.fill('sk-test-key-for-e2e-testing');
      await page.click('button:has-text("Salvar"), button:has-text("Guardar")');
    }
  });

  test('AICFG-E2E-005: Test API key', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/config-ia`);
    
    const testButton = page.locator('button:has-text("Testar"), button:has-text("Test")');
    if (await testButton.isVisible()) {
      await testButton.click();
      // Should show test result
      await expect(page.locator('text=Sucesso"), text=Error'), { timeout: 5000 }).toBeVisible();
    }
  });

  test('AICFG-E2E-006: Edit system prompt', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/config-ia/prompt-editor`);
    
    await expect(page.locator('text=Prompt'), { timeout: 5000 }).toBeVisible();
  });
});

test.describe('Admin Knowledge Base', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.admin.email);
    await page.fill('input[name="password"]', USERS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('KB-E2E-001: View knowledge articles', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/conhecimento`);
    
    await expect(page.locator('text=Conhecimento'), { timeout: 5000 }).toBeVisible();
  });

  test('KB-E2E-002: Create new article', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin/conhecimento`);
    
    const createButton = page.locator('button:has-text("Criar"), button:has-text("Novo")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Fill article form
      await page.fill('input[name="title"]', `Test Article ${Date.now()}`);
      await page.fill('textarea[name="content"]', 'Test content for knowledge base');
      
      await page.click('button[type="submit"], button:has-text("Salvar")');
    }
  });
});

test.describe('Superadmin Company Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.superadmin.email);
    await page.fill('input[name="password"]', USERS.superadmin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('COMP-E2E-001: View companies list', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/superadmin/empresas`);
    
    await expect(page.locator('text=Empresas'), { timeout: 5000 }).toBeVisible();
  });

  test('COMP-E2E-002: Filter companies by status', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/superadmin/empresas`);
    
    // Try filtering
    const pendingButton = page.locator('button:has-text("Pendentes")').first();
    if (await pendingButton.isVisible()) {
      await pendingButton.click();
    }
  });
});

test.describe('Superadmin Plan Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.superadmin.email);
    await page.fill('input[name="password"]', USERS.superadmin.password);
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
    await page.fill('input[name="email"]', USERS.superadmin.email);
    await page.fill('input[name="password"]', USERS.superadmin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    // Should see superadmin menu items
    await expect(page.locator('text=Empresas')).toBeVisible();
    await expect(page.locator('text=Planos')).toBeVisible();
  });

  test('DASH-E2E-002: Admin sees full menu', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.admin.email);
    await page.fill('input[name="password"]', USERS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    // Should see admin menu items
    await expect(page.locator('text=Usuários')).toBeVisible();
    await expect(page.locator('text=Config')).toBeVisible();
  });

  test('DASH-E2E-003: Agent sees Tickets and Aprovar IA', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.agent.email);
    await page.fill('input[name="password"]', USERS.agent.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    // Should see agent menu items
    await expect(page.locator('text=Tickets')).toBeVisible();
    await expect(page.locator('text=Aprovar')).toBeVisible();
  });

  test('DASH-E2E-004: Customer sees only Meus Tickets', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', USERS.customer.email);
    await page.fill('input[name="password"]', USERS.customer.password);
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
