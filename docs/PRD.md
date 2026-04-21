# celx-atendimento - Product Requirements Document (PRD)

**Versão:** 0.2  
**Data:** 2026-04-20  
**Status:** Aprovado para desenvolvimento  

---

## 1. Visão Geral

### 1.1 Descrição do Produto
**celx-atendimento** é um SaaS multi-tenant de tickets com atendentes de IA para suporte automático com aprovação humana. Cada empresa (tenant) possui base de conhecimento RAG própria, múltiplos usuários com diferentes perfis e isolamento total de dados.

### 1.2 Problema a Resolver
Empresas precisam de um sistema de suporte eficiente com:
- Respostas rápidas via IA para tickets de nível 3-4
- Aprovação humana para garantir qualidade
- Base de conhecimento customizável por empresa
- Isolamento total de dados entre empresas (multi-tenant)

### 1.3 Proposta de Valor
> *"Suporte inteligente com IA, mas com o toque humano quando necessário. Respostas rápidas 24/7 com qualidade garantida."*

---

## 2. Arquitetura do Sistema

### 2.1 Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | Next.js 14 + React + TypeScript + TailwindCSS |
| **Backend** | Python 3.11+ + FastAPI + LangChain + LangGraph |
| **Database** | PostgreSQL 15+ |
| **Observability** | Langfuse |
| **Vector DB** | pgvector (embeddings no PostgreSQL) |
| **Auth** | JWT + NextAuth.js |

### 2.2 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      LANDING PAGE                           │
│              (Página de vendas, planos, demo)              │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │ PAINEL      │     │ PAINEL      │     │ PAINEL      │
   │ CLIENTE     │     │ ATENDENTE      │     │ ADMIN       │
   │ (/cliente)  │     │ (/atendente)   │     │ (/admin)    │
   └─────────────┘     └─────────────┘     └─────────────┘
          │                   │                   │
          └───────────────────┴───────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   BACKEND (Python) │
                    │  ┌──────────────┐  │
                    │  │  LangChain   │  │
                    │  │  LangGraph   │  │
                    │  │  Langfuse    │  │
                    │  └──────────────┘  │
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │   PostgreSQL     │
                    │   (multi-tenant) │
                    │   + pgvector     │
                    └──────────────────┘
```

### 2.3 Estrutura de Pastas

```
celx-atendimento/
├── frontend/                     # Next.js + React
│   ├── app/
│   │   ├── (marketing)/          # Landing page, planos
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── pricing/          # Planos
│   │   │   └── contact/          # Contato
│   │   ├── (auth)/               # Rotas autenticadas
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/          # Painéis autenticados
│   │   │   ├── cliente/           # Painel do cliente
│   │   │   ├── atendente/            # Painel do atendente
│   │   │   ├── admin/             # Painel admin
│   │   │   └── superadmin/        # Painel super admin
│   │   └── api/                   # Rotas API (App Router)
│   ├── components/
│   │   ├── ui/                   # Componentes base
│   │   ├── dashboard/            # Componentes compartilhados
│   │   └── marketing/             # Componentes landing page
│   ├── lib/
│   │   ├── api.ts                # Cliente API
│   │   └── auth.ts               # Configuração auth
│   └── ...
├── backend/                      # Python + FastAPI
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/               # API v1
│   │   │   │   ├── routes/       # Endpoints
│   │   │   │   └── deps.py       # Dependencies
│   │   │   └── router.py         # Router principal
│   │   ├── agents/               # Agentes LangChain/LangGraph
│   │   │   ├── graph.py          # Grafo principal
│   │   │   ├── nodes.py          # Nós do grafo
│   │   │   ├── prompts.py        # Prompts
│   │   │   └── chains.py         # Chains
│   │   ├── core/                 # Core
│   │   │   ├── config.py         # Configurações
│   │   │   ├── security.py       # Auth/JWT
│   │   │   └── tenant.py         # Multi-tenant logic
│   │   ├── db/                   # Database
│   │   │   ├── base.py           # Base model
│   │   │   ├── session.py        # Sessions
│   │   │   └── models/           # SQLAlchemy models
│   │   ├── services/             # Lógica de negócio
│   │   │   ├── ticket_service.py
│   │   │   ├── user_service.py
│   │   │   └── rag_service.py
│   │   ├── RAG/                  # RAG
│   │   │   ├── document_loader.py
│   │   │   ├── chunker.py
│   │   │   ├── embedder.py
│   │   │   └── retriever.py
│   │   └── main.py               # Entry point
│   ├── tests/
│   ├── alembic/                  # Migrations
│   └── requirements.txt
├── database/
│   ├── migrations/              # Scripts alembic
│   └── seeders/                 # Dados iniciais
└── docs/
    └── prd.md                   # Este documento
```

---

## 3. Modelos de Dados

### 3.1 Diagrama ER

```
┌──────────────────┐       ┌──────────────────┐
│      Plan        │       │     Company      │
│──────────────────│       │──────────────────│
│ id (PK)          │       │ id (PK)          │
│ name             │       │ name             │
│ price_monthly    │       │ domain           │
│ price_yearly     │       │ plan_id (FK)     │
│ max_users        │◀──────│ plan_activated   │
│ max_tickets      │       │ status           │
│ features         │       │ created_at       │
│ is_active        │       │ settings         │
└──────────────────┘       └──────────────────┘
                                    │
                                    │ 1:N
                                    ▼
                          ┌──────────────────┐
                          │       User       │
                          │──────────────────│
                          │ id (PK)          │
                          │ company_id (FK)  │
                          │ email            │
                          │ password_hash    │
                          │ name             │
                          │ role             │  ← enum: customer, agent, admin
                          │ is_active        │
                          │ last_login       │
                          └──────────────────┘
                                    │
                                    │ 1:N
                                    ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    Category      │       │     Ticket        │       │   TicketMessage   │
│──────────────────│       │──────────────────│       │──────────────────│
│ id (PK)          │◀──┐    │ id (PK)          │       │ id (PK)          │
│ company_id (FK)  │   │    │ company_id (FK)  │◀──────│ ticket_id (FK)   │
│ name             │   │    │ user_id (FK)     │       │ author_id (FK)   │
│ description      │   │    │ category_id(FK)  │       │ content          │
│ sla_minutes      │   │    │ status           │       │ is_ai_generated  │
│ escalation_lvl   │   │    │ priority         │       │ is_approved      │
│ created_at       │   │    │ subject          │       │ approved_by      │
└──────────────────┘   │    │ ai_response      │       │ created_at       │
                      │    │ ai_context       │       └──────────────────┘
                      │    │ assigned_agent_id│
                      │    │ approved_by     │
                      │    │ resolved_at      │
                      │    │ created_at       │
                      │    │ updated_at       │
                      │    └──────────────────┘
                      │            │
                      │            │ N:1
                      │            ▼
                      │    ┌──────────────────┐
                      └───│   PriorityLevel   │
                         │──────────────────│
                         │ id (PK)          │
                         │ name             │  ← Critical, High, Medium, Low
                         │ sla_minutes      │
                         │ color            │
                         └──────────────────┘

┌──────────────────┐
│  KnowledgeBase   │
│──────────────────│
│ id (PK)          │
│ company_id (FK)  │
│ title            │
│ content          │  ← Texto ou texto extraído de PDF
│ source_type      │  ← enum: pdf, text, url
│ source_url       │
│ embeddings       │  ← pgvector (1536 dim for text-embedding-3-small)
│ is_active        │
│ created_at       │
│ updated_at       │
│ last_indexed_at  │
└──────────────────┘

┌──────────────────┐
│      AuditLog     │
│──────────────────│
│ id (PK)          │
│ company_id (FK)  │
│ user_id (FK)     │
│ action           │
│ entity_type      │
│ entity_id        │
│ metadata         │  ← JSON
│ ip_address       │
│ created_at       │
└──────────────────┘
```

### 3.2 Enums

```python
class UserRole(str, Enum):
    CUSTOMER = "customer"      # Cliente final
    AGENT = "agent"            # Agente de suporte
    ADMIN = "admin"            # Admin da empresa
    SUPERADMIN = "superadmin"  # Super admin do sistema

class TicketStatus(str, Enum):
    OPEN = "open"                      # Aberto
    PENDING_AI = "pending_ai"          # Aguardando aprovação AI
    PENDING_AGENT = "pending_agent"    # Aguardando atendente
    RESOLVED = "resolved"              # Resolvido
    CLOSED = "closed"                   # Fechado
    REJECTED = "rejected"              # Rejeitado

class TicketPriority(str, Enum):
    CRITICAL = "critical"  # SLA: 1h
    HIGH = "high"           # SLA: 4h
    MEDIUM = "medium"       # SLA: 24h
    LOW = "low"             # SLA: 48h

class SourceType(str, Enum):
    PDF = "pdf"
    TEXT = "text"
    URL = "url"
```

---

## 4. Funcionalidades por Módulo

### 4.1 Landing Page (`/`)

| Seção | Descrição |
|-------|-----------|
| **Hero** | Headline + subheadline + CTA "Começar Grátis" |
| **Features** | Cards com 3-4 features principais |
| **How it Works** | 3 steps: cria ticket → IA responde → humano aprova |
| **Pricing** | Tabela com 3 planos (Starter, Pro, Enterprise) |
| **Testimonials** | 2-3 depoimentos de clientes fictícios |
| **FAQ** | 5 perguntas frequentes |
| **CTA Final** | "Comece seu teste grátis hoje" |
| **Footer** | Links, copyright, social |

#### Planos:

| Plano | Preço | Usuários | Tickets/mês | RAG |
|-------|-------|----------|-------------|-----|
| **Starter** | R$ 97/mês | 3 | 100 | 1 PDF |
| **Pro** | R$ 297/mês | 10 | 500 | 5 PDFs |
| **Enterprise** | R$ 797/mês | Ilimitado | Ilimitado | Ilimitado |

### 4.2 Painel Cliente (`/cliente`)

#### 4.2.1 Dashboard
- Resumo: tickets abertos, fechados, tempo médio
- Tickets recentes (últimos 5)
- Status geral

#### 4.2.2 Meus Tickets (`/cliente/tickets`)
- Lista de tickets com filtros (status, categoria, data)
- Busca por assunto/conteúdo
- Ações: novo ticket, ver detalhes

#### 4.2.3 Novo Ticket (`/cliente/tickets/novo`)
- **Categoria** (select)
- **Prioridade** (select)
- **Assunto** (text, max 200)
- **Descrição** (textarea, max 5000)
- **Anexos** (opcional, max 5 files, 10MB cada)

#### 4.2.4 Ver Ticket (`/cliente/tickets/[id]`)
- Thread de mensagens
- Status badge
- Resposta AI (se houver)
- Avaliação (1-5 estrelas ao fechar)

#### 4.2.5 Base de Conhecimento (`/cliente/knowledge`)
- Lista de artigos/docs da empresa
- Busca
- Visualização de artigo

#### 4.2.6 Perfil (`/cliente/perfil`)
- Editar nome, email
- Alterar senha
- Notificações (email on/off)

### 4.3 Painel Agente (`/atendente`)

#### 4.3.1 Dashboard
- Métricas: tickets hoje, pendentes, resolvidos
- Tempo médio de resposta
- Score de satisfação

#### 4.3.2 Fila de Aprovação (`/atendente/aprovacao`)
- Lista de tickets aguardando aprovação
- Preview da resposta AI
- Ações: Aprovar, Rejeitar, Editar e Aprovar

#### 4.3.3 Editor de Resposta
- Resposta AI original (readonly)
- Editor de texto para correção
- Botões: Aprovar, Rejeitar, Solicitar AI

#### 4.3.4 Tickets (`/atendente/tickets`)
- Todos os tickets da empresa
- Filtros avançados
- Acesso ao histórico

#### 4.3.5 Resposta Manual (`/atendente/tickets/[id]/responder`)
- Formulário de resposta
- Opção de usar IA para sugestão

### 4.4 Painel Admin (`/admin`)

#### 4.4.1 Dashboard
- KPIs: MRR, tickets/mês, churn
- Gráfico: tickets por dia (últimos 30 dias)
- Gráfico: tickets por categoria
- Top atendentes por performance

#### 4.4.2 Usuários (`/admin/usuarios`)
- Lista de usuários da empresa
- CRUD (criar, editar, excluir, ativar/desativar)
- Atribuir role (customer, agent, admin)
- Bulk actions

#### 4.4.3 Agentes (`/admin/atendentes`)
- Equipe de suporte
- Métricas individuais
- Config de alocação

#### 4.4.4 Base de Conhecimento (`/admin/knowledge`)
- Upload de PDFs
- Editor de texto para artigos
- Status de indexação
- Preview RAG

#### 4.4.5 Categorias (`/admin/categorias`)
- CRUD categorias
- Config SLA por categoria
- Nível de escalação

#### 4.4.6 Configurações IA (`/admin/config-ia`)
- Prompt base do atendente
- Temperatura (criatividade)
- Nível de autonomia:
  - **Alto**: IA responde direto (sem aprovação)
  - **Médio**: IA responde, atendente é notificado
  - **Baixo**: Todas respostas precisam de aprovação

#### 4.4.7 Billing (`/admin/billing`)
- Plano atual
- Usage (tickets, usuários, storage)
- Histórico de pagamentos
- Upgrade/downgrade

#### 4.4.8 Configurações (`/admin/config`)
- Nome e logo da empresa
- Email de suporte
- Horário de funcionamento
- Timezone

### 4.5 Super Admin (`/superadmin`)

#### 4.5.1 Dashboard
- MRR total
- Churn rate
- Total de empresas
- Total de tickets processados

#### 4.5.2 Empresas (`/superadmin/empresas`)
- Lista com busca e filtros
- Status: pendente aprovação, ativa, suspensa
- Aprovar/rejeitar empresa nova
- Suspender/reativar
- Ver detalhes

#### 4.5.3 Planos (`/superadmin/planos`)
- CRUD planos
- Configurar features
- Preços

#### 4.5.4 Métricas (`/superadmin/metricas`)
- Dashboard analítico
- Exportar relatórios (CSV)

#### 4.5.5 Configurações Sistema (`/superadmin/config`)
- Termos de uso
- Política de privacidade
- Email de contato
- Maintenance mode

---

## 5. Agente de IA (LangGraph)

### 5.1 Workflow

```
┌────────────────────────────────────────────────────────────────────┐
│                         LANGGRAPH WORKFLOW                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌───────────┐     ┌────────────┐     ┌───────────────────────┐   │
│   │  TICKET   │────▶│   ROUTER   │────▶│     RAG_RETRIEVER     │   │
│   │  START    │     │            │     │                       │   │
│   └───────────┘     │ Categoria? │     │ Busca na base de      │   │
│                     │ Prioridade?│     │ conhecimento da       │   │
│                     └────────────┘     │ empresa (pgvector)    │   │
│                          │             └───────────────────────┘   │
│                          ▼                     │                  │
│                 ┌─────────────────┐            ▼                  │
│                 │   CLASSIFIER    │   ┌───────────────────────┐   │
│                 │                 │   │    CONTEXT_BUILDER    │   │
│                 │ Classifica o    │   │                       │   │
│                 │ ticket e define │   │ Combina:              │   │
│                 │ nível de        │   │ - Conteúdo ticket     │   │
│                 │ urgência        │   │ - Contexto RAG        │   │
│                 └─────────────────┘   │ - Histórico           │   │
│                                        └───────────────────────┘   │
│                                                    │               │
│                                                    ▼               │
│                                         ┌───────────────────────┐  │
│                                         │    AI_RESPONSE        │  │
│                                         │    GENERATOR          │  │
│                                         │                       │  │
│                                         │ Usa LLM (GPT-4o ou    │  │
│                                         │ Claude) para gerar    │  │
│                                         │ resposta personalizada │  │
│                                         └───────────────────────┘  │
│                                                    │               │
│                                                    ▼               │
│                                         ┌───────────────────────┐  │
│                                         │    ROUTER_APPROVAL   │  │
│                                         │                       │  │
│                                         │ Verifica nível de     │  │
│                                         │ autonomia configurado │  │
│                                         │ para decidir:         │  │
│                                         │ - Aprovar direto      │  │
│                                         │ - Pendente aprovação  │  │
│                                         └───────────────────────┘  │
│                                                    │               │
│                                    ┌───────────────┴───────────────┐
│                                    ▼                               ▼
│                           ┌──────────────┐                 ┌──────────────┐
│                           │   APPROVED  │                 │   PENDING    │
│                           │              │                 │   APPROVAL   │
│                           │ Responsta    │                 │              │
│                           │ enviada ao   │                 │ Notifica     │
│                           │ cliente     │                 │ atendente       │
│                           └──────────────┘                 └──────────────┘
│                                                                      │
│                           ┌──────────────┐                          │
│                           │   AGENT      │◀──── Agente rejeita     │
│                           │   EDIT       │                          │
│                           │              │                          │
│                           │ Corrige ou   │                          │
│                           │ rejeita      │                          │
│                           └──────────────┘                          │
│                                    │                                 │
│                                    ▼                                 │
│                           ┌──────────────┐                          │
│                           │  FINALIZED   │─────▶ Envia ao cliente   │
│                           └──────────────┘                          │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### 5.2 Nós do Grafo

| Nó | Descrição | Tipo |
|----|-----------|------|
| `start` | Ponto de entrada | `passthrough` |
| `router` | Classifica ticket | `function` |
| `rag_retriever` | Busca base de conhecimento | `LangChain Tool` |
| `context_builder` | Monta contexto final | `function` |
| `ai_response_generator` | Gera resposta via LLM | `LangChain Chain` |
| `router_approval` | Decide fluxo de aprovação | `function` |
| `pending_approval` | Marca como pendente | `function` |
| `approved` | Marca como aprovado | `function` |
| `agent_edit` | Aguarda edição do atendente | `passthrough` |
| `finalized` | Finaliza e envia | `function` |

### 5.3 Prompts

#### Prompt Base do Agente (customizável por empresa)

```python
SYSTEM_PROMPT = """
Você é um atendente de suporte da empresa {company_name}.

Sua função é auxiliar clientes respondendo suas dúvidas de forma clara, objetiva e amigável.

**Regras:**
1. Responda apenas com informações da base de conhecimento fornecida.
2. Se não souber a resposta, escalone para um atendente humano.
3. Seja cortês e profissional.
4. Não invente informações.
5. Formate a resposta com bullets quando aplicável.

**Contexto da Empresa:**
{company_context}

**Base de Conhecimento:**
{rag_context}

**Ticket do Cliente:**
- Assunto: {subject}
- Categoria: {category}
- Descrição: {description}
"""
```

---

## 6. RAG - Base de Conhecimento

### 6.1 Fluxo de Indexação

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PDF Upload    │────▶│   Text Extract  │────▶│    Chunker      │
│   or Text       │     │   (PyPDF2)      │     │  (Recursive     │
│                 │     │                 │     │   Character)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                    │
                                                    ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PostgreSQL    │◀────│   Embeddings     │◀────│   OpenAI        │
│   (pgvector)    │     │   Generation     │     │   Embeddings    │
│                 │     │                  │     │   API          │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 6.2 Configurações de Chunking

| Parâmetro | Valor |
|-----------|-------|
| **Chunk size** | 1000 caracteres |
| **Chunk overlap** | 200 caracteres |
| **Separators** | `\n\n`, `\n`, `.`, ` ` |
| **Embedding model** | text-embedding-3-small (1536 dim) |

### 6.3 Retrieval

```python
def retrieve_relevant_docs(query: str, company_id: int, top_k: int = 5):
    """
    1. Gera embedding da query
    2. Busca no pgvector por similaridade (cosine)
    3. Filtra por company_id
    4. Retorna top_k resultados
    """
```

---

## 7. Categorização de Tickets

### 7.1 Prioridades e SLA

| Prioridade | Cor | SLA Padrão | Descrição |
|------------|-----|------------|-----------|
| **CRITICAL** | 🔴 Vermelho | 1 hora | Sistema fora do ar, perda financeira grave |
| **HIGH** | 🟠 Laranja | 4 horas | Funcionalidade principal impactada |
| **MEDIUM** | 🟡 Amarelo | 24 horas | Problema com workaround disponível |
| **LOW** | 🟢 Verde | 48 horas | Dúvidas, solicitações, feedback |

### 7.2 Categorias Padrão

| Categoria | Descrição | Escalação |
|----------|-----------|-----------|
| **Suporte Técnico** | Problemas com sistema/produto | Nível 2 |
| **Comercial** | Dúvidas sobre planos, preços | Nível 1 |
| **Financeiro** | Faturas, pagamentos, reembolso | Nível 2 |
| **Dúvidas Gerais** | Como fazer X, onde encontrar Y | Nível 1 |
| **Bugs** | Erros no sistema | Nível 3 |
| **Feature Request** | Sugestões de melhorias | Nível 1 |

---

## 8. User Stories

### 8.1 Módulo Cliente

#### US-001: Cliente cria ticket
**Como** cliente da empresa  
**Quero** criar um ticket de suporte  
**Então** devo selecionar categoria, prioridade, descrever o problema e receber confirmação  

**Critérios de Aceite:**
- [ ] Cliente pode selecionar categoria (dropdown)
- [ ] Cliente pode selecionar prioridade (dropdown)
- [ ] Cliente pode inserir assunto (max 200 chars)
- [ ] Cliente pode inserir descrição (max 5000 chars)
- [ ] Cliente pode anexar até 5 arquivos
- [ ] Sistema exibe mensagem de sucesso
- [ ] Ticket aparece na lista "Meus Tickets"
- [ ] Email de confirmação enviado ao cliente

#### US-002: Cliente acompanha ticket
**Como** cliente  
**Quero** acompanhar o status do meu ticket  
**Então** devo poder ver histórico de mensagens e status  

**Critérios de Aceite:**
- [ ] Cliente vê lista de seus tickets
- [ ] Cliente pode filtrar por status
- [ ] Cliente pode buscar por assunto/conteúdo
- [ ] Cliente vê thread completa do ticket
- [ ] Cliente vê badge de status
- [ ] Cliente recebe notificação quando ticket é atualizado

#### US-003: Cliente avalia atendimento
**Como** cliente  
**Quero** avaliar o atendimento ao fechar ticket  
**Então** devo poder dar nota de 1-5 estrelas  

**Critérios de Aceite:**
- [ ] Ao fechar ticket, modal de avaliação aparece
- [ ] Cliente pode dar nota de 1-5 estrelas
- [ ] Cliente pode adicionar comentário (opcional)
- [ ] Avaliação é salva no banco

### 8.2 Módulo Agente

#### US-004: Agente aprova resposta AI
**Como** atendente  
**Quero** aprovar/rejeitar respostas geradas por IA  
**Então** devo poder revisar antes do envio ao cliente  

**Critérios de Aceite:**
- [ ] Agente vê fila de tickets pendentes
- [ ] Agente vê resposta AI gerada
- [ ] Agente pode aprovar (envia ao cliente)
- [ ] Agente pode rejeitar (retorna para fila)
- [ ] Agente pode editar resposta antes de aprovar
- [ ] Timestamp de aprovação registrado

#### US-005: Agente responde manualmente
**Como** atendente  
**Quero** responder um ticket sem usar IA  
**Então** devo poder digitar e enviar resposta  

**Critérios de Aceite:**
- [ ] Agente tem acesso ao formulário de resposta
- [ ] Resposta é enviada imediatamente
- [ ] Ticket muda status para "pending_agent" se necessário
- [ ] Cliente é notificado

### 8.3 Módulo Admin

#### US-006: Admin configura base de conhecimento
**Como** admin  
**Quero** subir documentos para a base de conhecimento  
**Então** o atendente de IA deve usar esses documentos nas respostas  

**Critérios de Aceite:**
- [ ] Admin pode fazer upload de PDF (max 10MB)
- [ ] Admin pode criar artigos de texto manualmente
- [ ] Sistema processa e indexa o conteúdo
- [ ] Admin vê status de indexação
- [ ] Admin pode ativar/desativar documentos
- [ ] Admin pode deletar documentos

#### US-007: Admin gerencia usuários
**Como** admin  
**Quero** criar e gerenciar usuários da empresa  
**Então** devo poder adicionar, editar, remover e definir roles  

**Critérios de Aceite:**
- [ ] Admin vê lista de usuários
- [ ] Admin pode criar novo usuário (nome, email, role)
- [ ] Admin pode editar usuário existente
- [ ] Admin pode desativar usuário (soft delete)
- [ ] Admin pode resetar senha de usuário
- [ ] Admin não pode deletar seu próprio usuário admin

#### US-008: Admin configura IA
**Como** admin  
**Quero** personalizar o comportamento do atendente IA  
**Então** devo poder ajustar prompt, temperatura e nível de autonomia  

**Critérios de Aceite:**
- [ ] Admin pode editar prompt base
- [ ] Admin pode ajustar temperatura (0.0 - 2.0)
- [ ] Admin pode selecionar nível de autonomia:
  - Alto: responde direto
  - Médio: responde e notifica
  - Baixo: sempre precisa aprovação
- [ ] Alterações são salvas e afetam novos tickets

### 8.4 Módulo Super Admin

#### US-009: Super Admin aprova empresa
**Como** super admin  
**Quero** aprovar novas empresas cadastradas  
**Então** devo poder aceitar ou rejeitar cada empresa  

**Critérios de Aceite:**
- [ ] Super admin vê lista de empresas pendentes
- [ ] Super admin pode ver detalhes da empresa
- [ ] Super admin pode aprovar (empresa ativa)
- [ ] Super admin pode rejeitar (com motivo)
- [ ] Email enviado à empresa com resultado

#### US-010: Super Admin gerencia planos
**Como** super admin  
**Quero** criar e editar planos de assinatura  
**Então** devo poder definir preços, features e limites  

**Critérios de Aceite:**
- [ ] Super admin vê lista de planos
- [ ] Super admin pode criar novo plano
- [ ] Super admin pode editar plano existente
- [ ] Super admin pode ativar/desativar plano
- [ ] Alterações não afetam empresas já assinadas

---

## 9. Roadmap

### Fase 1 - MVP (8-10 semanas)
**Objetivo:** Sistema funcional com autenticação, tickets e fluxo básico de IA

| Semana | Entregáveis |
|--------|-------------|
| 1-2 | Setup projeto, autenticação, multi-tenant base |
| 3-4 | CRUD Companies, Users, Roles |
| 5-6 | CRUD Tickets (cliente e atendente) |
| 7-8 | Agente AI básico (sem RAG) |
| 9-10 | Fila de aprovação, dashboard básico |

### Fase 2 - IA + RAG (6-8 semanas)
**Objetivo:** Integração completa de IA com base de conhecimento

| Semana | Entregáveis |
|--------|-------------|
| 1-2 | LangChain + LangGraph setup |
| 3-4 | RAG com PDF upload e indexação |
| 5-6 | Retrieval otimizado |
| 7-8 | Fine-tuning de prompts |

### Fase 3 - Multi-usuário e Permissões (4 semanas)
**Objetivo:** Sistema completo de roles e permissões

| Semana | Entregáveis |
|--------|-------------|
| 1 | Múltiplos usuários por empresa |
| 2 | Sistema de permissões (admin/funcionário) |
| 3 | Dashboard com métricas |
| 4 | Audit log |

### Fase 4 - Growth (4 semanas)
**Objetivo:** Landing page completa e billing

| Semana | Entregáveis |
|--------|-------------|
| 1 | Landing page profissional |
| 2 | Sistema de planos e billing |
| 3 | Super Admin completo |
| 4 | Email notifications, polish |

---

## 10. Requisitos Não-Funcionais

### 10.1 Performance
- Tempo de resposta API < 200ms (p95)
- Indexação de PDF < 30s para 10 páginas
- Busca RAG < 500ms

### 10.2 Segurança
- Todos os dados criptografados em repouso (AES-256)
- HTTPS obrigatório
- Rate limiting: 100 req/min por IP
- Validação de inputs em todas as rotas
- SQL injection prevention (ORM)
- XSS prevention

### 10.3 Multi-tenant
- Isolamento total de dados entre empresas
- Filtro de company_id em todas as queries
- Não há dados compartilhados entre tenants

### 10.4 Disponibilidade
- SLA: 99.5% uptime
- Backup diário
- Disaster recovery plan

---

## 11. Stack Detalhada

### Frontend
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "TailwindCSS",
  "ui": "shadcn/ui",
  "state": "Zustand",
  "forms": "React Hook Form + Zod",
  "auth": "NextAuth.js",
  "charts": "Recharts",
  "tables": "TanStack Table"
}
```

### Backend
```python
{
  "framework": "FastAPI",
  "language": "Python 3.11+",
  "orm": "SQLAlchemy 2.0",
  "migrations": "Alembic",
  "auth": "python-jose (JWT)",
  "password": "passlib[bcrypt]",
  "validation": "Pydantic v2",
  "ai": {
    "llm": "langchain-openai (GPT-4o)",
    "embedding": "langchain-openai (text-embedding-3-small)",
    "graph": "langgraph",
    "observability": "langfuse"
  },
  "vector": "pgvector",
  "pdf": "PyPDF2",
  "task_queue": "Celery (futuro)"
}
```

---

## 12. Glossário

| Termo | Definição |
|-------|-----------|
| **Tenant** | Empresa/cliente que usa o sistema |
| **RAG** | Retrieval-Augmented Generation |
| **Agent** | Agente de IA (LangChain) |
| **Ticket** | Chamado de suporte |
| **Base de Conhecimento** | Documentos que alimentam o RAG |
| **Aprovação humana** | Validação de resposta AI por atendente |

---

## 13. Contato e Suporte

| Canal | Info |
|-------|------|
| **Email** | suporte@celx.com.br |
| **Documentação** | docs.celx.com.br |
| **Status Page** | status.celx.com.br |

---

**Documento aprovado por:** _________________  
**Data:** _________________
