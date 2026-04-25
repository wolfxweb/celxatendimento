# celx-atendimento - Especificação: Categorias e Upload Múltiplo de Anexos

**Versão:** 1.0
**Data:** 2026-04-25
**Módulo:** Categorias (Multi-tenant) e Anexos Múltiplos

---

## 1. Visão Geral

Este documento especifica dois recursos independentes porém relacionados ao fluxo de tickets:

1. **Categorias por Empresa** - CRUD completo de categorias onde cada empresa (company) gerencia suas próprias categorias para classificar tickets
2. **Upload Múltiplo de Anexos** - Permitir anexar múltiplos arquivos sem limite a um ticket,替代 o atual upload único

**Premissas:**
- Sistema multi-tenant: cada empresa (`company_id`) possui seus próprios dados isolados
- Categorias são usadas para classificar tickets e definir SLA
- Anexos são armazenados localmente em disco (configurável para S3 futuro)

---

## 2. Funcionalidade 1: Categorias por Empresa

### 2.1 Modelo de Dados

```
categories:
  - id: SERIAL PRIMARY KEY
  - company_id: INTEGER NOT NULL REFERENCES companies(id)
  - name: VARCHAR(100) NOT NULL
  - sla_minutes: INTEGER DEFAULT 1440 (24 horas)
  - is_active: BOOLEAN DEFAULT true
  - require_approval: BOOLEAN DEFAULT false
  - parent_category_id: INTEGER REFERENCES categories(id) NULL (hierarquia futura)
  - created_at: TIMESTAMP DEFAULT NOW()
  - updated_at: TIMESTAMP DEFAULT NOW()

  UNIQUE INDEX: (company_id, name)
  CHECK: sla_minutes > 0
```

### 2.2 Endpoints da API

#### GET /api/v1/categories/active
Retorna categorias ativas da empresa logada (otimizado para combo).

**Request:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "categories": [
    { "id": 1, "name": "Suporte Técnico" },
    { "id": 2, "name": "Financeiro" },
    { "id": 3, "name": "Comercial" }
  ]
}
```

**Regras:**
- Filtra por `company_id` do token JWT
- Filtra por `is_active = true`
- Ordena por `name` ASC

---

#### GET /api/v1/categories
Retorna TODAS categorias da empresa (ativas e inativas) para admin.

**Query params:**
- `include_inactive` (boolean, default false)

**Response 200:**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Suporte Técnico",
      "sla_minutes": 480,
      "is_active": true,
      "require_approval": false,
      "ticket_count": 15,
      "created_at": "2026-04-01T10:00:00Z"
    }
  ]
}
```

---

#### POST /api/v1/categories
Cria uma nova categoria para a empresa.

**Request Body:**
```json
{
  "name": "Suporte Técnico",
  "sla_minutes": 480,
  "require_approval": false
}
```

**Response 201:**
```json
{
  "id": 1,
  "name": "Suporte Técnico",
  "sla_minutes": 480,
  "is_active": true,
  "require_approval": false,
  "created_at": "2026-04-25T14:00:00Z"
}
```

**Erros:**
- 400: `name` vazio ou duplicado
- 401: Não autenticado

---

#### PATCH /api/v1/categories/{id}
Atualiza uma categoria existente.

**Request Body (campos opcionais):**
```json
{
  "name": "Suporte Técnico Atualizado",
  "sla_minutes": 720,
  "require_approval": true,
  "is_active": false
}
```

**Response 200:** Retorna categoria atualizada

**Erros:**
- 404: Categoria não encontrada ou pertence a outra empresa
- 400: `name` duplicado
- 409: Tentativa de inativar categoria em uso (existem tickets)

---

#### DELETE /api/v1/categories/{id}
Soft-delete: marca `is_active = false` com validação de uso.

**Response 204:** Sucesso sem conteúdo

**Erros:**
- 404: Categoria não encontrada
- 409: Categoria está em uso por tickets (não pode inativar)

---

### 2.3 Regras de Negócio

1. **Nome único por empresa:** Não pode existir duas categorias com mesmo `name` e `company_id`
2. **Inativação com proteção:** Se categoria tem tickets associados, não permite inativar (retorna 409). Admin deve remarcar tickets primeiro
3. **Contagem de tickets:** Ao listar categorias, incluir `ticket_count` para informar admin

---

## 3. Funcionalidade 2: Upload Múltiplo de Anexos

### 3.1 Modelo de Dados

```
ticket_attachments:
  - id: SERIAL PRIMARY KEY
  - ticket_id: INTEGER NOT NULL REFERENCES tickets(id)
  - filename: VARCHAR(255) NOT NULL
  - file_path: VARCHAR(500) NOT NULL
  - file_size: INTEGER NOT NULL (bytes)
  - mime_type: VARCHAR(100) NOT NULL
  - uploaded_by: INTEGER NOT NULL REFERENCES users(id)
  - created_at: TIMESTAMP DEFAULT NOW()
```

### 3.2 Endpoint da API

#### POST /api/v1/tickets/{ticket_id}/attachments
Upload de múltiplos arquivos para um ticket.

**Request:** `Content-Type: multipart/form-data`
```
files: <múltiplos arquivos>
```

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Regras:**
- Sem limite de quantidade de arquivos
- Tamanho máximo por arquivo: **10MB**
- Extensões permitidas: `.jpg`, `.jpeg`, `.png`, `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.txt`, `.zip`
- MIME types validados: `image/jpeg`, `image/png`, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `text/plain`, `application/zip`

**Response 201:**
```json
{
  "attachments": [
    {
      "id": 1,
      "filename": "screenshot.png",
      "file_size": 102400,
      "mime_type": "image/png"
    },
    {
      "id": 2,
      "filename": "erro.log",
      "file_size": 8192,
      "mime_type": "text/plain"
    }
  ]
}
```

**Erros:**
- 400: Arquivo excede 10MB, extensão não permitida, ou MIME inválido
- 404: Ticket não encontrado ou pertence a outra empresa
- 413: Payload muito grande (configuração do servidor)

---

#### GET /api/v1/tickets/{ticket_id}/attachments
Lista anexos de um ticket.

**Response 200:**
```json
{
  "attachments": [
    {
      "id": 1,
      "filename": "screenshot.png",
      "file_size": 102400,
      "mime_type": "image/png",
      "uploaded_by": { "id": 1, "name": "João Silva" },
      "created_at": "2026-04-25T14:30:00Z"
    }
  ]
}
```

---

#### DELETE /api/v1/tickets/{ticket_id}/attachments/{attachment_id}
Remove um anexo específico.

**Response 204:** Sucesso

**Regras:**
- Apenas usuário que fez upload OU admin da empresa pode deletar
- Remove arquivo físico do disco

---

### 3.3 Armazenamento

**Caminho de arquivos:**
```
/uploads/{company_id}/tickets/{ticket_id}/{filename}
```

**Configurações (config.py):**
```python
ATTACHMENTS_MAX_SIZE_MB = 10
ATTACHMENTS_ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".zip"]
ATTACHMENTS_UPLOAD_PATH = "./uploads"
```

---

## 4. Interface Frontend

### 4.1 Wireframe: Formulário de Ticket com Combo de Categorias

```
┌─ Criar Ticket ────────────────────────────────────────────────────────────┐
│                                                                             │
│  Assunto:  [___________________________________________________________]  │
│                                                                             │
│  Categoria: [▼ Selecione uma categoria            ]                      │
│              ┌─────────────────────────────────┐                           │
│              │ 🔍Buscar categoria...           │                           │
│              ├─────────────────────────────────┤                           │
│              │ ⚙️ Suporte Técnico          ▸   │  ← tem subcategorias      │
│              │ 💰 Financeiro                    │                           │
│              │ 📦 Comercial                     │                           │
│              │ ❓ Dúvidas Gerais                │                           │
│              └─────────────────────────────────┘                           │
│                                                                             │
│  Prioridade:  ○ Crítica  ● Alta  ○ Média  ○ Baixa                          │
│                                                                             │
│  Descrição:                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                                                                        │   │
│  │                                                                        │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  📎 Anexos:                                                                │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │  📄 contrato.pdf (2.3 MB)                      [✕]                 │   │
│  │  🖼️ screenshot.png (1.1 MB)                     [✕]                 │   │
│  │                                                                        │   │
│  │  [+ Adicionar mais arquivos]                                        │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                              [Cancelar]  [Criar Ticket]                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Wireframe: Lista de Categorias (Admin)

```
┌─ Categorias da Empresa ─────────────────────────────────────────────────┐
│                                                                             │
│  [+ Nova Categoria]                                          [🔍 Buscar] │
│                                                                             │
│  ┌─ Categoria ───────────────────────────────────────────────────────┐  │
│  │  ⚙️ Suporte Técnico                          🟢 Ativa              │  │
│  │  SLA: 8 horas  •  Tickets: 15  •  Aprovação: Não                   │  │
│  │                                                                    │  │
│  │  [✏️ Editar]  [⛔ Inativar]  [🔗 Subtemas (3)]                     │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ Categoria ───────────────────────────────────────────────────────┐  │
│  │  💰 Financeiro                                🔴 Inativa          │  │
│  │  SLA: 24 horas  •  Tickets: 0  •  Aprovação: Sim                  │  │
│  │                                                                    │  │
│  │  [✏️ Editar]  [✅ Ativar]  [🔗 Subtemas (0)]                       │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Wireframe: Modal de Edição de Categoria

```
┌─ Editar Categoria ──────────────────────────────────────────────────────┐
│                                                                             │
│  Nome:  [Suporte Técnico____________________________]                      │
│                                                                             │
│  SLA (minutos):  [480____]                                                │
│                  480 minutos = 8 horas                                     │
│                                                                             │
│  ☑ Exigir aprovação de IA para tickets desta categoria                     │
│                                                                             │
│  Status:  ● Ativa  ○ Inativa                                               │
│                                                                             │
│                                    [Cancelar]  [Salvar Alterações]         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Fluxo de Dados

### 5.1 Diagrama de Contexto - Categorias

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   Admin Empresa   │       │   Atendente      │       │   Cliente        │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                         │                         │
         │ CRUD Categorias         │ Lista Categorias        │ Lista Categorias
         ▼                         ▼                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         API /api/v1/categories                           │
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                   │
│  │   GET       │    │   POST      │    │   PATCH     │                   │
│  │ /active     │    │             │    │   /{id}     │                   │
│  └─────────────┘    └─────────────┘    └─────────────┘                   │
│                                                                          │
│  Filtragem por company_id do token JWT                                   │
└──────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   PostgreSQL          │
                    │   categories          │
                    │   (company_id)        │
                    └───────────────────────┘
```

### 5.2 Diagrama de Contexto - Anexos

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   Admin/Agente   │       │   Cliente        │       │   Sistema        │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                         │                         │
         │ Upload Anexos           │ Upload Anexos           │ Lista/Deleta
         ▼                         ▼                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│              POST /api/v1/tickets/{id}/attachments                       │
│              GET  /api/v1/tickets/{id}/attachments                       │
│              DELETE /api/v1/tickets/{id}/attachments/{id}                │
│                                                                          │
│  Validação: company_id do ticket = company_id do token                  │
│  Validação: extensão e tamanho do arquivo                               │
└──────────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
        ┌───────────────────┐   ┌───────────────────┐
        │   PostgreSQL      │   │   Sistema de      │
        │ ticket_attachments│   │   Arquivos        │
        │                   │   │   /uploads/       │
        └───────────────────┘   └───────────────────┘
```

---

## 6. Casos de Teste

### CT-001: Criar categoria com sucesso
**Given** usuário logado como admin da empresa
**When** POST /api/v1/categories com `{ "name": "Financeiro", "sla_minutes": 1440 }`
**Then** retorna 201 com categoria criada e `is_active=true`

### CT-002: Criar categoria com nome duplicado
**Given** existe categoria "Financeiro" para a empresa
**When** POST /api/v1/categories com `{ "name": "Financeiro" }`
**Then** retorna 400 com erro "Categoria já existe"

### CT-003: Listar categorias ativas
**Given** empresa tem 3 categorias (2 ativas, 1 inativa)
**When** GET /api/v1/categories/active
**Then** retorna array com apenas 2 categorias ativas, cada uma com `{ id, name }`

### CT-004: Inativar categoria sem tickets
**Given** categoria existe e não tem tickets associados
**When** PATCH /api/v1/categories/{id} com `{ "is_active": false }`
**Then** retorna 200, categoria marcada como inativa

### CT-005: Inativar categoria com tickets (bloqueio)
**Given** categoria tem 5 tickets associados
**When** PATCH /api/v1/categories/{id} com `{ "is_active": false }`
**Then** retorna 409 com erro "Categoria está em uso por 5 tickets"

### CT-006: Upload múltiplo com arquivos válidos
**Given** ticket existe para a empresa do usuário
**When** POST /api/v1/tickets/{id}/attachments com 3 arquivos válidos
**Then** retorna 201 com array de 3 anexos criados

### CT-007: Upload arquivo que excede limite
**Given** arquivo tem 15MB
**When** POST /api/v1/tickets/{id}/attachments
**Then** retorna 400 com erro "Arquivo contrato.pdf excede limite de 10MB"

### CT-008: Upload arquivo com extensão inválida
**Given** arquivo tem extensão .exe
**When** POST /api/v1/tickets/{id}/attachments
**Then** retorna 400 com erro "Extensão .exe não permitida"

### CT-009: Upload para ticket de outra empresa
**Given** ticket pertence à empresa B, usuário logado na empresa A
**When** POST /api/v1/tickets/{ticket_b_id}/attachments
**Then** retorna 404

### CT-010: Deletar anexo de outro usuário (não admin)
**Given** anexo foi enviado por usuário X, usuário logado é Y (não admin)
**When** DELETE /api/v1/tickets/{id}/attachments/{attachment_id}
**Then** retorna 403

---

## 7. Critérios de Aceitação

### Categorias
- [x] Admin pode criar categoria com nome, SLA e aprovação opcional
- [x] Admin pode editar categoria existente
- [x] Admin pode inativar categoria (se não estiver em uso)
- [x] Admin não pode inativar categoria com tickets associados
- [x] Nome da categoria é único por empresa
- [x] Combo de seleção só mostra categorias ativas
- [x] Combo retorna formato otimizado `{ id, name }`

### Upload Múltiplo
- [x] Usuário pode anexar múltiplos arquivos em um ticket
- [x] Não há limite de quantidade de arquivos
- [x] Cada arquivo pode ter até 10MB
- [x] Apenas extensões permitidas são aceitas
- [x] Arquivos são salvos no caminho correto `/uploads/{company_id}/tickets/{ticket_id}/`
- [x] Listagem de anexos mostra todos os arquivos do ticket
- [x] Usuário pode remover anexo (seu próprio ou se for admin)
- [x] Erro retornado indica arquivo específico quando múltiplos falham

---

## 8. Implementação

### Backend
| Arquivo | Descrição |
|---------|-----------|
| `app/api/v1/routes/categories.py` | Endpoints CRUD + `/active` |
| `app/api/v1/routes/attachments.py` | Upload múltiplo, GET, DELETE |
| `app/services/attachment_service.py` | Lógica de upload com transação |
| `app/schemas/ticket.py` | Schemas CategoryActiveResponse, AttachmentResponse, etc |

### Frontend
| Arquivo | Descrição |
|---------|-----------|
| `app/dashboard/cliente/tickets/novo/page.tsx` | Combo categorias + upload múltiplo |
| `app/dashboard/cliente/tickets/[id]/page.tsx` | Upload múltiplo no composer |
| `app/dashboard/admin/categorias/page.tsx` | CRUD categorias admin |
| `lib/api.ts` | Nova função `apiUpload` para multipart |

---

## 9. Dependências e工作量

| Item | Backend | Frontend | Complexidade |
|------|---------|----------|--------------|
| Endpoint GET categories/active | ✅ | - | Baixa |
| CRUD categorias completo | ✅ | ✅ | Média |
| Upload múltiplo backend | ✅ | - | Média |
| UI upload múltiplo | - | ✅ | Média |
| Listagem de anexos | ✅ | ✅ | Baixa |
| Página admin categorias | - | ✅ | Média |
| **Status** | **Completo** | **Completo** | - |

---

## 10. Observações Técnicas

1. **Validação de nome duplicado:** Usar `func.lower()` para case-insensitive
2. **Contagem de tickets:** Query separada para evitar lock: `SELECT COUNT(*) FROM tickets WHERE category_id = ?`
3. **Transação:** Upload múltiplo deve usar transação - se um arquivo falhar, nenhum é salvo
4. **Segurança:** Validar `company_id` em todas as operações
5. **Limpeza:** Considerar job Celery para deletar anexos órfãos (tickets deletados)
6. **Futuro:** Migrar armazenamento para S3/MinIO mantendo interface de arquivos locais