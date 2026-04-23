# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Authentication >> AUTH-E2E-001: Login as Admin
- Location: tests/e2e.spec.ts:29:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Dashboard')
Expected: visible
Error: strict mode violation: locator('text=Dashboard') resolved to 2 elements:
    1) <span class="font-medium group-hover:text-primary-400 transition-colors">Dashboard</span> aka getByRole('link', { name: '🏠 Dashboard' })
    2) <span class="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-primary-600 to-violet-600">Dashboard</span> aka getByRole('main').getByText('Dashboard')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Dashboard')

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
            - paragraph [ref=e40]: Admin Teste
            - paragraph [ref=e41]: admin@teste.com
        - link "⬆ Sair" [ref=e42] [cursor=pointer]:
          - /url: /login
          - generic [ref=e43]: ⬆
          - text: Sair
    - generic [ref=e44]:
      - banner [ref=e45]:
        - generic [ref=e46]:
          - generic [ref=e47]:
            - heading "Olá, Admin 👋" [level=2] [ref=e48]
            - paragraph [ref=e49]: quarta-feira, 22 de abril
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
                  - generic [ref=e106]: "Ticket #123 resolvido com sucesso"
                  - generic [ref=e107]: 2h atrás
                - generic [ref=e108]:
                  - generic [ref=e110]: Nova resposta IA pendente
                  - generic [ref=e111]: 4h atrás
                - generic [ref=e112]:
                  - generic [ref=e114]: "Ticket #122 atribuído a você"
                  - generic [ref=e115]: 1d atrás
            - generic [ref=e119]:
              - generic [ref=e120]:
                - heading "Estatísticas" [level=3] [ref=e121]
                - generic [ref=e123]: ⚡
              - generic [ref=e124]:
                - generic [ref=e125]:
                  - generic [ref=e126]: "12"
                  - generic [ref=e127]: Tickets Abertos
                - generic [ref=e128]:
                  - generic [ref=e129]: "8"
                  - generic [ref=e130]: Resolvidos Hoje
                - generic [ref=e131]:
                  - generic [ref=e132]: "3"
                  - generic [ref=e133]: Aguardando IA
                - generic [ref=e134]:
                  - generic [ref=e135]: 98%
                  - generic [ref=e136]: Satisfação
  - alert [ref=e137]
```

# Test source

```ts
  1   | /**
  2   |  * Frontend E2E Tests with Playwright
  3   |  * 
  4   |  * Run with: npx playwright test
  5   |  * Or: npx playwright test --ui for visual mode
  6   |  */
  7   | 
  8   | import { test, expect, Page } from '@playwright/test';
  9   | 
  10  | // Test users from seed data
  11  | const USERS = {
  12  |   admin: { email: 'admin@teste.com', password: '123456' },
  13  |   customer: { email: 'cliente@teste.com', password: '123456' },
  14  |   agent: { email: 'atendente@teste.com', password: '123456' },
  15  |   superadmin: { email: 'superadmin@celx.com.br', password: 'admin123' },
  16  | };
  17  | 
  18  | // Base URL for tests
  19  | const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  20  | const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  21  | 
  22  | test.describe('Authentication', () => {
  23  |   test.beforeEach(async ({ page }) => {
  24  |     // Clear localStorage before each test
  25  |     await page.goto(BASE_URL);
  26  |     await page.evaluate(() => localStorage.clear());
  27  |   });
  28  | 
  29  |   test('AUTH-E2E-001: Login as Admin', async ({ page }) => {
  30  |     await page.goto(`${BASE_URL}/login`);
  31  |     // Use id selector since the form uses id="email" not name="email"
  32  |     await page.fill('input#email', USERS.admin.email);
  33  |     await page.fill('input#password', USERS.admin.password);
  34  |     await page.click('button[type="submit"]');
  35  |     
  36  |     // Should redirect to dashboard
  37  |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
> 38  |     await expect(page.locator('text=Dashboard')).toBeVisible();
      |                                                  ^ Error: expect(locator).toBeVisible() failed
  39  |   });
  40  | 
  41  |   test('AUTH-E2E-002: Login as Customer', async ({ page }) => {
  42  |     await page.goto(`${BASE_URL}/login`);
  43  |     await page.fill('input#email', USERS.customer.email);
  44  |     await page.fill('input#password', USERS.customer.password);
  45  |     await page.click('button[type="submit"]');
  46  |     
  47  |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  48  |   });
  49  | 
  50  |   test('AUTH-E2E-003: Login as Agent', async ({ page }) => {
  51  |     await page.goto(`${BASE_URL}/login`);
  52  |     await page.fill('input#email', USERS.agent.email);
  53  |     await page.fill('input#password', USERS.agent.password);
  54  |     await page.click('button[type="submit"]');
  55  |     
  56  |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  57  |   });
  58  | 
  59  |   test('AUTH-E2E-004: Login as Super Admin', async ({ page }) => {
  60  |     await page.goto(`${BASE_URL}/login`);
  61  |     await page.fill('input#email', USERS.superadmin.email);
  62  |     await page.fill('input#password', USERS.superadmin.password);
  63  |     await page.click('button[type="submit"]');
  64  |     
  65  |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  66  |   });
  67  | 
  68  |   test('AUTH-E2E-005: Login with wrong password shows error', async ({ page }) => {
  69  |     await page.goto(`${BASE_URL}/login`);
  70  |     await page.fill('input#email', USERS.admin.email);
  71  |     await page.fill('input#password', 'wrongpassword');
  72  |     await page.click('button[type="submit"]');
  73  |     
  74  |     // Should show error message
  75  |     await expect(page.locator('text=incorretos'), { timeout: 5000 }).toBeVisible();
  76  |   });
  77  | 
  78  |   test('AUTH-E2E-006: Logout and redirect to login', async ({ page }) => {
  79  |     // Login first
  80  |     await page.goto(`${BASE_URL}/login`);
  81  |     await page.fill('input#email', USERS.admin.email);
  82  |     await page.fill('input#password', USERS.admin.password);
  83  |     await page.click('button[type="submit"]');
  84  |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  85  |     
  86  |     // Logout - click on user menu and logout
  87  |     const logoutButton = page.locator('button:has-text("Sair")').first();
  88  |     if (await logoutButton.isVisible()) {
  89  |       await logoutButton.click();
  90  |     }
  91  |     
  92  |     // Should redirect to login
  93  |     await page.waitForURL('**/login**', { timeout: 10000 });
  94  |   });
  95  | });
  96  | 
  97  | test.describe('Customer Ticket Workflow', () => {
  98  |   test.beforeEach(async ({ page }) => {
  99  |     // Login as customer
  100 |     await page.goto(`${BASE_URL}/login`);
  101 |     await page.fill('input#email', USERS.customer.email);
  102 |     await page.fill('input#password', USERS.customer.password);
  103 |     await page.click('button[type="submit"]');
  104 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  105 |   });
  106 | 
  107 |   test('TICK-E2E-001: View my tickets list', async ({ page }) => {
  108 |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets`);
  109 |     
  110 |     // Should show tickets list
  111 |     await expect(page.locator('text=Tickets'), { timeout: 5000 }).toBeVisible();
  112 |   });
  113 | 
  114 |   test('TICK-E2E-002: Filter tickets by status', async ({ page }) => {
  115 |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets`);
  116 |     
  117 |     // Click on status filter if available
  118 |     const filterButton = page.locator('button:has-text("Abertos")').first();
  119 |     if (await filterButton.isVisible()) {
  120 |       await filterButton.click();
  121 |     }
  122 |   });
  123 | 
  124 |   test('TICK-E2E-003: Navigate to create new ticket form', async ({ page }) => {
  125 |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets/novo`);
  126 |     
  127 |     // Should show form - look for subject input or page content
  128 |     await expect(page.locator('text=Novo'), { timeout: 5000 }).toBeVisible();
  129 |   });
  130 | 
  131 |   test('TICK-E2E-004: Create ticket - success', async ({ page }) => {
  132 |     await page.goto(`${BASE_URL}/dashboard/cliente/tickets/novo`);
  133 |     
  134 |     // Look for any input field for subject
  135 |     const subjectInput = page.locator('input#subject, input[placeholder*="Assunto"], input[placeholder*="Subject"]').first();
  136 |     if (await subjectInput.isVisible()) {
  137 |       await subjectInput.fill('Test Ticket Subject E2E');
  138 |       
```