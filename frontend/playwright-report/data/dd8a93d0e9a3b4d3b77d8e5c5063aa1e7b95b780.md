# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Dashboard Access Control >> DASH-E2E-004: Customer sees only Meus Tickets
- Location: tests/e2e.spec.ts:239:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('aside nav').getByRole('link', { name: 'Meus Tickets', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('aside nav').getByRole('link', { name: 'Meus Tickets', exact: true })

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
            - paragraph [ref=e33]: quinta-feira, 23 de abril
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
> 241 |     await expect(navLink(page, 'Meus Tickets')).toBeVisible();
      |                                                 ^ Error: expect(locator).toBeVisible() failed
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