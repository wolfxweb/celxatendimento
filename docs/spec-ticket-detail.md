# celx-atendimento - Especificação: Tela de Detalhe do Ticket

**Versão:** 1.0  
**Data:** 2026-04-21  
**Módulo:** Ticket - Painéis Cliente, Atendente, Admin  

---

## 1. Visão Geral da Tela

A tela de detalhe do ticket é divida em **tabs**, separando claramente:
- **Mensagens** - Conversa entre cliente e atendentes
- **Informações** - Dados do ticket, cliente, anexo
- **Alterações** - Log de todas as mudanças (sem misturar com mensagens)
- **Relacionados** - Tickets associados

---

## 2. Wireframe Completo

### 2.1 Layout Principal

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  TICKET #1234                                                   [← Voltar]     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─ Header ──────────────────────────────────────────────────────────────────┐ │
│  │                                                                              │ │
│  │  Assunto: Erro 500 ao fazer login                           🟡 ABERTO      │ │
│  │                                                                              │ │
│  │  Criado por: João Silva  •  21/04/2026 14:30  •  Prioridade: Alta          │ │
│  │                                                                              │ │
│  └─────────────────────────────────────────────────────────────────────────────│ │
│                                                                                  │
│  ┌─ Tabs ────────────────────────────────────────────────────────────────────┐ │
│  │  [💬 Mensagens]  [📋 Informações]  [📜 Alterações]  [🔗 Relacionados]    │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  ┌─ Tab Content (Mensagens) ─────────────────────────────────────────────────┐ │
│  │                                                                              │ │
│  │  ┌─ Barra de Ações ────────────────────────────────────────────────────┐  │ │
│  │  │  [🔗 Associar Ticket]  [👤 Atribuir a ▼]  [📎 Anexar]  [↩️ Responder] │  │ │
│  │  └──────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                              │ │
│  │  ┌─ Mensagens ─────────────────────────────────────────────────────────┐  │ │
│  │  │                                                                        │  │ │
│  │  │  ┌─ Mensagem Cliente ──────────────────────────────────────────────┐│  │ │
│  │  │  │  👤 João Silva                              21/04 14:30        ││  │ │
│  │  │  │  ─────────────────────────────────────────────────────────────── ││  │ │
│  │  │  │  Estou tentando fazer login mas aparece erro 500. Já tentei     ││  │ │
│  │  │  │  limpar cache e cookies mas não funcionou.                      ││  │ │
│  │  │  │                                                                  ││  │ │
│  │  │  │  📎 2 anexos: screenshot1.png, erro_console.txt                 ││  │ │
│  │  │  └──────────────────────────────────────────────────────────────────┘│  │ │
│  │  │                                                                        │  │ │
│  │  │  ┌─ Resposta IA ──────────────────────────────────────────────────┐│  │ │
│  │  │  │  🤖 IA (Aguardando aprovação)                21/04 14:32   ⭐4/5 ││  │ │
│  │  │  │  ─────────────────────────────────────────────────────────────── ││  │ │
│  │  │  │  Olá João! Identificamos que o erro 500 pode estar relacionado  ││  │ │
│  │  │  │  a problemas no servidor de autenticação...                      ││  │ │
│  │  │  │                                                                  ││  │ │
│  │  │  │  📚 Fontes: FAQ - Problemas de Login (92%)                      ││  │ │
│  │  │  │                                                                  ││  │ │
│  │  │  │  [✓ Aprovar]  [✗ Rejeitar]  [✎ Editar]                         ││  │ │
│  │  │  └──────────────────────────────────────────────────────────────────┘│  │ │
│  │  │                                                                        │  │ │
│  │  │  ┌─ Mensagem Atendente ──────────────────────────────────────────────┐│  │ │
│  │  │  │  👤 Maria (Atendente)                           21/04 15:00         ││  │ │
│  │  │  │  ─────────────────────────────────────────────────────────────── ││  │ │
│  │  │  │  Olá João! Realmente identificamos um problema no servidor.     ││  │ │
│  │  │  │  Nossa equipe já está trabalhando na correção.                 ││  │ │
│  │  │  │  Previsão de resolução: 2 horas.                                ││  │ │
│  │  │  └──────────────────────────────────────────────────────────────────┘│  │ │
│  │  │                                                                        │  │ │
│  │  └────────────────────────────────────────────────────────────────────────│  │ │
│  │                                                                              │ │
│  │  ┌─ Composer ─────────────────────────────────────────────────────────┐  │ │
│  │  │  [Assistente IA: ═══════════════════════════════════════]         │  │ │
│  │  │                                                                        │  │ │
│  │  │  ┌──────────────────────────────────────────────────────────────┐   │  │ │
│  │  │  │ Digite sua resposta...                                       │   │  │ │
│  │  │  │                                                               │   │  │ │
│  │  │  │                                                               │   │  │ │
│  │  │  └──────────────────────────────────────────────────────────────┘   │  │ │
│  │  │                                                                        │  │ │
│  │  │  📎 [Adicionar anexos]                           [Enviar Resposta]   │  │ │
│  │  └────────────────────────────────────────────────────────────────────────│  │ │
│  │                                                                              │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Tab: Informações

```
┌─ Tab Content (Informações) ───────────────────────────────────────────────────┐
│                                                                                 │
│  ┌─ Dados do Ticket ───────────────────────────────────────────────────────┐  │
│  │                                                                             │  │
│  │  ID                 #1234                                                  │  │
│  │  Status             🟡 Aberto                                              │  │
│  │  Prioridade         Alta                                                   │  │
│  │  Categoria          Suporte Técnico                                        │  │
│  │  Atendente          Maria Santos                        [Trocar]           │  │
│  │  Criado em          21/04/2026 14:30                                       │  │
│  │  Atualizado em      21/04/2026 15:00                                       │  │
│  │  SLA                🟠 Resolve até 22/04 14:30 (23h restantes)            │  │
│  │                                                                             │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─ Cliente ───────────────────────────────────────────────────────────────┐  │
│  │                                                                             │  │
│  │  Nome              João Silva                                              │  │
│  │  Email             joao.silva@empresa.com                                 │  │
│  │  Empresa           Tech Solutions Ltda                                    │  │
│  │  Telefone          (11) 99999-8888                                         │  │
│  │  Cliente desde     15/03/2024                                             │  │
│  │  Total de tickets  12                                                     │  │
│  │                                                                             │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─ Anexos (5) ──────────────────────────────────────────────────────────────┐  │
│  │                                                                             │  │
│  │  📄 screenshot1.png                    245 KB    21/04 14:30  João Silva   │  │
│  │  📄 screenshot2.png                    312 KB    21/04 14:30  João Silva   │  │
│  │  📄 erro_console.txt                   12 KB    21/04 14:31  João Silva   │  │
│  │  📄 log_sistema.txt                    89 KB    21/04 14:35  Maria        │  │
│  │  📄 resposta_cliente.pdf              156 KB    21/04 15:05  Maria        │  │
│  │                                                                             │  │
│  │  [+ Adicionar Anexo]                                                       │  │
│  │                                                                             │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─ Resumo IA ──────────────────────────────────────────────────────────────┐  │
│  │                                                                             │  │
│  │  Resposta gerada       21/04 14:32                                         │  │
│  │  Status               ⭐ 4/5 (Aprovada)                                    │  │
│  │  Tempo de geração      2.3s                                                │  │
│  │  Fontes RAG           FAQ - Problemas de Login (92%)                       │  │
│  │                        Manual do Usuário p.45 (78%)                       │  │
│  │                                                                             │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Tab: Alterações (Audit Log)

```
┌─ Tab Content (Alterações) ───────────────────────────────────────────────────┐
│                                                                                 │
│  ┌─ Filtros ──────────────────────────────────────────────────────────────┐  │
│  │  Tipo: [Todos ▼]   Data: [Últimos 30 dias ▼]   [🔍 Buscar...]         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─ Log de Alterações ────────────────────────────────────────────────────┐  │
│  │                                                                          │ │
│  │  ┌─ Alteração de Status ─────────────────────────────────────────────┐│  │
│  │  │  🔄 Status alterado                                                 ││  │
│  │  │  De: [🟡 Aberto]                                                    ││  │
│  │  │  Para: [🟠 Pendente Atendente]                                          ││  │
│  │  │  Por: Maria Santos                                                   ││  │
│  │  │  Em: 21/04/2026 15:00                                               ││  │
│  │  └──────────────────────────────────────────────────────────────────────┘│  │
│  │                                                                          │  │
│  │  ┌─ Resposta AI Aprovada ─────────────────────────────────────────────┐│  │
│  │  │  ✅ Resposta da IA aprovada                                          ││  │
│  │  │  Rating: ⭐⭐⭐⭐☆ (4/5)                                              ││  │
│  │  │  Feedback: "Boa resposta, seguiu o protocolo."                     ││  │
│  │  │  Por: Maria Santos                                                   ││  │
│  │  │  Em: 21/04/2026 14:35                                               ││  │
│  │  └──────────────────────────────────────────────────────────────────────┘│  │
│  │                                                                          │  │
│  │  ┌─ Atribuição ───────────────────────────────────────────────────────┐│  │
│  │  │  👤 Ticket atribuído                                                ││  │
│  │  │  De: Não atribuído                                                   ││  │
│  │  │  Para: Maria Santos                                                  ││  │
│  │  │  Por: Sistema (auto-atribuição)                                      ││  │
│  │  │  Em: 21/04/2026 14:32                                               ││  │
│  │  └──────────────────────────────────────────────────────────────────────┘│  │
│  │                                                                          │  │
│  │  ┌─ Prioridade Alterada ──────────────────────────────────────────────┐│  │
│  │  │  ⚠️ Prioridade alterada                                              ││  │
│  │  │  De: Média                                                           ││  │
│  │  │  Para: Alta                                                          ││  │
│  │  │  Motivo: Cliente reportou problema crítico                           ││  │
│  │  │  Por: Maria Santos                                                   ││  │
│  │  │  Em: 21/04/2026 14:33                                               ││  │
│  │  └──────────────────────────────────────────────────────────────────────┘│  │
│  │                                                                          │  │
│  │  ┌─ Anexo Adicionado ─────────────────────────────────────────────────┐│  │
│  │  │  📎 Arquivo anexado                                                  ││  │
│  │  │  Arquivo: screenshot1.png (245 KB)                                  ││  │
│  │  │  Por: João Silva                                                     ││  │
│  │  │  Em: 21/04/2026 14:30                                               ││  │
│  │  └──────────────────────────────────────────────────────────────────────┘│  │
│  │                                                                          │  │
│  │  ┌─ Ticket Criado ───────────────────────────────────────────────────┐│  │
│  │  │  🎫 Ticket criado                                                    ││  │
│  │  │  Canal: Website                                                       ││  │
│  │  │  Por: João Silva                                                      ││  │
│  │  │  Em: 21/04/2026 14:30                                               ││  │
│  │  └──────────────────────────────────────────────────────────────────────┘│  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────────│  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.4 Tab: Relacionados

```
┌─ Tab Content (Relacionados) ──────────────────────────────────────────────────┐
│                                                                                 │
│  ┌─ Ações ────────────────────────────────────────────────────────────────┐  │
│  │  [+ Associar Ticket]                                                    │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─ Tickets Associados (3) ───────────────────────────────────────────────┐  │
│  │                                                                             │  │
│  │  ┌─ Associação ───────────────────────────────────────────────────────┐ │  │
│  │  │  🔗 #1230 - Problema similar de login                      🟢 Fechado│ │  │
│  │  │     Cliente: Carlos Oliveira  •  18/04/2026                        │ │  │
│  │  │     Relação: Duplicado                                             │ │  │
│  │  │     [Ver Ticket]  [Desassociar]                                    │ │  │
│  │  └──────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                             │  │
│  │  ┌─ Associação ───────────────────────────────────────────────────────┐ │  │
│  │  │  🔗 #1198 - Manutenção programada no servidor            🟢 Fechado│ │  │
│  │  │     Relacionado a: Este ticket pode estar afetado pela manutenção  │ │  │
│  │  │     Relação: Causa                                                 │ │  │
│  │  │     [Ver Ticket]  [Desassociar]                                    │ │  │
│  │  └──────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                             │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─ Tickets do Mesmo Cliente (5) ─────────────────────────────────────────┐  │
│  │                                                                             │  │
│  │  ┌─ Ticket ───────────────────────────────────────────────────────────┐ │  │
│  │  │  #1232 - Dúvida sobre fatura                               🟡 Aberto │ │  │
│  │  │     20/04/2026                                                       │ │  │
│  │  │     [Associar]  [Ver Ticket]                                        │ │  │
│  │  └──────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                             │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modelos de Dados

### 3.1 Tabela `ticket_attachment`

```sql
CREATE TABLE ticket_attachment (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES ticket(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES ticket_message(id) ON DELETE CASCADE,
    
    -- Arquivo
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size INTEGER NOT NULL,  -- em bytes
    
    -- Storage
    storage_path VARCHAR(500) NOT NULL,  -- path no S3/local
    storage_bucket VARCHAR(100),
    
    -- Upload
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP,
    deleted_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_ticket_attachment_ticket_id ON ticket_attachment(ticket_id);
CREATE INDEX idx_ticket_attachment_message_id ON ticket_attachment(message_id);
```

### 3.2 Tabela `ticket_relation`

```sql
CREATE TABLE ticket_relation (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES ticket(id) ON DELETE CASCADE,
    related_ticket_id INTEGER REFERENCES ticket(id) ON DELETE CASCADE,
    
    -- Tipo de relação
    relation_type VARCHAR(50) NOT NULL,  -- 'duplicate', 'causes', 'caused_by', 'related', 'subticket', 'parent'
    
    -- Metadata
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(ticket_id, related_ticket_id, relation_type)
);

CREATE INDEX idx_ticket_relation_ticket_id ON ticket_relation(ticket_id);
CREATE INDEX idx_ticket_relation_related ON ticket_relation(related_ticket_id);
```

### 3.3 Tabela `ticket_assignment_log`

```sql
CREATE TABLE ticket_assignment_log (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES ticket(id) ON DELETE CASCADE,
    
    -- Quem foi atribuído
    assigned_to INTEGER REFERENCES users(id),
    assigned_from INTEGER REFERENCES users(id),  -- NULL se era "não atribuído"
    
    -- Motivo
    reason VARCHAR(50),  -- 'manual', 'auto', 'sla', 'round_robin', 'escalation'
    notes TEXT,
    
    -- Contexto
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)  -- pode ser sistema
);

CREATE INDEX idx_ticket_assignment_log_ticket_id ON ticket_assignment_log(ticket_id);
```

### 3.4 Tabela `ticket_audit_log` (Log unificado de alterações)

```sql
CREATE TABLE ticket_audit_log (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES ticket(id) ON DELETE CASCADE,
    
    -- Tipo de alteração
    action_type VARCHAR(50) NOT NULL,  -- ver lista abaixo
    
    -- Quem fez
    user_id INTEGER REFERENCES users(id),  -- NULL se sistema
    user_role VARCHAR(20),  -- 'customer', 'agent', 'admin', 'system'
    
    -- Detalhes (JSON)
    old_values JSONB,  -- valores anteriores
    new_values JSONB,  -- novos valores
    
    -- Contexto
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tipos de ação
-- 'created'
-- 'status_changed'
-- 'priority_changed'
-- 'category_changed'
-- 'assigned_to'
-- 'unassigned'
-- 'sla_updated'
-- 'attachment_added'
-- 'attachment_removed'
-- 'relation_added'
-- 'relation_removed'
-- 'ai_response_generated'
-- 'ai_response_approved'
-- 'ai_response_rejected'
-- 'ai_response_edited'
-- 'message_added'
-- 'note_added'
-- 'escalated'
-- 'closed'
-- 'reopened'

CREATE INDEX idx_ticket_audit_log_ticket_id ON ticket_audit_log(ticket_id);
CREATE INDEX idx_ticket_audit_log_action_type ON ticket_audit_log(action_type);
CREATE INDEX idx_ticket_audit_log_created_at ON ticket_audit_log(created_at);
```

---

## 4. API Endpoints

### 4.1 Ticket Detalhe

```
GET    /api/v1/tickets/{ticket_id}
GET    /api/v1/tickets/{ticket_id}/messages
GET    /api/v1/tickets/{ticket_id}/info
GET    /api/v1/tickets/{ticket_id}/audit-log
GET    /api/v1/tickets/{ticket_id}/related
```

### 4.2 Anexos

```
POST   /api/v1/tickets/{ticket_id}/attachments      # Upload
GET    /api/v1/tickets/{ticket_id}/attachments      # Lista
DELETE /api/v1/attachments/{attachment_id}           # Remove (soft delete)
GET    /api/v1/attachments/{attachment_id}/download   # Download
```

### 4.3 Associações

```
POST   /api/v1/tickets/{ticket_id}/relations
DELETE /api/v1/tickets/{ticket_id}/relations/{relation_id}
GET    /api/v1/tickets/{ticket_id}/relations/suggestions   # Sugere tickets relacionados
```

### 4.4 Atribuição

```
POST   /api/v1/tickets/{ticket_id}/assign
POST   /api/v1/tickets/{ticket_id}/unassign
GET    /api/v1/agents/available                         # Lista atendentes disponíveis
```

### 4.5 Audit Log

```
GET    /api/v1/tickets/{ticket_id}/audit-log
GET    /api/v1/tickets/{ticket_id}/audit-log/export    # Export CSV
```

---

## 5. Response Examples

### 5.1 GET /tickets/{id}

```json
{
  "id": 1234,
  "subject": "Erro 500 ao fazer login",
  "status": "open",
  "priority": "high",
  "category": {
    "id": 1,
    "name": "Suporte Técnico"
  },
  "assignee": {
    "id": 5,
    "name": "Maria Santos",
    "email": "maria@empresa.com",
    "avatar": "https://..."
  },
  "customer": {
    "id": 10,
    "name": "João Silva",
    "email": "joao.silva@empresa.com",
    "company": "Tech Solutions Ltda"
  },
  "created_at": "2026-04-21T14:30:00Z",
  "updated_at": "2026-04-21T15:00:00Z",
  "sla_due_at": "2026-04-22T14:30:00Z",
  "ai_response": {
    "id": 567,
    "status": "approved",
    "rating": 4,
    "generated_at": "2026-04-21T14:32:00Z"
  },
  "tags": ["login", "erro-500"],
  "unread_messages": 0
}
```

### 5.2 GET /tickets/{id}/messages

```json
{
  "messages": [
    {
      "id": 1001,
      "type": "customer",
      "content": "Estou tentando fazer login mas aparece erro 500...",
      "author": {
        "id": 10,
        "name": "João Silva",
        "role": "customer"
      },
      "attachments": [
        {
          "id": 1,
          "filename": "screenshot1.png",
          "file_size": 245000,
          "url": "/api/attachments/1/download"
        }
      ],
      "created_at": "2026-04-21T14:30:00Z"
    },
    {
      "id": 1002,
      "type": "ai_initial",
      "content": "Olá João! Identificamos que o erro 500...",
      "ai_response_id": 567,
      "author": {
        "id": null,
        "name": "IA (Aguardando aprovação)",
        "role": "ai"
      },
      "attachments": [],
      "created_at": "2026-04-21T14:32:00Z"
    },
    {
      "id": 1003,
      "type": "agent",
      "content": "Olá João! Realmente identificamos um problema...",
      "was_edited": false,
      "ai_response_id": null,
      "author": {
        "id": 5,
        "name": "Maria Santos",
        "role": "agent"
      },
      "attachments": [],
      "created_at": "2026-04-21T15:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 3,
    "has_more": false
  }
}
```

### 5.3 GET /tickets/{id}/audit-log

```json
{
  "audit_log": [
    {
      "id": 9001,
      "action_type": "status_changed",
      "user": {
        "id": 5,
        "name": "Maria Santos"
      },
      "old_values": {"status": "open"},
      "new_values": {"status": "pending_agent"},
      "created_at": "2026-04-21T15:00:00Z"
    },
    {
      "id": 9002,
      "action_type": "ai_response_approved",
      "user": {
        "id": 5,
        "name": "Maria Santos"
      },
      "old_values": null,
      "new_values": {
        "rating": 4,
        "feedback": "Boa resposta, seguiu o protocolo."
      },
      "created_at": "2026-04-21T14:35:00Z"
    },
    {
      "id": 9003,
      "action_type": "assigned_to",
      "user": null,
      "user_role": "system",
      "old_values": {"assigned_to": null},
      "new_values": {"assigned_to": {"id": 5, "name": "Maria Santos"}},
      "reason": "auto",
      "created_at": "2026-04-21T14:32:00Z"
    },
    {
      "id": 9004,
      "action_type": "priority_changed",
      "user": {
        "id": 5,
        "name": "Maria Santos"
      },
      "old_values": {"priority": "medium"},
      "new_values": {"priority": "high"},
      "created_at": "2026-04-21T14:33:00Z"
    },
    {
      "id": 9005,
      "action_type": "attachment_added",
      "user": {
        "id": 10,
        "name": "João Silva"
      },
      "new_values": {
        "filename": "screenshot1.png",
        "file_size": 245000
      },
      "created_at": "2026-04-21T14:30:00Z"
    },
    {
      "id": 9006,
      "action_type": "created",
      "user": {
        "id": 10,
        "name": "João Silva"
      },
      "new_values": {
        "channel": "website",
        "category": "Suporte Técnico"
      },
      "created_at": "2026-04-21T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 6,
    "has_more": false
  }
}
```

### 5.4 POST /tickets/{id}/attachments

```
Content-Type: multipart/form-data

file: [binary]
```

**Response:**
```json
{
  "id": 6,
  "filename": "novo_anexo.pdf",
  "original_filename": "documento_cliente.pdf",
  "file_size": 156000,
  "mime_type": "application/pdf",
  "url": "/api/attachments/6/download"
}
```

### 5.5 POST /tickets/{id}/relations

```json
{
  "related_ticket_id": 1230,
  "relation_type": "duplicate",
  "description": "Mesmo erro de login relatado por outro cliente"
}
```

**Response:**
```json
{
  "id": 1,
  "ticket_id": 1234,
  "related_ticket": {
    "id": 1230,
    "subject": "Problema similar de login",
    "status": "closed"
  },
  "relation_type": "duplicate",
  "created_at": "2026-04-21T15:10:00Z"
}
```

### 5.6 POST /tickets/{id}/assign

```json
{
  "user_id": 5,
  "reason": "manual",
  "notes": "Atribuído por ser especialista em autenticação"
}
```

---

## 6. Frontend - Componentes

### 6.1 Estrutura

```
frontend/app/(dashboard)/
├── tickets/
│   └── [id]/
│       └── page.tsx                    # Página principal com tabs
├── components/
│   ├── ticket/
│   │   ├── TicketDetail.tsx            # Componente principal
│   │   ├── TicketTabs.tsx              # Navegação de tabs
│   │   ├── TicketMessagesTab.tsx       # Tab: Mensagens
│   │   ├── TicketInfoTab.tsx           # Tab: Informações
│   │   ├── TicketAuditTab.tsx          # Tab: Alterações
│   │   ├── TicketRelatedTab.tsx        # Tab: Relacionados
│   │   ├── MessageThread.tsx            # Lista de mensagens
│   │   ├── MessageBubble.tsx           # Bolha de mensagem
│   │   ├── MessageComposer.tsx         # Composer de resposta
│   │   ├── AIResponseCard.tsx          # Card de resposta AI
│   │   ├── AttachmentList.tsx         # Lista de anexos
│   │   ├── AttachmentUpload.tsx       # Upload de anexos
│   │   ├── TicketAssignment.tsx        # Seleção de atendente
│   │   ├── TicketRelationModal.tsx     # Modal de associar ticket
│   │   └── AuditLogList.tsx           # Lista de log
```

### 6.2 Estado Local

```typescript
// useTicketDetail.ts
interface TicketDetailState {
  ticket: Ticket;
  activeTab: 'messages' | 'info' | 'audit' | 'related';
  
  // Messages
  messages: Message[];
  isLoadingMessages: boolean;
  newMessage: string;
  attachments: File[];
  
  // AI
  aiApprovalAction: 'approve' | 'reject' | 'edit' | null;
  
  // Relations
  showRelationModal: boolean;
  availableTickets: Ticket[];
  
  // Assignment
  showAssignmentDropdown: boolean;
  availableAgents: User[];
}
```

---

## 7. User Stories

### US-019: Visualizar histórico de mensagens
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

### US-020: Adicionar anexos ilimitados
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

### US-021: Associar tickets entre si
**Como** atendente/admin  
**Quero** associar tickets relacionados  
**Então** devo poder vincular tickets para facilitar o acompanhamento  

**Critérios de Aceite:**
- [ ] Pode associar ticket a outro existente
- [ ] Tipos de relação: Duplicado, Causa, Causado por, Relacionado, Subtarefa, Pai
- [ ] Pode adicionar descrição da relação
- [ ] Lista de tickets associados visível
- [ ] Sugestão automática de tickets relacionados (mesmo cliente, mesma categoria)
- [ ] Pode desassociar tickets
- [ ] Associação aparece no log de alterações

### US-022: Atribuir ticket a atendente
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

### US-023: Visualizar log de alterações
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

---

## 8. Plano de Implementação

| Tarefa | Prioridade | Estimativa |
|--------|------------|------------|
| Criar tabela `ticket_attachment` | Alta | 1h |
| Criar tabela `ticket_relation` | Alta | 1h |
| Criar tabela `ticket_assignment_log` | Alta | 1h |
| Criar/atualizar `ticket_audit_log` | Alta | 2h |
| Endpoint upload de anexos | Alta | 3h |
| CRUD de relações de tickets | Alta | 3h |
| CRUD de atribuição | Alta | 2h |
| Frontend: Layout com tabs | Alta | 3h |
| Frontend: Tab Mensagens | Alta | 4h |
| Frontend: Tab Informações | Média | 3h |
| Frontend: Tab Alterações (Audit) | Alta | 3h |
| Frontend: Tab Relacionados | Média | 3h |
| Frontend: Modal associar ticket | Média | 2h |
| Frontend: Dropdown atribuir | Média | 2h |
| Endpoint export audit log CSV | Média | 1h |
| Testes | Média | 4h |

---

**Documento criado:** `docs/spec-ticket-detail.md`
