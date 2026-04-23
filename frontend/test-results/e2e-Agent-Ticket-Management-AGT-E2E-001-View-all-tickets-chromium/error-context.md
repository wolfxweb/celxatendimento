# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Agent Ticket Management >> AGT-E2E-001: View all tickets
- Location: tests/e2e.spec.ts:164:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Tickets')
Expected: visible
Error: strict mode violation: locator('text=Tickets') resolved to 4 elements:
    1) <span class="font-medium group-hover:text-primary-400 transition-colors">Tickets</span> aka getByRole('link', { name: '📋 Tickets' })
    2) <span class="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-primary-600">Tickets</span> aka getByRole('main').getByText('Tickets', { exact: true })
    3) <p class="text-slate-500 mt-1">Gerencie todos os tickets da empresa</p> aka getByText('Gerencie todos os tickets da')
    4) <span class="text-sm text-slate-500 ml-2">tickets</span> aka getByText('tickets', { exact: true })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Tickets')

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
          - generic [ref=e26]: M
          - generic [ref=e27]:
            - paragraph [ref=e28]: Maria Atendente
            - paragraph [ref=e29]: atendente@teste.com
        - link "⬆ Sair" [ref=e30] [cursor=pointer]:
          - /url: /login
          - generic [ref=e31]: ⬆
          - text: Sair
    - generic [ref=e32]:
      - banner [ref=e33]:
        - generic [ref=e34]:
          - generic [ref=e35]:
            - heading "Olá, Maria 👋" [level=2] [ref=e36]
            - paragraph [ref=e37]: quarta-feira, 22 de abril
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
  139 |       // Find description textarea
  140 |       const descInput = page.locator('textarea#description, textarea').first();
  141 |       if (await descInput.isVisible()) {
  142 |         await descInput.fill('Test ticket description for E2E test');
  143 |       }
  144 |       
  145 |       // Submit
  146 |       await page.click('button[type="submit"], button:has-text("Criar"), button:has-text("Enviar")');
  147 |       
  148 |       // Should see ticket related content
  149 |       await expect(page.locator('text=Ticket'), { timeout: 5000 }).toBeVisible();
  150 |     }
  151 |   });
  152 | });
  153 | 
  154 | test.describe('Agent Ticket Management', () => {
  155 |   test.beforeEach(async ({ page }) => {
  156 |     // Login as agent
  157 |     await page.goto(`${BASE_URL}/login`);
  158 |     await page.fill('input#email', USERS.agent.email);
  159 |     await page.fill('input#password', USERS.agent.password);
  160 |     await page.click('button[type="submit"]');
  161 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  162 |   });
  163 | 
  164 |   test('AGT-E2E-001: View all tickets', async ({ page }) => {
  165 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  166 |     
> 167 |     await expect(page.locator('text=Tickets'), { timeout: 5000 }).toBeVisible();
      |                                                                   ^ Error: expect(locator).toBeVisible() failed
  168 |   });
  169 | 
  170 |   test('AGT-E2E-002: Filter tickets by status', async ({ page }) => {
  171 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  172 |     
  173 |     // Try filtering by status
  174 |     const filterButton = page.locator('button:has-text("Abertos")').first();
  175 |     if (await filterButton.isVisible()) {
  176 |       await filterButton.click();
  177 |     }
  178 |   });
  179 | 
  180 |   test('AGT-E2E-003: Open ticket detail', async ({ page }) => {
  181 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  182 |     
  183 |     // Click on first ticket if any
  184 |     const ticketLink = page.locator('a[href*="/dashboard/atendente/tickets/"]').first();
  185 |     if (await ticketLink.isVisible()) {
  186 |       await ticketLink.click();
  187 |       await expect(page.locator('text=Detalhes'), { timeout: 5000 }).toBeVisible();
  188 |     }
  189 |   });
  190 | 
  191 |   test('AGT-E2E-005: Send customer message', async ({ page }) => {
  192 |     await page.goto(`${BASE_URL}/dashboard/atendente/tickets`);
  193 |     
  194 |     // Navigate to first ticket
  195 |     const ticketLink = page.locator('a[href*="/dashboard/atendente/tickets/"]').first();
  196 |     if (await ticketLink.isVisible()) {
  197 |       await ticketLink.click();
  198 |       
  199 |       // Type message
  200 |       const messageInput = page.locator('textarea#content, textarea').first();
  201 |       if (await messageInput.isVisible()) {
  202 |         await messageInput.fill('Test message from agent E2E');
  203 |         await page.click('button:has-text("Enviar"), button:has-text("Responder")');
  204 |       }
  205 |     }
  206 |   });
  207 | });
  208 | 
  209 | test.describe('AI Approval Page', () => {
  210 |   test.beforeEach(async ({ page }) => {
  211 |     await page.goto(`${BASE_URL}/login`);
  212 |     await page.fill('input#email', USERS.agent.email);
  213 |     await page.fill('input#password', USERS.agent.password);
  214 |     await page.click('button[type="submit"]');
  215 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  216 |   });
  217 | 
  218 |   test('AI-E2E-001: View pending AI approvals', async ({ page }) => {
  219 |     await page.goto(`${BASE_URL}/dashboard/atendente/aprovacao`);
  220 |     
  221 |     // Should show AI approval interface
  222 |     await expect(page.locator('text=Aprovar'), { timeout: 5000 }).toBeVisible();
  223 |   });
  224 | });
  225 | 
  226 | test.describe('Admin User Management', () => {
  227 |   test.beforeEach(async ({ page }) => {
  228 |     await page.goto(`${BASE_URL}/login`);
  229 |     await page.fill('input#email', USERS.admin.email);
  230 |     await page.fill('input#password', USERS.admin.password);
  231 |     await page.click('button[type="submit"]');
  232 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  233 |   });
  234 | 
  235 |   test('USER-E2E-001: View user list', async ({ page }) => {
  236 |     await page.goto(`${BASE_URL}/dashboard/admin/usuarios`);
  237 |     
  238 |     await expect(page.locator('text=Usuários'), { timeout: 5000 }).toBeVisible();
  239 |   });
  240 | });
  241 | 
  242 | test.describe('Admin AI Configuration', () => {
  243 |   test.beforeEach(async ({ page }) => {
  244 |     await page.goto(`${BASE_URL}/login`);
  245 |     await page.fill('input#email', USERS.admin.email);
  246 |     await page.fill('input#password', USERS.admin.password);
  247 |     await page.click('button[type="submit"]');
  248 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  249 |   });
  250 | 
  251 |   test('AICFG-E2E-001: View AI configuration', async ({ page }) => {
  252 |     await page.goto(`${BASE_URL}/dashboard/admin/config-ia`);
  253 |     
  254 |     // Should show AI config form
  255 |     await expect(page.locator('text=Config'), { timeout: 5000 }).toBeVisible();
  256 |   });
  257 | 
  258 |   test('AICFG-E2E-006: Edit system prompt', async ({ page }) => {
  259 |     await page.goto(`${BASE_URL}/dashboard/admin/config-ia/prompt-editor`);
  260 |     
  261 |     await expect(page.locator('text=Prompt'), { timeout: 5000 }).toBeVisible();
  262 |   });
  263 | });
  264 | 
  265 | test.describe('Admin Knowledge Base', () => {
  266 |   test.beforeEach(async ({ page }) => {
  267 |     await page.goto(`${BASE_URL}/login`);
```