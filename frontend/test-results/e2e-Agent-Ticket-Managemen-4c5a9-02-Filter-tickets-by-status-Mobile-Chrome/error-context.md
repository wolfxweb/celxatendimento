# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Agent Ticket Management >> AGT-E2E-002: Filter tickets by status
- Location: tests/e2e.spec.ts:114:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Abertos', exact: true })

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
        - link "📋 Tickets" [ref=e16] [cursor=pointer]:
          - /url: /dashboard/atendente/tickets
          - generic [ref=e17]: 📋
          - generic [ref=e18]: Tickets
        - link "🤖 Aprovar IA NEW" [ref=e19] [cursor=pointer]:
          - /url: /dashboard/atendente/aprovacao
          - generic [ref=e20]: 🤖
          - generic [ref=e21]: Aprovar IA
          - generic [ref=e22]: NEW
      - generic [ref=e23]:
        - generic [ref=e24]:
          - generic [ref=e26]: A
          - generic [ref=e27]:
            - paragraph [ref=e28]: Agente Silva
            - paragraph [ref=e29]: agente@celx.com.br
        - link "⬆ Sair" [ref=e30] [cursor=pointer]:
          - /url: /login
          - generic [ref=e31]: ⬆
          - text: Sair
    - generic [ref=e32]:
      - banner [ref=e33]:
        - generic [ref=e34]:
          - generic [ref=e35]:
            - heading "Olá, Agente 👋" [level=2] [ref=e36]
            - paragraph [ref=e37]: quinta-feira, 23 de abril
          - generic [ref=e38]:
            - generic [ref=e39]: agent
            - button "🔔" [ref=e40] [cursor=pointer]: 🔔
      - main [ref=e42]:
        - generic [ref=e44]:
          - generic [ref=e45]:
            - generic [ref=e46]:
              - heading "Tickets" [level=1] [ref=e47]
              - paragraph [ref=e48]: Gerencie todos os tickets da empresa
            - generic [ref=e50]: 0tickets
          - generic [ref=e51]:
            - button "📋 Todos" [ref=e52] [cursor=pointer]:
              - generic [ref=e53]: 📋
              - text: Todos
            - button "🟢 Abertos" [ref=e54] [cursor=pointer]:
              - generic [ref=e55]: 🟢
              - text: Abertos
            - button "🤖 Aguardando IA" [ref=e56] [cursor=pointer]:
              - generic [ref=e57]: 🤖
              - text: Aguardando IA
            - button "⏳ Aguardando Atendente" [ref=e58] [cursor=pointer]:
              - generic [ref=e59]: ⏳
              - text: Aguardando Atendente
            - button "✅ Resolvidos" [ref=e60] [cursor=pointer]:
              - generic [ref=e61]: ✅
              - text: Resolvidos
            - button "🔒 Fechados" [ref=e62] [cursor=pointer]:
              - generic [ref=e63]: 🔒
              - text: Fechados
          - generic [ref=e64]: Erro ao carregar tickets
          - generic [ref=e65]:
            - generic [ref=e66]: 🎫
            - heading "Nenhum ticket encontrado" [level=3] [ref=e67]
            - paragraph [ref=e68]: Não há tickets neste status no momento
  - alert [ref=e69]
```

# Test source

```ts
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
> 116 |     await page.getByRole('button', { name: 'Abertos', exact: true }).click();
      |                                                                      ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  198 |   test('COMP-E2E-001: View companies list', async ({ page }) => {
  199 |     await page.goto(`${BASE_URL}/dashboard/superadmin/empresas`);
  200 |     await expect(page.getByRole('heading', { level: 1, name: 'Gerenciar Empresas' })).toBeVisible();
  201 |   });
  202 | });
  203 | 
  204 | test.describe('Superadmin Plan Management', () => {
  205 |   test.beforeEach(async ({ page }) => {
  206 |     await loginAs(page, 'superadmin');
  207 |   });
  208 | 
  209 |   test('PLAN-E2E-001: View plans list', async ({ page }) => {
  210 |     await page.goto(`${BASE_URL}/dashboard/superadmin/planos`);
  211 |     await expect(page.getByRole('heading', { level: 1, name: 'Planos de Assinatura' })).toBeVisible();
  212 |   });
  213 | });
  214 | 
  215 | test.describe('Dashboard Access Control', () => {
  216 |   test('DASH-E2E-001: Superadmin sees Empresas and Planos', async ({ page }) => {
```