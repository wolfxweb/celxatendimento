-- =====================================================
-- USUÁRIOS DE TESTE (Seed Data)
-- =====================================================

-- Empresa de testes
INSERT INTO companies (name, domain, contact_email, status, settings) VALUES
('Empresa Teste', 'teste.com', 'admin@teste.com', 'active', '{"timezone": "America/Sao_Paulo"}');

-- Usuários da empresa teste (company_id = 1)
-- Password: 123456 (hash bcrypt)
INSERT INTO users (company_id, email, password_hash, name, role, is_active, is_email_verified) VALUES
-- Admin da empresa
(1, 'admin@teste.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.FRnFJ4v0lWfIyG', 'Admin Teste', 'admin', TRUE, TRUE),
-- Atendente
(1, 'atendente@teste.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.FRnFJ4v0lWfIyG', 'Maria Atendente', 'agent', TRUE, TRUE),
-- Cliente
(1, 'cliente@teste.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.FRnFJ4v0lWfIyG', 'João Cliente', 'customer', TRUE, TRUE);

-- Categorias padrão
INSERT INTO categories (company_id, name, description, sla_minutes, is_active, is_default, icon, color) VALUES
(1, 'Suporte Técnico', 'Problemas técnicos e dúvidas sobre uso do sistema', 480, TRUE, TRUE, 'wrench', '#3B82F6'),
(1, 'Comercial', 'Dúvidas sobre planos, preços e funcionalidades', 1440, TRUE, FALSE, 'currency-dollar', '#10B981'),
(1, 'Financeiro', 'Faturas, pagamentos e reembolso', 1440, TRUE, FALSE, 'credit-card', '#F59E0B'),
(1, 'Dúvidas Gerais', 'Perguntas gerais sobre o produto', 2880, TRUE, FALSE, 'question-mark-circle', '#8B5CF6'),
(1, 'Bugs', 'Erros e falhas no sistema', 240, TRUE, FALSE, 'bug', '#EF4444'),
(1, 'Feature Request', 'Sugestões de novas funcionalidades', 4320, TRUE, FALSE, 'light-bulb', '#F97316');

-- Super Admin do sistema
INSERT INTO users (company_id, email, password_hash, name, role, is_active, is_email_verified) VALUES
(NULL, 'superadmin@celx.com.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.FRnFJ4v0lWfIyG', 'Super Admin', 'superadmin', TRUE, TRUE);

-- Configuração de IA da empresa teste
-- API key será configurada pelo admin via painel
INSERT INTO company_ai_config (company_id, provider_id, llm_model, embedding_model, temperature, max_tokens, system_prompt, tools, autonomy_level, is_active, api_key_is_set) VALUES
(1, 1, 'google/gemini-1.5-flash', 'openai/text-embedding-3-small', 0.7, 2048,
'Você é um assistente de suporte da empresa {company_name}.

Sua função é auxiliar clientes respondendo suas dúvidas de forma clara, objetiva e amigável.

**Regras:**
1. Responda apenas com informações da base de conhecimento fornecida.
2. Se não souber a resposta, escalone para um atendente humano.
3. Seja cortês e profissional.
4. Não invente informações.
5. Formate a resposta com bullets quando aplicável.

**Contexto da Empresa:**
{company_context}

**Base de Conhecimento:**
{rag_context}

**Ticket do Cliente:**
- Assunto: {subject}
- Categoria: {category}
- Descrição: {description}',
'["rag"]',
'low',
TRUE,
FALSE);  -- api_key_is_set = FALSE (precisa configurar)
