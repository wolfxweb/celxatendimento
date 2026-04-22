#!/bin/bash
# =====================================================
# celx-atendimento - Deploy Script (Production)
# =====================================================

set -e

echo "=========================================="
echo "  CELX-ATENDIMENTO DEPLOY"
echo "  $(date)"
echo "=========================================="

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificar Docker
check_docker() {
    log_info "Verificando Docker..."
    if ! command -v docker &> /dev/null; then
        log_error "Docker não encontrado. Instale o Docker primeiro."
        exit 1
    fi
    if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose não encontrado. Instale o Docker Compose primeiro."
        exit 1
    fi
    log_info "Docker OK"
}

# Criar arquivos .env se não existirem
create_env_files() {
    log_info "Verificando arquivos de ambiente..."
    
    # Backend .env
    if [ ! -f backend/.env ]; then
        log_warn "Criando backend/.env..."
        cp backend/.env.example backend/.env
    else
        log_info "backend/.env já existe"
    fi
    
    # Frontend .env
    if [ ! -f frontend/.env ]; then
        log_warn "Criando frontend/.env..."
        cp frontend/.env.example frontend/.env
    else
        log_info "frontend/.env já existe"
    fi
}

# Docker Compose command (supports both v1 and v2)
DOCKER_COMPOSE="docker compose"

# Pull de imagens base
pull_images() {
    log_info "Atualizando imagens base..."
    docker pull node:20-alpine
    docker pull postgres:16
    docker pull redis:7-alpine
    docker pull dpage/pgadmin4:latest
}

# Build das imagens Docker
build_images() {
    log_step "Construindo imagem do backend..."
    $DOCKER_COMPOSE build backend
    
    log_step "Construindo imagem do frontend..."
    $DOCKER_COMPOSE build frontend
    
    log_step "Construindo imagem do celery..."
    $DOCKER_COMPOSE build celery
}

# Deploy completo
deploy() {
    log_info "Iniciando deploy completo..."
    
    # Verificar Docker
    check_docker
    
    # Criar arquivos de ambiente
    create_env_files
    
    # Pull imagens base
    pull_images
    
    # Build das imagens
    build_images
    
    # Subir serviços
    log_info "Subindo serviços..."
    $DOCKER_COMPOSE up -d
    
    # Aguardar serviços
    log_info "Aguardando serviços ficarem prontos..."
    sleep 10
    
    # Verificar status
    status
}

# Rebuild (sem cache)
rebuild() {
    log_warn "Rebuild sem cache (pode demorar)..."
    
    check_docker
    create_env_files
    
    log_step "Removendo imagens antigas..."
    $DOCKER_COMPOSE build --no-cache backend
    $DOCKER_COMPOSE build --no-cache frontend
    $DOCKER_COMPOSE build --no-cache celery
    
    log_info "Rebuild completo! Subindo serviços..."
    $DOCKER_COMPOSE up -d
    status
}

# Status dos serviços
status() {
    echo ""
    log_info "Status dos serviços:"
    echo ""
    $DOCKER_COMPOSE ps
    echo ""
    log_info "Portas expostas:"
    echo "  Frontend:  http://localhost:3000"
    echo "  Backend:   http://localhost:8000"
    echo "  API Docs:  http://localhost:8000/docs"
    echo "  PGAdmin:   http://localhost:5050"
    echo "  Redis:     localhost:6379"
    echo "  Postgres:  localhost:5432"
    echo ""
}

# Logs
logs() {
    if [ -z "${2:-}" ]; then
        echo "Logs de todos os serviços (Ctrl+C para sair):"
        $DOCKER_COMPOSE logs -f
    else
        echo "Logs do serviço: $2 (Ctrl+C para sair):"
        $DOCKER_COMPOSE logs -f $2
    fi
}

# Parar serviços
stop() {
    log_info "Parando serviços..."
    $DOCKER_COMPOSE down
}

# Restart
restart() {
    log_info "Reiniciando serviços..."
    $DOCKER_COMPOSE restart
}

# Rebuild only frontend
rebuild_frontend() {
    log_step "Rebuild apenas do frontend..."
    $DOCKER_COMPOSE build --no-cache frontend
    $DOCKER_COMPOSE up -d frontend
    status
}

# Health check
health() {
    log_info "Verificando saúde dos serviços..."
    echo ""
    
    # Frontend
    if curl -sf http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Frontend (Next.js) - OK"
    else
        echo -e "${RED}✗${NC} Frontend (Next.js) - FALHOU"
    fi
    
    # Backend
    if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend (FastAPI) - OK"
    else
        echo -e "${RED}✗${NC} Backend (FastAPI) - FALHOU"
    fi
    
    # Postgres
    if docker exec celx-postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} PostgreSQL - OK"
    else
        echo -e "${RED}✗${NC} PostgreSQL - FALHOU"
    fi
    
    # Redis
    if docker exec celx-redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Redis - OK"
    else
        echo -e "${RED}✗${NC} Redis - FALHOU"
    fi
    
    echo ""
}

# Menu
show_menu() {
    echo ""
    echo "╔═══════════════════════════════════════════╗"
    echo "║   CELX-ATENDIMENTO - Deploy Commands     ║"
    echo "╠═══════════════════════════════════════════╣"
    echo "║  ./deploy.sh start      - Deploy completo  ║"
    echo "║  ./deploy.sh stop      - Parar serviços    ║"
    echo "║  ./deploy.sh restart   - Reiniciar todos   ║"
    echo "║  ./deploy.sh rebuild   - Rebuild total     ║"
    echo "║  ./deploy.sh rebuild-fe- Rebuild frontend ║"
    echo "║  ./deploy.sh status    - Status serviços   ║"
    echo "║  ./deploy.sh health    - Health check      ║"
    echo "║  ./deploy.sh logs [svc]- Ver logs          ║"
    echo "╚═══════════════════════════════════════════╝"
    echo ""
    echo "Serviços disponíveis:"
    echo "  postgres  - Banco de dados (porta 5432)"
    echo "  redis     - Cache/Tasks (porta 6379)"
    echo "  backend   - API FastAPI (porta 8000)"
    echo "  celery    - Background tasks"
    echo "  frontend  - Next.js (porta 3000)"
    echo "  pgadmin   - Admin PostgreSQL (porta 5050)"
    echo ""
}

# Main
case "${1:-}" in
    start)
        deploy
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    rebuild)
        rebuild
        ;;
    rebuild-fe)
        rebuild_frontend
        ;;
    status)
        status
        ;;
    health)
        health
        ;;
    logs)
        logs "$@"
        ;;
    *)
        show_menu
        ;;
esac