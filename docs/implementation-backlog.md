# celx-atendimento - Backlog de Implementação

**Versão:** 1.0  
**Data:** 2026-04-21  
**Status:** 📋 Planejamento  

---

## 📊 Quadro Kanban

| 📋 To Do | 🔄 In Progress | ✅ Done |
|----------|----------------|--------|
| - | - | - |

---

## 🎯 User Stories - Backlog

### MÓDULO CLIENTE

#### US-001: Cliente cria ticket
**Como** cliente da empresa  
**Quero** criar um ticket de suporte  
**Então** devo selecionar categoria, prioridade, descrever o problema e receber confirmação  

**Critérios de Aceite:**
- [ ] Cliente pode selecionar categoria (dropdown)
- [ ] Cliente pode selecionar prioridade (dropdown)
- [ ] Cliente pode inserir assunto (max 200 chars)
- [ ] Cliente pode inserir descrição (max 5000 chars)
- [ ] Cliente pode anexar até N arquivos
- [ ] Sistema exibe mensagem de sucesso
- [ ] Ticket aparece na lista "Meus Tickets"
- [ ] Email de confirmação enviado ao cliente

**Estimativa:** 5 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@backend/ticket_service.py`, `@frontend/cliente/tickets/novo/`

---

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

**Estimativa:** 3 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/cliente/tickets/`, `@frontend/cliente/tickets/[id]/`

---

#### US-003: Cliente avalia atendimento
**Como** cliente  
**Quero** avaliar o atendimento ao fechar ticket  
**Então** devo poder dar nota de 1-5 estrelas  

**Critérios de Aceite:**
- [ ] Ao fechar ticket, modal de avaliação aparece
- [ ] Cliente pode dar nota de 1-5 estrelas
- [ ] Cliente pode adicionar comentário (opcional)
- [ ] Avaliação é salva no banco

**Estimativa:** 2 dias  
**Prioridade:** 🟡 Média  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/cliente/tickets/[id]/`, `@backend/ticket_service.py`

---

### MÓDULO ATENDENTE

#### US-004: Atendente aprova resposta AI
**Como** atendente  
**Quero** aprobar/rejeitar respostas geradas por IA  
**Então** devo poder revisar antes do envio ao cliente  

**Critérios de Aceite:**
- [ ] Atendente vê fila de tickets pendentes
- [ ] Atendente vê resposta AI gerada + fontes RAG
- [ ] Atendente pode aprovar (envia ao cliente)
- [ ] Atendente pode rejeitar (retorna para fila)
- [ ] Atendente pode editar resposta antes de aprovar
- [ ] Timestamp de aprovação registrado

**Estimativa:** 4 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/atendente/aprovacao/`, `@backend/ticket_ai_service.py`

---

#### US-005: Atendente responde manualmente
**Como** atendente  
**Quero** responder um ticket sem usar IA  
**Então** devo poder digitar e enviar resposta  

**Critérios de Aceite:**
- [ ] Atendente tem acesso ao formulário de resposta
- [ ] Resposta é enviada imediatamente
- [ ] Ticket muda status para "pending_agent" se necessário
- [ ] Cliente é notificado

**Estimativa:** 2 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/atendente/tickets/[id]/`, `@backend/ticket_service.py`

---

#### US-006: Atendente avalia resposta AI
**Como** atendente  
**Quero** avaliar a resposta da IA  
**Então** o sistema deve coletar feedback para aprendizado  

**Critérios de Aceite:**
- [ ] Atendente pode dar nota 1-5 à resposta AI
- [ ] Atendente pode adicionar feedback textual
- [ ] Atendente pode marcar como exemplo bom/ruim
- [ ] Feedback é salvo no banco (ticket_ai_response)
- [ ] Log de feedback registrado (ai_feedback_log)

**Estimativa:** 2 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/atendente/aprovacao/`, `@backend/ai_feedback_service.py`

---

### MÓDULO ADMIN

#### US-007: Admin configura base de conhecimento
**Como** admin  
**Quero** subir documentos para a base de conhecimento  
**Então** o atendente de IA deve usar esses documentos nas respostas  

**Critérios de Aceite:**
- [ ] Admin pode fazer upload de PDF (max 25MB)
- [ ] Admin pode criar artigos de texto manualmente
- [ ] Sistema processa e indexa o conteúdo (chunks + embeddings)
- [ ] Admin vê status de indexação
- [ ] Admin pode ativar/desativar documentos
- [ ] Admin pode deletar documentos

**Estimativa:** 5 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/admin/knowledge/`, `@backend/rag_service.py`

---

#### US-008: Admin gerencia usuários
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

**Estimativa:** 3 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/admin/usuarios/`, `@backend/user_service.py`

---

#### US-009: Admin configura IA
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

**Estimativa:** 3 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/admin/config-ia/`, `@backend/company_ai_config.py`

---

#### US-010: Admin configura API do Atendente
**Como** admin  
**Quero** inserir minha própria chave de API (OpenAI/Anthropic)  
**Então** o sistema deve usar minha chave para as chamadas de IA  

**Critérios de Aceite:**
- [ ] Admin pode selecionar provedor (OpenAI, Anthropic, Cohere, Local)
- [ ] Admin pode inserir e salvar chave de API (criptografada AES-256)
- [ ] Admin pode testar chave de API (valida e mostra uso)
- [ ] Sistema rejeita chave inválida com mensagem clara

**Estimativa:** 3 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/admin/config-ia/`, `@backend/api_key_service.py`

---

#### US-011: Admin seleciona modelos
**Como** admin  
**Quero** escolher quais modelos usar para LLM e embeddings  
**Então** devo poder selecionar de uma lista de modelos disponíveis  

**Critérios de Aceite:**
- [ ] Dropdown com modelos LLM do provedor selecionado
- [ ] Dropdown com modelos de embedding do provedor
- [ ] Exibição de características (max tokens, dimensões)
- [ ] Modelos ordenados por popularidade/recomendação

**Estimativa:** 2 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/admin/config-ia/`, `@backend/ai_model_service.py`

---

#### US-012: Admin associa ferramentas
**Como** admin  
**Quero** habilitar/desabilitar ferramentas para o atendente  
**Então** o atendente deve poder usar apenas as ferramentas selecionadas  

**Critérios de Aceite:**
- [ ] Lista de ferramentas com checkboxes
- [ ] Descrição de cada ferramenta
- [ ] Indicação de ferramentas que requerem integração
- [ ] Ferramenta "Busca RAG" ativada por padrão

**Estimativa:** 2 dias  
**Prioridade:** 🟡 Média  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/admin/config-ia/`, `@backend/ai_tools_service.py`

---

#### US-013: Admin define nível de autonomia
**Como** admin  
**Quero** definir como o atendente de IA responde tickets  
**Então** devo poder escolher entre aprovação obrigatória ou automática  

**Critérios de Aceite:**
- [ ] Radio buttons para nível de autonomia
- [ ] Explicação clara de cada nível
- [ ] Aviso de segurança ao selecionar nível alto
- [ ] Nível "Baixo" é o padrão

**Estimativa:** 1 dia  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/admin/config-ia/`

---

#### US-014: Admin customiza prompt
**Como** admin  
**Quero** personalizar o prompt do atendente de IA  
**Então** devo poder editar o texto com variáveis disponíveis  

**Critérios de Aceite:**
- [ ] Editor de texto com syntax highlighting
- [ ] Lista de variáveis disponíveis ({company_name}, {rag_context}, etc)
- [ ] Botão para restaurar prompt padrão
- [ ] Preview do prompt renderizado

**Estimativa:** 2 dias  
**Prioridade:** 🟡 Média  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/admin/config-ia/prompt-editor/`

---

### MÓDULO SUPER ADMIN

#### US-015: Super Admin aprova empresa
**Como** super admin  
**Quero** aprobar novas empresas cadastradas  
**Então** devo poder aceitar ou rejeitar cada empresa  

**Critérios de Aceite:**
- [ ] Super admin vê lista de empresas pendentes
- [ ] Super admin pode ver detalhes da empresa
- [ ] Super admin pode aprovar (empresa ativa)
- [ ] Super admin pode rejeitar (com motivo)
- [ ] Email enviado à empresa com resultado

**Estimativa:** 2 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/superadmin/empresas/`, `@backend/company_service.py`

---

#### US-016: Super Admin gerencia planos
**Como** super admin  
**Quero** criar e editar planos de assinatura  
**Então** devo poder definir preços, features e limites  

**Critérios de Aceite:**
- [ ] Super admin vê lista de planos
- [ ] Super admin pode criar novo plano
- [ ] Super admin pode editar plano existente
- [ ] Super admin pode ativar/desativar plano
- [ ] Alterações não afetam empresas já assinadas

**Estimativa:** 3 dias  
**Prioridade:** 🟡 Média  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/superadmin/planos/`, `@backend/plan_service.py`

---

### MÓDULO TICKET

#### US-017: Sistema dispara IA automaticamente
**Como** sistema  
**Quero** disparar o atendente de IA ao criar um ticket  
**Então** a resposta deve ser gerada e aguardada aprovação  

**Critérios de Aceite:**
- [ ] Ao criar ticket, status muda para "pending_ai"
- [ ] Atendente IA é disparado em background (Celery)
- [ ] Resposta AI é salva com contexto e fontes RAG
- [ ] Atendentes são notificados de nova resposta pendente
- [ ] Tempo de geração é registrado

**Estimativa:** 5 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@backend/tasks/generate_ai_response.py`, `@backend/langgraph/`

---

#### US-018: Visualizar histórico de mensagens
**Como** atendente/cliente  
**Quero** ver todas as mensagens do ticket em ordem cronológica  
**Então** devo poder visualizar a conversa completa  

**Critérios de Aceite:**
- [ ] Mensagens em ordem cronológica (mais antiga primeiro)
- [ ] Identificação clara de quem escreveu (cliente/atendente/IA)
- [ ] Timestamp de cada mensagem
- [ ] Anexos visíveis junto às mensagens
- [ ] Indicador visual de mensagem AI (com rating se aprovado)
- [ ] Scroll infinito para muitas mensagens

**Estimativa:** 3 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/tickets/[id]/tabs/mensagens/`

---

#### US-019: Adicionar anexos ilimitados
**Como** atendente/cliente  
**Quero** adicionar quantos anexos quiser a um ticket  
**Então** devo poder fazer upload sem limite de quantidade  

**Critérios de Aceite:**
- [ ] Pode adicionar múltiplos arquivos de uma vez
- [ ] Sem limite de quantidade de anexos
- [ ] Tipos de arquivo permitidos: pdf, png, jpg, txt, doc, docx, xls, xlsx
- [ ] Tamanho máximo por arquivo: 25MB
- [ ] Indicador de progresso de upload
- [ ] Preview do arquivo após upload
- [ ] Possibilidade de remover anexo antes de enviar mensagem

**Estimativa:** 3 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/components/attachment-upload/`, `@backend/attachment_service.py`

---

#### US-020: Associar tickets entre si
**Como** atendente/admin  
**Quero** associar tickets relacionados  
**Então** devo poder vincular tickets para facilitar o acompanhamento  

**Critérios de Aceite:**
- [ ] Pode associar ticket a outro existente
- [ ] Tipos de relação: Duplicado, Causa, Causado por, Relacionado, Subtarefa, Pai
- [ ] Pode adicionar descrição da relação
- [ ] Lista de tickets associados visível
- [ ] Sugestão automática de tickets relacionados
- [ ] Pode desassociar tickets
- [ ] Associação aparece no log de alterações

**Estimativa:** 3 dias  
**Prioridade:** 🟡 Média  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/tickets/[id]/tabs/relacionados/`, `@backend/ticket_relation_service.py`

---

#### US-021: Atribuir ticket a atendente
**Como** atendente/admin  
**Quero** atribuir um ticket a um atendente específico  
**Então** o ticket deve ficar sob responsabilidade da pessoa selecionada  

**Critérios de Aceite:**
- [ ] Dropdown com lista de atendentes disponíveis
- [ ] Busca por nome de atendente
- [ ] Opção de desatribuir (tirar de qualquer atendente)
- [ ] Motivo da atribuição (manual, SLA, round-robin)
- [ ] Atribuição é registrada no log
- [ ] Notificação enviada ao atendente atribuído

**Estimativa:** 2 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/tickets/[id]/components/assignment/`, `@backend/ticket_assignment_service.py`

---

#### US-022: Visualizar log de alterações
**Como** atendente/admin  
**Quero** ver todas as alterações feitas no ticket  
**Então** devo poder consultar um log completo separado das mensagens  

**Critérios de Aceite:**
- [ ] Tab separado para Alterações (não mistura com mensagens)
- [ ] Lista cronológica de todas as mudanças
- [ ] Tipo de alteração com ícone identificador
- [ ] Valores antigos e novos (quando aplicável)
- [ ] Quem fez a alteração e quando
- [ ] Filtros por tipo de alteração e período
- [ ] Exportação para CSV

**Estimativa:** 3 dias  
**Prioridade:** 🔴 Alta  
**Status:** ⬜ To Do  
**Técnico:** `@frontend/tickets/[id]/tabs/alteracoes/`, `@backend/audit_log_service.py`

---

## 📈 Roadmap de Implementação

### Sprint 1: MVP Core (3 semanas)
**Objetivo:** Sistema funcional básico com autenticação e tickets

| US | Descrição | Dias |
|----|-----------|------|
| US-001 | Cliente cria ticket | 5 |
| US-002 | Cliente acompanha ticket | 3 |
| US-004 | Atendente aprova resposta AI | 4 |
| US-005 | Atendente responde manualmente | 2 |
| US-017 | Sistema dispara IA automaticamente | 5 |
| US-018 | Visualizar histórico de mensagens | 3 |
| US-021 | Atribuir ticket a atendente | 2 |

**Total:** 24 dias (3 semanas)

---

### Sprint 2: IA + Feedback (2 semanas)
**Objetivo:** Integração completa de IA com feedback

| US | Descrição | Dias |
|----|-----------|------|
| US-006 | Atendente avalia resposta AI | 2 |
| US-007 | Admin configura base de conhecimento | 5 |
| US-009 | Admin configura IA | 3 |
| US-014 | Admin customiza prompt | 2 |

**Total:** 12 dias (2 semanas)

---

### Sprint 3: Multi-usuário + Admin (2 semanas)
**Objetivo:** Sistema completo de roles e permissões

| US | Descrição | Dias |
|----|-----------|------|
| US-008 | Admin gerencia usuários | 3 |
| US-010 | Admin configura API | 3 |
| US-011 | Admin seleciona modelos | 2 |
| US-012 | Admin associa ferramentas | 2 |
| US-013 | Admin define nível de autonomia | 1 |

**Total:** 11 dias (2 semanas)

---

### Sprint 4: Tickets Avançados (2 semanas)
**Objetivo:** Funcionalidades completas de tickets

| US | Descrição | Dias |
|----|-----------|------|
| US-003 | Cliente avalia atendimento | 2 |
| US-019 | Adicionar anexos ilimitados | 3 |
| US-020 | Associar tickets entre si | 3 |
| US-022 | Visualizar log de alterações | 3 |

**Total:** 11 dias (2 semanas)

---

### Sprint 5: Super Admin + Polish (1 semana)
**Objetivo:** Super Admin e refinamentos

| US | Descrição | Dias |
|----|-----------|------|
| US-015 | Super Admin aprova empresa | 2 |
| US-016 | Super Admin gerencia planos | 3 |

**Total:** 5 dias (1 semana)

---

## 📊 Burndown / Progresso

```
Sprint 1: [████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░] 0/24 dias
Sprint 2: [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0/12 dias
Sprint 3: [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0/11 dias
Sprint 4: [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0/11 dias
Sprint 5: [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0/5 dias
```

---

## 🎯 Definition of Done

Para uma US ser considerada **DONE**, todos os critérios devem ser cumpridos:

- [ ] Código implementado e testado
- [ ] CRIAÇÃO DE API (se aplicável)
- [ ] Testes unitários criados (>80% coverage)
- [ ] Testes de integração passing
- [ ] Documentação atualizada
- [ ] Deploy em ambiente de staging
- [ ] Aprovação de PO/Revisão

---

## 📁 Estrutura de Pastas Sugerida

```
celx-atendimento/
├── frontend/
│   └── app/
│       └── (dashboard)/
│           ├── cliente/
│           │   ├── tickets/
│           │   │   ├── page.tsx              # Lista de tickets
│           │   │   ├── novo/page.tsx         # Criar ticket
│           │   │   └── [id]/
│           │   │       └── page.tsx           # Detalhe do ticket
│           │   └── perfil/page.tsx
│           ├── atendente/
│           │   ├── aprovacao/page.tsx        # Fila de aprovação
│           │   ├── tickets/
│           │   │   ├── page.tsx
│           │   │   └── [id]/
│           │   │       └── page.tsx
│           │   └── dashboard/page.tsx
│           └── admin/
│               ├── usuarios/page.tsx
│               ├── conhecimento/page.tsx      # Base de conhecimento
│               ├── config-ia/page.tsx        # Config AI
│               └── dashboard/page.tsx
│
├── backend/
│   └── app/
│       ├── api/
│       │   └── v1/
│       │       └── routes/
│       │           ├── tickets.py
│       │           ├── users.py
│       │           ├── knowledge.py
│       │           └── ai_config.py
│       ├── services/
│       │   ├── ticket_service.py
│       │   ├── user_service.py
│       │   ├── rag_service.py
│       │   └── ai_feedback_service.py
│       ├── agents/
│       │   └── langgraph/
│       │       └── ticket_agent.py
│       └── tasks/
│           └── generate_ai_response.py
│
└── database/
    ├── schema.sql
    └── migrations/
```

---

## 📝 Como Usar Este Documento

1. **Criar nova branch:** `git checkout -b feat/US-001-criar-ticket`
2. **Implementar** seguindo os critérios de aceite
3. **Marcar como done** quando todos os critérios cumplidos
4. **Atualizar quadro Kanban** no topo deste documento
5. **Criar PR** quando sprint for completada

---

**Última atualização:** 2026-04-21 00:25
