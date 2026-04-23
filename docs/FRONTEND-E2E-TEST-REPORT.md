# 📊 Relatório de Testes E2E - Frontend

**Data:** 2026-04-22
**Sistema:** celx-atendimento (Frontend Next.js)
**Framework:** Playwright
**Total de Testes:** 35

---

## 📋 Resumo dos Testes

| Categoria | Quantidade | Status |
|-----------|------------|--------|
| Authentication | 6 | ✅ Implementado |
| Customer Ticket Workflow | 4 | ✅ Implementado |
| Agent Ticket Management | 4 | ✅ Implementado |
| AI Approval Page | 1 | ✅ Implementado |
| Admin User Management | 1 | ✅ Implementado |
| Admin AI Configuration | 2 | ✅ Implementado |
| Admin Knowledge Base | 1 | ✅ Implementado |
| Superadmin Company Management | 1 | ✅ Implementado |
| Superadmin Plan Management | 1 | ✅ Implementado |
| Dashboard Access Control | 4 | ✅ Implementado |
| Health Check | 1 | ✅ Implementado |
| **TOTAL** | **35** | ✅ |

---

## 👥 Usuários de Teste

| Email | Senha | Role | Rota Dashboard |
|-------|-------|------|----------------|
| `superadmin@celx.com.br` | `admin123` | Super Admin | `/dashboard/superadmin/*` |
| `admin@teste.com` | `123456` | Admin | `/dashboard/admin/*` |
| `atendente@teste.com` | `123456` | Atendente/Agent | `/dashboard/atendente/*` |
| `cliente@teste.com` | `123456` | Cliente/Customer | `/dashboard/cliente/*` |

---

## 🔐 Autenticação (6 testes)

### test_api_http.py - Autenticação

| ID | Teste | Descrição | Credenciais |
|----|-------|-----------|-------------|
| AUTH-E2E-001 | Login as Admin | Login com usuário admin | admin@teste.com / 123456 |
| AUTH-E2E-002 | Login as Customer | Login com usuário cliente | cliente@teste.com / 123456 |
| AUTH-E2E-003 | Login as Agent | Login com usuário atendente | atendente@teste.com / 123456 |
| AUTH-E2E-004 | Login as Super Admin | Login com superadmin | superadmin@celx.com.br / admin123 |
| AUTH-E2E-005 | Login with wrong password | Erro com senha incorreta | admin@teste.com / wrongpassword |
| AUTH-E2E-006 | Logout and redirect | Logout redireciona para login | admin@teste.com / 123456 |

**Fluxo:**
1. Acessar `/login`
2. Preencher `input#email` e `input#password`
3. Clicar em `button[type="submit"]`
4. Verificar redirect para `/dashboard`
5. Para logout: clicar em "Sair"

---

## 🎫 Workflow de Tickets - Cliente (4 testes)

| ID | Teste | Descrição | URL |
|----|-------|-----------|-----|
| TICK-E2E-001 | View my tickets list | Listar tickets do cliente | `/dashboard/cliente/tickets` |
| TICK-E2E-002 | Filter tickets by status | Filtrar por status | `/dashboard/cliente/tickets` |
| TICK-E2E-003 | Navigate to create new ticket form | Formulário de novo ticket | `/dashboard/cliente/tickets/novo` |
| TICK-E2E-004 | Create ticket - success | Criar ticket com sucesso | `/dashboard/cliente/tickets/novo` |

**Fluxo de Criação de Ticket:**
1. Acessar `/dashboard/cliente/tickets/novo`
2. Preencher `input#subject` com assunto
3. Preencher `textarea#description` com descrição
4. Clicar em `button[type="submit"]` ou botão "Criar"/"Enviar"
5. Verificar criação bem-sucedida

---

## 🎫 Gestão de Tickets - Agente (4 testes)

| ID | Teste | Descrição | URL |
|----|-------|-----------|-----|
| AGT-E2E-001 | View all tickets | Listar todos os tickets | `/dashboard/atendente/tickets` |
| AGT-E2E-002 | Filter tickets by status | Filtrar por status | `/dashboard/atendente/tickets` |
| AGT-E2E-003 | Open ticket detail | Ver detalhes do ticket | `/dashboard/atendente/tickets` |
| AGT-E2E-005 | Send customer message | Enviar mensagem ao cliente | `/dashboard/atendente/tickets/{id}` |

**Fluxo de Mensagem:**
1. Acessar `/dashboard/atendente/tickets`
2. Clicar em ticket com link `a[href*="/dashboard/atendente/tickets/"]`
3. Preencher `textarea#content`
4. Clicar em "Enviar" ou "Responder"

---

## 🤖 Página de Aprovação de IA (1 teste)

| ID | Teste | Descrição | URL |
|----|-------|-----------|-----|
| AI-E2E-001 | View pending AI approvals | Ver aprovações pendentes | `/dashboard/atendente/aprovacao` |

**Verificação:** Presença de texto "Aprovar"

---

## 👤 Gestão de Usuários - Admin (1 teste)

| ID | Teste | Descrição | URL |
|----|-------|-----------|-----|
| USER-E2E-001 | View user list | Listar usuários | `/dashboard/admin/usuarios` |

**Verificação:** Presença de texto "Usuários"

---

## ⚙️ Configuração de IA - Admin (2 testes)

| ID | Teste | Descrição | URL |
|----|-------|-----------|-----|
| AICFG-E2E-001 | View AI configuration | Ver config de IA | `/dashboard/admin/config-ia` |
| AICFG-E2E-006 | Edit system prompt | Editar prompt do sistema | `/dashboard/admin/config-ia/prompt-editor` |

**Verificação:** Presença de texto "Config" ou "Prompt"

---

## 📚 Base de Conhecimento - Admin (1 teste)

| ID | Teste | Descrição | URL |
|----|-------|-----------|-----|
| KB-E2E-001 | View knowledge articles | Ver artigos de conhecimento | `/dashboard/admin/conhecimento` |

**Verificação:** Presença de texto "Conhecimento"

---

## 🏢 Gestão de Empresas - Superadmin (1 teste)

| ID | Teste | Descrição | URL |
|----|-------|-----------|-----|
| COMP-E2E-001 | View companies list | Listar empresas | `/dashboard/superadmin/empresas` |

**Verificação:** Presença de texto "Empresas"

---

## 📋 Gestão de Planos - Superadmin (1 teste)

| ID | Teste | Descrição | URL |
|----|-------|-----------|-----|
| PLAN-E2E-001 | View plans list | Listar planos | `/dashboard/superadmin/planos` |

**Verificação:** Presença de texto "Planos"

---

## 📊 Controle de Acesso - Dashboard (4 testes)

| ID | Teste | Descrição | Verificação |
|----|-------|-----------|-------------|
| DASH-E2E-001 | Superadmin sees Empresas and Planos | Menu superadmin completo | "Empresas" + "Planos" visíveis |
| DASH-E2E-002 | Admin sees full menu | Menu admin completo | "Usuários" visível |
| DASH-E2E-003 | Agent sees Tickets and Aprovar IA | Menu agente | "Tickets" visível |
| DASH-E2E-004 | Customer sees only Meus Tickets | Menu cliente limitado | "Meus Tickets" visível |

---

## ❤️ Health Check (1 teste)

| ID | Teste | Descrição | Endpoint |
|----|-------|-----------|----------|
| Health Check | API is running | Verificar se API responde | `http://localhost:8000/health` |

**Verificação:** `response.ok()` é truthy

---

## 🚀 Como Executar os Testes

### Pré-requisitos
```bash
# Iniciar serviços
docker compose up -d

# Instalar dependências do frontend
cd frontend
npm install

# Instalar browsers do Playwright
npx playwright install
```

### Comandos de Execução

```bash
# Executar todos os testes E2E
cd frontend && npm run test:e2e

# Executar com UI visual
cd frontend && npm run test:e2e:ui

# Executar em modo headed (com browser visível)
cd frontend && npm run test:e2e:headed

# Executar teste específico
cd frontend && npx playwright test --grep "AUTH-E2E-001"

# Executar com relatório HTML
cd frontend && npx playwright test --reporter=html
```

### Variáveis de Ambiente

```bash
# Opcional: URLs customizadas
export NEXT_PUBLIC_APP_URL=http://localhost:3000
export NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📁 Estrutura dos Testes

```
frontend/
├── tests/
│   └── e2e.spec.ts          # 35 testes E2E
├── playwright.config.ts      # Configuração Playwright
└── package.json              # Scripts npm
```

### Configuração Playwright (playwright.config.ts)

- **Base URL:** `http://localhost:3000`
- **Browsers:** Chromium, Firefox, Webkit, Mobile Chrome
- **Paralelismo:** Totalmente paralelo
- **Retries:** 2 em CI, 0 em desenvolvimento
- **Reporter:** HTML
- **Screenshot:** Apenas em falha
- **Trace:** Na primeira retry

---

## 🔍 Seletores Used

| Seletor | Uso |
|---------|-----|
| `input#email` | Campo de email do login |
| `input#password` | Campo de senha do login |
| `button[type="submit"]` | Botão de submit |
| `button:has-text("Sair")` | Botão de logout |
| `button:has-text("Abertos")` | Filtro de status |
| `input#subject` | Campo de assunto do ticket |
| `textarea#description` | Campo de descrição |
| `textarea#content` | Campo de mensagem |
| `a[href*="/dashboard/atendente/tickets/"]` | Links de tickets |

---

## ⚠️ Possíveis Problemas

1. **Docker não está rodando:** Execute `sudo systemctl start docker`
2. **Backend não responde:** Verifique se `celx-backend` está rodando
3. **Frontend não responde:** Verifique se `celx-frontend` está rodando
4. **Timeout em waitForURL:** Pode indicar problema de redirect ou autenticação

---

## ✅ Checklist de Execução

- [ ] Verificar se Docker está rodando
- [ ] Iniciar serviços com `docker compose up -d`
- [ ] Aguardar health check de todos os serviços
- [ ] Instalar dependências: `cd frontend && npm install`
- [ ] Instalar browsers: `npx playwright install`
- [ ] Executar testes: `cd frontend && npm run test:e2e`
- [ ] Verificar relatório HTML em `frontend/playwright-report`

---

*Relatório gerado em: 2026-04-22 22:39:00*
*Total de testes: 35*
*Status: Prontos para execução (requer serviços rodando)*
