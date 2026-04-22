# Skill: Criar Componente Next.js (App Router)

## Descrição
Use esta habilidade quando o usuário pedir para criar um novo componente visual no Frontend (Next.js).

## Passos para Execução
1. **Localização**: Identifique se o componente é de uso global (deve ir para `frontend/components/`) ou específico de uma tela (deve ir junto à rota em `frontend/app/...`).
2. **Server vs Client**:
   - Por padrão, crie **Server Components** (não adicione nenhuma diretiva no topo).
   - Apenas adicione `"use client";` no topo do arquivo se o componente precisar de `useState`, `useEffect`, ou escutar eventos do DOM (como `onClick`).
3. **Estilização**:
   - Use apenas classes utilitárias do TailwindCSS.
   - Não crie arquivos `.css` ou `.module.css` a menos que seja estritamente necessário para animações complexas não suportadas pelo Tailwind.
4. **Integração com API**:
   - Se o componente precisar buscar dados (fetch), faça a chamada do lado do servidor (no Server Component) passando os dados como `props` para o Client Component (se houver interatividade).
   - Lide com o carregamento (loading.tsx) e erros (error.tsx) usando os padrões do Next.js App Router.
5. **Componentes de UI**: Verifique se o projeto já possui uma biblioteca de componentes base (como shadcn/ui ou Radix) antes de criar botões ou modais do zero.
