# celx-atendimento - Especificação: Atendente de IA

**Versão:** 1.0  
**Data:** 2026-04-21  
**Módulo:** Painel Atendente / Admin  

---

## 1. Visão Geral

O atendente de IA é totalmente configurável por empresa, permitindo personalização de prompts, ferramentas, modelos e credenciais de API.

---

## 2. Configurações do Agente

### 2.1 Tela de Configuração (`/admin/config-ia`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CONFIGURAÇÕES DO ATENDENTE DE IA DE IA                                          [X] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ Credenciais ────────────────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │  Provedor *        [OpenAI ▼]                                          │  │
│  │                                                                          │  │
│  │  Chave da API *    [sk-••••••••••••••••••••••••••••••••••]  [Testar]   │  │
│  │                                                                          │  │
│  │  ┌─ Status ───────────────────────────────────────────────────────┐  │  │
│  │  │  ✓ Chave válida  •  Limite: $100/mês  •  Usado: $23.45        │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                          │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ Modelo do Atendente (LLM) ──────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │  Modelo *           [gpt-4o ▼]                                           │  │
│  │                                                                          │  │
│  │  Temperatura        [━━━━━●━━━━━━━━━━━━] 0.7                            │  │
│  │  (0.0 = preciso, 2.0 = criativo)                                        │  │
│  │                                                                          │  │
│  │  Max Tokens         [━━━━━━━━●━━━━━━━] 2048                             │  │
│  │                                                                          │  │
│  │  ┌─ Modelos Disponíveis ───────────────────────────────────────────┐  │  │
│  │  │  OPENAI:     gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo     │  │  │
│  │  │  ANTHROPIC:  claude-3-5-sonnet, claude-3-opus, claude-3-haiku   │  │  │
│  │  │  LOCAL:      llama-3, mistral, codellama                          │  │  │
│  │  └───────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                          │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ Modelo RAG (Embeddings) ────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │  Modelo de Embedding * [text-embedding-3-small ▼]                     │  │
│  │                                                                          │  │
│  │  Dimensão          [1536] (automático)                                 │  │
│  │                                                                          │  │
│  │  ┌─ Modelos Disponíveis ───────────────────────────────────────────┐  │  │
│  │  │  OpenAI:      text-embedding-3-small, text-embedding-3-large   │  │  │
│  │  │                text-embedding-ada-002                            │  │  │
│  │  │  Cohere:      embed--multilingual-v3.0, embed-english-v3.0      │  │  │
│  │  └───────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                          │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ Prompt do Sistema ──────────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │  ┌─ Variáveis Disponíveis ────────────────────────────────────────┐  │  │
│  │  │  {company_name}  - Nome da empresa                               │  │  │
│  │  │  {category}      - Categoria do ticket                          │  │  │
│  │  │  {priority}      - Prioridade do ticket                          │  │  │
│  │  │  {rag_context}   - Contexto da base de conhecimento               │  │  │
│  │  │  {conversation}  - Histórico da conversa                          │  │  │
│  │  └───────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Você é um atendente de suporte da empresa {company_name}.           │  │  │
│  │  │                                                                  │  │  │
│  │  │ Sua função é auxiliar clientes respondendo suas dúvidas de      │  │  │
│  │  │ forma clara, objetiva e amigável.                               │  │  │
│  │  │                                                                  │  │  │
│  │  │ **Regras:**                                                     │  │  │
│  │  │ 1. Responda apenas com informações da base de conhecimento.       │  │  │
│  │  │ 2. Se não souber a resposta, escalone para um atendente humano.     │  │  │
│  │  │ 3. Seja cortês e profissional.                                    │  │  │
│  │  │ 4. Não invente informações.                                       │  │  │
│  │  │ 5. Formate a resposta com bullets quando aplicável.              │  │  │
│  │  │                                                                  │  │  │
│  │  │ **Base de Conhecimento:**                                        │  │  │
│  │  │ {rag_context}                                                    │  │  │
│  │  │                                                                  │  │  │
│  │  │ **Ticket do Cliente:**                                            │  │  │
│  │  │ - Assunto: {subject}                                             │  │  │
│  │  │ - Categoria: {category}                                          │  │  │
│  │  │ - Descrição: {description}                                       │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                          │  │
│  │  [Restaurar Prompt Padrão]                                             │  │
│  │                                                                          │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ Ferramentas do Atendente ───────────────────────────────────────────────┐  │
│  │                                                                          │  │
│  │  ┌─ Ferramentas Disponíveis ───────────────────────────────────────┐  │  │
│  │  │                                                                    │  │  │
│  │  │  [✓] 🔍 Busca na Base de Conhecimento                             │  │  │
│  │  │       Busca em documentos PDF e artigos da empresa                 │  │  │
│  │  │                                                                    │  │  │
│  │  │  [ ] 📊 Consulta Status do Pedido                                 │  │  │
│  │  │       Consulta status de pedidos (requer integração)              │  │  │
│  │  │                                                                    │  │  │
│  │  │  [ ] 💳 Consulta Fatura                                           │  │  │
│  │  │       Consulta informações de faturamento                          │  │  │
│  │  │                                                                    │  │  │
│  │  │  [ ] 🔄 Abertura de Ticket Internamente                           │  │  │
│  │  │       Cria tickets automaticamente para o setor certo               │  │  │
│  │  │                                                                    │  │  │
│  │  │  [ ] 📧 Envio de Email                                            │  │  │
│  │  │       Envia emails diretamente ao cliente                          │  │  │
│  │  │                                                                    │  │  │
│  │  │  [ ] 📋 Consulta CRM                                              │  │  │
│  │  │       Busca dados do cliente no CRM (requer integração)            │  │  │
│  │  │                                                                    │  │  │
│  │  └────────────────────────────────────────────────────────────────────│  │  │
│  │                                                                            │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ Nível de Autonomia ────────────────────────────────────────────────┐  │
│  │                                                                            │  │
│  │  (•) Baixo    - Todas respostas precisam de aprovação humana          │  │
│  │  ( ) Médio    - IA responde e notifica o atendente                        │  │
│  │  ( ) Alto     - IA responde direto (supervisão posterior)             │  │
│  │                                                                            │  │
│  │  ┌─ Avisos ─────────────────────────────────────────────────────────┐  │  │
│  │  │  ⚠️ Nível Alto: Todas as respostas são enviadas automaticamente.   │  │  │
│  │  │  ⚠️ Nível Médio: Agente é notificado, mas resposta já foi enviada.   │  │  │
│  │  │  ⚠️ Nível Baixo: Agente deve aprovar cada resposta antes do envio.   │  │  │
│  │  └────────────────────────────────────────────────────────────────────│  │  │
│  │                                                                            │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│                              [Cancelar]  [Salvar Configurações]             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Modelos de Dados

### 3.1 Tabela `ai_provider`

```sql
CREATE TABLE ai_provider (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,  -- 'openai', 'anthropic', 'cohere', 'local'
    display_name VARCHAR(100) NOT NULL,
    api_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed
INSERT INTO ai_provider (name, display_name, api_url) VALUES
('openai', 'OpenAI', 'https://api.openai.com/v1'),
('anthropic', 'Anthropic', 'https://api.anthropic.com/v1'),
('cohere', 'Cohere', 'https://api.cohere.ai/v1'),
('local', 'Local/Ollama', 'http://localhost:11434/v1');
```

### 3.2 Tabela `ai_model`

```sql
CREATE TABLE ai_model (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES ai_provider(id),
    name VARCHAR(100) NOT NULL,          -- 'gpt-4o', 'claude-3-5-sonnet'
    display_name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,            -- 'llm' ou 'embedding'
    max_tokens INTEGER,
    embedding_dimensions INTEGER,         -- NULL para LLM
    supports_function_calling BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id, name)
);

-- Seed LLM Models
INSERT INTO ai_model (provider_id, name, display_name, type, max_tokens, supports_function_calling) VALUES
(1, 'gpt-4o', 'GPT-4o', 'llm', 128000, TRUE),
(1, 'gpt-4o-mini', 'GPT-4o Mini', 'llm', 128000, TRUE),
(1, 'gpt-4-turbo', 'GPT-4 Turbo', 'llm', 128000, TRUE),
(1, 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'llm', 16385, TRUE),
(2, 'claude-3-5-sonnet', 'Claude 3.5 Sonnet', 'llm', 200000, TRUE),
(2, 'claude-3-opus', 'Claude 3 Opus', 'llm', 200000, TRUE),
(2, 'claude-3-haiku', 'Claude 3 Haiku', 'llm', 200000, FALSE);

-- Seed Embedding Models
INSERT INTO ai_model (provider_id, name, display_name, type, embedding_dimensions) VALUES
(1, 'text-embedding-3-small', 'Text Embedding 3 Small', 'embedding', 1536),
(1, 'text-embedding-3-large', 'Text Embedding 3 Large', 'embedding', 3072),
(1, 'text-embedding-ada-002', 'Text Embedding Ada v2', 'embedding', 1536),
(3, 'embed-multilingual-v3.0', 'Embed Multilingual v3', 'embedding', 1024),
(3, 'embed-english-v3.0', 'Embed English v3', 'embedding', 1024);
```

### 3.3 Tabela `company_ai_config`

```sql
CREATE TABLE company_ai_config (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES company(id) ON DELETE CASCADE,
    
    -- Provider & Credentials
    provider_id INTEGER REFERENCES ai_provider(id),
    api_key_encrypted TEXT,  -- criptografado com AES-256
    
    -- LLM Settings
    llm_model_id INTEGER REFERENCES ai_model(id),
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2048,
    
    -- RAG Settings
    embedding_model_id INTEGER REFERENCES ai_model(id),
    
    -- Prompt
    system_prompt TEXT NOT NULL,
    
    -- Tools
    tools JSONB DEFAULT '[]',  -- ["rag", "status_pedido", "consulta_fatura"]
    
    -- Autonomy
    autonomy_level VARCHAR(20) DEFAULT 'low',  -- 'low', 'medium', 'high'
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(company_id)
);
```

### 3.4 Tabela `ai_tool`

```sql
CREATE TABLE ai_tool (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,  -- 'rag', 'status_pedido', 'consulta_fatura'
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    requires_integration BOOLEAN DEFAULT FALSE,  -- TRUE se precisa de config extra
    integration_type VARCHAR(50),  -- 'crm', 'erp', 'ecommerce'
    schema_definition JSONB,  -- OpenAI function calling schema
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed
INSERT INTO ai_tool (name, display_name, description, icon, requires_integration, schema_definition) VALUES
('rag', 'Busca na Base de Conhecimento', 'Busca em documentos PDF e artigos da empresa', 'search', FALSE, NULL),
('status_pedido', 'Consulta Status do Pedido', 'Consulta status de pedidos do cliente', 'package', TRUE, '{"type": "function", "function": {"name": "consultar_status_pedido", "parameters": {"type": "object", "properties": {"pedido_id": {"type": "string", "description": "ID do pedido"}}, "required": ["pedido_id"]}}}'),
('consulta_fatura', 'Consulta Fatura', 'Consulta informações de faturamento', 'credit_card', TRUE, '{"type": "function", "function": {"name": "consultar_fatura", "parameters": {"type": "object", "properties": {"cliente_id": {"type": "string", "description": "ID do cliente"}}, "required": ["cliente_id"]}}}'),
('abrir_ticket', 'Abertura de Ticket Internamente', 'Cria tickets automaticamente para o setor certo', 'ticket', FALSE, '{"type": "function", "function": {"name": "abrir_ticket_interno", "parameters": {"type": "object", "properties": {"categoria": {"type": "string", "description": "Categoria do ticket"}}, "required": ["categoria"]}}}'),
('enviar_email', 'Envio de Email', 'Envia emails diretamente ao cliente', 'mail', FALSE, '{"type": "function", "function": {"name": "enviar_email", "parameters": {"type": "object", "properties": {"destinatario": {"type": "string", "description": "Email do destinatário"}, "assunto": {"type": "string", "description": "Assunto do email"}}, "required": ["destinatario", "assunto"]}}}'),
('consulta_crm', 'Consulta CRM', 'Busca dados do cliente no CRM', 'database', TRUE, '{"type": "function", "function": {"name": "consultar_crm", "parameters": {"type": "object", "properties": {"cliente_id": {"type": "string", "description": "ID do cliente no CRM"}}, "required": ["cliente_id"]}}}');
```

---

## 4. API Endpoints

### 4.1 Configurações

```
GET    /api/v1/companies/{company_id}/ai-config
POST   /api/v1/companies/{company_id}/ai-config
PUT    /api/v1/companies/{company_id}/ai-config
DELETE /api/v1/companies/{company_id}/ai-config
POST   /api/v1/companies/{company_id}/ai-config/test-api-key
```

**Request PUT:**
```json
{
  "provider_id": 1,
  "api_key": "sk-...",
  "llm_model_id": 1,
  "temperature": 0.7,
  "max_tokens": 2048,
  "embedding_model_id": 5,
  "system_prompt": "Você é um atendente de suporte...",
  "tools": ["rag", "abrir_ticket"],
  "autonomy_level": "low"
}
```

**Response:**
```json
{
  "id": 1,
  "provider": {
    "id": 1,
    "name": "openai",
    "display_name": "OpenAI"
  },
  "llm_model": {
    "id": 1,
    "name": "gpt-4o",
    "display_name": "GPT-4o"
  },
  "embedding_model": {
    "id": 5,
    "name": "text-embedding-3-small",
    "display_name": "Text Embedding 3 Small"
  },
  "temperature": 0.7,
  "max_tokens": 2048,
  "system_prompt": "...",
  "tools": [
    {"id": 1, "name": "rag", "display_name": "Busca na Base de Conhecimento", "enabled": true}
  ],
  "autonomy_level": "low",
  "api_key_status": {
    "valid": true,
    "limit": "100.00",
    "used": "23.45",
    "remaining": "76.55"
  }
}
```

### 4.2 Providers e Models

```
GET /api/v1/ai/providers
GET /api/v1/ai/providers/{provider_id}/models
GET /api/v1/ai/tools
```

---

## 5. Fluxo de Configuração

```
┌──────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE CONFIGURAÇÃO DO AGENTE                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  1. Admin acessa /admin/config-ia                                     │
│                              │                                         │
│                              ▼                                         │
│  2. Seleciona Provedor (OpenAI/Anthropic/etc)                        │
│                              │                                         │
│                              ▼                                         │
│  3. Insere e testa Chave da API                                       │
│     ┌─────────────────────────────────────────┐                        │
│     │ POST /test-api-key                      │                        │
│     │ → Valida chave                          │                        │
│     │ → Retorna uso atual e limites           │                        │
│     └─────────────────────────────────────────┘                        │
│                              │                                         │
│                              ▼                                         │
│  4. Seleciona Modelo LLM                                               │
│                              │                                         │
│                              ▼                                         │
│  5. Seleciona Modelo de Embedding                                     │
│                              │                                         │
│                              ▼                                         │
│  6. Customiza Prompt (opcional)                                        │
│     → Usa variáveis predefinidas                                      │
│     → Preview em tempo real                                           │
│                              │                                         │
│                              ▼                                         │
│  7. Seleciona Ferramentas                                             │
│     → RAG (obrigatório se usar base de conhecimento)                 │
│     → Outras ferramentas opcionais                                    │
│     → Configura integrações se necessário                              │
│                              │                                         │
│                              ▼                                         │
│  8. Define Nível de Autonomia                                         │
│                              │                                         │
│                              ▼                                         │
│  9. SALVAR                                                             │
│     → Criptografa API Key (AES-256)                                   │
│     → Salva config no banco                                           │
│     → Disponibiliza para LangGraph                                    │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 6. Integração LangGraph

### 6.1 Config Provider

```python
# backend/app/agents/config.py
from typing import Optional
from pydantic import BaseModel

class AgentConfig(BaseModel):
    company_id: int
    provider: str                    # 'openai', 'anthropic', etc
    api_key: str                      # descriptografada
    llm_model: str                    # 'gpt-4o', 'claude-3-5-sonnet'
    embedding_model: str               # 'text-embedding-3-small'
    temperature: float = 0.7
    max_tokens: int = 2048
    system_prompt: str
    tools: list[str]                  # ['rag', 'status_pedido']
    autonomy_level: str               # 'low', 'medium', 'high'

def get_agent_config(company_id: int) -> AgentConfig:
    """Carrega configuração do banco e retorna AgentConfig"""
```

### 6.2 Factory de LLMs

```python
# backend/app/agents/llm_factory.py
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

def get_llm(config: AgentConfig):
    if config.provider == 'openai':
        return ChatOpenAI(
            model=config.llm_model,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
            api_key=config.api_key
        )
    elif config.provider == 'anthropic':
        return ChatAnthropic(
            model=config.llm_model,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
            api_key=config.api_key
        )
    # ... outros providers

def get_embedding_model(config: AgentConfig):
    if config.provider == 'openai':
        return OpenAIEmbeddings(
            model=config.embedding_model,
            api_key=config.api_key
        )
    # ... outros providers
```

### 6.3 Ferramentas (Tools)

```python
# backend/app/agents/tools/
from langchain.tools import tool
from langchain.agents import Tool

@tool
def busca_base_conhecimento(query: str, company_id: int) -> str:
    """Busca na base de conhecimento da empresa."""
    # Implementação RAG
    docs = rag_service.similarity_search(
        query=query,
        company_id=company_id,
        top_k=5
    )
    return "\n\n".join([doc.content for doc in docs])

@tool
def abrir_ticket_interno(categoria: str, descricao: str, company_id: int) -> str:
    """Abre um ticket interno no sistema."""
    ticket = ticket_service.create(
        company_id=company_id,
        category=categoria,
        description=descricao,
        is_internal=True
    )
    return f"Ticket #{ticket.id} criado com sucesso."

def get_tools(enabled_tools: list[str], config: AgentConfig) -> list[Tool]:
    """Retorna lista de tools habilitadas."""
    all_tools = {
        'rag': Tool(
            name="busca_base_conhecimento",
            func=busca_base_conhecimento,
            description="Busca na base de conhecimento da empresa para responder dúvidas."
        ),
        'abrir_ticket': Tool(
            name="abrir_ticket_interno",
            func=abrir_ticket_interno,
            description="Abre um ticket interno quando o problema requer atenção humana."
        ),
        # ... outras tools
    }
    
    return [all_tools[t] for t in enabled_tools if t in all_tools]
```

---

## 7. Segurança

### 7.1 Criptografia da API Key

```python
# backend/app/core/security.py
from cryptography.fernet import Fernet
from base64 import b64decode

class APIKeyManager:
    def __init__(self):
        # Chave lida de variável de ambiente
        self.cipher = Fernet(settings.ENCRYPTION_KEY)
    
    def encrypt(self, api_key: str) -> str:
        return self.cipher.encrypt(api_key.encode()).decode()
    
    def decrypt(self, encrypted: str) -> str:
        return self.cipher.decrypt(encrypted.encode()).decode()
```

### 7.2 Validação de API Key

```python
# Testa chave com chamada leve à API
async def test_api_key(provider: str, api_key: str) -> dict:
    if provider == 'openai':
        client = OpenAI(api_key=api_key)
        usage = client.usage.fetch()  # Não existe, usar list()
        # Alternativa: fazer chamada simples
        models = client.models.list()
        return {"valid": True}
    # ...
```

---

## 8. Frontend - Componentes

### 8.1 Estrutura de Pastas

```
frontend/components/
├── admin/
│   └── ai-config/
│       ├── AIConfigForm.tsx       # Form principal
│       ├── ProviderSelector.tsx  # Seletor de provedor
│       ├── APIKeyInput.tsx        # Input com teste
│       ├── ModelSelector.tsx      # Seletor de modelo
│       ├── PromptEditor.tsx       # Editor de prompt
│       ├── ToolSelector.tsx       # Seletor de ferramentas
│       ├── AutonomySelector.tsx   # Nível de autonomia
│       └── TokenUsageChart.tsx    # Gráfico de uso
```

---

## 9. User Stories

### US-009: Admin configura API do Agente
**Como** admin da empresa  
**Quero** inserir minha própria chave de API (OpenAI/Anthropic)  
**Então** o sistema deve usar minha chave para as chamadas de IA  

**Critérios de Aceite:**
- [ ] Admin pode selecionar provedor (OpenAI, Anthropic, Cohere, Local)
- [ ] Admin pode inserir e salvar chave de API (criptografada)
- [ ] Admin pode testar chave de API (valida e mostra uso)
- [ ] Sistema rejeita chave inválida com mensagem clara

### US-010: Admin seleciona modelos
**Como** admin da empresa  
**Quero** escolher quais modelos usar para LLM e embeddings  
**Então** devo poder selecionar de uma lista de modelos disponíveis  

**Critérios de Aceite:**
- [ ] Dropdown com modelos LLM do provedor selecionado
- [ ] Dropdown com modelos de embedding do provedor
- [ ] Exibição de características (max tokens, dimensões)
- [ ] Modelos ordenados por popularidade/recomendação

### US-011: Admin customiza prompt
**Como** admin da empresa  
**Quero** personalizar o prompt do atendente de IA  
**Então** devo poder editar o texto com variáveis disponíveis  

**Critérios de Aceite:**
- [ ] Editor de texto com syntax highlighting
- [ ] Lista de variáveis disponíveis ({company_name}, {rag_context}, etc)
- [ ] Botão para restaurar prompt padrão
- [ ] Preview do prompt renderizado

### US-012: Admin associa ferramentas
**Como** admin da empresa  
**Quero** habilitar/desabilitar ferramentas para o atendente  
**Então** o atendente deve poder usar apenas as ferramentas selecionadas  

**Critérios de Aceite:**
- [ ] Lista de ferramentas com checkboxes
- [ ] Descrição de cada ferramenta
- [ ] Indicação de ferramentas que requerem integração
- [ ] Ferramenta "Busca RAG" ativada por padrão

### US-013: Admin define nível de autonomia
**Como** admin da empresa  
**Quero** definir como o atendente de IA responde tickets  
**Então** devo poder escolher entre aprovação obrigatória ou automática  

**Critérios de Aceite:**
- [ ] Radio buttons para nível de autonomia
- [ ] Explicação clara de cada nível
- [ ] Aviso de segurança ao selecionar nível alto
- [ ] Nível "Baixo" é o padrão

---

## 10. Telas

### 10.1 Página de Configuração

```
/admin/config-ia
```

Visual conforme wireframe na seção 2.1.

### 10.2 Tela de Teste de API

```
Modal ao clicar em "Testar" após inserir chave
```

```
┌─────────────────────────────────────────────────────────────────┐
│  TESTAR CONEXÃO                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Provedor:    OpenAI                                                │
│  Chave:       sk-••••••••••••••••••••••••••••••••••              │
│                                                                      │
│  ┌─ Status ────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │  🔄 Testando conexão...                                         │  │
│  │                                                                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│                              [Fechar]                                │
└─────────────────────────────────────────────────────────────────────┘
```

Após sucesso:
```
┌─ Status ────────────────────────────────────────────────────┐
│                                                              │
│  ✓ Conexão estabelecida com sucesso!                        │
│                                                              │
│  📊 Uso da API (mês atual):                                  │
│  │  ████████████░░░░░░░░░░░░░░░░░░░  $23.45 / $100.00        │
│                                                              │
│  💰 Limite restante: $76.55                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Após erro:
```
┌─ Status ────────────────────────────────────────────────────┐
│                                                              │
│  ✗ Erro ao conectar                                          │
│                                                              │
│  🔴 Chave de API inválida ou expirada.                       │
│     Verifique sua chave em platform.openai.com/api-keys     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. Plano de Implementação

| Tarefa | Prioridade | Estimativa |
|--------|------------|------------|
| Criar tabelas `ai_provider`, `ai_model`, `ai_tool` | Alta | 2h |
| Criar tabela `company_ai_config` | Alta | 1h |
| Seed de providers, models e tools | Alta | 1h |
| Endpoint CRUD config + encrypt/decrypt | Alta | 4h |
| Endpoint test-api-key | Alta | 2h |
| Frontend: ProviderSelector | Média | 2h |
| Frontend: APIKeyInput com teste | Média | 3h |
| Frontend: ModelSelector | Média | 2h |
| Frontend: PromptEditor | Média | 3h |
| Frontend: ToolSelector | Média | 2h |
| Frontend: AutonomySelector | Média | 1h |
| Frontend: AIConfigForm completo | Média | 4h |
| Integrar LangGraph com config do banco | Alta | 4h |
| Testes unitários | Média | 4h |

---

**Documento criado:** `docs/spec-agent-ai.md`
