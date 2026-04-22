# celx-atendimento - Frontend Dockerfile
# Build otimizado para produção

FROM node:20-alpine AS builder

WORKDIR /app

# Dependências
COPY package*.json ./
RUN npm ci

# Código fonte
COPY . .

# Build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ============================================
# Production stage
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Copia build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]