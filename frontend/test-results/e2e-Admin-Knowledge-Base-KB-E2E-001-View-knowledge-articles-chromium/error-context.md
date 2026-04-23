# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Admin Knowledge Base >> KB-E2E-001: View knowledge articles
- Location: tests/e2e.spec.ts:274:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Conhecimento')
Expected: visible
Error: strict mode violation: locator('text=Conhecimento') resolved to 2 elements:
    1) <span class="font-medium group-hover:text-primary-400 transition-colors">Conhecimento</span> aka getByRole('link', { name: '📚 Conhecimento' })
    2) <span class="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-primary-600">Base de Conhecimento</span> aka getByText('Base de Conhecimento')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Conhecimento')

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
              - heading "Base de Conhecimento" [level=1] [ref=e59]
              - paragraph [ref=e60]: Gerencie artigos para o sistema RAG
            - button "+ Novo Artigo" [ref=e61] [cursor=pointer]:
              - generic [ref=e62]: +
              - text: Novo Artigo
          - generic [ref=e63]:
            - generic [ref=e65]:
              - generic [ref=e66]: 📚
              - generic [ref=e67]:
                - generic [ref=e68]: "0"
                - generic [ref=e69]: Total de Artigos
            - generic [ref=e71]:
              - generic [ref=e72]: ✓
              - generic [ref=e73]:
                - generic [ref=e74]: "0"
                - generic [ref=e75]: Indexados
            - generic [ref=e77]:
              - generic [ref=e78]: ⏳
              - generic [ref=e79]:
                - generic [ref=e80]: "0"
                - generic [ref=e81]: Pendentes
            - generic [ref=e83]:
              - generic [ref=e84]: ✗
              - generic [ref=e85]:
                - generic [ref=e86]: "0"
                - generic [ref=e87]: Com Erro
          - generic [ref=e88]: Erro ao carregar artigos
          - generic [ref=e89]:
            - generic [ref=e90]: 📚
            - heading "Nenhum artigo cadastrado" [level=3] [ref=e91]
            - paragraph [ref=e92]: Clique em "Novo Artigo" para começar
  - alert [ref=e93]
```

# Test source

```ts
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
  268 |     await page.fill('input#email', USERS.admin.email);
  269 |     await page.fill('input#password', USERS.admin.password);
  270 |     await page.click('button[type="submit"]');
  271 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  272 |   });
  273 | 
  274 |   test('KB-E2E-001: View knowledge articles', async ({ page }) => {
  275 |     await page.goto(`${BASE_URL}/dashboard/admin/conhecimento`);
  276 |     
> 277 |     await expect(page.locator('text=Conhecimento'), { timeout: 5000 }).toBeVisible();
      |                                                                        ^ Error: expect(locator).toBeVisible() failed
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
  339 |     await page.fill('input#email', USERS.agent.email);
  340 |     await page.fill('input#password', USERS.agent.password);
  341 |     await page.click('button[type="submit"]');
  342 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  343 |     
  344 |     // Should see agent menu items
  345 |     await expect(page.locator('text=Tickets')).toBeVisible();
  346 |   });
  347 | 
  348 |   test('DASH-E2E-004: Customer sees only Meus Tickets', async ({ page }) => {
  349 |     await page.goto(`${BASE_URL}/login`);
  350 |     await page.fill('input#email', USERS.customer.email);
  351 |     await page.fill('input#password', USERS.customer.password);
  352 |     await page.click('button[type="submit"]');
  353 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  354 |     
  355 |     // Should see customer menu items
  356 |     await expect(page.locator('text=Meus Tickets')).toBeVisible();
  357 |   });
  358 | });
  359 | 
  360 | // Health check test
  361 | test('Health Check: API is running', async ({ page }) => {
  362 |   const response = await page.request.get(`${API_URL}/health`);
  363 |   expect(response.ok()).toBeTruthy();
  364 | });
```