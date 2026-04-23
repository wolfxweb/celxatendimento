# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Superadmin Plan Management >> PLAN-E2E-001: View plans list
- Location: tests/e2e.spec.ts:306:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Planos')
Expected: visible
Error: strict mode violation: locator('text=Planos') resolved to 3 elements:
    1) <span class="font-medium group-hover:text-primary-400 transition-colors">Planos</span> aka getByRole('link', { name: '📦 Planos' })
    2) <span class="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-primary-600">Planos de Assinatura</span> aka getByText('Planos de Assinatura')
    3) <p class="text-slate-500 mt-1">Gerencie os planos disponíveis para as empresas</p> aka getByText('Gerencie os planos disponí')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Planos')

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
            - paragraph [ref=e36]: quarta-feira, 22 de abril
          - generic [ref=e37]:
            - generic [ref=e38]: superadmin
            - button "🔔" [ref=e39] [cursor=pointer]: 🔔
      - main [ref=e41]:
        - generic [ref=e44]:
          - generic [ref=e45]:
            - heading "Planos de Assinatura" [level=1] [ref=e46]
            - paragraph [ref=e47]: Gerencie os planos disponíveis para as empresas
          - button "+ Novo Plano" [ref=e48] [cursor=pointer]:
            - generic [ref=e49]: +
            - text: Novo Plano
  - alert [ref=e53]
```

# Test source

```ts
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
> 309 |     await expect(page.locator('text=Planos'), { timeout: 5000 }).toBeVisible();
      |                                                                  ^ Error: expect(locator).toBeVisible() failed
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