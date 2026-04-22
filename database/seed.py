"""
Database Seed Script

Populates the database with initial data for testing/development.
Usage: python -m database.seed
"""

import asyncio
import asyncpg
import os
from datetime import datetime
from pathlib import Path

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/celx_atendimento"
)


async def run_seed():
    """Seed the database with initial data"""

    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)

    try:
        # Create demo company
        print("Creating demo company...")
        company_id = await conn.fetchval("""
            INSERT INTO companies (name, domain, status, contact_email, contact_name)
            VALUES ('Demo Empresa', 'demo.com', 'active', 'admin@demo.com', 'Admin Demo')
            RETURNING id
        """)
        print(f"  Company ID: {company_id}")

        # Create demo users using uuid_generate_v4()
        print("Creating demo users...")

        # Admin user
        admin_id = await conn.fetchval(
            """
            INSERT INTO users (company_id, email, hashed_password, full_name, role, is_active, is_email_verified)
            VALUES ($1, 'admin@demo.com', crypt('admin123', gen_salt('bf')), 'Admin Demo', 'admin', true, true)
            RETURNING id
        """,
            company_id,
        )
        print(f"  Admin: admin@demo.com (password: admin123)")

        # Agent user
        agent_id = await conn.fetchval(
            """
            INSERT INTO users (company_id, email, hashed_password, full_name, role, is_active, is_email_verified)
            VALUES ($1, 'agent@demo.com', crypt('agent123', gen_salt('bf')), 'João Atendente', 'agent', true, true)
            RETURNING id
        """,
            company_id,
        )
        print(f"  Agent: agent@demo.com (password: agent123)")

        # Customer user
        customer_id = await conn.fetchval(
            """
            INSERT INTO users (company_id, email, hashed_password, full_name, role, is_active, is_email_verified)
            VALUES ($1, 'cliente@demo.com', crypt('cliente123', gen_salt('bf')), 'Maria Cliente', 'customer', true, true)
            RETURNING id
        """,
            company_id,
        )
        print(f"  Customer: cliente@demo.com (password: cliente123)")

        # Create categories
        print("Creating categories...")
        categories = [
            (
                "Dúvidas Gerais",
                "Perguntas gerais sobre produtos e serviços",
                "chat",
                "#3B82F6",
                1440,
            ),
            ("Suporte Técnico", "Problemas técnicos e falhas", "tool", "#EF4444", 240),
            (
                "Faturamento",
                "Dúvidas sobre cobranças e faturas",
                "credit_card",
                "#F59E0B",
                480,
            ),
            ("Cancelamento", "Solicitações de cancelamento", "x-circle", "#DC2626", 60),
        ]

        for name, desc, icon, color, sla in categories:
            await conn.execute(
                """
                INSERT INTO categories (company_id, name, description, icon, color, sla_minutes, is_active, is_default)
                VALUES ($1, $2, $3, $4, $5, $6, true, false)
            """,
                company_id,
                name,
                desc,
                icon,
                color,
                sla,
            )
        print(f"  Created {len(categories)} categories")

        # Create AI config for company
        print("Creating AI configuration...")
        await conn.execute(
            """
            INSERT INTO company_ai_config (company_id, provider_id, llm_model, temperature, system_prompt, autonomy_level, is_active)
            VALUES ($1, 1, 'google/gemini-1.5-flash', 0.7, $2, 'low', true)
        """,
            company_id,
            """Você é um agente de atendimento ao cliente.

## Regras de Comunicação
1. Seja profissional e amigável
2. Seja claro e objetivo
3. Responda em português brasileiro
4. Se não souber a resposta, não invente - escalone para um atendente

## Respondendo Tickets
1. Entenda o problema
2. Forneça a solução quando possível
3. Se precisar de informações, solicite de forma clara
4. Defina próximos passos""",
        )

        # Create sample tickets
        print("Creating sample tickets...")

        # Get category id
        cat_result = await conn.fetchrow(
            "SELECT id FROM categories WHERE company_id = $1 LIMIT 1", company_id
        )
        category_id = cat_result["id"] if cat_result else None

        # Ticket 1 - Open
        ticket1 = await conn.fetchval(
            """
            INSERT INTO tickets (company_id, user_id, category_id, ticket_number, subject, description, status, priority)
            VALUES ($1, $2, $3, 'TKT-202604000001', 'Como redefinir minha senha?', 
                    'Olá, não consigo redefinir minha senha. Quando clico no link de redefinição, dá erro 404.', 
                    'open', 'medium')
            RETURNING id
        """,
            company_id,
            customer_id,
            category_id,
        )

        # Add message to ticket 1
        await conn.execute(
            """
            INSERT INTO ticket_messages (ticket_id, author_id, content, message_type)
            VALUES ($1, $2, 'Olá Maria, obrigado pelo contato! Vou verificar o problema com o link de redefinição de senha. Qual é o email cadastrado na sua conta?', 'agent')
        """,
            ticket1,
            agent_id,
        )

        # Ticket 2 - Pending AI
        ticket2 = await conn.fetchval(
            """
            INSERT INTO tickets (company_id, user_id, category_id, ticket_number, subject, description, status, priority)
            VALUES ($1, $2, $3, 'TKT-202604000002', 'Diferença entre planos', 
                    'Gostaria de saber qual a diferença entre o plano Basic e o plano Pro. Qual recomenda para uma empresa com 50 funcionários?', 
                    'pending_ai', 'low')
            RETURNING id
        """,
            company_id,
            customer_id,
            category_id,
        )

        # Ticket 3 - Resolved
        ticket3 = await conn.fetchval(
            """
            INSERT INTO tickets (company_id, user_id, category_id, ticket_number, subject, description, status, priority, resolved_at)
            VALUES ($1, $2, $3, 'TKT-202604000003', 'Erro ao fazer login', 
                    'Estou recebendo mensagem de "credenciais inválidas" mas tenho certeza que a senha está correta.', 
                    'resolved', 'high', NOW())
            RETURNING id
        """,
            company_id,
            customer_id,
            category_id,
        )

        # Add message to ticket 3
        await conn.execute(
            """
            INSERT INTO ticket_messages (ticket_id, author_id, content, message_type)
            VALUES ($1, $2, 'Identificamos que sua conta estava bloqueada após múltiplas tentativas incorretas. Já desblockamos. Tente novamente.', 'agent')
        """,
            ticket3,
            agent_id,
        )

        print("  Created 3 sample tickets")

        # Create knowledge base articles
        print("Creating knowledge base articles...")

        articles = [
            (
                "Como redefinir a senha",
                'Para redefinir sua senha, siga estes passos:\n\n1. Acesse a página de login\n2. Clique em "Esqueci minha senha"\n3. Digite seu email cadastrado\n4. Verifique sua caixa de entrada (e spam)\n5. Clique no link de redefinição\n\nO link expira em 24 horas.',
            ),
            (
                "Diferença entre planos",
                "Plano Basic:\n- Até 10 usuários\n- Suporte por email\n- Relatórios básicos\n\nPlano Pro:\n- Usuários ilimitados\n- Suporte prioritário 24/7\n- Relatórios avançados\n- Integrações com CRM\n- API disponível",
            ),
            (
                "Política de cancelamento",
                "Você pode cancelar sua assinatura a qualquer momento.\n\n- Cancelamento é effective imediatamente\n- Não há multa por cancelamento\n- Dados são mantidos por 90 dias\n- Reembolso proporcional para planos anuais",
            ),
        ]

        for title, content in articles:
            await conn.execute(
                """
                INSERT INTO knowledge_base (company_id, title, content, source_type, is_active, is_indexed)
                VALUES ($1, $2, $3, 'text', true, true)
            """,
                company_id,
                title,
                content,
            )

        print(f"  Created {len(articles)} knowledge base articles")

        print("\n✅ Seed completed successfully!")
        print("\n📋 Login credentials:")
        print("   Admin:   admin@demo.com / admin123")
        print("   Agent:   agent@demo.com / agent123")
        print("   Client:  cliente@demo.com / cliente123")

    except Exception as e:
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(run_seed())
