# Regras e Contexto para o Agente Kilo Code

## 🎯 Contexto do Projeto
- **Nome:** celx-atendimento
- **Domínio:** Sistema SaaS de tickets de suporte com agentes de IA (resposta automática com aprovação humana).
- **Arquitetura Multi-tenant:** Cada empresa possui suas próprias configurações e chaves de API (OpenRouter) salvas no banco de dados. Nunca assuma chaves globais no `.env` para LLMs de clientes.

## 💻 Tech Stack
- **Backend:** Python, FastAPI, LangChain, LangGraph (Fluxos de IA), SQLAlchemy.
- **Banco de Dados:** PostgreSQL com a extensão `pgvector` (crucial para as buscas semânticas da IA).
- **Cache/Background:** Redis + Celery.
- **Frontend:** Next.js, React, TailwindCSS (App Router).
- **Infraestrutura:** Docker Compose (`postgres`, `redis`, `backend`, `frontend`, `pgadmin`, `langfuse`, `celery`).

## 🧠 Instruções de Memória e Aprendizado (Long-Term Memory)
- **LEITURA DA MEMÓRIA:** No início de qualquer tarefa nova ou chat, SEMPRE leia o arquivo `.kilo/memory.md` para resgatar os últimos aprendizados do projeto e não repetir erros passados.
- **Documentação de IA:** Antes de propor alterações na arquitetura de IA, leia `docs/spec-agent-ai.md`.
- **Atualização de Memória:** Sempre que uma decisão importante for tomada ou um bug for resolvido, use a skill definida em `.kilo/skill/atualizar-memoria.md` para registrar o aprendizado no arquivo `memory.md`.

## 🛠️ Regras de Desenvolvimento
### Geral
1. **Idioma:** Mantenha os comentários em código preferencialmente em português (ou conforme o padrão já estabelecido no arquivo), pois o foco do sistema (celx-atendimento) é o público brasileiro.
2. **Escopo:** Evite modificar arquivos fora do escopo imediato da tarefa. Não atualize dependências sem permissão explícita.
3. **Containers:** Lembre-se que as aplicações rodam dentro da rede docker `celx-network`. O frontend fala com a API via container, o backend fala com o DB via `postgres`, etc.

### Backend (Python/FastAPI)
1. Respeite o padrão de injeção de dependências do FastAPI.
2. Ao criar fluxos de IA com LangGraph, mantenha os nós pequenos e testáveis.
3. Sempre utilize tipagem rigorosa (Type Hints).
4. Gerencie migrações de banco usando Alembic (não faça `CREATE TABLE` diretamente na mão).
5. No módulo de empresas, `companies.id` é `integer` no PostgreSQL. Nunca converta `company_id` para UUID nas rotas, models, schemas ou queries.
6. A coluna `companies.status` é ENUM no PostgreSQL (`company_status`). Ao filtrar por query string, faça cast para string ou use tipagem compatível com o ENUM; não compare ENUM diretamente com `VARCHAR`.
7. O frontend chama alguns endpoints sem barra final, como `/api/v1/companies?status_filter=pending`. Como o FastAPI está com `redirect_slashes=False`, rotas de coleção usadas pelo frontend devem aceitar explicitamente a versão sem barra final quando necessário.

### Frontend (Next.js/React)
1. Use Server Components por padrão. Só utilize `'use client'` quando precisar de interatividade ou hooks.
2. Para estilização, mantenha-se restrito às classes utilitárias do TailwindCSS.
3. Tratamento de erros e estados de loading são obrigatórios ao consultar a API.
