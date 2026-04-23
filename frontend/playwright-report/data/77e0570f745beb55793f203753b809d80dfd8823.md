# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Authentication >> AUTH-E2E-006: Logout and redirect to login
- Location: tests/e2e.spec.ts:60:7

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
    14 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <aside class="fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-50 transition-all duration-300 w-64">…</aside> intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling

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
  1   | import { test, expect, Page } from '@playwright/test';
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
  18  |   await page.waitForURL('**/dashboard', { timeout: 10000 });
  19  |   await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  20  | }
  21  | 
  22  | function dashboardNav(page: Page) {
  23  |   return page.locator('aside nav');
  24  | }
  25  | 
  26  | function navLink(page: Page, label: string) {
  27  |   return dashboardNav(page).getByRole('link', { name: label, exact: true });
  28  | }
  29  | 
  30  | test.describe('Authentication', () => {
  31  |   test.beforeEach(async ({ page }) => {
  32  |     await page.goto(BASE_URL);
  33  |     await page.evaluate(() => localStorage.clear());
  34  |   });
  35  | 
  36  |   test('AUTH-E2E-001: Login as Admin', async ({ page }) => {
  37  |     await loginAs(page, 'admin');
  38  |   });
  39  | 
  40  |   test('AUTH-E2E-002: Login as Customer', async ({ page }) => {
  41  |     await loginAs(page, 'customer');
  42  |   });
  43  | 
  44  |   test('AUTH-E2E-003: Login as Agent', async ({ page }) => {
  45  |     await loginAs(page, 'agent');
  46  |   });
  47  | 
  48  |   test('AUTH-E2E-004: Login as Super Admin', async ({ page }) => {
  49  |     await loginAs(page, 'superadmin');
  50  |   });
  51  | 
  52  |   test('AUTH-E2E-005: Login with wrong password shows error', async ({ page }) => {
  53  |     await page.goto(`${BASE_URL}/login`);
  54  |     await page.fill('#email', USERS.admin.email);
  55  |     await page.fill('#password', 'wrongpassword');
  56  |     await page.click('button[type="submit"]');
  57  |     await expect(page.getByText('Email ou senha incorretos')).toBeVisible({ timeout: 5000 });
  58  |   });
  59  | 
  60  |   test('AUTH-E2E-006: Logout and redirect to login', async ({ page }) => {
  61  |     await loginAs(page, 'admin');
> 62  |     await page.getByRole('link', { name: /sair/i }).click();
      |                                                     ^ Error: locator.click: Test timeout of 30000ms exceeded.
  63  |     await page.waitForURL('**/login', { timeout: 10000 });
  64  |     await expect(page.locator('#email')).toBeVisible();
  65  |   });
  66  | });
  67  | 
  68  | test.describe('Customer Ticket Workflow', () => {
  69  |   test.beforeEach(async ({ page }) => {
  70  |     await loginAs(page, 'customer');
  71  |   });
  72  | 
  73  |   test('TICK-E2E-001: View my tickets list', async ({ page }) => {
  74  |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets`);
  75  |     await expect(page).toHaveURL(/\/dashboard\/cliente\/tickets$/);
  76  |     await expect(page.getByRole('heading', { level: 1, name: 'Meus Tickets' })).toBeVisible();
  77  |   });
  78  | 
  79  |   test('TICK-E2E-002: Filter tickets by status', async ({ page }) => {
  80  |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets`);
  81  |     await page.getByRole('button', { name: 'Abertos', exact: true }).click();
  82  |     await expect(page.getByRole('button', { name: 'Abertos', exact: true })).toBeVisible();
  83  |   });
  84  | 
  85  |   test('TICK-E2E-003: Navigate to create new ticket form', async ({ page }) => {
  86  |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets/novo`);
  87  |     await expect(page.getByRole('heading', { level: 1, name: 'Criar Novo Ticket' })).toBeVisible();
  88  |     await expect(page.locator('#subject')).toBeVisible();
  89  |   });
  90  | 
  91  |   test('TICK-E2E-004: Create ticket - success', async ({ page }) => {
  92  |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets/novo`);
  93  |     page.once('dialog', (dialog) => dialog.accept());
  94  | 
  95  |     await page.fill('#subject', `Test Ticket Subject E2E ${Date.now()}`);
  96  |     await page.fill('#description', 'Test ticket description for E2E test');
  97  |     await page.click('button[type="submit"]');
  98  | 
  99  |     await page.waitForURL('**/dashboard/cliente/tickets', { timeout: 10000 });
  100 |     await expect(page.getByRole('heading', { level: 1, name: 'Meus Tickets' })).toBeVisible();
  101 |   });
  102 | });
  103 | 
  104 | test.describe('Agent Ticket Management', () => {
  105 |   test.beforeEach(async ({ page }) => {
  106 |     await loginAs(page, 'agent');
  107 |   });
  108 | 
  109 |   test('AGT-E2E-001: View all tickets', async ({ page }) => {
  110 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  111 |     await expect(page.getByRole('heading', { level: 1, name: 'Tickets' })).toBeVisible();
  112 |   });
  113 | 
  114 |   test('AGT-E2E-002: Filter tickets by status', async ({ page }) => {
  115 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  116 |     await page.getByRole('button', { name: 'Abertos', exact: true }).click();
  117 |     await expect(page.getByRole('button', { name: 'Abertos', exact: true })).toBeVisible();
  118 |   });
  119 | 
  120 |   test('AGT-E2E-003: Open ticket detail', async ({ page }) => {
  121 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  122 | 
  123 |     const ticketLink = page.locator('a[href*="/atendente/tickets/"], a[href*="/dashboard/atendente/tickets/"]').first();
  124 |     await expect(ticketLink).toBeVisible({ timeout: 10000 });
  125 |     await ticketLink.click();
  126 | 
  127 |     await expect(page.getByText(/cliente:/i)).toBeVisible({ timeout: 10000 });
  128 |   });
  129 | 
  130 |   test('AGT-E2E-005: Send customer message', async ({ page }) => {
  131 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  132 | 
  133 |     const ticketLink = page.locator('a[href*="/atendente/tickets/"], a[href*="/dashboard/atendente/tickets/"]').first();
  134 |     await expect(ticketLink).toBeVisible({ timeout: 10000 });
  135 |     await ticketLink.click();
  136 | 
  137 |     const messageInput = page.locator('textarea').first();
  138 |     await expect(messageInput).toBeVisible({ timeout: 10000 });
  139 |     await messageInput.fill('Test message from agent E2E');
  140 |     await page.getByRole('button', { name: /enviar|responder/i }).click();
  141 |   });
  142 | });
  143 | 
  144 | test.describe('AI Approval Page', () => {
  145 |   test.beforeEach(async ({ page }) => {
  146 |     await loginAs(page, 'agent');
  147 |   });
  148 | 
  149 |   test('AI-E2E-001: View pending AI approvals', async ({ page }) => {
  150 |     await page.goto(`${BASE_URL}/dashboard/atendente/aprovacao`);
  151 |     await expect(page.getByRole('heading', { level: 1, name: /aprova/i })).toBeVisible({ timeout: 5000 });
  152 |   });
  153 | });
  154 | 
  155 | test.describe('Admin User Management', () => {
  156 |   test.beforeEach(async ({ page }) => {
  157 |     await loginAs(page, 'admin');
  158 |   });
  159 | 
  160 |   test('USER-E2E-001: View user list', async ({ page }) => {
  161 |     await page.goto(`${BASE_URL}/dashboard/admin/usuarios`);
  162 |     await expect(page.getByRole('heading', { level: 1, name: 'Gerenciar Usuários' })).toBeVisible();
```