# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Superadmin Plan Management >> PLAN-E2E-001: View plans list
- Location: tests/e2e.spec.ts:209:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard" until "load"
  navigated to "http://localhost:3001/dashboard"
  "domcontentloaded" event fired
============================================================
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
        - link "🏢 Empresas" [ref=e16] [cursor=pointer]:
          - /url: /dashboard/superadmin/empresas
          - generic [ref=e17]: 🏢
          - generic [ref=e18]: Empresas
        - link "📦 Planos" [ref=e19] [cursor=pointer]:
          - /url: /dashboard/superadmin/planos
          - generic [ref=e20]: 📦
          - generic [ref=e21]: Planos
      - generic [ref=e22]:
        - generic [ref=e23]:
          - generic [ref=e25]: S
          - generic [ref=e26]:
            - paragraph [ref=e27]: Super Admin
            - paragraph [ref=e28]: superadmin@celx.com.br
        - link "⬆ Sair" [ref=e29] [cursor=pointer]:
          - /url: /login
          - generic [ref=e30]: ⬆
          - text: Sair
    - generic [ref=e31]:
      - banner [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]:
            - heading "Olá, Super 👋" [level=2] [ref=e35]
            - paragraph [ref=e36]: quinta-feira, 23 de abril
          - generic [ref=e37]:
            - generic [ref=e38]: superadmin
            - button "🔔" [ref=e39] [cursor=pointer]: 🔔
      - main [ref=e41]:
        - generic [ref=e43]:
          - generic [ref=e44]:
            - heading "Dashboard" [level=1] [ref=e45]
            - paragraph [ref=e46]: Gerencie suas atividades e tickets
          - generic [ref=e49]:
            - link "🎫 Meus Tickets Visualize e crie tickets de suporte Acessar →" [ref=e50] [cursor=pointer]:
              - /url: /dashboard/cliente/tickets
              - generic [ref=e53]:
                - generic [ref=e54]: 🎫
                - heading "Meus Tickets" [level=2] [ref=e55]
                - paragraph [ref=e56]: Visualize e crie tickets de suporte
                - generic [ref=e57]:
                  - generic [ref=e58]: Acessar
                  - generic [ref=e59]: →
            - link "📋 Tickets Gerencie tickets da empresa Acessar →" [ref=e61] [cursor=pointer]:
              - /url: /dashboard/atendente/tickets
              - generic [ref=e64]:
                - generic [ref=e65]: 📋
                - heading "Tickets" [level=2] [ref=e66]
                - paragraph [ref=e67]: Gerencie tickets da empresa
                - generic [ref=e68]:
                  - generic [ref=e69]: Acessar
                  - generic [ref=e70]: →
            - link "🤖 Pendente Aprovar IA Revise respostas geradas por IA Acessar →" [ref=e72] [cursor=pointer]:
              - /url: /dashboard/atendente/aprovacao
              - generic [ref=e75]:
                - generic [ref=e76]: 🤖
                - generic [ref=e77]: Pendente
                - heading "Aprovar IA" [level=2] [ref=e78]
                - paragraph [ref=e79]: Revise respostas geradas por IA
                - generic [ref=e80]:
                  - generic [ref=e81]: Acessar
                  - generic [ref=e82]: →
          - generic [ref=e84]:
            - generic [ref=e85]:
              - generic [ref=e86]:
                - heading "Atividade Recente" [level=3] [ref=e87]
                - generic [ref=e89]: 📊
              - generic [ref=e90]:
                - generic [ref=e91]:
                  - generic [ref=e93]: "Ticket #123 resolvido com sucesso"
                  - generic [ref=e94]: 2h atrás
                - generic [ref=e95]:
                  - generic [ref=e97]: Nova resposta IA pendente
                  - generic [ref=e98]: 4h atrás
                - generic [ref=e99]:
                  - generic [ref=e101]: "Ticket #122 atribuído a você"
                  - generic [ref=e102]: 1d atrás
            - generic [ref=e106]:
              - generic [ref=e107]:
                - heading "Estatísticas" [level=3] [ref=e108]
                - generic [ref=e110]: ⚡
              - generic [ref=e111]:
                - generic [ref=e112]:
                  - generic [ref=e113]: "12"
                  - generic [ref=e114]: Tickets Abertos
                - generic [ref=e115]:
                  - generic [ref=e116]: "8"
                  - generic [ref=e117]: Resolvidos Hoje
                - generic [ref=e118]:
                  - generic [ref=e119]: "3"
                  - generic [ref=e120]: Aguardando IA
                - generic [ref=e121]:
                  - generic [ref=e122]: 98%
                  - generic [ref=e123]: Satisfação
  - alert [ref=e124]
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
> 18  |   await page.waitForURL('**/dashboard', { timeout: 10000 });
      |              ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
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
```