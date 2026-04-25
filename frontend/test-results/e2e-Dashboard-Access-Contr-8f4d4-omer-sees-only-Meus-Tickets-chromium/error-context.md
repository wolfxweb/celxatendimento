# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Dashboard Access Control >> DASH-E2E-004: Customer sees only Meus Tickets
- Location: frontend/tests/e2e.spec.ts:268:7

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('aside nav').getByRole('link', { name: /Tickets/i })
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('aside nav').getByRole('link', { name: /Tickets/i })
    8 × locator resolved to 1 element
      - unexpected value "1"

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
            - paragraph [ref=e25]: cliente@celx.com.br
        - link "⬆ Sair" [ref=e26] [cursor=pointer]:
          - /url: /login
          - generic [ref=e27]: ⬆
          - text: Sair
    - generic [ref=e28]:
      - banner [ref=e29]:
        - generic [ref=e30]:
          - generic [ref=e31]:
            - heading "Olá, João 👋" [level=2] [ref=e32]
            - paragraph [ref=e33]: sábado, 25 de abril
          - generic [ref=e34]:
            - generic [ref=e35]: customer
            - button "🔔" [ref=e36] [cursor=pointer]: 🔔
      - main [ref=e38]:
        - generic [ref=e40]:
          - generic [ref=e41]:
            - heading "Dashboard" [level=1] [ref=e42]
            - paragraph [ref=e43]: Gerencie suas atividades e tickets
          - generic [ref=e46]:
            - link "🎫 Meus Tickets Visualize e crie tickets de suporte Acessar →" [ref=e47] [cursor=pointer]:
              - /url: /dashboard/cliente/tickets
              - generic [ref=e50]:
                - generic [ref=e51]: 🎫
                - heading "Meus Tickets" [level=2] [ref=e52]
                - paragraph [ref=e53]: Visualize e crie tickets de suporte
                - generic [ref=e54]:
                  - generic [ref=e55]: Acessar
                  - generic [ref=e56]: →
            - link "📋 Tickets Gerencie tickets da empresa Acessar →" [ref=e58] [cursor=pointer]:
              - /url: /dashboard/atendente/tickets
              - generic [ref=e61]:
                - generic [ref=e62]: 📋
                - heading "Tickets" [level=2] [ref=e63]
                - paragraph [ref=e64]: Gerencie tickets da empresa
                - generic [ref=e65]:
                  - generic [ref=e66]: Acessar
                  - generic [ref=e67]: →
            - link "🤖 Pendente Aprovar IA Revise respostas geradas por IA Acessar →" [ref=e69] [cursor=pointer]:
              - /url: /dashboard/atendente/aprovacao
              - generic [ref=e72]:
                - generic [ref=e73]: 🤖
                - generic [ref=e74]: Pendente
                - heading "Aprovar IA" [level=2] [ref=e75]
                - paragraph [ref=e76]: Revise respostas geradas por IA
                - generic [ref=e77]:
                  - generic [ref=e78]: Acessar
                  - generic [ref=e79]: →
          - generic [ref=e81]:
            - generic [ref=e82]:
              - generic [ref=e83]:
                - heading "Atividade Recente" [level=3] [ref=e84]
                - generic [ref=e86]: 📊
              - generic [ref=e87]:
                - generic [ref=e88]:
                  - generic [ref=e90]: "Ticket #123 resolvido com sucesso"
                  - generic [ref=e91]: 2h atrás
                - generic [ref=e92]:
                  - generic [ref=e94]: Nova resposta IA pendente
                  - generic [ref=e95]: 4h atrás
                - generic [ref=e96]:
                  - generic [ref=e98]: "Ticket #122 atribuído a você"
                  - generic [ref=e99]: 1d atrás
            - generic [ref=e103]:
              - generic [ref=e104]:
                - heading "Estatísticas" [level=3] [ref=e105]
                - generic [ref=e107]: ⚡
              - generic [ref=e108]:
                - generic [ref=e109]:
                  - generic [ref=e110]: "12"
                  - generic [ref=e111]: Tickets Abertos
                - generic [ref=e112]:
                  - generic [ref=e113]: "8"
                  - generic [ref=e114]: Resolvidos Hoje
                - generic [ref=e115]:
                  - generic [ref=e116]: "3"
                  - generic [ref=e117]: Aguardando IA
                - generic [ref=e118]:
                  - generic [ref=e119]: 98%
                  - generic [ref=e120]: Satisfação
  - alert [ref=e121]
```

# Test source

```ts
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
  268 |   test('DASH-E2E-004: Customer sees only Meus Tickets', async ({ page }) => {
  269 |     await loginAs(page, 'customer');
  270 |     await expect(navLink(page, 'Meus Tickets')).toBeVisible();
> 271 |     await expect(navLink(page, 'Tickets')).toHaveCount(0);
      |                                            ^ Error: expect(locator).toHaveCount(expected) failed
  272 |     await expect(navLink(page, 'Aprovar IA')).toHaveCount(0);
  273 |   });
  274 | });
  275 | 
  276 | test('Health Check: API is running', async ({ page }) => {
  277 |   const response = await page.request.get(`${API_URL}/health`);
  278 |   expect(response.ok()).toBeTruthy();
  279 | });
  280 | 
```