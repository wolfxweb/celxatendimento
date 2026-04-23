# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Dashboard Access Control >> DASH-E2E-003: Agent sees Tickets and Aprovar IA
- Location: tests/e2e.spec.ts:337:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Tickets')
Expected: visible
Error: strict mode violation: locator('text=Tickets') resolved to 7 elements:
    1) <span class="font-medium group-hover:text-primary-400 transition-colors">Tickets</span> aka getByRole('link', { name: '📋 Tickets', exact: true })
    2) <p class="text-slate-500 mt-2">Gerencie suas atividades e tickets</p> aka getByText('Gerencie suas atividades e')
    3) <h2 class="mt-4 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">Meus Tickets</h2> aka getByRole('link', { name: '🎫 Meus Tickets Visualize e' })
    4) <p class="mt-2 text-slate-500 text-sm leading-relaxed">Visualize e crie tickets de suporte</p> aka getByRole('link', { name: '🎫 Meus Tickets Visualize e' })
    5) <h2 class="mt-4 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">Tickets</h2> aka getByRole('link', { name: '📋 Tickets Gerencie tickets' })
    6) <p class="mt-2 text-slate-500 text-sm leading-relaxed">Gerencie tickets da empresa</p> aka getByRole('link', { name: '📋 Tickets Gerencie tickets' })
    7) <div class="text-sm text-slate-400">Tickets Abertos</div> aka getByText('Tickets Abertos')

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
            - heading "Dashboard" [level=1] [ref=e46]
            - paragraph [ref=e47]: Gerencie suas atividades e tickets
          - generic [ref=e50]:
            - link "🎫 Meus Tickets Visualize e crie tickets de suporte Acessar →" [ref=e51] [cursor=pointer]:
              - /url: /dashboard/cliente/tickets
              - generic [ref=e54]:
                - generic [ref=e55]: 🎫
                - heading "Meus Tickets" [level=2] [ref=e56]
                - paragraph [ref=e57]: Visualize e crie tickets de suporte
                - generic [ref=e58]:
                  - generic [ref=e59]: Acessar
                  - generic [ref=e60]: →
            - link "📋 Tickets Gerencie tickets da empresa Acessar →" [ref=e62] [cursor=pointer]:
              - /url: /dashboard/atendente/tickets
              - generic [ref=e65]:
                - generic [ref=e66]: 📋
                - heading "Tickets" [level=2] [ref=e67]
                - paragraph [ref=e68]: Gerencie tickets da empresa
                - generic [ref=e69]:
                  - generic [ref=e70]: Acessar
                  - generic [ref=e71]: →
            - link "🤖 Pendente Aprovar IA Revise respostas geradas por IA Acessar →" [ref=e73] [cursor=pointer]:
              - /url: /dashboard/atendente/aprovacao
              - generic [ref=e76]:
                - generic [ref=e77]: 🤖
                - generic [ref=e78]: Pendente
                - heading "Aprovar IA" [level=2] [ref=e79]
                - paragraph [ref=e80]: Revise respostas geradas por IA
                - generic [ref=e81]:
                  - generic [ref=e82]: Acessar
                  - generic [ref=e83]: →
          - generic [ref=e85]:
            - generic [ref=e86]:
              - generic [ref=e87]:
                - heading "Atividade Recente" [level=3] [ref=e88]
                - generic [ref=e90]: 📊
              - generic [ref=e91]:
                - generic [ref=e92]:
                  - generic [ref=e94]: "Ticket #123 resolvido com sucesso"
                  - generic [ref=e95]: 2h atrás
                - generic [ref=e96]:
                  - generic [ref=e98]: Nova resposta IA pendente
                  - generic [ref=e99]: 4h atrás
                - generic [ref=e100]:
                  - generic [ref=e102]: "Ticket #122 atribuído a você"
                  - generic [ref=e103]: 1d atrás
            - generic [ref=e107]:
              - generic [ref=e108]:
                - heading "Estatísticas" [level=3] [ref=e109]
                - generic [ref=e111]: ⚡
              - generic [ref=e112]:
                - generic [ref=e113]:
                  - generic [ref=e114]: "12"
                  - generic [ref=e115]: Tickets Abertos
                - generic [ref=e116]:
                  - generic [ref=e117]: "8"
                  - generic [ref=e118]: Resolvidos Hoje
                - generic [ref=e119]:
                  - generic [ref=e120]: "3"
                  - generic [ref=e121]: Aguardando IA
                - generic [ref=e122]:
                  - generic [ref=e123]: 98%
                  - generic [ref=e124]: Satisfação
  - alert [ref=e125]
```

# Test source

```ts
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
  339 |     await page.fill('input#email', USERS.agent.email);
  340 |     await page.fill('input#password', USERS.agent.password);
  341 |     await page.click('button[type="submit"]');
  342 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  343 |     
  344 |     // Should see agent menu items
> 345 |     await expect(page.locator('text=Tickets')).toBeVisible();
      |                                                ^ Error: expect(locator).toBeVisible() failed
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