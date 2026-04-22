# celx-atendimento - Backend Dockerfile
# Multi-stage build para imagem otimizada em produção

# ============================================
# Stage 1: Dependencies
# ============================================
FROM python:3.11-slim AS deps

WORKDIR /app

# Dependências do sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Requirements先复制用于安装依赖
COPY requirements.txt .

# 安装依赖（使用国内镜像加速）
RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple && \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip cache purge

# ============================================
# Stage 2: Build
# ============================================
FROM python:3.11-slim AS builder

WORKDIR /app

COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

COPY . .

RUN mkdir -p /app/uploads && \
    chmod 755 /app/uploads

# ============================================
# Stage 3: Production
# ============================================
FROM python:3.11-slim AS runner

WORKDIR /app

# 安装运行时依赖
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Usuário não-root para segurança
RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

# Criar diretórios
RUN mkdir -p /app/uploads && \
    chown -R appuser:appgroup /app

COPY --from=builder /app /app

USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Start com gunicorn para produção (melhor performance)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker"]