# Skill: Atualizar a Memória do Agente

## Descrição
Use esta habilidade **sempre** que você resolver um problema difícil, debugar um erro obscuro, tomar uma decisão de arquitetura importante (ex: mudar um banco, adicionar uma lib nova) ou quando o usuário pedir explicitamente para "memorizar isso".

## Passos para Execução
1. **Leia a memória atual:** Faça a leitura do arquivo `.kilo/memory.md` para não duplicar informações que já estão lá.
2. **Formate o aprendizado:** Crie um pequeno bloco de texto contendo:
   - A data da decisão (YYYY-MM-DD).
   - Um título curto.
   - Uma explicação clara e objetiva do que foi decidido ou do problema que foi resolvido (para que o seu "eu do futuro" entenda rapidamente).
3. **Escreva no arquivo:** Adicione essa nova entrada no final do arquivo `.kilo/memory.md` (sob a seção de "Novos aprendizados").
4. **Comunique:** Avise o usuário: *"Registrei esse aprendizado na memória do projeto (`.kilo/memory.md`) para não esquecermos no futuro."*

## Exemplo de Entrada na Memória
```markdown
### [2026-04-22] Erro de CORS no Next.js com FastAPI
- **Contexto:** Estava ocorrendo erro de CORS no login.
- **Decisão:** A rota de login no FastAPI precisa incluir o IP/Porta do frontend explicitamente na lista de `allow_origins` do middleware CORS no `main.py`. Não usar `*` em produção.
```

## 🧹 Autogerenciamento e Poda (Pruning)
O LLM possui um limite de contexto (Tokens). Se este arquivo `.kilo/memory.md` passar de **150 linhas**, a IA começará a ficar cara e lenta. 
Portanto, o agente que estiver lendo/atualizando a memória DEVE ter a proatividade de fazer a poda:
1. **Identifique conhecimentos solidificados:** Se uma regra na memória já virou o padrão do projeto e o código base já a reflete perfeitamente, apague-a da memória.
2. **Arquivamento em Docs:** Se houver 3 ou mais itens sobre "Arquitetura do Banco", consolide-os em um documento definitivo na pasta `docs/` (ex: `docs/arquitetura-db.md`) e remova-os desta memória de curto prazo.
3. **Avise o usuário:** Se você fizer a poda, informe: *"Notei que a memória estava ficando longa, então arquivei as decisões mais antigas na pasta `docs/` para economizar seus tokens."*
