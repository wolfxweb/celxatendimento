# Memória do Agente (Log de Aprendizado e Decisões)

> **ATENÇÃO AGENTES:** Este arquivo é o "cérebro de longo prazo" do projeto. Sempre que vocês tomarem uma decisão de arquitetura importante, resolverem um bug complexo ou definirem um novo padrão que não estava nas regras, vocês **DEVEM** documentar isso aqui usando a skill `atualizar-memoria.md`.

## 📌 Padrões e Decisões Registradas

### [2026-04-21] Estrutura de Agentes Kilo Code
- O projeto adotou uma estrutura de agentes especialistas (`ai-engineer`, `front-end`, `back-end`) orquestrados pelo `developer` (Tech Lead).
- **Ação futura:** Sempre que iniciar uma tarefa complexa, o orquestrador deve dividir o escopo entre os especialistas em vez de tentar resolver tudo em um único arquivo.

*(Novos aprendizados devem ser adicionados abaixo desta linha)*

### [2026-04-25] Rotas de empresas usam ID inteiro, não UUID
- **Contexto:** A tela "Gerenciar Empresas" chamava `/api/v1/companies?status_filter=pending` e recebeu 404/500. O backend só aceitava `/companies/`, tentava converter `company_id` para UUID e comparava o ENUM `company_status` com `VARCHAR`.
- **Decisão:** `companies.id` é `integer` no PostgreSQL. Nunca usar `uuid.UUID(company_id)` nas rotas de empresas. Como `redirect_slashes=False`, endpoints chamados sem barra final pelo frontend precisam existir sem barra. Para filtros em `companies.status`, usar cast para string ou tipo compatível com o ENUM.

### [2026-04-25] Rotas estáticas antes de rotas dinâmicas no FastAPI
- **Contexto:** A tela de tickets chamava `/api/v1/tickets` e `/api/v1/tickets/ai/stats`. A coleção sem barra retornava 404 e `/tickets/ai/stats` podia cair em `/{ticket_id}` porque a rota dinâmica vinha antes.
- **Decisão:** Rotas de coleção usadas sem barra pelo frontend devem ter alias sem barra. Rotas específicas como `/ai/stats` devem ser declaradas antes de `/{ticket_id}` para não serem capturadas como ID.
