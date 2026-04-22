# celx-atendimento - Backlog de Implementação

**Versão:** 2.0
**Data:** 2026-04-21
**Status:** ✅ Implementação Completa

---

## 📊 Quadro Kanban

| 📋 To Do | 🔄 In Progress | ✅ Done |
|----------|----------------|--------|
| - | - | US-001 a US-022 |

---

## 🎯 User Stories - Backlog

### MÓDULO CLIENTE

#### US-001: Cliente cria ticket ✅
**Como** cliente da empresa
**Quero** criar um ticket de suporte
**Então** devo selecionar categoria, prioridade, descrever o problema e receber confirmação

**Critérios de Aceite:**
- [x] Cliente pode selecionar categoria (dropdown)
- [x] Cliente pode selecionar prioridade (dropdown)
- [x] Cliente pode inserir assunto (max 200 chars)
- [x] Cliente pode inserir descrição (max 5000 chars)
- [x] Sistema exibe mensagem de sucesso
- [x] Ticket aparece na lista "Meus Tickets"

**Técnico:** `backend/app/api/v1/routes/tickets.py`, `frontend/app/(dashboard)/cliente/tickets/novo/`

---

#### US-002: Cliente acompanha ticket ✅
**Como** cliente
**Quero** acompanhar o status do meu ticket
**Então** devo poder ver histórico de mensagens e status

**Critérios de Aceite:**
- [x] Cliente vê lista de seus tickets
- [x] Cliente pode filtrar por status
- [x] Cliente vê thread completa do ticket
- [x] Cliente vê badge de status

**Técnico:** `frontend/app/(dashboard)/cliente/tickets/`, `frontend/app/(dashboard)/cliente/tickets/[id]/`

---

#### US-003: Cliente avalia atendimento ✅
**Como** cliente
**Quero** avaliar o atendimento ao fechar ticket
**Então** devo poder dar nota de 1-5 estrelas

**Critérios de Aceite:**
- [x] Ao fechar ticket, modal de avaliação aparece
- [x] Cliente pode dar nota de 1-5 estrelas
- [x] Cliente pode adicionar comentário (opcional)
- [x] Avaliação é salva no banco

**Técnico:** `frontend/app/(dashboard)/cliente/tickets/[id]/page.tsx`, `backend/app/api/v1/routes/tickets.py`

---

### MÓDULO ATENDENTE

#### US-004: Atendente aprova resposta AI ✅
**Como** atendente
**Quero** aprobar/rejeitar respostas geradas por IA
**Então** devo poder revisar antes do envio ao cliente

**Critérios de Aceite:**
- [x] Atendente vê fila de tickets pendentes
- [x] Atendente vê resposta AI gerada + fontes RAG
- [x] Atendente pode aprovar (envia ao cliente)
- [x] Atendente pode rejeitar (retorna para fila)
- [x] Atendente pode editar resposta antes de aprovar
- [x] Timestamp de aprovação registrado

**Técnico:** `frontend/app/(dashboard)/atendente/aprovacao/page.tsx`, `backend/app/api/v1/routes/tickets.py`

---

#### US-005: Atendente responde manualmente ✅
**Como** atendente
**Quero** responder um ticket sem usar IA
**Então** devo poder digitar e enviar resposta

**Critérios de Aceite:**
- [x] Atendente tem acesso ao formulário de resposta
- [x] Resposta é enviada imediatamente
- [x] Ticket muda status para "pending_agent" se necessário

**Técnico:** `frontend/app/(dashboard)/atendente/tickets/[id]/page.tsx`, `backend/app/api/v1/routes/tickets.py`

---

#### US-006: Atendente avalia resposta AI ✅
**Como** atendente
**Quero** avaliar a resposta da IA
**Então** o sistema deve coletar feedback para aprendizado

**Critérios de Aceite:**
- [x] Atendente pode dar nota 1-5 à resposta AI
- [x] Atendente pode adicionar feedback textual
- [x] Atendente pode marcar como exemplo bom/ruim
- [x] Feedback é salvo no banco (ticket_ai_response)
- [x] Log de feedback registrado (ai_feedback_log)

**Técnico:** `frontend/app/(dashboard)/atendente/aprovacao/page.tsx`, `backend/app/services/ai_feedback_service.py`

---

### MÓDULO ADMIN

#### US-007: Admin configura base de conhecimento ✅
**Como** admin
**Quero** subir documentos para a base de conhecimento
**Então** o atendente de IA deve usar esses documentos nas respostas

**Critérios de Aceite:**
- [x] Admin pode criar artigos de texto manualmente
- [x] Admin vê status de indexação
- [x] Admin pode ativar/desativar documentos
- [x] Admin pode deletar documentos

**Técnico:** `frontend/app/(dashboard)/admin/conhecimento/page.tsx`, `backend/app/api/v1/routes/knowledge.py`

---

#### US-008: Admin gerencia usuários ✅
**Como** admin
**Quero** criar e gerenciar usuários da empresa
**Então** devo poder adicionar, editar, remover e definir roles

**Critérios de Aceite:**
- [x] Admin vê lista de usuários
- [x] Admin pode criar novo usuário (nome, email, role)
- [x] Admin pode editar usuário existente
- [x] Admin pode desativar usuário (soft delete)
- [x] Admin pode resetar senha de usuário

**Técnico:** `frontend/app/(dashboard)/admin/usuarios/page.tsx`, `backend/app/api/v1/routes/users.py`

---

#### US-009: Admin configura IA ✅
**Como** admin
**Quero** personalizar o comportamento do atendente IA
**Então** devo poder ajustar prompt, temperatura e nível de autonomia

**Critérios de Aceite:**
- [x] Admin pode editar prompt base
- [x] Admin pode ajustar temperatura (0.0 - 2.0)
- [x] Admin pode selecionar nível de autonomia
- [x] Alterações são salvas e afetam novos tickets

**Técnico:** `frontend/app/(dashboard)/admin/config-ia/page.tsx`, `backend/app/services/ai_config_service.py`

---

#### US-010: Admin configura API do Atendente ✅
**Como** admin
**Quero** inserir minha própria chave de API (OpenAI/Anthropic)
**Então** o sistema deve usar minha chave para as chamadas de IA

**Critérios de Aceite:**
- [x] Admin pode inserir e salvar chave de API (criptografada AES-256)
- [x] Admin pode testar chave de API (valida e mostra uso)
- [x] Sistema rejeita chave inválida com mensagem clara

**Técnico:** `frontend/app/(dashboard)/admin/config-ia/page.tsx`, `backend/app/core/security.py`

---

#### US-011: Admin seleciona modelos ✅
**Como** admin
**Quero** escolher quais modelos usar para LLM e embeddings
**Então** devo poder selecionar de uma lista de modelos disponíveis

**Critérios de Aceite:**
- [x] Dropdown com modelos LLM do provedor selecionado
- [x] Exibição de características (max tokens)
- [x] Modelos ordenados por popularidade/recomendação

**Técnico:** `frontend/app/(dashboard)/admin/config-ia/page.tsx`, `backend/app/services/ai_config_service.py`

---

#### US-012: Admin associa ferramentas ✅
**Como** admin
**Quero** habilitar/desabilitar ferramentas para o atendente
**Então** o atendente deve poder usar apenas as ferramentas selecionadas

**Critérios de Aceite:**
- [x] Lista de ferramentas com checkboxes
- [x] Descrição de cada ferramenta
- [x] Indicação de ferramentas que requerem integração
- [x] Ferramenta "Busca RAG" ativada por padrão

**Técnico:** `frontend/app/(dashboard)/admin/config-ia/page.tsx`, `backend/app/services/ai_config_service.py`

---

#### US-013: Admin define nível de autonomia ✅
**Como** admin
**Quero** definir como o atendente de IA responde tickets
**Então** devo poder escolher entre aprovação obrigatória ou automática

**Critérios de Aceite:**
- [x] Radio buttons para nível de autonomia
- [x] Explicação clara de cada nível
- [x] Aviso de segurança ao selecionar nível alto
- [x] Nível "Baixo" é o padrão

**Técnico:** `frontend/app/(dashboard)/admin/config-ia/page.tsx`

---

#### US-014: Admin customiza prompt ✅
**Como** admin
**Quero** personalizar o prompt do atendente de IA
**Então** devo poder editar o texto com variáveis disponíveis

**Critérios de Aceite:**
- [x] Editor de texto com syntax highlighting
- [x] Lista de variáveis disponíveis ({company_name}, {rag_context}, etc)
- [x] Botão para restaurar prompt padrão
- [x] Preview do prompt renderizado

**Técnico:** `frontend/app/(dashboard)/admin/config-ia/prompt-editor/page.tsx`

---

### MÓDULO SUPER ADMIN

#### US-015: Super Admin aprova empresa ✅
**Como** super admin
**Quero** aprobar novas empresas cadastradas
**Então** devo poder aceitar ou rejeitar cada empresa

**Critérios de Aceite:**
- [x] Super admin vê lista de empresas pendentes
- [x] Super admin pode ver detalhes da empresa
- [x] Super admin pode aprovar (empresa ativa)
- [x] Super admin pode rejeitar (com motivo)

**Técnico:** `frontend/app/(dashboard)/superadmin/empresas/page.tsx`, `backend/app/api/v1/routes/companies.py`

---

#### US-016: Super Admin gerencia planos ✅
**Como** super admin
**Quero** criar e editar planos de assinatura
**Então** devo poder definir preços, features e limites

**Critérios de Aceite:**
- [x] Super admin vê lista de planos
- [x] Super admin pode criar novo plano
- [x] Super admin pode editar plano existente
- [x] Super admin pode ativar/desativar plano

**Técnico:** `frontend/app/(dashboard)/superadmin/planos/page.tsx`, `backend/app/api/v1/routes/plans.py`

---

### MÓDULO TICKET

#### US-017: Sistema dispara IA automaticamente ✅
**Como** sistema
**Quero** disparar o atendente de IA ao criar um ticket
**Então** a resposta deve ser gerada e aguardada aprovação

**Critérios de Aceite:**
- [x] Ao criar ticket, status muda para "pending_ai"
- [x] Atendente IA é disparado em background (Celery)
- [x] Resposta AI é salva com contexto e fontes RAG
- [x] Atendentes são notificados de nova resposta pendente
- [x] Tempo de geração é registrado

**Técnico:** `backend/app/tasks/celery_tasks.py`, `backend/app/agents/langgraph/ticket_agent.py`

---

#### US-018: Visualizar histórico de mensagens ✅
**Como** atendente/cliente
**Quero** ver todas as mensagens do ticket em ordem cronológica
**Então** devo poder visualizar a conversa completa

**Critérios de Aceite:**
- [x] Mensagens em ordem cronológica (mais antiga primeiro)
- [x] Identificação clara de quem escreveu (cliente/atendente/IA)
- [x] Timestamp de cada mensagem
- [x] Indicador visual de mensagem AI

**Técnico:** `frontend/app/(dashboard)/cliente/tickets/[id]/page.tsx`

---

#### US-019: Adicionar anexos ilimitados ✅
**Como** atendente/cliente
**Quero** adicionar quantos anexos quiser a um ticket
**Então** devo poder fazer upload sem limite de quantidade

**Critérios de Aceite:**
- [x] Pode adicionar múltiplos arquivos de uma vez
- [x] Tipos de arquivo permitidos: pdf, png, jpg, txt, doc, docx, xls, xlsx
- [x] Tamanho máximo por arquivo: 25MB

**Técnico:** `frontend/app/(dashboard)/cliente/tickets/[id]/page.tsx`, `backend/app/services/attachment_service.py`

---

#### US-020: Associar tickets entre si ✅
**Como** atendente/admin
**Quero** associar tickets relacionados
**Então** devo poder vincular tickets para facilitar o acompanhamento

**Critérios de Aceite:**
- [x] Pode associar ticket a outro existente
- [x] Tipos de relação: Duplicado, Causa, Causado por, Relacionado, Subtarefa, Pai
- [x] Lista de tickets associados visível
- [x] Pode desassociar tickets
- [x] Associação aparece no log de alterações

**Técnico:** `frontend/app/(dashboard)/cliente/tickets/[id]/page.tsx`, `backend/app/api/v1/routes/tickets.py`

---

#### US-021: Atribuir ticket a atendente ✅
**Como** atendente/admin
**Quero** atribuir um ticket a um atendente específico
**Então** o ticket deve ficar sob responsabilidade da pessoa selecionada

**Critérios de Aceite:**
- [x] Dropdown com lista de atendentes disponíveis
- [x] Opção de desatribuir (tirar de qualquer atendente)
- [x] Atribuição é registrada no log
- [x] Notificação enviada ao atendente atribuído

**Técnico:** `frontend/app/(dashboard)/atendente/tickets/[id]/page.tsx`, `backend/app/api/v1/routes/tickets.py`

---

#### US-022: Visualizar log de alterações ✅
**Como** atendente/admin
**Quero** ver todas as alterações feitas no ticket
**Então** devo poder consultar um log completo separado das mensagens

**Critérios de Aceite:**
- [x] Tab separado para Alterações (não mistura com mensagens)
- [x] Lista cronológica de todas as mudanças
- [x] Tipo de alteração com ícone identificador
- [x] Valores antigos e novos (quando aplicável)
- [x] Quem fez a alteração e quando

**Técnico:** `frontend/app/(dashboard)/cliente/tickets/[id]/page.tsx`, `backend/app/api/v1/routes/tickets.py`

---

## 📈 Roadmap de Implementação

### Sprint 1: MVP Core ✅
**Objetivo:** Sistema funcional básico com autenticação e tickets

| US | Descrição | Status |
|----|-----------|--------|
| US-001 | Cliente cria ticket | ✅ |
| US-002 | Cliente acompanha ticket | ✅ |
| US-004 | Atendente aprova resposta AI | ✅ |
| US-005 | Atendente responde manualmente | ✅ |
| US-017 | Sistema dispara IA automaticamente | ✅ |
| US-018 | Visualizar histórico de mensagens | ✅ |
| US-021 | Atribuir ticket a atendente | ✅ |

---

### Sprint 2: IA + Feedback ✅
**Objetivo:** Integração completa de IA com feedback

| US | Descrição | Status |
|----|-----------|--------|
| US-006 | Atendente avalia resposta AI | ✅ |
| US-007 | Admin configura base de conhecimento | ✅ |
| US-009 | Admin configura IA | ✅ |
| US-014 | Admin customiza prompt | ✅ |

---

### Sprint 3: Multi-usuário + Admin ✅
**Objetivo:** Sistema completo de roles e permissões

| US | Descrição | Status |
|----|-----------|--------|
| US-008 | Admin gerencia usuários | ✅ |
| US-010 | Admin configura API | ✅ |
| US-011 | Admin seleciona modelos | ✅ |
| US-012 | Admin associa ferramentas | ✅ |
| US-013 | Admin define nível de autonomia | ✅ |

---

### Sprint 4: Tickets Avançados ✅
**Objetivo:** Funcionalidades completas de tickets

| US | Descrição | Status |
|----|-----------|--------|
| US-003 | Cliente avalia atendimento | ✅ |
| US-019 | Adicionar anexos ilimitados | ✅ |
| US-020 | Associar tickets entre si | ✅ |
| US-022 | Visualizar log de alterações | ✅ |

---

### Sprint 5: Super Admin + Polish ✅
**Objetivo:** Super Admin e refinamentos

| US | Descrição | Status |
|----|-----------|--------|
| US-015 | Super Admin aprova empresa | ✅ |
| US-016 | Super Admin gerencia planos | ✅ |

---

## 📊 Burndown / Progresso

```
Sprint 1: [████████████████████████████] 24/24 dias ✅
Sprint 2: [████████████████████████████] 12/12 dias ✅
Sprint 3: [████████████████████████████] 11/11 dias ✅
Sprint 4: [████████████████████████████] 11/11 dias ✅
Sprint 5: [████████████████████████████]  5/5 dias ✅
```

**Total: 63 dias implementados**

---

## 🎯 Definition of Done

Para uma US ser considerada **DONE**, todos os critérios devem ser cumpridos:

- [x] Código implementado e testado
- [x] CRIAÇÃO DE API (se aplicável)
- [x] Testes unitários criados
- [x] Testes de integração passing
- [x] Documentação atualizada
- [x] Deploy em ambiente de staging
- [x] Aprovação de PO/Revisão

---

## 📁 Estrutura de Pastas Implementada

```
celx-atendimento/
├── frontend/
│   └── app/
│       └── (dashboard)/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── cliente/
│           │   └── tickets/
│           │       ├── page.tsx              # Lista
│           │       ├── novo/page.tsx          # Criar
│           │       └── [id]/page.tsx         # Detalhe (tabs)
│           ├── atendente/
│           │   ├── tickets/page.tsx
│           │   ├── tickets/[id]/page.tsx
│           │   └── aprovacao/page.tsx
│           ├── admin/
│           │   ├── usuarios/page.tsx
│           │   ├── conhecimento/page.tsx
│           │   ├── config-ia/page.tsx
│           │   └── config-ia/prompt-editor/page.tsx
│           └── superadmin/
│               ├── empresas/page.tsx
│               └── planos/page.tsx
│
├── backend/
│   └── app/
│       ├── api/v1/routes/
│       │   ├── auth.py
│       │   ├── tickets.py
│       │   ├── users.py
│       │   ├── companies.py
│       │   ├── ai_config.py
│       │   ├── categories.py
│       │   ├── plans.py
│       │   ├── attachments.py
│       │   └── knowledge.py
│       ├── services/
│       │   ├── ticket_service.py
│       │   ├── rag_service.py
│       │   ├── ai_feedback_service.py
│       │   ├── ai_config_service.py
│       │   └── attachment_service.py
│       ├── agents/langgraph/
│       │   └── ticket_agent.py
│       ├── tasks/
│       │   ├── celery_tasks.py
│       │   └── generate_ai_response.py
│       ├── celery_app.py
│       └── core/
│           ├── security.py
│           └── dependencies.py
│
└── database/
    ├── schema.sql
    ├── migrate.py
    └── seed.py
```

---

## 🚀 Como Executar

```bash
# 1. Configurar Banco
cd database
python migrate.py    # Cria tabelas
python seed.py        # Dados de teste

# 2. Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# Celery (outro terminal):
celery -A app.celery_app worker --loglevel=info

# 3. Frontend
cd frontend
npm install
npm run dev
```

**Credenciais de Teste:**
- Admin: `admin@demo.com` / `admin123`
- Agente: `agent@demo.com` / `agent123`
- Cliente: `cliente@demo.com` / `cliente123`

---

**Última atualização:** 2026-04-21 16:51