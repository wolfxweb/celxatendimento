# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Agent Ticket Management >> AGT-E2E-003: Open ticket detail
- Location: tests/e2e.spec.ts:163:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  1   | import { test, expect, Page, APIRequestContext } from '@playwright/test';
  2   | 
  3   | const USERS = {
  4   |   admin: { email: 'admin@celx.com.br', password: 'admin123' },
  5   |   customer: { email: 'cliente@celx.com.br', password: 'cliente123' },
  6   |   agent: { email: 'agente@celx.com.br', password: 'agente123' },
  7   |   superadmin: { email: 'superadmin@celx.com.br', password: 'admin123' },
  8   | } as const;
  9   | 
  10  | const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  11  | const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  12  | 
  13  | async function loginAs(page: Page, user: keyof typeof USERS) {
  14  |   await page.goto(`${BASE_URL}/login`);
  15  |   await page.fill('#email', USERS[user].email);
  16  |   await page.fill('#password', USERS[user].password);
  17  |   await page.click('button[type="submit"]');
  18  |   await page.waitForURL(/\/dashboard$/, { timeout: 10000 });
  19  |   await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  20  | }
  21  | 
  22  | async function logout(page: Page) {
  23  |   const logoutLink = page.getByRole('link', { name: /sair/i });
  24  | 
  25  |   if (!(await logoutLink.isVisible())) {
  26  |     await page.getByRole('button', { name: /abrir menu/i }).click();
  27  |   }
  28  | 
  29  |   await logoutLink.click();
  30  | }
  31  | 
  32  | function dashboardNav(page: Page) {
  33  |   return page.locator('aside nav');
  34  | }
  35  | 
  36  | function navLink(page: Page, label: string) {
  37  |   return dashboardNav(page).getByRole('link', { name: new RegExp(label, 'i') });
  38  | }
  39  | 
  40  | function navLinkByHref(page: Page, href: string) {
  41  |   return dashboardNav(page).locator(`a[href="${href}"]`);
  42  | }
  43  | 
  44  | async function apiLogin(request: APIRequestContext, user: keyof typeof USERS) {
  45  |   const response = await request.post(`${API_URL}/api/v1/auth/login`, {
  46  |     data: USERS[user],
  47  |   });
  48  | 
  49  |   expect(response.ok()).toBeTruthy();
  50  |   const data = await response.json();
  51  | 
  52  |   return data.access_token as string;
  53  | }
  54  | 
  55  | async function createTicketViaApi(request: APIRequestContext) {
  56  |   const token = await apiLogin(request, 'customer');
  57  |   const response = await request.post(`${API_URL}/api/v1/tickets/`, {
  58  |     headers: {
  59  |       Authorization: `Bearer ${token}`,
  60  |     },
  61  |     data: {
  62  |       subject: `Ticket E2E ${Date.now()}`,
  63  |       description: 'Ticket criado automaticamente para cenarios do atendente.',
  64  |       priority: 'medium',
  65  |       category_id: null,
  66  |     },
  67  |   });
  68  | 
> 69  |   expect(response.ok()).toBeTruthy();
      |                         ^ Error: expect(received).toBeTruthy()
  70  | }
  71  | 
  72  | test.describe('Authentication', () => {
  73  |   test.beforeEach(async ({ page }) => {
  74  |     await page.goto(BASE_URL);
  75  |     await page.evaluate(() => localStorage.clear());
  76  |   });
  77  | 
  78  |   test('AUTH-E2E-001: Login as Admin', async ({ page }) => {
  79  |     await loginAs(page, 'admin');
  80  |   });
  81  | 
  82  |   test('AUTH-E2E-002: Login as Customer', async ({ page }) => {
  83  |     await loginAs(page, 'customer');
  84  |   });
  85  | 
  86  |   test('AUTH-E2E-003: Login as Agent', async ({ page }) => {
  87  |     await loginAs(page, 'agent');
  88  |   });
  89  | 
  90  |   test('AUTH-E2E-004: Login as Super Admin', async ({ page }) => {
  91  |     await loginAs(page, 'superadmin');
  92  |   });
  93  | 
  94  |   test('AUTH-E2E-005: Login with wrong password shows error', async ({ page }) => {
  95  |     await page.goto(`${BASE_URL}/login`);
  96  |     await page.fill('#email', USERS.admin.email);
  97  |     await page.fill('#password', 'wrongpassword');
  98  |     await page.click('button[type="submit"]');
  99  |     await expect(page.getByText('Email ou senha incorretos')).toBeVisible({ timeout: 5000 });
  100 |   });
  101 | 
  102 |   test('AUTH-E2E-006: Logout and redirect to login', async ({ page }) => {
  103 |     await loginAs(page, 'admin');
  104 |     await logout(page);
  105 |     await page.waitForURL('**/login', { timeout: 10000 });
  106 |     await expect(page.locator('#email')).toBeVisible();
  107 |   });
  108 | });
  109 | 
  110 | test.describe('Customer Ticket Workflow', () => {
  111 |   test.beforeEach(async ({ page }) => {
  112 |     await loginAs(page, 'customer');
  113 |   });
  114 | 
  115 |   test('TICK-E2E-001: View my tickets list', async ({ page }) => {
  116 |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets`);
  117 |     await expect(page).toHaveURL(/\/dashboard\/cliente\/tickets$/);
  118 |     await expect(page.getByRole('heading', { level: 1, name: 'Meus Tickets' })).toBeVisible();
  119 |   });
  120 | 
  121 |   test('TICK-E2E-002: Filter tickets by status', async ({ page }) => {
  122 |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets`);
  123 |     await page.getByRole('button', { name: /abertos/i }).click();
  124 |     await expect(page.getByRole('button', { name: /abertos/i })).toBeVisible();
  125 |   });
  126 | 
  127 |   test('TICK-E2E-003: Navigate to create new ticket form', async ({ page }) => {
  128 |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets/novo`);
  129 |     await expect(page.getByRole('heading', { level: 1, name: 'Criar Novo Ticket' })).toBeVisible();
  130 |     await expect(page.locator('#subject')).toBeVisible();
  131 |   });
  132 | 
  133 |   test('TICK-E2E-004: Create ticket - success', async ({ page }) => {
  134 |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets/novo`);
  135 |     page.once('dialog', (dialog) => dialog.accept());
  136 | 
  137 |     await page.fill('#subject', `Test Ticket Subject E2E ${Date.now()}`);
  138 |     await page.fill('#description', 'Test ticket description for E2E test');
  139 |     await page.click('button[type="submit"]');
  140 | 
  141 |     await page.waitForURL('**/dashboard/cliente/tickets', { timeout: 10000 });
  142 |     await expect(page.getByRole('heading', { level: 1, name: 'Meus Tickets' })).toBeVisible();
  143 |   });
  144 | });
  145 | 
  146 | test.describe('Agent Ticket Management', () => {
  147 |   test.beforeEach(async ({ page, request }) => {
  148 |     await createTicketViaApi(request);
  149 |     await loginAs(page, 'agent');
  150 |   });
  151 | 
  152 |   test('AGT-E2E-001: View all tickets', async ({ page }) => {
  153 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  154 |     await expect(page.getByRole('heading', { level: 1, name: 'Tickets' })).toBeVisible();
  155 |   });
  156 | 
  157 |   test('AGT-E2E-002: Filter tickets by status', async ({ page }) => {
  158 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  159 |     await page.getByRole('button', { name: /abertos/i }).click();
  160 |     await expect(page.getByRole('button', { name: /abertos/i })).toBeVisible();
  161 |   });
  162 | 
  163 |   test('AGT-E2E-003: Open ticket detail', async ({ page }) => {
  164 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  165 | 
  166 |     const ticketLink = page.locator('a[href*="/atendente/tickets/"], a[href*="/dashboard/atendente/tickets/"]').first();
  167 |     await expect(ticketLink).toBeVisible({ timeout: 10000 });
  168 |     await ticketLink.click();
  169 | 
```