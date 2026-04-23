# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Admin AI Configuration >> AICFG-E2E-001: View AI configuration
- Location: tests/e2e.spec.ts:171:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Configuração da IA', level: 1 })
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Configuração da IA', level: 1 })

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
        - generic [ref=e56]: Erro ao carregar dados
  - alert [ref=e57]
```

# Test source

```ts
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
> 173 |     await expect(page.getByRole('heading', { level: 1, name: 'Configuração da IA' })).toBeVisible();
      |                                                                                       ^ Error: expect(locator).toBeVisible() failed
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
  217 |     await loginAs(page, 'superadmin');
  218 |     await expect(navLink(page, 'Empresas')).toBeVisible();
  219 |     await expect(navLink(page, 'Planos')).toBeVisible();
  220 |   });
  221 | 
  222 |   test('DASH-E2E-002: Admin sees full menu', async ({ page }) => {
  223 |     await loginAs(page, 'admin');
  224 |     await expect(navLink(page, 'Meus Tickets')).toBeVisible();
  225 |     await expect(navLink(page, 'Tickets')).toBeVisible();
  226 |     await expect(navLink(page, 'Aprovar IA')).toBeVisible();
  227 |     await expect(navLink(page, 'Usuários')).toBeVisible();
  228 |     await expect(navLink(page, 'Config IA')).toBeVisible();
  229 |     await expect(navLink(page, 'Conhecimento')).toBeVisible();
  230 |   });
  231 | 
  232 |   test('DASH-E2E-003: Agent sees Tickets and Aprovar IA', async ({ page }) => {
  233 |     await loginAs(page, 'agent');
  234 |     await expect(navLink(page, 'Tickets')).toBeVisible();
  235 |     await expect(navLink(page, 'Aprovar IA')).toBeVisible();
  236 |     await expect(navLink(page, 'Usuários')).toHaveCount(0);
  237 |   });
  238 | 
  239 |   test('DASH-E2E-004: Customer sees only Meus Tickets', async ({ page }) => {
  240 |     await loginAs(page, 'customer');
  241 |     await expect(navLink(page, 'Meus Tickets')).toBeVisible();
  242 |     await expect(navLink(page, 'Tickets')).toHaveCount(0);
  243 |     await expect(navLink(page, 'Aprovar IA')).toHaveCount(0);
  244 |   });
  245 | });
  246 | 
  247 | test('Health Check: API is running', async ({ page }) => {
  248 |   const response = await page.request.get(`${API_URL}/health`);
  249 |   expect(response.ok()).toBeTruthy();
  250 | });
  251 | 
```