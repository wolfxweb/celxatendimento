# celx-atendimento

Sistema SaaS de tickets com agentes de IA para suporte automático com aprovação humana.

## 🚀 Quick Start

### 1. Clone o projeto
```bash
cd celx-atendimento
```

### 2. Configure o ambiente
```bash
# Suba os containers
docker-compose up -d
```

### 3. Aguarde os serviços subirem (~2 minutos)
```bash
docker-compose logs -f
```

### 4. Acesse os serviços

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | - |
| **Backend API** | http://localhost:8000 | - |
| **API Docs** | http://localhost:8000/docs | - |
| **PgAdmin** | http://localhost:5050 | admin@celx.com.br / celx123456 |
| **Langfuse** | http://localhost:3001 | - |

### 5. Configure a API OpenRouter
Cada empresa configura sua própria chave de API OpenRouter no painel Admin.

## 🔑 Arquitetura de API Keys

- **Sistema:** Não armazena API keys globais
- **Por Empresa:** Cada empresa cliente cadastra sua própria chave OpenRouter
- **Armazenamento:** Chaves criptografadas (AES-256) no banco de dados
- **Acesso:** Admin da empresa configura via painel `/admin/config-ia`

### Modelos Disponíveis (via OpenRouter)

| Modelo | Preço | Context | Função Calling |
|--------|-------|---------|----------------|
| Gemini 2.0 Flash | **FREE** | 1M | ✅ |
| Gemini 1.5 Flash | **FREE** | 1M | ✅ |
| Llama 3.1 8B | **FREE** | 8K | ❌ |
| GPT-4o Mini | $0.15/1M | 128K | ✅ |
| Claude 3.5 Sonnet | $3/1M | 200K | ✅ |
| Claude Sonnet 4 | $3/1M | 200K | ✅ |

## 👥 Usuários de Teste

| Email | Senha | Role |
|-------|-------|------|
| superadmin@celx.com.br | **admin123** | Super Admin |
| admin@teste.com | 123456 | Admin |
| atendente@teste.com | 123456 | Atendente |
| cliente@teste.com | 123456 | Cliente |

## 📁 Estrutura de Pastas

```
celx-atendimento/
├── frontend/          # Next.js + React
├── backend/           # FastAPI + LangChain + LangGraph
├── database/          # Schema SQL + Seeds
├── docker-compose.yml  # Orquestração Docker
└── docs/              # Documentação
```

## 🔧 Comandos Úteis

```bash
# Ver logs de um serviço específico
docker-compose logs -f postgres
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar um serviço
docker-compose restart backend

# Parar todos os serviços
docker-compose down

# Rebuild (após mudanças no código)
docker-compose up -d --build

# Acessar PostgreSQL via CLI
docker exec -it celx-postgres psql -U postgres -d celx_atendimento

# Ver uso de recursos
docker stats
```

## 🌐 Rede

Todos os serviços estão na rede `celx-network` e se comunicam por nome do container:

- `postgres` - Banco de dados
- `redis` - Cache/fila
- `backend` - API FastAPI (porta 8000)
- `frontend` - Next.js (porta 3000)
- `pgadmin` - Admin PostgreSQL (porta 5050)
- `langfuse` - Observabilidade AI (porta 3001)
- `celery` - Background tasks

## 📝 Desenvolvimento

### Sem Docker (local)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**PostgreSQL local:**
```bash
# Instalar PostgreSQL 16 + pgvector
# Criar banco: celx_atendimento
# Rodar scripts: database/schema.sql e database/seed.sql
```

## 📄 Documentação

- [PRD.md](./docs/PRD.md) - Product Requirements Document
- [spec-agent-ai.md](./docs/spec-agent-ai.md) - Especificação do Agente IA
- [spec-ticket-ai-flow.md](./docs/spec-ticket-ai-flow.md) - Fluxo de Ticket com IA
- [spec-ticket-detail.md](./docs/spec-ticket-detail.md) - Tela de Detalhe do Ticket
- [implementation-backlog.md](./docs/implementation-backlog.md) - Backlog de Implementação
- [schema.sql](./database/schema.sql) - Schema do Banco de Dados

## 📜 Licença

MIT
