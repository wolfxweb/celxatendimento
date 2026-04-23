# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Admin User Management >> USER-E2E-001: View user list
- Location: tests/e2e.spec.ts:235:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Usuários')
Expected: visible
Error: strict mode violation: locator('text=Usuários') resolved to 3 elements:
    1) <span class="font-medium group-hover:text-primary-400 transition-colors">Usuários</span> aka getByRole('link', { name: '👥 Usuários' })
    2) <span class="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-primary-600">Gerenciar Usuários</span> aka getByText('Gerenciar Usuários')
    3) <p class="text-slate-500 mt-1">Cadastre e gerencie usuários do sistema</p> aka getByText('Cadastre e gerencie usuários')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Usuários')

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
            - generic [ref=e58]:
              - heading "Gerenciar Usuários" [level=1] [ref=e59]
              - paragraph [ref=e60]: Cadastre e gerencie usuários do sistema
            - button "+ Novo Usuário" [ref=e61] [cursor=pointer]:
              - generic [ref=e62]: +
              - text: Novo Usuário
          - generic [ref=e63]: Erro ao carregar usuários
          - generic [ref=e64]:
            - generic [ref=e65]: 👥
            - heading "Nenhum usuário cadastrado" [level=3] [ref=e66]
            - paragraph [ref=e67]: Clique em "Novo Usuário" para começar
  - alert [ref=e68]
```

# Test source

```ts
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
> 238 |     await expect(page.locator('text=Usuários'), { timeout: 5000 }).toBeVisible();
      |                                                                    ^ Error: expect(locator).toBeVisible() failed
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
  268 |     await page.fill('input#email', USERS.admin.email);
  269 |     await page.fill('input#password', USERS.admin.password);
  270 |     await page.click('button[type="submit"]');
  271 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  272 |   });
  273 | 
  274 |   test('KB-E2E-001: View knowledge articles', async ({ page }) => {
  275 |     await page.goto(`${BASE_URL}/dashboard/admin/conhecimento`);
  276 |     
  277 |     await expect(page.locator('text=Conhecimento'), { timeout: 5000 }).toBeVisible();
  278 |   });
  279 | });
  280 | 
  281 | test.describe('Superadmin Company Management', () => {
  282 |   test.beforeEach(async ({ page }) => {
  283 |     await page.goto(`${BASE_URL}/login`);
  284 |     await page.fill('input#email', USERS.superadmin.email);
  285 |     await page.fill('input#password', USERS.superadmin.password);
  286 |     await page.click('button[type="submit"]');
  287 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  288 |   });
  289 | 
  290 |   test('COMP-E2E-001: View companies list', async ({ page }) => {
  291 |     await page.goto(`${BASE_URL}/dashboard/superadmin/empresas`);
  292 |     
  293 |     await expect(page.locator('text=Empresas'), { timeout: 5000 }).toBeVisible();
  294 |   });
  295 | });
  296 | 
  297 | test.describe('Superadmin Plan Management', () => {
  298 |   test.beforeEach(async ({ page }) => {
  299 |     await page.goto(`${BASE_URL}/login`);
  300 |     await page.fill('input#email', USERS.superadmin.email);
  301 |     await page.fill('input#password', USERS.superadmin.password);
  302 |     await page.click('button[type="submit"]');
  303 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  304 |   });
  305 | 
  306 |   test('PLAN-E2E-001: View plans list', async ({ page }) => {
  307 |     await page.goto(`${BASE_URL}/dashboard/superadmin/planos`);
  308 |     
  309 |     await expect(page.locator('text=Planos'), { timeout: 5000 }).toBeVisible();
  310 |   });
  311 | });
  312 | 
  313 | test.describe('Dashboard Access Control', () => {
  314 |   test('DASH-E2E-001: Superadmin sees Empresas and Planos', async ({ page }) => {
  315 |     await page.goto(`${BASE_URL}/login`);
  316 |     await page.fill('input#email', USERS.superadmin.email);
  317 |     await page.fill('input#password', USERS.superadmin.password);
  318 |     await page.click('button[type="submit"]');
  319 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  320 |     
  321 |     // Should see superadmin menu items
  322 |     await expect(page.locator('text=Empresas')).toBeVisible();
  323 |     await expect(page.locator('text=Planos')).toBeVisible();
  324 |   });
  325 | 
  326 |   test('DASH-E2E-002: Admin sees full menu', async ({ page }) => {
  327 |     await page.goto(`${BASE_URL}/login`);
  328 |     await page.fill('input#email', USERS.admin.email);
  329 |     await page.fill('input#password', USERS.admin.password);
  330 |     await page.click('button[type="submit"]');
  331 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  332 |     
  333 |     // Should see admin menu items
  334 |     await expect(page.locator('text=Usuários')).toBeVisible();
  335 |   });
  336 | 
  337 |   test('DASH-E2E-003: Agent sees Tickets and Aprovar IA', async ({ page }) => {
  338 |     await page.goto(`${BASE_URL}/login`);
```