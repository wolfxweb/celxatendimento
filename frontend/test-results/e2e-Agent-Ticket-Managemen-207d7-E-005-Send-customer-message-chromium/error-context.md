# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Agent Ticket Management >> AGT-E2E-005: Send customer message
- Location: frontend/tests/e2e.spec.ts:159:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: locator('textarea').first()
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('textarea').first()

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
            - paragraph [ref=e37]: sábado, 25 de abril
          - generic [ref=e38]:
            - generic [ref=e39]: agent
            - button "🔔" [ref=e40] [cursor=pointer]: 🔔
      - main [ref=e42]:
        - generic [ref=e45]: Erro ao carregar ticket
  - alert [ref=e46]
```

# Test source

```ts
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
> 167 |     await expect(messageInput).toBeVisible({ timeout: 10000 });
      |                                ^ Error: expect(locator).toBeVisible() failed
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
  191 |     await expect(page.getByRole('heading', { level: 1, name: 'Gerenciar Usuários' })).toBeVisible();
  192 |   });
  193 | });
  194 | 
  195 | test.describe('Admin AI Configuration', () => {
  196 |   test.beforeEach(async ({ page }) => {
  197 |     await loginAs(page, 'admin');
  198 |   });
  199 | 
  200 |   test('AICFG-E2E-001: View AI configuration', async ({ page }) => {
  201 |     await page.goto(`${BASE_URL}/dashboard/admin/config-ia`);
  202 |     await expect(page.getByRole('heading', { level: 1, name: 'Configuração da IA' })).toBeVisible();
  203 |   });
  204 | 
  205 |   test('AICFG-E2E-006: Edit system prompt', async ({ page }) => {
  206 |     await page.goto(`${BASE_URL}/dashboard/admin/config-ia/prompt-editor`);
  207 |     await expect(page.getByRole('heading', { level: 1, name: 'Editor de Prompt' })).toBeVisible();
  208 |   });
  209 | });
  210 | 
  211 | test.describe('Admin Knowledge Base', () => {
  212 |   test.beforeEach(async ({ page }) => {
  213 |     await loginAs(page, 'admin');
  214 |   });
  215 | 
  216 |   test('KB-E2E-001: View knowledge articles', async ({ page }) => {
  217 |     await page.goto(`${BASE_URL}/dashboard/admin/conhecimento`);
  218 |     await expect(page.getByRole('heading', { level: 1, name: 'Base de Conhecimento' })).toBeVisible();
  219 |   });
  220 | });
  221 | 
  222 | test.describe('Superadmin Company Management', () => {
  223 |   test.beforeEach(async ({ page }) => {
  224 |     await loginAs(page, 'superadmin');
  225 |   });
  226 | 
  227 |   test('COMP-E2E-001: View companies list', async ({ page }) => {
  228 |     await page.goto(`${BASE_URL}/dashboard/superadmin/empresas`);
  229 |     await expect(page.getByRole('heading', { level: 1, name: 'Gerenciar Empresas' })).toBeVisible();
  230 |   });
  231 | });
  232 | 
  233 | test.describe('Superadmin Plan Management', () => {
  234 |   test.beforeEach(async ({ page }) => {
  235 |     await loginAs(page, 'superadmin');
  236 |   });
  237 | 
  238 |   test('PLAN-E2E-001: View plans list', async ({ page }) => {
  239 |     await page.goto(`${BASE_URL}/dashboard/superadmin/planos`);
  240 |     await expect(page.getByRole('heading', { level: 1, name: 'Planos de Assinatura' })).toBeVisible();
  241 |   });
  242 | });
  243 | 
  244 | test.describe('Dashboard Access Control', () => {
  245 |   test('DASH-E2E-001: Superadmin sees Empresas and Planos', async ({ page }) => {
  246 |     await loginAs(page, 'superadmin');
  247 |     await expect(navLink(page, 'Empresas')).toBeVisible();
  248 |     await expect(navLink(page, 'Planos')).toBeVisible();
  249 |   });
  250 | 
  251 |   test('DASH-E2E-002: Admin sees full menu', async ({ page }) => {
  252 |     await loginAs(page, 'admin');
  253 |     await expect(navLink(page, 'Meus Tickets')).toBeVisible();
  254 |     await expect(navLink(page, 'Tickets')).toBeVisible();
  255 |     await expect(navLink(page, 'Aprovar IA')).toBeVisible();
  256 |     await expect(navLink(page, 'Usuários')).toBeVisible();
  257 |     await expect(navLink(page, 'Config IA')).toBeVisible();
  258 |     await expect(navLink(page, 'Conhecimento')).toBeVisible();
  259 |   });
  260 | 
  261 |   test('DASH-E2E-003: Agent sees Tickets and Aprovar IA', async ({ page }) => {
  262 |     await loginAs(page, 'agent');
  263 |     await expect(navLink(page, 'Tickets')).toBeVisible();
  264 |     await expect(navLink(page, 'Aprovar IA')).toBeVisible();
  265 |     await expect(navLink(page, 'Usuários')).toHaveCount(0);
  266 |   });
  267 | 
```