-- =====================================================
-- Script para criar banco de dados Langfuse
-- =====================================================
-- Executar após o PostgreSQL estar disponível:
-- docker exec -it celx-postgres psql -U postgres -f /path/to/init-langfuse.sql
-- =====================================================

-- Criar banco de dados para Langfuse
CREATE DATABASE langfuse;