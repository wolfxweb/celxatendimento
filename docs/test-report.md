# 📊 Relatório de Testes - celx-atendimento

## Resumo Executivo

Este relatório documenta a estrutura de testes criada para o projeto celx-atendimento, abrangendo testes de API (pytest) e testes E2E frontend (Playwright).

---

## 🧪 Infraestrutura de Testes

### Backend - pytest
**Local:** `backend/tests/`

| Arquivo | Descrição | Test Cases |
|---------|-----------|------------|
| `test_auth.py` | Login, registro, validação | 6 |
| `test_tickets.py` | CRUD tickets, mensagens, atribuição | 16 |
| `test_ai_approval.py` | Aprovar/rejeitar/editar IA | 9 |
| `test_categories.py` | CRUD categorias | 4 |
| `test_users.py` | Gestão de usuários | 5 |
| `test_companies.py` | Gestão de empresas | 6 |
| **Total** | | **46 testes** |

### Frontend - Playwright
**Local:** `frontend/tests/`

| Arquivo | Descrição | Test Cases |
|---------|-----------|------------|
| `e2e.spec.ts` | Login, tickets, AI, admin | 35 |
| `playwright.config.ts` | Configuração Playwright | - |
| **Total** | | **35+ testes** |

---

## 📁 Estrutura de Arquivos

```
celx-atendimento/
├── backend/
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_tickets.py
│   │   ├── test_ai_approval.py
│   │   ├── test_categories.py
│   │   ├── test_users.py
│   │   ├── test_companies.py
│   │   └── conftest.py
│   ├── requirements.txt      # pytest, httpx incluídos
│   └── pyproject.toml
├── frontend/
│   ├── tests/
│   │   └── e2e.spec.ts
│   ├── playwright.config.ts
│   ├── package.json          # @playwright/test incluído
│   └── tsconfig.json
└── docs/
    ├── test-cases.md         # 150+ casos documentados
    └── test-runner.md        # instruções de execução
```

---

## 🚀 Como Executar

### Backend (API)
```bash
cd backend

# Todos os testes
pytest tests/ -v

# Teste específico
pytest tests/test_auth.py -v

# Com coverage
pytest --cov=app tests/
```

### Frontend (E2E)
```bash
cd frontend

# Instalar Playwright (primeira vez)
npx playwright install chromium

# Executar E2E
npm run test:e2e

# Modo visual (UI)
npm run test:e2e:ui

# Navegador visível
npm run test:e2e:headed
```

---

## 👥 Usuários de Teste

| Email | Senha | Role |
|-------|-------|------|
| superadmin@celx.com.br | 123456 | Super Admin |
| admin@teste.com | 123456 | Admin |
| atendente@teste.com | 123456 | Atendente |
| cliente@teste.com | 123456 | Cliente |

---

## 🔗 Endpoints Documentados (55 total)

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`

### Tickets (20 endpoints)
- CRUD tickets, mensagens, atribuição
- AI approve/reject/edit
- Rating, relações, audit log

### Companies (6 endpoints)
- List, approve, reject, suspend

### Users (4 endpoints)
- me, create, get, update

### Categories (5 endpoints)
- CRUD completo

### Knowledge (6 endpoints)
- Articles, indexing status

### Attachments (4 endpoints)
- Upload, list, delete

### AI-Config (7 endpoints)
- Config, api-key, test, models, tools

### Plans (5 endpoints)
- CRUD + listagem pública

---

## ✅ Status Atual

| Componente | Status |
|------------|--------|
| Testes API pytest criados | ✅ Pronto |
| Testes E2E Playwright criados | ✅ Pronto |
| Dependências instaladas (frontend) | ✅ OK |
| Dependências instaladas (backend) | ✅ OK |
| API respondendo | ✅ http://localhost:8000 |
| Frontend rodando | ✅ http://localhost:3000 |
| Tests executados | ⚠️ Requer rebuild do container |

---

## ⚠️ Ação Necessária

Para executar os testes pytest no container Docker do backend, é necessário rebuild:

```bash
# Rebuild do backend (os novos testes serão incluídos)
docker compose up -d --build backend

# Executar testes dentro do container
docker exec celx-backend python -m pytest tests/ -v
```

---

## 📋 Prioridades de Teste

| Prioridade | Área | Casos |
|------------|------|-------|
| **P0 (Crítico)** | Auth, Login, Create Ticket | 13 |
| **P1 (Alto)** | Ticket Assignment, AI Approve/Reject | 15 |
| **P2 (Médio)** | Categories, Attachments, Knowledge | 24 |
| **P3 (Baixo)** | Plans, Companies | 13 |

---

## 📊 Cobertura Esperada

| Categoria | API Tests | E2E Tests |
|-----------|-----------|-----------|
| Authentication | 7 | 6 |
| Tickets | 16 | 10 |
| AI Approval | 9 | 8 |
| Users | 5 | 2 |
| Companies | 6 | 2 |
| Categories | 4 | 0 |
| Knowledge | 0 | 2 |
| AI Config | 0 | 6 |
| Dashboard | 0 | 4 |
| **Total** | **46** | **35+** |

---

## 🛠 Ferramentas

| Ferramenta | Versão | Uso |
|-------------|--------|-----|
| pytest | 7.4.4 | Testes API Python |
| pytest-asyncio | 0.23.4 | Tests async |
| pytest-cov | 4.1.0 | Coverage |
| httpx | 0.26.0 | HTTP client |
| @playwright/test | 1.40+ | E2E tests |
| chromium/firefox/webkit | latest | Browsers |

---

*Relatório gerado em: 2026-04-21*
*Documentação completa em: docs/test-cases.md, docs/test-runner.md*