# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Customer Ticket Workflow >> TICK-E2E-004: Create ticket - success
- Location: tests/e2e.spec.ts:91:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[type="submit"]')
    - locator resolved to <button type="submit" class="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-glow-primary hover:scale-[1.02] transition-all disabled:opacity-50">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <main class="p-6">…</main> intercepts pointer events
  - retrying click action
    - waiting 100ms
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting 100ms
    7 × waiting for element to be visible, enabled and stable
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
      - <aside class="fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-50 transition-all duration-300 w-64">…</aside> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <select id="category" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all">…</select> from <div class="space-y-2">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
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
- generic [ref=e1]:
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
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e22]: J
          - generic [ref=e23]:
            - paragraph [ref=e24]: João Cliente
            - paragraph [ref=e25]: cliente@celx.com.br
        - link "⬆ Sair" [ref=e26] [cursor=pointer]:
          - /url: /login
          - generic [ref=e27]: ⬆
          - text: Sair
    - generic [ref=e28]:
      - banner [ref=e29]:
        - generic [ref=e30]:
          - generic [ref=e31]:
            - heading "Olá, João 👋" [level=2] [ref=e32]
            - paragraph [ref=e33]: quinta-feira, 23 de abril
          - generic [ref=e34]:
            - generic [ref=e35]: customer
            - button "🔔" [ref=e36] [cursor=pointer]: 🔔
      - main [ref=e38]:
        - generic [ref=e40]:
          - generic [ref=e41]:
            - heading "Criar Novo Ticket" [level=1] [ref=e42]
            - paragraph [ref=e43]: Descreva seu problema ou dúvida
          - generic [ref=e45]:
            - generic [ref=e46]:
              - generic [ref=e47]: Assunto *
              - textbox "Assunto *" [ref=e48]:
                - /placeholder: Descreva resumidamente o problema
                - text: Test Ticket Subject E2E 1776981536254
              - generic [ref=e49]: 37/200
            - generic [ref=e50]:
              - generic [ref=e51]: Descrição *
              - textbox "Descrição *" [active] [ref=e52]:
                - /placeholder: Descreva detalhadamente o problema ou dúvida. Inclua informações como:\n- Quando começou o problema\n- O que você estava tentando fazer\n- Mensagens de erro (se houver)
                - text: Test ticket description for E2E test
              - generic [ref=e53]: 36/5000
            - generic [ref=e54]:
              - text: Categoria
              - combobox "Categoria" [ref=e55]:
                - option "Selecione uma categoria (opcional)" [selected]
            - generic [ref=e56]:
              - text: Prioridade
              - generic [ref=e57]:
                - generic [ref=e58] [cursor=pointer]:
                  - radio "🟢 Baixa" [ref=e59]
                  - generic [ref=e60]: 🟢
                  - generic [ref=e61]: Baixa
                - generic [ref=e62] [cursor=pointer]:
                  - radio "🟡 Média" [checked] [ref=e63]
                  - generic [ref=e64]: 🟡
                  - generic [ref=e65]: Média
                - generic [ref=e66] [cursor=pointer]:
                  - radio "🟠 Alta" [ref=e67]
                  - generic [ref=e68]: 🟠
                  - generic [ref=e69]: Alta
                - generic [ref=e70] [cursor=pointer]:
                  - radio "🔴 Crítica" [ref=e71]
                  - generic [ref=e72]: 🔴
                  - generic [ref=e73]: Crítica
            - generic [ref=e74]:
              - button "🎫 Criar Ticket" [ref=e75] [cursor=pointer]:
                - generic [ref=e76]: 🎫
                - text: Criar Ticket
              - button "Cancelar" [ref=e77] [cursor=pointer]
  - alert [ref=e78]
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
  62  |     await page.getByRole('link', { name: /sair/i }).click();
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
> 97  |     await page.click('button[type="submit"]');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
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
  163 |   });
  164 | });
  165 | 
  166 | test.describe('Admin AI Configuration', () => {
  167 |   test.beforeEach(async ({ page }) => {
  168 |     await loginAs(page, 'admin');
  169 |   });
  170 | 
  171 |   test('AICFG-E2E-001: View AI configuration', async ({ page }) => {
  172 |     await page.goto(`${BASE_URL}/dashboard/admin/config-ia`);
  173 |     await expect(page.getByRole('heading', { level: 1, name: 'Configuração da IA' })).toBeVisible();
  174 |   });
  175 | 
  176 |   test('AICFG-E2E-006: Edit system prompt', async ({ page }) => {
  177 |     await page.goto(`${BASE_URL}/dashboard/admin/config-ia/prompt-editor`);
  178 |     await expect(page.getByRole('heading', { level: 1, name: 'Editor de Prompt' })).toBeVisible();
  179 |   });
  180 | });
  181 | 
  182 | test.describe('Admin Knowledge Base', () => {
  183 |   test.beforeEach(async ({ page }) => {
  184 |     await loginAs(page, 'admin');
  185 |   });
  186 | 
  187 |   test('KB-E2E-001: View knowledge articles', async ({ page }) => {
  188 |     await page.goto(`${BASE_URL}/dashboard/admin/conhecimento`);
  189 |     await expect(page.getByRole('heading', { level: 1, name: 'Base de Conhecimento' })).toBeVisible();
  190 |   });
  191 | });
  192 | 
  193 | test.describe('Superadmin Company Management', () => {
  194 |   test.beforeEach(async ({ page }) => {
  195 |     await loginAs(page, 'superadmin');
  196 |   });
  197 | 
```