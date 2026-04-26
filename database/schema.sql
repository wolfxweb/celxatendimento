-- celx-atendimento - Schema PostgreSQL
-- Versão: 1.0
-- Data: 2026-04-21

-- =====================================================
-- EXTENSÕES
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgvector";  -- Sprint 2+ (requer instalação manual)

-- =====================================================
-- ENUMS
-- =====================================================

-- User Roles
CREATE TYPE user_role AS ENUM (
    'customer',      -- Cliente final
    'agent',         -- Atendente de suporte
    'admin',         -- Admin da empresa
    'superadmin'     -- Super admin do sistema
);

-- Ticket Status
CREATE TYPE ticket_status AS ENUM (
    'open',                  -- Aberto
    'pending_ai',            -- Aguardando aprovação AI
    'pending_agent',         -- Aguardando atendente
    'resolved',               -- Resolvido
    'closed',                -- Fechado
    'rejected'               -- Rejeitado
);

-- Ticket Priority
CREATE TYPE ticket_priority AS ENUM (
    'critical',  -- SLA: 1h
    'high',       -- SLA: 4h
    'medium',     -- SLA: 24h
    'low'         -- SLA: 48h
);

-- AI Response Status
CREATE TYPE ai_response_status AS ENUM (
    'pending',    -- Aguardando aprovação
    'approved',   -- Aprovada e enviada
    'rejected',   -- Rejeitada
    'edited'      -- Editada pelo atendente antes de enviar
);

-- AI Provider
CREATE TYPE ai_provider_name AS ENUM (
    'openai',
    'anthropic',
    'cohere',
    'openrouter',
    'local'
);

-- AI Model Type
CREATE TYPE ai_model_type AS ENUM (
    'llm',
    'embedding'
);

-- Source Type (Knowledge Base)
CREATE TYPE source_type AS ENUM (
    'pdf',
    'text',
    'url'
);

-- Relation Type (Ticket Relations)
CREATE TYPE ticket_relation_type AS ENUM (
    'duplicate',     -- Ticket duplicado
    'causes',        -- Causa de outro ticket
    'caused_by',     -- Causado por outro ticket
    'related',       -- Relacionado
    'subticket',     -- Subtarefa
    'parent'         -- Ticket pai
);

-- Company Status
CREATE TYPE company_status AS ENUM (
    'pending',       -- Pendente aprovação
    'active',        -- Ativa
    'suspended',     -- Suspensa
    'cancelled'      -- Cancelada
);

-- Autonomy Level
CREATE TYPE autonomy_level AS ENUM (
    'low',           -- Todas respostas precisam de aprovação
    'medium',        -- IA responde e notifica
    'high'           -- IA responde direto
);

-- =====================================================
-- TODO: Implementar PLANOS (Plans) - Sprint 5
-- Os desenvolvedores devem criar esta tabela conforme evolução
-- Sugestão de campos: name, price_monthly, price_yearly, max_users, 
-- max_tickets, features (JSONB), etc.
-- =====================================================

-- CREATE TABLE plans (...);

-- =====================================================
-- EMPRESAS (Companies/Tenants)
-- =====================================================

CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    logo_url VARCHAR(500),
    -- TODO: plan_id INTEGER REFERENCES plans(id), -- Sprint 5
    -- TODO: plan_started_at TIMESTAMP WITH TIME ZONE, -- Sprint 5
    -- TODO: plan_expires_at TIMESTAMP WITH TIME ZONE, -- Sprint 5
    
    -- Status
    status company_status DEFAULT 'pending',
    status_reason TEXT,
    approved_by INTEGER, -- REFERENCES users(id) -- Added after users table creation
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Configurações da empresa
    settings JSONB DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    locale VARCHAR(10) DEFAULT 'pt-BR',
    
    -- Contact
    contact_name VARCHAR(255),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    
    -- Billing
    billing_email VARCHAR(255),
    billing_address JSONB,
    
    -- Stats (denormalized for performance)
    total_users INTEGER DEFAULT 0,
    total_tickets INTEGER DEFAULT 0,
    tickets_this_month INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_companies_domain ON companies(domain);
CREATE INDEX idx_companies_status ON companies(status);
-- TODO: CREATE INDEX idx_companies_plan ON companies(plan_id); -- Sprint 5

-- =====================================================
-- USUÁRIOS (Users)
-- =====================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Auth
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(50),
    
    -- Role
    role user_role NOT NULL DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    
    -- Permissions (JSON for flexibility)
    permissions JSONB DEFAULT '[]',
    
    -- Login tracking
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    login_count INTEGER DEFAULT 0,
    failed_login_count INTEGER DEFAULT 0,
    
    -- Password reset
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(company_id, email)
);

CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- =====================================================
-- CATEGORIAS DE TICKETS (Categories)
-- =====================================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- SLA
    sla_minutes INTEGER DEFAULT 1440,  -- 24 hours default
    
    -- Escalation
    escalation_level INTEGER DEFAULT 1,
    parent_category_id INTEGER REFERENCES categories(id),
    
    -- Config
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    require_approval BOOLEAN DEFAULT TRUE,
    
    -- Icon
    icon VARCHAR(50),
    color VARCHAR(7),  -- hex color
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(company_id, name)
);

CREATE INDEX idx_categories_company ON categories(company_id);
CREATE INDEX idx_categories_active ON categories(is_active);

-- =====================================================
-- NÍVEIS DE PRIORIDADE (Priority Levels)
-- =====================================================

CREATE TABLE priority_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    sla_minutes INTEGER NOT NULL,
    color VARCHAR(7) NOT NULL,  -- hex
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO priority_levels (name, display_name, sla_minutes, color, sort_order) VALUES
('critical', 'Crítica', 60, '#DC2626', 1),    -- 1 hora
('high', 'Alta', 240, '#EA580C', 2),           -- 4 horas
('medium', 'Média', 1440, '#CA8A04', 3),       -- 24 horas
('low', 'Baixa', 2880, '#16A34A', 4);          -- 48 horas

-- =====================================================
-- TICKETS
-- =====================================================

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Identificação
    ticket_number VARCHAR(20) NOT NULL,  -- Format: TKT-{YEAR}{MONTH}{NUMBER}
    
    -- Relations
    user_id INTEGER NOT NULL REFERENCES users(id),
    category_id INTEGER REFERENCES categories(id),
    assigned_to INTEGER REFERENCES users(id),  -- Atendente
    
    -- Status e Prioridade
    status ticket_status DEFAULT 'open',
    priority ticket_priority DEFAULT 'medium',
    
    -- Conteúdo
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- Canal de origem
    channel VARCHAR(50) DEFAULT 'website',  -- website, email, api, chat
    
    -- timestamps
    first_response_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- SLA
    sla_due_at TIMESTAMP WITH TIME ZONE,
    sla_breached BOOLEAN DEFAULT FALSE,
    
    -- Rastreamento
    resolution_time_minutes INTEGER,
    response_time_minutes INTEGER,
    
    -- Avaliação
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    rating_comment TEXT,
    rated_at TIMESTAMP WITH TIME ZONE,
    
    -- Tags
    tags JSONB DEFAULT '[]',
    
    -- Lock para edição simultânea
    locked_by INTEGER REFERENCES users(id),
    locked_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(company_id, ticket_number)
);

CREATE INDEX idx_tickets_company ON tickets(company_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX idx_tickets_category ON tickets(category_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created ON tickets(created_at);
CREATE INDEX idx_tickets_number ON tickets(ticket_number);

-- =====================================================
-- MENSAGENS DE TICKET (Ticket Messages)
-- =====================================================

CREATE TABLE ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id),
    
    -- Conteúdo
    content TEXT NOT NULL,
    
    -- Tipo de mensagem
    message_type VARCHAR(30) NOT NULL DEFAULT 'agent',  -- customer, agent, ai_initial, ai_approved, note, system
    
    -- Referência à resposta AI (se aplicável)
    ai_response_id INTEGER REFERENCES ticket_ai_response(id),
    
    -- Se foi editada pelo atendente
    was_edited BOOLEAN DEFAULT FALSE,
    original_ai_text TEXT,
    
    -- Visibilidade
    is_internal BOOLEAN DEFAULT FALSE,  -- Nota interna (só atendentes veem)
    
    -- Status
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_by INTEGER REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX idx_messages_author ON ticket_messages(author_id);
CREATE INDEX idx_messages_type ON ticket_messages(message_type);
CREATE INDEX idx_messages_created ON ticket_messages(created_at);

-- =====================================================
-- ANEXOS DE TICKET (Ticket Attachments)
-- =====================================================

CREATE TABLE ticket_attachments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES ticket_messages(id) ON DELETE CASCADE,
    
    -- Arquivo
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size INTEGER NOT NULL,  -- bytes
    
    -- Storage
    storage_provider VARCHAR(50) DEFAULT 'local',  -- local, s3, gcs
    storage_path VARCHAR(500) NOT NULL,
    storage_bucket VARCHAR(100),
    storage_url VARCHAR(1000),  -- URL pública ou pré-assinada
    
    -- Thumbnail (para imagens)
    thumbnail_path VARCHAR(500),
    thumbnail_url VARCHAR(1000),
    
    -- Upload
    uploaded_by INTEGER REFERENCES users(id),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_scanned BOOLEAN DEFAULT FALSE,  -- Escaneado por malware
    scan_result VARCHAR(50),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by INTEGER REFERENCES users(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_ticket ON ticket_attachments(ticket_id);
CREATE INDEX idx_attachments_message ON ticket_attachments(message_id);
CREATE INDEX idx_attachments_active ON ticket_attachments(is_active);

-- =====================================================
-- RESPOSTAS AI (Ticket AI Responses)
-- =====================================================

CREATE TABLE ticket_ai_response (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    
    -- Resposta gerada pela IA
    response_text TEXT NOT NULL,
    
    -- Contexto usado (RAG + ticket info)
    context_used JSONB NOT NULL,  -- {
                                   --   "rag_sources": [...],
                                   --   "ticket_subject": "...",
                                   --   "ticket_category": "...",
                                   --   "retrieval_score": 0.85
                                   -- }
    
    -- Config do atendente usado
    config_snapshot JSONB NOT NULL,  -- {
                                      --   "model": "gpt-4o",
                                      --   "temperature": 0.7,
                                      --   "prompt_hash": "abc123",
                                      --   "tools_used": ["rag"]
                                      -- }
    
    -- Timing
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processing_time_ms INTEGER,
    
    -- Status da aprovação
    status ai_response_status DEFAULT 'pending',
    
    -- Atendente que aprovou/rejeitou
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Feedback do atendente sobre a resposta da IA
    ai_rating INTEGER CHECK (ai_rating >= 1 AND ai_rating <= 5),
    ai_feedback TEXT,
    rejection_reason VARCHAR(100),
    
    -- Flags para aprendizado
    is_example_good BOOLEAN DEFAULT FALSE,
    is_example_bad BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_response_ticket ON ticket_ai_response(ticket_id);
CREATE INDEX idx_ai_response_status ON ticket_ai_response(status);
CREATE INDEX idx_ai_response_rating ON ticket_ai_response(ai_rating);
CREATE INDEX idx_ai_response_reviewed ON ticket_ai_response(reviewed_by);

-- =====================================================
-- LOG DE FEEDBACK AI (AI Feedback Log)
-- =====================================================

CREATE TABLE ai_feedback_log (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    ai_response_id INTEGER REFERENCES ticket_ai_response(id),
    agent_id INTEGER NOT NULL REFERENCES users(id),
    
    -- Tipo de ação
    action VARCHAR(20) NOT NULL,  -- approved, rejected, edited, rated
    
    -- Dados da ação
    previous_state JSONB,
    new_state JSONB,
    
    -- Feedback
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    rejection_reason VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_log_ticket ON ai_feedback_log(ticket_id);
CREATE INDEX idx_feedback_log_agent ON ai_feedback_log(agent_id);
CREATE INDEX idx_feedback_log_action ON ai_feedback_log(action);

-- =====================================================
-- RELAÇÕES ENTRE TICKETS (Ticket Relations)
-- =====================================================

CREATE TABLE ticket_relations (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    related_ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    
    -- Tipo de relação
    relation_type ticket_relation_type NOT NULL,
    
    -- Descrição
    description TEXT,
    
    -- Metadata
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(ticket_id, related_ticket_id, relation_type)
);

CREATE INDEX idx_ticket_relations_ticket ON ticket_relations(ticket_id);
CREATE INDEX idx_ticket_relations_related ON ticket_relations(related_ticket_id);
CREATE INDEX idx_ticket_relations_type ON ticket_relations(relation_type);

-- =====================================================
-- LOG DE ATRIBUIÇÃO (Ticket Assignment Log)
-- =====================================================

CREATE TABLE ticket_assignment_log (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    
    -- Quem foi atribuído
    assigned_to INTEGER REFERENCES users(id),
    assigned_from INTEGER REFERENCES users(id),
    
    -- Motivo
    reason VARCHAR(50) DEFAULT 'manual',  -- manual, auto, sla, round_robin, escalation
    notes TEXT,
    
    -- Contexto
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_assignment_log_ticket ON ticket_assignment_log(ticket_id);
CREATE INDEX idx_assignment_log_assigned ON ticket_assignment_log(assigned_to);

-- =====================================================
-- LOG DE AUDITORIA (Ticket Audit Log)
-- =====================================================

CREATE TABLE ticket_audit_log (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    
    -- Tipo de alteração
    action_type VARCHAR(50) NOT NULL,
    
    -- Quem fez
    user_id INTEGER REFERENCES users(id),
    user_role VARCHAR(20),
    
    -- Detalhes
    old_values JSONB,
    new_values JSONB,
    
    -- Contexto
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tipos de ação:
-- created, status_changed, priority_changed, category_changed
-- assigned_to, unassigned, sla_updated
-- attachment_added, attachment_removed
-- relation_added, relation_removed
-- ai_response_generated, ai_response_approved, ai_response_rejected, ai_response_edited
-- message_added, note_added
-- escalated, closed, reopened
-- rating_added

CREATE INDEX idx_audit_log_ticket ON ticket_audit_log(ticket_id);
CREATE INDEX idx_audit_log_action ON ticket_audit_log(action_type);
CREATE INDEX idx_audit_log_user ON ticket_audit_log(user_id);
CREATE INDEX idx_audit_log_created ON ticket_audit_log(created_at);

-- =====================================================
-- BASE DE CONHECIMENTO (Knowledge Base)
-- =====================================================

CREATE TABLE knowledge_base (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Conteúdo
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    
    -- Fonte
    source_type source_type DEFAULT 'text',
    source_url VARCHAR(1000),
    original_filename VARCHAR(255),  -- Para PDFs
    
    -- Embeddings (text for now - enable pgvector for vector support in Sprint 2+)
    -- embedding vector(1536),  -- Dimensão do text-embedding-3-small
    embedding_text TEXT,  -- Armazena texto original para recuperação
    
    -- Chunking info
    chunks_count INTEGER DEFAULT 1,
    chunk_index INTEGER,
    parent_doc_id INTEGER REFERENCES knowledge_base(id),  -- Para chunks do mesmo documento
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_indexed BOOLEAN DEFAULT FALSE,
    index_error TEXT,
    last_indexed_at TIMESTAMP WITH TIME ZONE,
    
    -- Config
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_knowledge_company ON knowledge_base(company_id);
CREATE INDEX idx_knowledge_active ON knowledge_base(is_active);
CREATE INDEX idx_knowledge_indexed ON knowledge_base(is_indexed);
-- CREATE INDEX idx_knowledge_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops);  -- Enable with pgvector

-- =====================================================
-- CONFIGURAÇÃO AI DA EMPRESA (Company AI Config)
-- =====================================================

CREATE TABLE company_ai_config (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
    
    -- Provider & Credentials (OpenRouter é o único recomendado)
    -- Cada empresa tem sua própria API key armazenada
    provider_id INTEGER REFERENCES ai_providers(id),  -- Aponta para OpenRouter por padrão
    api_key_encrypted TEXT,  -- Chave OpenRouter do cliente (criptografada AES-256)
    api_key_is_set BOOLEAN DEFAULT FALSE,  -- TRUE se a chave foi configurada
    
    -- LLM Settings (modelo OpenRouter)
    llm_model VARCHAR(100) NOT NULL DEFAULT 'google/gemini-1.5-flash',
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2048,
    
    -- RAG Settings (usando OpenAI embeddings para embeddings)
    embedding_model VARCHAR(100) DEFAULT 'openai/text-embedding-3-small',
    embedding_dimensions INTEGER DEFAULT 1536,
    
    -- Prompt
    system_prompt TEXT NOT NULL,
    
    -- Tools (JSON array of tool names)
    tools JSONB DEFAULT '["rag"]',
    
    -- Autonomy
    autonomy_level autonomy_level DEFAULT 'low',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_ai_config_company ON company_ai_config(company_id);

-- =====================================================
-- PROVIDERS DE AI (AI Providers)
-- =====================================================

CREATE TABLE ai_providers (
    id SERIAL PRIMARY KEY,
    name ai_provider_name NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    api_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ai_providers (name, display_name, api_url) VALUES
('openrouter', 'OpenRouter', 'https://openrouter.ai/api/v1'),
('openai', 'OpenAI', 'https://api.openai.com/v1'),
('anthropic', 'Anthropic', 'https://api.anthropic.com/v1'),
('local', 'Local/Ollama', 'http://localhost:11434/v1');

-- =====================================================
-- MODELOS DE AI (AI Models)
-- =====================================================

CREATE TABLE ai_models (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES ai_providers(id),
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    model_type ai_model_type NOT NULL,
    max_tokens INTEGER,
    embedding_dimensions INTEGER,
    supports_function_calling BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id, name, model_type)
);

-- Modelos LLM via OpenRouter (ordenados por preço: mais barato primeiro)
-- Formato: provider/model (OpenRouter API)
INSERT INTO ai_models (provider_id, name, display_name, model_type, max_tokens, supports_function_calling) VALUES
-- OpenRouter - Modelos FREE
(1, 'google/gemini-2.0-flash-exp', 'Gemini 2.0 Flash (FREE)', 'llm', 1000000, TRUE),
(1, 'google/gemini-1.5-flash', 'Gemini 1.5 Flash (FREE)', 'llm', 1000000, TRUE),
(1, 'google/gemini-1.5-flash-8b', 'Gemini 1.5 Flash 8B (FREE)', 'llm', 1000000, TRUE),
(1, 'meta-llama/llama-3.1-8b-instruct', 'Llama 3.1 8B (FREE)', 'llm', 8192, FALSE),
(1, 'mistralai/mistral-7b-instruct', 'Mistral 7B (FREE)', 'llm', 32768, FALSE),
-- OpenRouter - Modelos PAGOS (bons e baratos)
(1, 'openai/gpt-4o-mini', 'GPT-4o Mini', 'llm', 128000, TRUE),
(1, 'openai/gpt-4o', 'GPT-4o', 'llm', 128000, TRUE),
(1, 'anthropic/claude-3.5-sonnet', 'Claude 3.5 Sonnet', 'llm', 200000, TRUE),
(1, 'anthropic/claude-3-haiku', 'Claude 3 Haiku', 'llm', 200000, FALSE),
-- OpenRouter - Modelos Premium
(1, 'anthropic/claude-sonnet-4-20250514', 'Claude Sonnet 4', 'llm', 200000, TRUE),
(1, 'anthropic/claude-opus-4-20250514', 'Claude Opus 4', 'llm', 200000, TRUE);

-- Modelos de Embedding
INSERT INTO ai_models (provider_id, name, display_name, model_type, embedding_dimensions) VALUES
(1, 'text-embedding-3-small', 'Text Embedding 3 Small', 'embedding', 1536),
(1, 'text-embedding-3-large', 'Text Embedding 3 Large', 'embedding', 3072),
(1, 'text-embedding-ada-002', 'Text Embedding Ada v2', 'embedding', 1536),
(3, 'embed-multilingual-v3.0', 'Embed Multilingual v3', 'embedding', 1024),
(3, 'embed-english-v3.0', 'Embed English v3', 'embedding', 1024);

-- =====================================================
-- FERRAMENTAS DE AI (AI Tools)
-- =====================================================

CREATE TABLE ai_tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    requires_integration BOOLEAN DEFAULT FALSE,
    integration_type VARCHAR(50),  -- crm, erp, ecommerce
    schema_definition JSONB,  -- OpenAI function calling schema
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ai_tools (name, display_name, description, icon, requires_integration, schema_definition) VALUES
('rag', 'Busca na Base de Conhecimento', 'Busca em documentos PDF e artigos da empresa', 'search', FALSE, NULL),
('status_pedido', 'Consulta Status do Pedido', 'Consulta status de pedidos do cliente', 'package', TRUE, '{"type": "function", "function": {"name": "consultar_status_pedido", "parameters": {"type": "object", "properties": {"pedido_id": {"type": "string", "description": "ID do pedido"}}, "required": ["pedido_id"]}}}'),
('consulta_fatura', 'Consulta Fatura', 'Consulta informações de faturamento', 'credit_card', TRUE, '{"type": "function", "function": {"name": "consultar_fatura", "parameters": {"type": "object", "properties": {"cliente_id": {"type": "string", "description": "ID do cliente"}}, "required": ["cliente_id"]}}}'),
('abrir_ticket', 'Abertura de Ticket Internamente', 'Cria tickets automaticamente para o setor certo', 'ticket', FALSE, '{"type": "function", "function": {"name": "abrir_ticket_interno", "parameters": {"type": "object", "properties": {"categoria": {"type": "string", "description": "Categoria do ticket"}}, "required": ["categoria"]}}}'),
('enviar_email', 'Envio de Email', 'Envia emails diretamente ao cliente', 'mail', FALSE, '{"type": "function", "function": {"name": "enviar_email", "parameters": {"type": "object", "properties": {"destinatario": {"type": "string", "description": "Email do destinatário"}, "assunto": {"type": "string", "description": "Assunto do email"}}, "required": ["destinatario", "assunto"]}}}'),
('consulta_crm', 'Consulta CRM', 'Busca dados do cliente no CRM', 'database', TRUE, '{"type": "function", "function": {"name": "consultar_crm", "parameters": {"type": "object", "properties": {"cliente_id": {"type": "string", "description": "ID do cliente no CRM"}}, "required": ["cliente_id"]}}}');

-- =====================================================
-- SEQUENCES (para números de ticket)
-- =====================================================

CREATE SEQUENCE tickets_number_seq START 1;

-- Function para gerar número de ticket
CREATE OR REPLACE FUNCTION generate_ticket_number(p_company_id INTEGER)
RETURNS VARCHAR(20) AS $$
DECLARE
    v_year VARCHAR(4);
    v_month VARCHAR(2);
    v_seq INTEGER;
    v_result VARCHAR(20);
BEGIN
    v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    v_month := TO_CHAR(CURRENT_DATE, 'MM');
    
    SELECT nextval('tickets_number_seq') INTO v_seq;
    
    v_result := 'TKT-' || v_year || v_month || LPAD(v_seq::TEXT, 6, '0');
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_messages_updated_at
    BEFORE UPDATE ON ticket_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_ai_response_updated_at
    BEFORE UPDATE ON ticket_ai_response
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_knowledge_updated_at
    BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_company_ai_config_updated_at
    BEFORE UPDATE ON company_ai_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- VIEWS
-- =====================================================

-- View para dados de treinamento da AI
CREATE OR REPLACE VIEW v_ai_training_data AS
SELECT 
    tar.id,
    tar.response_text,
    tar.context_used,
    tar.ai_rating,
    tar.rejection_reason,
    tar.is_example_good,
    tar.is_example_bad,
    tar.created_at,
    tar.config_snapshot->>'model' as model_used,
    t.subject as ticket_subject,
    t.description as ticket_description,
    c.name as category_name
FROM ticket_ai_response tar
JOIN tickets t ON t.id = tar.ticket_id
JOIN categories c ON c.id = t.category_id
WHERE 
    tar.status IN ('approved', 'edited')
    AND (tar.is_example_good = TRUE OR tar.ai_rating >= 4);

-- View para métricas de tickets
CREATE OR REPLACE VIEW v_ticket_metrics AS
SELECT 
    t.company_id,
    DATE_TRUNC('day', t.created_at) as date,
    COUNT(*) as total_tickets,
    COUNT(*) FILTER (WHERE t.status = 'open') as open_tickets,
    COUNT(*) FILTER (WHERE t.status = 'resolved') as resolved_tickets,
    COUNT(*) FILTER (WHERE t.status = 'closed') as closed_tickets,
    AVG(t.response_time_minutes) FILTER (WHERE t.response_time_minutes IS NOT NULL) as avg_response_time,
    AVG(t.resolution_time_minutes) FILTER (WHERE t.resolution_time_minutes IS NOT NULL) as avg_resolution_time,
    AVG(t.rating) FILTER (WHERE t.rating IS NOT NULL) as avg_rating
FROM tickets t
WHERE t.deleted_at IS NULL
GROUP BY t.company_id, DATE_TRUNC('day', t.created_at);

-- View para métricas de qualidade da AI
CREATE OR REPLACE VIEW v_ai_quality_metrics AS
SELECT 
    DATE_TRUNC('week', tar.created_at) as week,
    COUNT(*) as total_responses,
    COUNT(*) FILTER (WHERE tar.status = 'approved') as approved,
    COUNT(*) FILTER (WHERE tar.status = 'rejected') as rejected,
    COUNT(*) FILTER (WHERE tar.status = 'edited') as edited,
    AVG(tar.ai_rating) FILTER (WHERE tar.ai_rating IS NOT NULL) as avg_rating,
    COUNT(*) FILTER (WHERE tar.ai_rating >= 4) as high_rated,
    COUNT(*) FILTER (WHERE tar.ai_rating <= 2) as low_rated,
    AVG(tar.processing_time_ms) FILTER (WHERE tar.processing_time_ms IS NOT NULL) as avg_processing_time
FROM ticket_ai_response tar
WHERE tar.created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('week', tar.created_at)
ORDER BY week DESC;

-- =====================================================
-- POLICIES (Row Level Security - para multi-tenant)
-- =====================================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_ai_response ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Policies básicas (exemplo - implementar conforme necessidade)
-- CREATE POLICY users_company ON users USING (company_id = current_setting('app.current_company_id')::INTEGER);

-- =====================================================
-- FOREIGN KEY CONSTRAINTS (after all tables created)
-- =====================================================

ALTER TABLE companies ADD CONSTRAINT fk_companies_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE users IS 'Usuários do sistema (clientes, atendentes, admins)';
-- COMMENT ON TABLE plans IS 'Planos de assinatura'; -- Sprint 5
COMMENT ON TABLE categories IS 'Categorias de tickets por empresa';
COMMENT ON TABLE tickets IS 'Tickets de suporte';
COMMENT ON TABLE ticket_messages IS 'Mensagens dentro de um ticket';
COMMENT ON TABLE ticket_attachments IS 'Anexos de tickets e mensagens';
COMMENT ON TABLE ticket_ai_response IS 'Respostas geradas pela IA para tickets';
COMMENT ON TABLE ticket_relations IS 'Relações entre tickets (duplicado, causa, etc)';
COMMENT ON TABLE ticket_assignment_log IS 'Log de atribuições de tickets';
COMMENT ON TABLE ticket_audit_log IS 'Log de auditoria de alterações em tickets';
COMMENT ON TABLE knowledge_base IS 'Base de conhecimento para RAG';
COMMENT ON TABLE company_ai_config IS 'Configurações de IA por empresa';
COMMENT ON TABLE ai_providers IS 'Provedores de IA (OpenAI, Anthropic, etc)';
COMMENT ON TABLE ai_models IS 'Modelos de IA disponíveis';
COMMENT ON TABLE ai_tools IS 'Ferramentas que o agente de IA pode usar';
