# 🧠 Sistema de Agentes Kilo Code (Orquestração e Memória)

Este diretório contém o cérebro, as habilidades e as personalidades dos agentes que constroem o projeto `celx-atendimento`. Em vez de usar uma IA genérica, o projeto utiliza um sistema de **Especialistas Orquestrados** com **Memória Persistente**.

---

## 🎭 1. Orquestração e Especialistas

Nós dividimos a IA em cargos específicos para evitar que ela gere "código espaguete" misturando React, Python e LangChain em uma única resposta.

### 👑 O Orquestrador (Tech Lead)
* **Arquivo:** `agent/developer.md`
* **Função:** É o arquiteto. Se você pedir "Crie um sistema de login", ele NÃO vai programar tudo. Ele vai desenhar os contratos (JSON), definir a arquitetura e orientar você a chamar os especialistas na ordem correta.

### 👷 Os Especialistas
1. **Engenheiro de IA (`agent/ai-engineer.md`):** Focado 100% no LangGraph, prompts, OpenRouter e buscas semânticas (pgvector).
2. **Back-end (`agent/back-end.md`):** Focado em criar rotas FastAPI limpas, autenticação e banco de dados.
3. **QA Backend (`agent/qa-api.md`):** Escreve testes rigorosos em Pytest para garantir a API.
4. **Front-end (`agent/front-end.md`):** Focado em componentes React, Next.js e TailwindCSS.
5. **QA Frontend (`agent/qa-frontend.md`):** Escreve testes visuais e de interação com Jest/React Testing Library.

**Fluxo de Trabalho Ideal:**
`Humano pede Feature -> Tech Lead arquiteta -> IA-Engineer faz lógica -> Back-end cria API -> QA-API testa API -> Front-end faz tela -> QA-Frontend testa Tela.`

---

## 💾 2. O Sistema de Memória

Para que os agentes não cometam o mesmo erro duas vezes e aprendam sobre o projeto enquanto programam, implementamos um sistema de longo prazo.

### Como funciona?
1. **O Gatilho:** Toda vez que um chat inicia, o arquivo `.kilo/rules.md` é lido invisivelmente. Ele tem uma regra rígida: *"Obrigue o agente a ler o arquivo `.kilo/memory.md` imediatamente"*.
2. **A Memória RAM:** O arquivo `.kilo/memory.md` contém decisões passadas, bugs resolvidos e novos padrões. A IA lê isso e já "entra no clima" do projeto.
3. **Escrita:** Quando vocês resolvem um problema complexo no chat, você (ou o próprio agente) aciona a skill `.kilo/skill/atualizar-memoria.md` para registrar o aprendizado no arquivo de memória com a data do dia.

### 🧹 Pruning (Poda Automática)
O limite de leitura da memória é de cerca de 150 linhas para não gastar muitos tokens e encarecer o uso da IA. 
A skill de memória ensina a IA a fazer a auto-limpeza: quando a memória fica muito cheia, a própria IA pega o conhecimento antigo consolidado, move para a pasta `/docs/` como documentação oficial do projeto e apaga as linhas da memória de curto prazo.

---

## 🛠️ 3. Skills (Habilidades)

Para manter a padronização do código, a pasta `skill/` contém "receitas de bolo" (SOPs - Standard Operating Procedures). 
Se o Tech Lead mandar o agente Front-end criar um componente, ele mandará o agente ler a skill `criar-componente-next.md` antes de começar, garantindo que o agente use Server Components e Tailwind corretamente.

---
**TL;DR para Desenvolvedores Humanos:**
Você tem um time. O `developer` é seu gerente de projeto. Os outros são os peões especializados. E todos eles leem o diário de bordo (`memory.md`) todo dia de manhã.
