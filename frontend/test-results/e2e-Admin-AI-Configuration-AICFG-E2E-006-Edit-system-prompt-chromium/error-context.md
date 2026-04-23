# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Admin AI Configuration >> AICFG-E2E-006: Edit system prompt
- Location: tests/e2e.spec.ts:258:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Prompt')
Expected: visible
Error: strict mode violation: locator('text=Prompt') resolved to 6 elements:
    1) <span class="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-primary-600">Editor de Prompt</span> aka getByText('Editor de Prompt')
    2) <button disabled class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-glow-primary transition-all disabled:opacity-50">💾 Salvar Prompt</button> aka getByRole('button', { name: '💾 Salvar Prompt' })
    3) <p class="text-xs text-slate-500 mb-4">Clique para inserir no prompt</p> aka getByText('Clique para inserir no prompt')
    4) <h3 class="font-bold text-slate-800">Prompt do Sistema</h3> aka getByRole('heading', { name: 'Prompt do Sistema' })
    5) <h4 class="font-bold text-primary-800 mb-3 flex items-center gap-2">💡 Dicas para um bom prompt</h4> aka getByRole('heading', { name: '💡 Dicas para um bom prompt' })
    6) <li>• Teste o prompt com o botão "Ver Preview" antes …</li> aka getByText('• Teste o prompt com o botão')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Prompt')

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
              - heading "Editor de Prompt" [level=1] [ref=e59]
              - paragraph [ref=e60]: Personalize o comportamento do agente de IA
            - generic [ref=e61]:
              - button "👁️ Ver Preview" [ref=e62] [cursor=pointer]
              - button "🔄 Restaurar Padrão" [ref=e63] [cursor=pointer]
              - button "💾 Salvar Prompt" [disabled] [ref=e64]
          - generic [ref=e65]:
            - generic [ref=e66]:
              - generic [ref=e67]:
                - generic [ref=e68]: 📋
                - heading "Variáveis" [level=3] [ref=e69]
              - paragraph [ref=e70]: Clique para inserir no prompt
              - generic [ref=e71]:
                - 'button "{company_name} Nome da empresa do cliente" [ref=e72] [cursor=pointer]':
                  - code [ref=e73]: "{company_name}"
                  - generic [ref=e74]: Nome da empresa do cliente
                - 'button "{rag_context} Contexto da base de conhecimento (RAG)" [ref=e75] [cursor=pointer]':
                  - code [ref=e76]: "{rag_context}"
                  - generic [ref=e77]: Contexto da base de conhecimento (RAG)
                - 'button "{ticket_subject} Assunto do ticket" [ref=e78] [cursor=pointer]':
                  - code [ref=e79]: "{ticket_subject}"
                  - generic [ref=e80]: Assunto do ticket
                - 'button "{ticket_description} Descrição completa do ticket" [ref=e81] [cursor=pointer]':
                  - code [ref=e82]: "{ticket_description}"
                  - generic [ref=e83]: Descrição completa do ticket
                - 'button "{customer_name} Nome do cliente" [ref=e84] [cursor=pointer]':
                  - code [ref=e85]: "{customer_name}"
                  - generic [ref=e86]: Nome do cliente
                - 'button "{customer_email} Email do cliente" [ref=e87] [cursor=pointer]':
                  - code [ref=e88]: "{customer_email}"
                  - generic [ref=e89]: Email do cliente
                - 'button "{ticket_priority} Prioridade do ticket (critical/high/medium/low)" [ref=e90] [cursor=pointer]':
                  - code [ref=e91]: "{ticket_priority}"
                  - generic [ref=e92]: Prioridade do ticket (critical/high/medium/low)
                - 'button "{ticket_category} Categoria do ticket" [ref=e93] [cursor=pointer]':
                  - code [ref=e94]: "{ticket_category}"
                  - generic [ref=e95]: Categoria do ticket
                - 'button "{ticket_id} ID único do ticket" [ref=e96] [cursor=pointer]':
                  - code [ref=e97]: "{ticket_id}"
                  - generic [ref=e98]: ID único do ticket
                - 'button "{ticket_number} Número do ticket (ex: TKT-202604000001)" [ref=e99] [cursor=pointer]':
                  - code [ref=e100]: "{ticket_number}"
                  - generic [ref=e101]: "Número do ticket (ex: TKT-202604000001)"
                - 'button "{current_date} Data atual" [ref=e102] [cursor=pointer]':
                  - code [ref=e103]: "{current_date}"
                  - generic [ref=e104]: Data atual
                - 'button "{agent_name} Nome do atendente (se atribuído)" [ref=e105] [cursor=pointer]':
                  - code [ref=e106]: "{agent_name}"
                  - generic [ref=e107]: Nome do atendente (se atribuído)
            - generic [ref=e108]:
              - generic [ref=e109]:
                - generic [ref=e110]:
                  - heading "Prompt do Sistema" [level=3] [ref=e111]
                  - button "🔮 Gerar Preview Completo" [ref=e112] [cursor=pointer]
                - generic [ref=e113]:
                  - button "✏️ Editar" [ref=e114] [cursor=pointer]
                  - button "👁️ Preview" [ref=e115] [cursor=pointer]
                - generic [ref=e116]:
                  - textbox "Digite seu prompt aqui..." [ref=e117]: "Você é um agente de atendimento ao cliente da {company_name}. ## Regras de Comunicação 1. Seja profissional e amigável --tratamento respeitoso em todas as interações 2. Seja claro e objetivo - respostas diretas, evitando rodeios 3. Use linguagem acessível - evite jargões técnicos desnecessários 4. Agradeça o contato - demonstre valorização pelo tempo do cliente ## Respondendo Tickets 1. **Entenda o problema** - Leia atentamente a descrição do ticket 2. **Identifique a categoria** - Determine se é dúvida, problema técnico, solicitação, etc. 3. **Forneça a solução** - Se souber a resposta, forneça imediatamente 4. **Se precisar de informações** - Solicite de forma clara e objetiva 5. **Defina próximos passos** - Informe o cliente sobre o que acontece a seguir ## Usando a Base de Conhecimento Quando houver informações relevantes na base de conhecimento ({rag_context}), use-as para fundamentar sua resposta. Cite as fontes quando usar informações da base de conhecimento. ## Quando Não Souber a Resposta 1. Não invente informações 2. Informe que vai verificar e retornará 3. Se necessário, escalone para um atendente humano ## Informações da Empresa - Empresa: {company_name} - Suporte: Segunda a Sexta, 9h às 18h - Email: suporte@{company_name}.com ## Dados do Ticket Atual - Número: {ticket_number} - Assunto: {ticket_subject} - Descrição: {ticket_description} - Prioridade: {ticket_priority} - Categoria: {ticket_category} - Cliente: {customer_name} ({customer_email})"
                  - generic [ref=e118]:
                    - generic [ref=e119]: 📝 1486 caracteres
                    - generic [ref=e120]: ~372 tokens (estimado)
              - generic [ref=e121]:
                - heading "💡 Dicas para um bom prompt" [level=4] [ref=e122]
                - list [ref=e123]:
                  - listitem [ref=e124]:
                    - text: • Use variáveis como
                    - code [ref=e125]: "{customer_name}"
                    - text: para personalizar mensagens
                  - listitem [ref=e126]: • Inclua regras claras de comunicação no início
                  - listitem [ref=e127]: • Defina o que fazer quando não souber a resposta
                  - listitem [ref=e128]:
                    - text: • Mencione a base de conhecimento com
                    - code [ref=e129]: "{rag_context}"
                  - listitem [ref=e130]: • Teste o prompt com o botão "Ver Preview" antes de salvar
  - alert [ref=e131]
```

# Test source

```ts
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
> 261 |     await expect(page.locator('text=Prompt'), { timeout: 5000 }).toBeVisible();
      |                                                                  ^ Error: expect(locator).toBeVisible() failed
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
```