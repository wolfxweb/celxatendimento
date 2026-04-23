# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Customer Ticket Workflow >> TICK-E2E-001: View my tickets list
- Location: tests/e2e.spec.ts:107:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Tickets')
Expected: visible
Error: strict mode violation: locator('text=Tickets') resolved to 3 elements:
    1) <span class="font-medium group-hover:text-primary-400 transition-colors">Meus Tickets</span> aka getByRole('link', { name: '🎫 Meus Tickets' })
    2) <span class="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-primary-600">Meus Tickets</span> aka getByRole('main').getByText('Meus Tickets')
    3) <p class="text-slate-500 mt-1">Acompanhe todos os seus tickets de suporte</p> aka getByText('Acompanhe todos os seus')

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
        - link "🎫 Meus Tickets" [ref=e16] [cursor=pointer]:
          - /url: /dashboard/cliente/tickets
          - generic [ref=e17]: 🎫
          - generic [ref=e18]: Meus Tickets
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e22]: J
          - generic [ref=e23]:
            - paragraph [ref=e24]: João Cliente
            - paragraph [ref=e25]: cliente@teste.com
        - link "⬆ Sair" [ref=e26] [cursor=pointer]:
          - /url: /login
          - generic [ref=e27]: ⬆
          - text: Sair
    - generic [ref=e28]:
      - banner [ref=e29]:
        - generic [ref=e30]:
          - generic [ref=e31]:
            - heading "Olá, João 👋" [level=2] [ref=e32]
            - paragraph [ref=e33]: quarta-feira, 22 de abril
          - generic [ref=e34]:
            - generic [ref=e35]: customer
            - button "🔔" [ref=e36] [cursor=pointer]: 🔔
      - main [ref=e38]:
        - generic [ref=e40]:
          - generic [ref=e41]:
            - generic [ref=e42]:
              - heading "Meus Tickets" [level=1] [ref=e43]
              - paragraph [ref=e44]: Acompanhe todos os seus tickets de suporte
            - link "+ Novo Ticket" [ref=e45] [cursor=pointer]:
              - /url: /dashboard/cliente/tickets/novo
              - generic [ref=e46]: +
              - text: Novo Ticket
          - generic [ref=e47]:
            - button "📋 Todos" [ref=e48] [cursor=pointer]:
              - generic [ref=e49]: 📋
              - text: Todos
            - button "🟢 Abertos" [ref=e50] [cursor=pointer]:
              - generic [ref=e51]: 🟢
              - text: Abertos
            - button "⏳ Em Atendimento" [ref=e52] [cursor=pointer]:
              - generic [ref=e53]: ⏳
              - text: Em Atendimento
            - button "✅ Resolvidos" [ref=e54] [cursor=pointer]:
              - generic [ref=e55]: ✅
              - text: Resolvidos
  - alert [ref=e59]
```

# Test source

```ts
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
  38  |     await expect(page.locator('text=Dashboard')).toBeVisible();
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
> 111 |     await expect(page.locator('text=Tickets'), { timeout: 5000 }).toBeVisible();
      |                                                                   ^ Error: expect(locator).toBeVisible() failed
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
  167 |     await expect(page.locator('text=Tickets'), { timeout: 5000 }).toBeVisible();
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
```