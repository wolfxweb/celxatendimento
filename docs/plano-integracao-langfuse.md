# Plano de Integração: Langfuse no celx-atendimento

**Opção adotada: Container separado na mesma rede**

---

## 1. Contexto

O sistema `celx-atendimento` utiliza LangChain/LangGraph para processamento de agentes de IA. Para **observabilidade, debugging e análise de traces**, vamos integrar o **Langfuse** como plataforma de monitoring.

Langfuse oferece:
- Visualização de traces de LLMs
- Análise de latência e custos
- Debug de agentes LangChain
- Monitoramento de prompts

---

## 2. Arquitetura

### 2.1 Diagrama de Serviços

```
┌─────────────────────────────────────────────────────────────────┐
│                     celx-network                                │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │postgres  │  │  redis   │  │ backend  │  │ frontend │        │
│  │:5432     │  │  :6379   │  │  :8000   │  │  :3000   │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘        │
│       │             │             │                            │
│       │    ┌────────┴────────┐     │                            │
│       │    │   langfuse      │◄────┘                            │
│       │    │   :3001        │                                  │
│       │    │                 │                                  │
│       │    │  ┌───────────┐  │                                  │
│       │    │  │ PostgreSQL│  │◄── Reutilizar postgres          │
│       │    │  │ (db lang) │  │                                  │
│       │    │  └───────────┘  │                                  │
│       │    │                 │                                  │
│       │    │  ┌───────────┐  │                                  │
│       │    │  │   Redis   │  │◄── Reutilizar redis             │
│       │    │  │ (cache)   │  │                                  │
│       │    │  └───────────┘  │                                  │
│       │    └─────────────────┘                                  │
│       └────────────────────────────                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Características

- **Container próprio**: `celx-langfuse`
- **Rede compartilhada**: `celx-network`
- **PostgreSQL dedicado**: banco `langfuse` separado
- **Redis**: reutiliza existente (canal 1)
- **Interface web**: porta 3001

---

## 3. Alterações Necessárias

### 3.1 docker-compose.yml

Adicionar serviço `langfuse` (após o serviço `celery` e antes do `frontend`):

```yaml
  # =====================================================
  # LANGFUSE (Observabilidade de LLMs)
  # =====================================================
  langfuse:
    image: langfuse/langfuse:latest
    container_name: celx-langfuse
    restart: unless-stopped
    environment:
      # Database - reutiliza postgres existente com banco langfuse
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-celx123456}@postgres:5432/langfuse
      # Redis - reutiliza redis existente (canal 1)
      REDIS_URL: redis://redis:6379/1
      # Configuração do servidor
      NEXTAUTH_URL: http://localhost:3001
      NEXTAUTH_SECRET: ${LANGFUSE_SECRET:-langfuse-secret-change-in-production}
      # Salt para hashing
      SALT: ${LANGFUSE_SALT:-langfuse-salt-change-in-production}
      # Telefone/email (opcional, para notificações)
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN:-}
    ports:
      - "${LANGFUSE_PORT:-3001}:3001"
    volumes:
      - langfuse_data:/app/data
    networks:
      - celx-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://localhost:3001/api/public/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 256M
```

Adicionar volume ao section `volumes`:

```yaml
volumes:
  # ... existentes ...
  langfuse_data:
```

### 3.2 backend/requirements.txt

**Adicionar** no final do arquivo (após Testing):

```
# Langfuse
langfuse>=2.0.0
```

### 3.3 .env.example

**Adicionar** após a seção LANGFUSE existente (linha 47):

```bash
# =====================================================
# LANGFUSE (Observabilidade)
# =====================================================
LANGFUSE_PORT=3001
LANGFUSE_SECRET=your-langfuse-secret-at-least-32-chars
LANGFUSE_SALT=your-langfuse-salt-32-caracteres
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_ENABLE=true
```

### 3.4 backend/app/config.py

**Modificar** para adicionar variáveis Langfuse:

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Langfuse
    LANGFUSE_HOST: str = "http://localhost:3001"
    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: str = ""
    LANGFUSE_ENABLE: bool = True

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.BACKEND_CORS_ORIGINS.split(",")
            if origin.strip()
        ]

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
```

### 3.5 backend/app/ai/callbacks.py (NOVO ARQUIVO)

**Criar** `backend/app/ai/callbacks.py`:

```python
"""
Langfuse callback handler for LangChain tracing
"""

from typing import Optional
from langfuse.callback import CallbackHandler
import os


def get_langfuse_handler() -> Optional[CallbackHandler]:
    """
    Retorna callback handler para Langfuse tracing.

    Returns None se LANGFUSE_ENABLE=false ou se as chaves não estão configuradas.
    """
    if os.getenv("LANGFUSE_ENABLE", "true").lower() != "true":
        return None

    public_key = os.getenv("LANGFUSE_PUBLIC_KEY", "")
    secret_key = os.getenv("LANGFUSE_SECRET_KEY", "")

    if not public_key or not secret_key:
        return None

    return CallbackHandler(
        public_key=public_key,
        secret_key=secret_key,
        host=os.getenv("LANGFUSE_HOST", "http://localhost:3001"),
    )


def get_langfuse_callbacks() -> list:
    """
    Retorna lista de callbacks para passar para LangChain.
    Se Langfuse não estiver configurado, retorna lista vazia.
    """
    handler = get_langfuse_handler()
    return [handler] if handler else []
```

### 3.6 backend/app/agents/langgraph/ticket_agent.py

**Modificar** a função `create_ticket_agent` para aceitar callbacks:

```python
# Adicionar parâmetro callbacks na função
def create_ticket_agent(
    api_key: str,
    model: str = "google/gemini-1.5-flash",
    temperature: float = 0.7,
    callbacks: list = None,  # NOVO
):
```

**Modificar** a chamada ao LLM em `generate_ai_response`:

```python
# Na função generate_ai_response, modificar:
# De:
response = await llm.ainvoke(prompt)
# Para:
response = await llm.ainvoke(prompt, config={"callbacks": callbacks} if callbacks else {})
```

**Modificar** `process_ticket` para aceitar e propagar callbacks:

```python
async def process_ticket(
    ticket_data: dict,
    ai_config: dict,
    api_key: str,
    callbacks: list = None,  # NOVO
) -> dict:
    # ... todo o código existente ...

    # Na criação do agent, passar callbacks
    result = await agent.ainvoke(initial_state, config={"callbacks": callbacks} if callbacks else {})
```

### 3.7 backend/app/services/ticket_ai_service.py

**Modificar** `_call_openrouter_chat` para suportar callbacks (opcional - para traces mais granulares):

```python
async def _call_openrouter_chat(
    api_key: str,
    model: str,
    temperature: float,
    prompt: str,
    callbacks: list = None,  # NOVO
) -> tuple[str, int]:
```

**Modificar** `generate_pending_ai_response` para criar e passar callbacks:

```python
# No início da função, importar e criar callbacks:
from app.ai.callbacks import get_langfuse_callbacks

# Na função, antes de chamar _call_openrouter_chat:
langfuse_callbacks = get_langfuse_callbacks()

# Passar callbacks para a função:
response_text, processing_time_ms = await _call_openrouter_chat(
    api_key=api_key,
    model=llm_model,
    temperature=ai_config.temperature,
    prompt=prompt,
    callbacks=langfuse_callbacks,  # NOVO
)
```

**Modificar** `_call_openrouter_chat` para usar callbacks na requisição httpx (opcional - Langfuse suporta via callback handler, não diretamente na httpx).

### 3.8 backend/app/tasks/celery_tasks.py

**Modificar** `generate_ai_response_async` para usar callbacks:

```python
async def generate_ai_response_async(ticket_id: str) -> dict:
    async with AsyncSessionLocal() as db:
        # ... código existente até antes de gerar resposta ...

        # NOVO: Importar e criar callbacks
        from app.ai.callbacks import get_langfuse_callbacks
        langfuse_callbacks = get_langfuse_callbacks()

        # Se usar o ticket_agent.py para processar:
        # from app.agents.langgraph.ticket_agent import process_ticket
        # result = await process_ticket(
        #     ticket_data=ticket_data,
        #     ai_config=config,
        #     api_key=api_key,
        #     callbacks=langfuse_callbacks,
        # )
```

### 3.9 backend/app/tasks/generate_ai_response.py

**Modificar** `generate_ai_response_task` para usar callbacks:

```python
async def generate_ai_response_task(
    db: AsyncSession,
    ticket_id: str,
) -> dict:
    # ... código existente ...

    # NOVO: Criar callbacks
    from app.ai.callbacks import get_langfuse_callbacks
    langfuse_callbacks = get_langfuse_callbacks()

    # Na chamada do process_ticket:
    result = await process_ticket(
        ticket_data=ticket_data,
        ai_config=config,
        api_key=ai_config.api_key_encrypted,
        callbacks=langfuse_callbacks,  # NOVO
    )
```

### 3.10 database/schema.sql

**Adicionar** no início do arquivo (antes da criação das tabelas do app):

```sql
-- Criar banco de dados para Langfuse (executar manualmente ou em script separado)
-- CREATE DATABASE langfuse;
```

Ou criar script separado `database/init-langfuse.sql`:

```sql
-- Script para criar banco Langfuse
-- Executar: docker exec -it celx-postgres psql -U postgres -f /path/to/init-langfuse.sql

CREATE DATABASE langfuse;
```

---

## 4. Passo a Passo de Implementação

### Fase 1: Infraestrutura

1. [ ] Fazer backup do `docker-compose.yml` atual
2. [ ] Adicionar serviço `langfuse` ao docker-compose
3. [ ] Adicionar volume `langfuse_data`
4. [ ] Criar banco de dados `langfuse` no PostgreSQL:
   ```bash
   docker exec -it celx-postgres psql -U postgres -c "CREATE DATABASE langfuse;"
   ```
5. [ ] Adicionar variáveis ao `.env`
6. [ ] Testar subir container: `docker-compose up -d langfuse`

### Fase 2: Backend Integration

1. [ ] Adicionar `langfuse>=2.0.0` ao requirements.txt
2. [ ] Criar `backend/app/ai/callbacks.py` com handler
3. [ ] Modificar `backend/app/config.py` para adicionar config Langfuse
4. [ ] Modificar `backend/app/agents/langgraph/ticket_agent.py` para aceitar callbacks
5. [ ] Modificar `backend/app/services/ticket_ai_service.py` para usar callbacks
6. [ ] Modificar `backend/app/tasks/generate_ai_response.py` para usar callbacks
7. [ ] Modificar `backend/app/tasks/celery_tasks.py` para usar callbacks (opcional)
8. [ ] Rebuild backend: `docker-compose build backend celery`
9. [ ] Reiniciar serviços: `docker-compose up -d`

### Fase 3: Configuração e Validação

1. [ ] Acessar Langfuse em `http://localhost:3001`
2. [ ] Criar primeira conta/admin
3. [ ] Gerar API keys em Settings > API Keys
4. [ ] Copiar Public Key e Secret Key
5. [ ] Atualizar `.env` com as chaves:
   ```
   LANGFUSE_PUBLIC_KEY=pk-lf-xxxxx
   LANGFUSE_SECRET_KEY=sk-lf-xxxxx
   ```
6. [ ] Reiniciar backend: `docker-compose restart backend`
7. [ ] Criar um ticket de teste e verificar se aparece no Langfuse

---

## 5. Fluxo de Integração

```
┌──────────────────────────────────────────────────────────────┐
│                    fluxo de traces                          │
└──────────────────────────────────────────────────────────────┘

  Ticket criado
       │
       ▼
┌──────────────────┐
│ celery_tasks.py  │──► trigger_ai_for_ticket()
│                  │              │
│ generate_ai_     │              ▼
│ response         │    ┌─────────────────────┐
└────────┬─────────┘    │ ticket_ai_service.py│
         │              │                     │
         ▼              │ _call_openrouter_   │
┌──────────────────┐    │ chat()              │
│ generate_ai_     │    │    │                │
│ response_task    │    │    ▼                │
│ (ticket_agent)   │    │ ┌──────────────────┐│
│                  │    │ │ httpx.AsyncClient││
│ process_ticket() │    │ │ POST /chat/      ││
│    │             │    │ │ completions      ││
│    ▼             │    │ └────────┬─────────┘│
│ ┌────────────┐   │    └──────────┼──────────┘
│ │create_     │   │               │
│ │ticket_agent│   │               ▼
│ └─────┬──────┘   │         OpenRouter API
│       │         │
│       ▼         │
│ ┌────────────┐   │
│ │ langgraph  │   │
│ │ workflow   │   │
│ └─────┬──────┘   │
│       │          ┌─────────────────────────┐
│       ▼          │ CALLBACKS (langfuse)     │
│ search_knowledge │                         │
│       │          │ get_langfuse_handler()  │
│       ▼          │    │                    │
│ generate_response│    │ trace              │
│       │          │    ▼                    │
│       ▼          │ ┌──────────────────┐  │
│ evaluate_conf    │ │ Langfuse Server   │  │
│       │          │ │ :3001            │  │
│       ▼          │ │                  │  │
│ route_response   │ │ • Traces          │  │
│       │          │ │ • Latency         │  │
│       ▼          │ │ • Costs           │  │
│ send_to_customer │ └──────────────────┘  │
└──────────────────┘                      │
                                          │
                   ┌──────────────────────┘
                   ▼
            ┌─────────────┐
            │ Langfuse UI │
            │ localhost   │
            │ :3001      │
            └─────────────┘
```

---

## 6. Endpoints e URLs

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Langfuse UI | http://localhost:3001 |
| PgAdmin | http://localhost:5050 |

---

## 7. Recursos

| Componente | Memória | CPU |
|------------|---------|-----|
| Langfuse | 512MB-1GB | Moderado |
| PostgreSQL | 256MB | Moderado |
| Redis | 64MB | Leve |

---

## 8. Arquivos a Modificar (Detalhado)

| Arquivo | Ação | Modificações |
|---------|------|--------------|
| `docker-compose.yml` | Modificar | Adicionar serviço `langfuse` e volume `langfuse_data` |
| `backend/requirements.txt` | Modificar | Adicionar `langfuse>=2.0.0` |
| `.env.example` | Modificar | Adicionar variáveis LANGFUSE_* |
| `backend/app/config.py` | Modificar | Adicionar variáveis `LANGFUSE_HOST`, `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_ENABLE` |
| `backend/app/ai/callbacks.py` | **Criar** | Novo arquivo com `get_langfuse_handler()` e `get_langfuse_callbacks()` |
| `backend/app/agents/langgraph/ticket_agent.py` | Modificar | Adicionar parâmetro `callbacks` em `create_ticket_agent()` e `process_ticket()`, passar para `llm.ainvoke()` |
| `backend/app/services/ticket_ai_service.py` | Modificar | Adicionar imports e uso de `get_langfuse_callbacks()`, passar callbacks |
| `backend/app/tasks/generate_ai_response.py` | Modificar | Adicionar imports e uso de callbacks |
| `backend/app/tasks/celery_tasks.py` | Modificar | Adicionar imports e uso de callbacks |
| `database/init-langfuse.sql` (opcional) | Criar | Script SQL para criar banco langfuse |

### Detalhamento por Arquivo

#### 1. docker-compose.yml
- Adicionar serviço `langfuse` após `celery`
- Adicionar volume `langfuse_data`
- Adicionar dependência do postgres e redis

#### 2. backend/requirements.txt
- Linha 61+ (após Testing): Adicionar `langfuse>=2.0.0`

#### 3. .env.example
- Após linha 47: Adicionar seção LANGFUSE completa

#### 4. backend/app/config.py
- Adicionar 4 novos atributos de classe
- `LANGFUSE_HOST`, `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_ENABLE`

#### 5. backend/app/ai/callbacks.py (NOVO)
- Função `get_langfuse_handler()` - retorna CallbackHandler ou None
- Função `get_langfuse_callbacks()` - retorna lista (vazia ou com handler)

#### 6. backend/app/agents/langgraph/ticket_agent.py
- Função `create_ticket_agent()`: adicionar `callbacks: list = None`
- Função `generate_ai_response()`: passar callbacks em `llm.ainvoke()`
- Função `process_ticket()`: adicionar `callbacks: list = None` e passar no `agent.ainvoke()`

#### 7. backend/app/services/ticket_ai_service.py
- Importar `get_langfuse_callbacks` de `app.ai.callbacks`
- Em `generate_pending_ai_response()`: chamar `get_langfuse_callbacks()` antes de `_call_openrouter_chat()`
- Passar callbacks via parâmetro (criar se não existir)

#### 8. backend/app/tasks/generate_ai_response.py
- Importar `get_langfuse_callbacks`
- Em `generate_ai_response_task()`: chamar `get_langfuse_callbacks()`
- Passar para `process_ticket()`

#### 9. backend/app/tasks/celery_tasks.py
- Importar `get_langfuse_callbacks`
- Em `generate_ai_response_async()`: chamar `get_langfuse_callbacks()`
- Passar callbacks onde gerar resposta de IA

---

## 9. Comandos Úteis

```bash
# Criar banco langfuse
docker exec -it celx-postgres psql -U postgres -c "CREATE DATABASE langfuse;"

# Ver logs do Langfuse
docker logs -f celx-langfuse

# Reiniciar só Langfuse
docker-compose restart langfuse

# Verificar se está rodando
curl http://localhost:3001/api/public/health

# Rebuild backend e celery
docker-compose build backend celery

# Subir tudo
docker-compose up -d

# Reiniciar backend
docker-compose restart backend

# Ver todos os containers
docker-compose ps

# Acessar container backend
docker exec -it celx-backend /bin/bash
```

---

## 10. Observações Importantes

1. **Banco dedicado**: Langfuse usa seu próprio banco `langfuse` (não compartilhar tabelas com app)

2. **Redis canal 1**: Langfuse usa canal 1 do Redis (`REDIS_URL: redis://redis:6379/1`) para não conflitar com o app

3. **Primeiro acesso**: Na primeira vez que acessar o Langfuse (http://localhost:3001), será pedido para criar usuário admin

4. **API Keys**: As chaves API são geradas pela UI do Langfuse em Settings > API Keys:
   - Public Key: `pk-lf-...` (usado no frontend/client)
   - Secret Key: `sk-lf-...` (usado no server/backend)

5. **Performance**: Langfuse pode adicionar 50-100ms de latência em cada chamada LLM. Para ambientes com alto volume, monitorar.

6. **Dados sensíveis**: Langfuse registra prompts e respostas. Verificar políticas de retenção de dados da empresa.

7. **Desabilitar**: Para ambientes de desenvolvimento sem Langfuse, setar `LANGFUSE_ENABLE=false`

8. **Sem Langfuse configurado**: Se as chaves não estiverem configuradas, o sistema continua funcionando normalmente (callbacks retornam None/lista vazia)

9. **Verbose mode**: Para debug, verificar logs do container `celx-langfuse`

---

## 11. Estrutura de Diretórios After Integration

```
backend/app/
├── agents/
│   └── langgraph/
│       └── ticket_agent.py        # MODIFICADO: callbacks
├── ai/
│   └── callbacks.py              # NOVO: langfuse handler
├── tasks/
│   ├── celery_tasks.py           # MODIFICADO: callbacks
│   └── generate_ai_response.py   # MODIFICADO: callbacks
├── services/
│   └── ticket_ai_service.py      # MODIFICADO: callbacks
├── config.py                     # MODIFICADO: langfuse config
└── ...
```