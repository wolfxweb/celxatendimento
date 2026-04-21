#!/bin/bash

AGENTE="$1"
AGENTS_DIR=".kilo/../agents"

list_agents() {
  echo "Agentes disponíveis:"
  echo ""
  echo "  pm           - Product Manager (cria PRD, User Stories, prioriza backlog)"
  echo "  developer    - Desenvolvedor (implementa código e testes)"
  echo "  architect   - Arquiteto de Software (define arquitetura e stack)"
  echo ""
  echo "Uso: /selecionar-agente [agente]"
  echo "     Use sem argumento para listar todos"
}

if [ -z "$AGENTE" ] || [ "$AGENTE" = "--list" ] || [ "$AGENTE" = "-l" ]; then
  list_agents
  exit 0
fi

case "$AGENTE" in
  pm)
    AGENT_FILE="$AGENTS_DIR/pm.md"
    ;;
  developer|desenvolvedor)
    AGENT_FILE="$AGENTS_DIR/developer.md"
    ;;
  architect|arquiteto)
    AGENT_FILE="$AGENTS_DIR/architect.md"
    ;;
  *)
    echo "Agente inválido: $AGENTE"
    echo ""
    list_agents
    exit 1
    ;;
esac

if [ -f "$AGENT_FILE" ]; then
  cat "$AGENT_FILE"
else
  echo "Arquivo de agente não encontrado: $AGENT_FILE"
  exit 1
fi