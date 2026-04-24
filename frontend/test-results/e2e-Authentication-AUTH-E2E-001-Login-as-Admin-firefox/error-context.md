# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Authentication >> AUTH-E2E-001: Login as Admin
- Location: tests/e2e.spec.ts:64:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e8]:
    - generic [ref=e9]:
      - generic [ref=e11]: C
      - heading "celx-atendimento" [level=1] [ref=e12]
      - paragraph [ref=e13]: Sistema de tickets com IA
    - generic [ref=e15]:
      - generic [ref=e16]: Email ou senha incorretos
      - generic [ref=e17]:
        - text: Email
        - textbox "Email" [ref=e19]:
          - /placeholder: seu@email.com
          - text: admin@celx.com.br
      - generic [ref=e20]:
        - text: Senha
        - textbox "Senha" [ref=e22]:
          - /placeholder: ••••••••
          - text: admin123
      - button "Entrar →" [ref=e23] [cursor=pointer]:
        - generic [ref=e25]:
          - text: Entrar
          - generic [ref=e26]: →
    - generic [ref=e29]:
      - paragraph [ref=e30]: 👆 Clique para preencher automaticamente
      - generic [ref=e31]:
        - button "👑 Super Admin superadmin@celx.com.br admin123" [ref=e32] [cursor=pointer]:
          - generic [ref=e33]: 👑
          - generic [ref=e34]:
            - generic [ref=e35]: Super Admin
            - generic [ref=e36]: superadmin@celx.com.br
          - generic [ref=e37]: admin123
        - button "⚡ Admin admin@celx.com.br admin123" [ref=e38] [cursor=pointer]:
          - generic [ref=e39]: ⚡
          - generic [ref=e40]:
            - generic [ref=e41]: Admin
            - generic [ref=e42]: admin@celx.com.br
          - generic [ref=e43]: admin123
        - button "👨‍💻 Atendente agente@celx.com.br agente123" [ref=e44] [cursor=pointer]:
          - generic [ref=e45]: 👨‍💻
          - generic [ref=e46]:
            - generic [ref=e47]: Atendente
            - generic [ref=e48]: agente@celx.com.br
          - generic [ref=e49]: agente123
        - button "👤 Cliente cliente@celx.com.br cliente123" [ref=e50] [cursor=pointer]:
          - generic [ref=e51]: 👤
          - generic [ref=e52]:
            - generic [ref=e53]: Cliente
            - generic [ref=e54]: cliente@celx.com.br
          - generic [ref=e55]: cliente123
    - paragraph [ref=e56]: Sistema de atendimento com inteligência artificial
  - alert [ref=e57]
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
> 18  |   await page.waitForURL(/\/dashboard$/, { timeout: 10000 });
      |              ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  19  |   await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  20  | }
  21  | 
  22  | function dashboardNav(page: Page) {
  23  |   return page.locator('aside nav');
  24  | }
  25  | 
  26  | function navLink(page: Page, label: string) {
  27  |   return dashboardNav(page).getByRole('link', { name: new RegExp(label, 'i') });
  28  | }
  29  | 
  30  | async function apiLogin(request: APIRequestContext, user: keyof typeof USERS) {
  31  |   const response = await request.post(`${API_URL}/api/v1/auth/login`, {
  32  |     data: USERS[user],
  33  |   });
  34  | 
  35  |   expect(response.ok()).toBeTruthy();
  36  |   const data = await response.json();
  37  | 
  38  |   return data.access_token as string;
  39  | }
  40  | 
  41  | async function createTicketViaApi(request: APIRequestContext) {
  42  |   const token = await apiLogin(request, 'customer');
  43  |   const response = await request.post(`${API_URL}/api/v1/tickets/`, {
  44  |     headers: {
  45  |       Authorization: `Bearer ${token}`,
  46  |     },
  47  |     data: {
  48  |       subject: `Ticket E2E ${Date.now()}`,
  49  |       description: 'Ticket criado automaticamente para cenarios do atendente.',
  50  |       priority: 'medium',
  51  |       category_id: null,
  52  |     },
  53  |   });
  54  | 
  55  |   expect(response.ok()).toBeTruthy();
  56  | }
  57  | 
  58  | test.describe('Authentication', () => {
  59  |   test.beforeEach(async ({ page }) => {
  60  |     await page.goto(BASE_URL);
  61  |     await page.evaluate(() => localStorage.clear());
  62  |   });
  63  | 
  64  |   test('AUTH-E2E-001: Login as Admin', async ({ page }) => {
  65  |     await loginAs(page, 'admin');
  66  |   });
  67  | 
  68  |   test('AUTH-E2E-002: Login as Customer', async ({ page }) => {
  69  |     await loginAs(page, 'customer');
  70  |   });
  71  | 
  72  |   test('AUTH-E2E-003: Login as Agent', async ({ page }) => {
  73  |     await loginAs(page, 'agent');
  74  |   });
  75  | 
  76  |   test('AUTH-E2E-004: Login as Super Admin', async ({ page }) => {
  77  |     await loginAs(page, 'superadmin');
  78  |   });
  79  | 
  80  |   test('AUTH-E2E-005: Login with wrong password shows error', async ({ page }) => {
  81  |     await page.goto(`${BASE_URL}/login`);
  82  |     await page.fill('#email', USERS.admin.email);
  83  |     await page.fill('#password', 'wrongpassword');
  84  |     await page.click('button[type="submit"]');
  85  |     await expect(page.getByText('Email ou senha incorretos')).toBeVisible({ timeout: 5000 });
  86  |   });
  87  | 
  88  |   test('AUTH-E2E-006: Logout and redirect to login', async ({ page }) => {
  89  |     await loginAs(page, 'admin');
  90  |     await page.getByRole('link', { name: /sair/i }).click();
  91  |     await page.waitForURL('**/login', { timeout: 10000 });
  92  |     await expect(page.locator('#email')).toBeVisible();
  93  |   });
  94  | });
  95  | 
  96  | test.describe('Customer Ticket Workflow', () => {
  97  |   test.beforeEach(async ({ page }) => {
  98  |     await loginAs(page, 'customer');
  99  |   });
  100 | 
  101 |   test('TICK-E2E-001: View my tickets list', async ({ page }) => {
  102 |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets`);
  103 |     await expect(page).toHaveURL(/\/dashboard\/cliente\/tickets$/);
  104 |     await expect(page.getByRole('heading', { level: 1, name: 'Meus Tickets' })).toBeVisible();
  105 |   });
  106 | 
  107 |   test('TICK-E2E-002: Filter tickets by status', async ({ page }) => {
  108 |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets`);
  109 |     await page.getByRole('button', { name: /abertos/i }).click();
  110 |     await expect(page.getByRole('button', { name: /abertos/i })).toBeVisible();
  111 |   });
  112 | 
  113 |   test('TICK-E2E-003: Navigate to create new ticket form', async ({ page }) => {
  114 |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets/novo`);
  115 |     await expect(page.getByRole('heading', { level: 1, name: 'Criar Novo Ticket' })).toBeVisible();
  116 |     await expect(page.locator('#subject')).toBeVisible();
  117 |   });
  118 | 
```