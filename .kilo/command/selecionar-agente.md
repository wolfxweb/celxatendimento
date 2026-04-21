# Selecionar Agente

Seleciona um agente para atuar no projeto com base no perfil desejado.

## Agentes Disponíveis

| Perfil | Arquivo | Descrição |
|-------|--------|-----------|
| Product Manager | pm.md | Define escopo, User Stories e prioriza backlog |
| Desenvolvedor | developer.md | Implementa funcionalidades, escreve código e testes |
| Arquiteto de Software | architect.md | Define arquitetura, stack e padrões de projeto |

## Argumentos

- `agente`: Nome do perfil do agente (pm, developer, architect)
- `--list` ou `-l`: Lista todos os agentes disponíveis (use sem argumento)

## Exemplos

```
/selecionar-agente          # Lista todos os agentes
/selecionar-agente --list   # Lista todos os agentes
/selecionar-agente pm       # Carrega o agente PM
/selecionar-agente developer
/selecionar-agente architect
```