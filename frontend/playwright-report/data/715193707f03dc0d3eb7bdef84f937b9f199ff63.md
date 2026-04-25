# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Authentication >> AUTH-E2E-006: Logout and redirect to login
- Location: frontend/tests/e2e.spec.ts:88:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: /sair/i })
    - locator resolved to <a href="/login" class="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 text-sm">…</a>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <aside class="fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-50 transition-all duration-300 w-64">…</aside> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <aside class="fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-50 transition-all duration-300 w-64">…</aside> intercepts pointer events
    - retrying click action
      - waiting 100ms
    51 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <aside class="fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-50 transition-all duration-300 w-64">…</aside> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e5]:
        - generic [ref=e7]: C
        - generic [ref=e8]: celx-atendimento
      - button [ref=e9] [cursor=pointer]:
        - img [ref=e10]
      - navigation [ref=e12]:
        - link "🏠 Dashboard" [ref=e13] [cursor=pointer]:
          - /url: /dashboard
          - generic [ref=e14]: 🏠
          - generic [ref=e15]: Dashboard
        - link "🎫 Meus Tickets" [ref=e16] [cursor=pointer]:
          - /url: /dashboard/cliente/tickets
          - generic [ref=e17]: 🎫
          - generic [ref=e18]: Meus Tickets
        - link "📋 Tickets" [ref=e19] [cursor=pointer]:
          - /url: /dashboard/atendente/tickets
          - generic [ref=e20]: 📋
          - generic [ref=e21]: Tickets
        - link "🤖 Aprovar IA NEW" [ref=e22] [cursor=pointer]:
          - /url: /dashboard/atendente/aprovacao
          - generic [ref=e23]: 🤖
          - generic [ref=e24]: Aprovar IA
          - generic [ref=e25]: NEW
        - link "👥 Usuários" [ref=e26] [cursor=pointer]:
          - /url: /dashboard/admin/usuarios
          - generic [ref=e27]: 👥
          - generic [ref=e28]: Usuários
        - link "⚙️ Config IA" [ref=e29] [cursor=pointer]:
          - /url: /dashboard/admin/config-ia
          - generic [ref=e30]: ⚙️
          - generic [ref=e31]: Config IA
        - link "📚 Conhecimento" [ref=e32] [cursor=pointer]:
          - /url: /dashboard/admin/conhecimento
          - generic [ref=e33]: 📚
          - generic [ref=e34]: Conhecimento
      - generic [ref=e35]:
        - generic [ref=e36]:
          - generic [ref=e38]: A
          - generic [ref=e39]:
            - paragraph [ref=e40]: Administrador
            - paragraph [ref=e41]: admin@celx.com.br
        - link "⬆ Sair" [ref=e42] [cursor=pointer]:
          - /url: /login
          - generic [ref=e43]: ⬆
          - text: Sair
    - generic [ref=e44]:
      - banner [ref=e45]:
        - generic [ref=e46]:
          - generic [ref=e47]:
            - heading "Olá, Administrador 👋" [level=2] [ref=e48]
            - paragraph [ref=e49]: quinta-feira, 23 de abril
          - generic [ref=e50]:
            - generic [ref=e51]: admin
            - button "🔔" [ref=e52] [cursor=pointer]: 🔔
      - main [ref=e54]:
        - generic [ref=e56]:
          - generic [ref=e57]:
            - heading "Dashboard" [level=1] [ref=e58]
            - paragraph [ref=e59]: Gerencie suas atividades e tickets
          - generic [ref=e62]:
            - link "🎫 Meus Tickets Visualize e crie tickets de suporte Acessar →" [ref=e63] [cursor=pointer]:
              - /url: /dashboard/cliente/tickets
              - generic [ref=e66]:
                - generic [ref=e67]: 🎫
                - heading "Meus Tickets" [level=2] [ref=e68]
                - paragraph [ref=e69]: Visualize e crie tickets de suporte
                - generic [ref=e70]:
                  - generic [ref=e71]: Acessar
                  - generic [ref=e72]: →
            - link "📋 Tickets Gerencie tickets da empresa Acessar →" [ref=e74] [cursor=pointer]:
              - /url: /dashboard/atendente/tickets
              - generic [ref=e77]:
                - generic [ref=e78]: 📋
                - heading "Tickets" [level=2] [ref=e79]
                - paragraph [ref=e80]: Gerencie tickets da empresa
                - generic [ref=e81]:
                  - generic [ref=e82]: Acessar
                  - generic [ref=e83]: →
            - link "🤖 Pendente Aprovar IA Revise respostas geradas por IA Acessar →" [ref=e85] [cursor=pointer]:
              - /url: /dashboard/atendente/aprovacao
              - generic [ref=e88]:
                - generic [ref=e89]: 🤖
                - generic [ref=e90]: Pendente
                - heading "Aprovar IA" [level=2] [ref=e91]
                - paragraph [ref=e92]: Revise respostas geradas por IA
                - generic [ref=e93]:
                  - generic [ref=e94]: Acessar
                  - generic [ref=e95]: →
          - generic [ref=e97]:
            - generic [ref=e98]:
              - generic [ref=e99]:
                - heading "Atividade Recente" [level=3] [ref=e100]
                - generic [ref=e102]: 📊
              - generic [ref=e103]:
                - generic [ref=e104]:
                  - generic [ref=e105]: "Ticket #123 resolvido com sucesso"
                  - generic [ref=e106]: 2h atrás
                - generic [ref=e107]:
                  - generic [ref=e108]: Nova resposta IA pendente
                  - generic [ref=e109]: 4h atrás
                - generic [ref=e110]:
                  - generic [ref=e111]: "Ticket #122 atribuído a você"
                  - generic [ref=e112]: 1d atrás
            - generic [ref=e116]:
              - generic [ref=e117]:
                - heading "Estatísticas" [level=3] [ref=e118]
                - generic [ref=e120]: ⚡
              - generic [ref=e121]:
                - generic [ref=e122]:
                  - generic: "12"
                  - generic: Tickets Abertos
                - generic [ref=e123]:
                  - generic: "8"
                  - generic: Resolvidos Hoje
                - generic [ref=e124]:
                  - generic: "3"
                  - generic: Aguardando IA
                - generic [ref=e125]:
                  - generic: 98%
                  - generic: Satisfação
  - alert [ref=e126]
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
> 90  |     await page.getByRole('link', { name: /sair/i }).click();
      |                                                     ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  119 |   test('TICK-E2E-004: Create ticket - success', async ({ page }) => {
  120 |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets/novo`);
  121 |     page.once('dialog', (dialog) => dialog.accept());
  122 | 
  123 |     await page.fill('#subject', `Test Ticket Subject E2E ${Date.now()}`);
  124 |     await page.fill('#description', 'Test ticket description for E2E test');
  125 |     await page.click('button[type="submit"]');
  126 | 
  127 |     await page.waitForURL('**/dashboard/cliente/tickets', { timeout: 10000 });
  128 |     await expect(page.getByRole('heading', { level: 1, name: 'Meus Tickets' })).toBeVisible();
  129 |   });
  130 | });
  131 | 
  132 | test.describe('Agent Ticket Management', () => {
  133 |   test.beforeEach(async ({ page, request }) => {
  134 |     await createTicketViaApi(request);
  135 |     await loginAs(page, 'agent');
  136 |   });
  137 | 
  138 |   test('AGT-E2E-001: View all tickets', async ({ page }) => {
  139 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  140 |     await expect(page.getByRole('heading', { level: 1, name: 'Tickets' })).toBeVisible();
  141 |   });
  142 | 
  143 |   test('AGT-E2E-002: Filter tickets by status', async ({ page }) => {
  144 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  145 |     await page.getByRole('button', { name: /abertos/i }).click();
  146 |     await expect(page.getByRole('button', { name: /abertos/i })).toBeVisible();
  147 |   });
  148 | 
  149 |   test('AGT-E2E-003: Open ticket detail', async ({ page }) => {
  150 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  151 | 
  152 |     const ticketLink = page.locator('a[href*="/atendente/tickets/"], a[href*="/dashboard/atendente/tickets/"]').first();
  153 |     await expect(ticketLink).toBeVisible({ timeout: 10000 });
  154 |     await ticketLink.click();
  155 | 
  156 |     await expect(page.getByText(/cliente:/i)).toBeVisible({ timeout: 10000 });
  157 |   });
  158 | 
  159 |   test('AGT-E2E-005: Send customer message', async ({ page }) => {
  160 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  161 | 
  162 |     const ticketLink = page.locator('a[href*="/atendente/tickets/"], a[href*="/dashboard/atendente/tickets/"]').first();
  163 |     await expect(ticketLink).toBeVisible({ timeout: 10000 });
  164 |     await ticketLink.click();
  165 | 
  166 |     const messageInput = page.locator('textarea').first();
  167 |     await expect(messageInput).toBeVisible({ timeout: 10000 });
  168 |     await messageInput.fill('Test message from agent E2E');
  169 |     await page.getByRole('button', { name: /enviar|responder/i }).click();
  170 |   });
  171 | });
  172 | 
  173 | test.describe('AI Approval Page', () => {
  174 |   test.beforeEach(async ({ page }) => {
  175 |     await loginAs(page, 'agent');
  176 |   });
  177 | 
  178 |   test('AI-E2E-001: View pending AI approvals', async ({ page }) => {
  179 |     await page.goto(`${BASE_URL}/dashboard/atendente/aprovacao`);
  180 |     await expect(page.getByRole('heading', { level: 1, name: 'Aprovação de IA' })).toBeVisible({ timeout: 5000 });
  181 |   });
  182 | });
  183 | 
  184 | test.describe('Admin User Management', () => {
  185 |   test.beforeEach(async ({ page }) => {
  186 |     await loginAs(page, 'admin');
  187 |   });
  188 | 
  189 |   test('USER-E2E-001: View user list', async ({ page }) => {
  190 |     await page.goto(`${BASE_URL}/dashboard/admin/usuarios`);
```