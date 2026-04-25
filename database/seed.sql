-- =====================================================
-- SEED DATA - Initial test data
-- =====================================================

-- AI Provider (OpenRouter)
INSERT INTO ai_providers (name, display_name, api_url, is_active) VALUES
('openrouter', 'OpenRouter', 'https://openrouter.ai/api/v1', TRUE)
ON CONFLICT DO NOTHING;

-- Empresa CELX Tecnologia
INSERT INTO companies (name, domain, contact_email, status, settings) VALUES
('CELX Tecnologia', 'celx.com.br', 'admin@celx.com.br', 'active', '{"timezone": "America/Sao_Paulo"}')
ON CONFLICT (domain) DO NOTHING;

-- Usuários CELX (company_id = 1)
-- Senhas: admin123, agente123, cliente123
INSERT INTO users (company_id, email, password_hash, name, role, is_active, is_email_verified) VALUES
(1, 'admin@celx.com.br', '$2b$12$RN4Da5jFscjedt1J8mc6Cef8Eh1rNOHiOd5nOIH85NUztPoWps8US', 'Administrador', 'admin', TRUE, TRUE),
(1, 'agente@celx.com.br', '$2b$12$pnwzoUg1t0.sArS8d2vLYeC.IhYfNRwFMq6Wv0LpaGhWXo2ibnIq.', 'Agente Silva', 'agent', TRUE, TRUE),
(1, 'cliente@celx.com.br', '$2b$12$D.qMYzeDOGnHdAKBbz/4NeM4/YxSJCHdVS7b.78ubCLdKV5jVO5Am', 'João Cliente', 'customer', TRUE, TRUE)
ON CONFLICT (company_id, email) DO NOTHING;

-- Empresa de testes (company_id = 2)
INSERT INTO companies (name, domain, contact_email, status, settings) VALUES
('Empresa Teste', 'teste.com', 'admin@teste.com', 'active', '{"timezone": "America/Sao_Paulo"}')
ON CONFLICT DO NOTHING;

-- Usuários da empresa teste (company_id = 2)
-- Password: 123456 (hash bcrypt)
INSERT INTO users (company_id, email, password_hash, name, role, is_active, is_email_verified) VALUES
(2, 'admin@teste.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.FRnFJ4v0lWfIyG', 'Admin Teste', 'admin', TRUE, TRUE),
(2, 'atendente@teste.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.FRnFJ4v0lWfIyG', 'Maria Atendente', 'agent', TRUE, TRUE),
(2, 'cliente@teste.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.FRnFJ4v0lWfIyG', 'João Cliente', 'customer', TRUE, TRUE)
ON CONFLICT (company_id, email) DO NOTHING;

-- Categorias padrão
INSERT INTO categories (company_id, name, description, sla_minutes, is_active, is_default, icon, color) VALUES
(1, 'Suporte Técnico', 'Problemas técnicos e dúvidas sobre uso do sistema', 480, TRUE, TRUE, 'wrench', '#3B82F6'),
(1, 'Comercial', 'Dúvidas sobre planos, preços e funcionalidades', 1440, TRUE, FALSE, 'currency-dollar', '#10B981'),
(1, 'Financeiro', 'Faturas, pagamentos e reembolso', 1440, TRUE, FALSE, 'credit-card', '#F59E0B'),
(1, 'Dúvidas Gerais', 'Perguntas gerais sobre o produto', 2880, TRUE, FALSE, 'question-mark-circle', '#8B5CF6'),
(1, 'Bugs', 'Erros e falhas no sistema', 240, TRUE, FALSE, 'bug', '#EF4444'),
(1, 'Feature Request', 'Sugestões de novas funcionalidades', 4320, TRUE, FALSE, 'light-bulb', '#F97316')
ON CONFLICT (company_id, name) DO NOTHING;

-- Super Admin do sistema
INSERT INTO users (company_id, email, password_hash, name, role, is_active, is_email_verified) VALUES
(NULL, 'superadmin@celx.com.br', '$2b$12$RN4Da5jFscjedt1J8mc6Cef8Eh1rNOHiOd5nOIH85NUztPoWps8US', 'Super Admin', 'superadmin', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Configuração de IA da empresa teste
INSERT INTO company_ai_config (company_id, provider_id, llm_model, embedding_model, temperature, max_tokens, system_prompt, tools, autonomy_level, is_active, api_key_is_set) 
SELECT 
    1, 
    (SELECT id FROM ai_providers WHERE name = 'openrouter' LIMIT 1), 
    'google/gemini-1.5-flash', 
    'openai/text-embedding-3-small', 
    0.7, 
    2048,
    'Você é um assistente de suporte. Responda apenas com informações da base de conhecimento. Seja cortês e profissional. Não invente informações.',
    '["rag"]',
    'low',
    TRUE,
    FALSE
WHERE NOT EXISTS (SELECT 1 FROM company_ai_config WHERE company_id = 1);
