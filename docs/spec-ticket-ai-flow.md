# celx-atendimento - Especificação: Fluxo de Ticket com IA e Feedback

**Versão:** 1.0  
**Data:** 2026-04-21  
**Módulo:** Ticket, Atendente AI, Feedback  

---

## 1. Visão Geral do Fluxo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO DE TICKET COM IA                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐         ┌──────────────┐         ┌─────────────────────┐      │
│  │CLIENTE  │         │   SISTEMA    │         │      AGENTE         │      │
│  │         │         │              │         │                     │      │
│  │ Cria    │────────▶│ Recebe       │         │                     │      │
│  │ Ticket  │         │ Ticket       │         │                     │      │
│  └─────────┘         └──────┬───────┘         └─────────────────────┘      │
│                             │                                                  │
│                             ▼                                                  │
│                    ┌─────────────────┐                                        │
│                    │  DISPARA AGENTE │  ← Automático ao criar ticket         │
│                    │      AI         │                                        │
│                    └────────┬────────┘                                        │
│                             │                                                  │
│                             ▼                                                  │
│                    ┌─────────────────┐                                        │
│                    │  RAG RETRIEVER  │  ← Busca na base de conhecimento       │
│                    │                 │                                        │
│                    └────────┬────────┘                                        │
│                             │                                                  │
│                             ▼                                                  │
│                    ┌─────────────────┐                                        │
│                    │ AI GENERATES    │                                        │
│                    │ RESPONSE        │                                        │
│                    └────────┬────────┘                                        │
│                             │                                                  │
│                             ▼                                                  │
│                    ┌─────────────────┐                                        │
│                    │ SAVES RESPONSE  │                                        │
│                    │ & CONTEXT       │  ← saved to ticket_ai_response         │
│                    └────────┬────────┘                                        │
│                             │                                                  │
│                             ▼                                                  │
│                    ┌─────────────────┐         ┌─────────────────────┐      │
│                    │   PENDING       │────────▶│  NOTIFICA AGENTE    │      │
│                    │   APPROVAL      │         │                     │      │
│                    └────────┬────────┘         └─────────────────────┘      │
│                             │                                                  │
│                             ▼                                                  │
│                    ┌─────────────────┐                                        │
│                    │  AGENTE VÊ      │                                        │
│                    │  RESPOSTA       │                                        │
│                    │  PODE:          │                                        │
│                    │  ✓ Aprovar       │                                        │
│                    │  ✗ Rejeitar      │                                        │
│                    │  ✎ Editar+Enviar │                                        │
│                    │  ⭐ Avaliar IA   │  ← Feedback para aprendizado          │
│                    └────────┬────────┘                                        │
│                             │                                                  │
│         ┌───────────────────┼───────────────────┐                            │
│         ▼                   ▼                   ▼                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐                   │
│  │  APPROVED   │    │  REJECTED  │    │  EDITED+SEND    │                   │
│  │             │    │            │    │                 │                   │
│  │ Resposta    │    │ Volta p/   │    │ Atendente edita    │                   │
│  │ enviada ao  │    │ fila       │    │ resposta e      │                   │
│  │ cliente     │    │ aguardando │    │ envia           │                   │
│  └─────────────┘    │ nova resp  │    └─────────────────┘                   │
│                     └─────────────┘                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Modelos de Dados

### 2.1 Tabela `ticket_ai_response`

```sql
CREATE TABLE ticket_ai_response (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES ticket(id) ON DELETE CASCADE,
    
    -- Resposta gerada pela IA
    response_text TEXT NOT NULL,
    
    -- Contexto usado (RAG + ticket info)
    context_used JSONB NOT NULL,  -- {
                                   --   "rag_sources": [...],
                                   --   "ticket_subject": "...",
                                   --   "ticket_category": "...",
                                   --   "retrieval_score": 0.85
                                   -- }
    
    -- Config do agente usado
    config_snapshot JSONB NOT NULL,  -- {
                                      --   "model": "gpt-4o",
                                      --   "temperature": 0.7,
                                      --   "prompt_hash": "abc123",
                                      --   "tools_used": ["rag"]
                                      -- }
    
    -- Timing
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_time_ms INTEGER,  -- Tempo para gerar resposta
    
    -- Status da aprovação
    status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected, edited
    
    -- Atendente que aprovou/rejeitou
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    
    -- Feedback do agente sobre a resposta da IA
    ai_rating INTEGER CHECK (ai_rating >= 1 AND ai_rating <= 5),  -- 1=péssima, 5=ótima
    ai_feedback TEXT,  -- "Resposta muito genérica", "Faltou citar o prazo"
    rejection_reason TEXT,  -- Motivo da rejeição
    
    -- Flags para aprendizado
    is_example_good BOOLEAN DEFAULT FALSE,  -- Marcar como exemplo positivo
    is_example_bad BOOLEAN DEFAULT FALSE,    -- Marcar como exemplo negativo
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_ai_response_ticket_id ON ticket_ai_response(ticket_id);
CREATE INDEX idx_ticket_ai_response_status ON ticket_ai_response(status);
CREATE INDEX idx_ticket_ai_response_rating ON ticket_ai_response(ai_rating);
```

### 2.2 Enum `AiResponseStatus`

```sql
CREATE TYPE ai_response_status AS ENUM (
    'pending',    -- Aguardando aprovação
    'approved',   -- Aprovada e enviada
    'rejected',   -- Rejeitada
    'edited'      -- Editada pelo agente antes de enviar
);
```

### 2.3 Tabela `ticket_message` (atualizada)

```sql
CREATE TABLE ticket_message (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES ticket(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id),
    
    content TEXT NOT NULL,
    
    -- Origem da mensagem
    message_type VARCHAR(20) NOT NULL,  -- 'customer', 'agent', 'ai_initial', 'ai_approved'
    
    -- Referência à resposta AI (se aplicável)
    ai_response_id INTEGER REFERENCES ticket_ai_response(id),
    
    -- Se foi editada pelo agente
    was_edited BOOLEAN DEFAULT FALSE,
    original_ai_text TEXT,  -- Texto original da IA se foi editado
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_message_ticket_id ON ticket_message(ticket_id);
```

### 2.4 Tabela `ai_feedback_log` (log de feedback)

```sql
CREATE TABLE ai_feedback_log (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES ticket(id) ON DELETE CASCADE,
    ai_response_id INTEGER REFERENCES ticket_ai_response(id),
    agent_id INTEGER REFERENCES users(id),
    
    -- Tipo de ação
    action VARCHAR(20) NOT NULL,  -- 'approved', 'rejected', 'edited', 'rated'
    
    -- Dados da ação
    previous_state JSONB,  -- Estado antes da ação
    new_state JSONB,      -- Estado após a ação
    
    -- Feedback
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_feedback_log_ticket_id ON ai_feedback_log(ticket_id);
CREATE INDEX idx_ai_feedback_log_agent_id ON ai_feedback_log(agent_id);
```

---

## 3. Tela do Atendente: Aprovação com Feedback

### 3.1 Wireframe - Tela de Aprovação

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FILA DE APROVAÇÃO                                                    [🔔 3] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Filtros:  [Todos os status ▼]  [Categoria ▼]  [Data ▼]  [🔍 Buscar...]    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  #1234 - Problema com login                                    ⏱ 2min   ││
│  │  Cliente: João Silva  •  Categoria: Suporte Técnico  •  Prioridade: Alta││
│  │  ───────────────────────────────────────────────────────────────────────││
│  │                                                                          ││
│  │  📋 Mensagem do Cliente:                                               ││
│  │  "Estou tentando fazer login mas aparece erro 500. Já tentei limpar   ││
│  │   cache e cookies mas não funcionou."                                   ││
│  │                                                                          ││
│  │  ───────────────────────────────────────────────────────────────────────││
│  │                                                                          ││
│  │  🤖 Resposta Gerada pela IA:                          ⭐⭐⭐⭐☆ (4/5)     ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐││
│  │  │ Olá João!                                                          │││
│  │  │                                                                     │││
│  │  │ Identificamos que o erro 500 pode estar relacionado a problemas    │││
│  │  │ no servidor de autenticação. Por favor, tente os seguintes pasos: │││
│  │  │                                                                     │││
│  │  │ 1. Aguarde 5 minutos e tente novamente                             │││
│  │  │ 2. Tente fazer login em janela anônima                            │││
│  │  │ 3. Se o problema persistir, entre em contato respondendo este     │││
│  │  │    ticket.                                                         │││
│  │  │                                                                     │││
│  │  │ Tempo estimado de resolução: 24 horas.                             │││
│  │  └─────────────────────────────────────────────────────────────────────┘││
│  │                                                                          ││
│  │  📚 Fontes RAG utilizadas:                                              ││
│  │  • FAQ - Problemas de Login (relevância: 92%)                         ││
│  │  • Manual do Usuário - Pág. 45 (relevância: 78%)                       ││
│  │                                                                          ││
│  │  ───────────────────────────────────────────────────────────────────────││
│  │                                                                          ││
│  │  ⭐ Avalie a resposta da IA:                                           ││
│  │  (ajuda a melhorar o aprendizado futuro)                               ││
│  │                                                                          ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐││
│  │  │ ⭐⭐⭐⭐⭐  ┃  ✗ Rejeitar  ┃  ✎ Editar e Enviar                    │││
│  │  └─────────────────────────────────────────────────────────────────────┘││
│  │                                                                          ││
│  │  ┌─ Feedback (opcional) ───────────────────────────────────────────┐  ││
│  │  │ [Resposta correta mas poderia mencionar prazo específico...    ] │  ││
│  │  └──────────────────────────────────────────────────────────────────┘  ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  #1233 - Dúvida sobre faturamento                              ⏱ 5min   ││
│  │  ...                                                                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Wireframe - Modal de Avaliação e Rejeição

```
┌─────────────────────────────────────────────────────────────────┐
│  AVALIAR RESPOSTA DA IA                                    [X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⭐ Como você avalia esta resposta?                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │    😞        😐        🤔        😊        🤩                  │ │
│  │   (1)       (2)       (3)       (4)       (5)                 │ │
│  │                                                                │ │
│  │   Péssima   Ruim     Regular    Boa     Ótima               │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Feedback (ajuda a melhorar) ─────────────────────────────┐  │
│  │                                                               │  │
│  │  [Explique por que deu esta nota...]                        │  │
│  │                                                               │  │
│  │  Sugestões comuns:                                           │  │
│  │  • "Resposta muito genérica"                                 │  │
│  │  • "Faltou citar política de reembolso"                      │  │
│  │  • "Boa resposta, seguiu o protocolo"                        │  │
│  │  • "Resolvido rapidamente"                                   │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ☐ Marcar como exemplo positivo (será usado para fine-tuning)    │
│  ☐ Marcar como exemplo negativo (excluir do treinamento)         │
│                                                                  │
│  ┌─ Rejeição ─────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  Motivo da rejeição:                                         │  │
│  │  [Selecione o motivo ▼]                                      │  │
│  │  • Informção incorreta                                       │  │
│  │  • Resposta incompleta                                       │  │
│  │  • Tom inadequado                                            │  │
│  │  • Não seguiu o padrão da empresa                            │  │
│  │  • Outro...                                                  │  │
│  │                                                               │  │
│  │  [Explique o motivo...]                                      │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                  │
│                           [Cancelar]  [Confirmar Avaliação]      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. API Endpoints

### 4.1 Fluxo de Ticket

```
POST   /api/v1/tickets                           # Cria ticket e dispara IA
GET    /api/v1/tickets/{ticket_id}/ai-response    # Pega resposta AI pendente
POST   /api/v1/tickets/{ticket_id}/ai-response/approve
POST   /api/v1/tickets/{ticket_id}/ai-response/reject
POST   /api/v1/tickets/{ticket_id}/ai-response/edit-and-send
POST   /api/v1/tickets/{ticket_id}/ai-response/rate
GET    /api/v1/agents/pending-responses           # Lista pendentes
```

### 4.2 Request/Response

**POST /api/v1/tickets** (criar ticket)
```json
// Request
{
  "category_id": 1,
  "priority": "high",
  "subject": "Erro 500 ao fazer login",
  "description": "Estou tentando fazer login mas aparece erro 500..."
}

// Response
{
  "id": 1234,
  "status": "pending_ai",
  "ai_response_id": 567,
  "message": "Ticket criado. IA está gerando resposta..."
}
```

**POST /api/v1/tickets/{id}/ai-response/approve**
```json
// Request
{
  "rating": 4,
  "feedback": "Boa resposta, seguiu o protocolo corretamente."
}

// Response
{
  "success": true,
  "message": "Resposta aprovada e enviada ao cliente.",
  "ticket_status": "pending_agent",
  "ai_response_id": 567
}
```

**POST /api/v1/tickets/{id}/ai-response/reject**
```json
// Request
{
  "rating": 2,
  "feedback": "Resposta muito genérica, não ajudou o cliente.",
  "rejection_reason": "informacao_incorreta",
  "mark_as_example_bad": false
}

// Response
{
  "success": true,
  "message": "Resposta rejeitada. Aguardando nova geração ou resposta manual.",
  "ai_response_id": 567
}
```

**POST /api/v1/tickets/{id}/ai-response/edit-and-send**
```json
// Request
{
  "edited_response": "Olá João! O erro 500 está relacionado ao servidor...",
  "rating": 5,
  "feedback": "Agora ficou perfeito!",
  "was_substantial_edit": false
}

// Response
{
  "success": true,
  "message": "Resposta editada e enviada ao cliente.",
  "ticket_status": "pending_agent"
}
```

---

## 5. Backend - Código

### 5.1 Service de Ticket

```python
# backend/app/services/ticket_service.py
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime

class TicketAIService:
    def __init__(self, db: Session):
        self.db = db
    
    async def create_ticket_with_ai(
        self,
        company_id: int,
        user_id: int,
        category_id: int,
        subject: str,
        description: str,
        priority: str
    ) -> dict:
        """
        1. Cria ticket
        2. Dispara agente IA (assíncrono)
        3. Retorna ticket com status pending_ai
        """
        # Criar ticket
        ticket = self.create_ticket(
            company_id=company_id,
            user_id=user_id,
            category_id=category_id,
            subject=subject,
            description=description,
            priority=priority,
            status=TicketStatus.PENDING_AI
        )
        
        # Salvar mensagem do cliente
        self.create_message(
            ticket_id=ticket.id,
            author_id=user_id,
            content=description,
            message_type='customer'
        )
        
        # Disparar IA (background task)
        await self.trigger_ai_agent(ticket.id)
        
        return ticket
    
    async def trigger_ai_agent(self, ticket_id: int):
        """Dispara o agente IA para gerar resposta"""
        # Implementação via Celery/RQ
        from app.tasks import generate_ai_response
        generate_ai_response.delay(ticket_id)
    
    async def approve_ai_response(
        self,
        ticket_id: int,
        agent_id: int,
        rating: int,
        feedback: Optional[str] = None
    ) -> dict:
        """Aprova resposta AI e envia ao cliente"""
        
        # 1. Atualizar AI response
        ai_response = self.get_pending_ai_response(ticket_id)
        ai_response.status = AiResponseStatus.APPROVED
        ai_response.reviewed_by = agent_id
        ai_response.reviewed_at = datetime.utcnow()
        ai_response.ai_rating = rating
        ai_response.ai_feedback = feedback
        
        # 2. Criar mensagem para o cliente
        self.create_message(
            ticket_id=ticket_id,
            author_id=agent_id,
            content=ai_response.response_text,
            message_type='ai_approved',
            ai_response_id=ai_response.id
        )
        
        # 3. Atualizar ticket status
        self.update_ticket_status(ticket_id, TicketStatus.PENDING_AGENT)
        
        # 4. Log de feedback
        self.log_feedback(
            ticket_id=ticket_id,
            ai_response_id=ai_response.id,
            agent_id=agent_id,
            action='approved',
            rating=rating,
            feedback_text=feedback
        )
        
        # 5. Notificar cliente (async)
        await self.notify_customer(ticket_id)
        
        return {"success": True}
    
    async def reject_ai_response(
        self,
        ticket_id: int,
        agent_id: int,
        rating: int,
        feedback: str,
        rejection_reason: str,
        mark_as_example_bad: bool = False
    ) -> dict:
        """Rejeita resposta AI"""
        
        ai_response = self.get_pending_ai_response(ticket_id)
        ai_response.status = AiResponseStatus.REJECTED
        ai_response.reviewed_by = agent_id
        ai_response.reviewed_at = datetime.utcnow()
        ai_response.ai_rating = rating
        ai_response.ai_feedback = feedback
        ai_response.rejection_reason = rejection_reason
        ai_response.is_example_bad = mark_as_example_bad
        
        # Log de feedback
        self.log_feedback(
            ticket_id=ticket_id,
            ai_response_id=ai_response.id,
            agent_id=agent_id,
            action='rejected',
            rating=rating,
            feedback_text=feedback
        )
        
        # Notificar que precisa de nova resposta ou intervenção
        await self.notify_agent_needs_manual_response(ticket_id)
        
        return {"success": True}
    
    async def edit_and_send_ai_response(
        self,
        ticket_id: int,
        agent_id: int,
        edited_response: str,
        rating: int,
        feedback: str,
        was_substantial_edit: bool
    ) -> dict:
        """Edita resposta AI e envia ao cliente"""
        
        ai_response = self.get_pending_ai_response(ticket_id)
        ai_response.status = AiResponseStatus.EDITED
        ai_response.reviewed_by = agent_id
        ai_response.reviewed_at = datetime.utcnow()
        ai_response.ai_rating = rating
        ai_response.ai_feedback = feedback
        
        # Criar mensagem com texto editado
        self.create_message(
            ticket_id=ticket_id,
            author_id=agent_id,
            content=edited_response,
            message_type='ai_approved',
            ai_response_id=ai_response.id,
            was_edited=True,
            original_ai_text=ai_response.response_text
        )
        
        # Atualizar ticket
        self.update_ticket_status(ticket_id, TicketStatus.PENDING_AGENT)
        
        # Log
        self.log_feedback(
            ticket_id=ticket_id,
            ai_response_id=ai_response.id,
            agent_id=agent_id,
            action='edited',
            rating=rating,
            feedback_text=feedback,
            previous_state={"response": ai_response.response_text},
            new_state={"response": edited_response}
        )
        
        await self.notify_customer(ticket_id)
        
        return {"success": True}
```

### 5.2 Task de Geração de Resposta

```python
# backend/app/tasks/ai_tasks.py
from celery import Task
from datetime import datetime
import time

class GenerateAIResponseTask(Task):
    name = "generate_ai_response"
    
    def run(self, ticket_id: int):
        """Gera resposta AI para um ticket"""
        start_time = time.time()
        
        # 1. Carregar ticket e contexto
        ticket = get_ticket_with_context(ticket_id)
        company_config = get_company_ai_config(ticket.company_id)
        
        # 2. RAG - Buscar documentos relevantes
        rag_context = retrieve_relevant_docs(
            query=ticket.description,
            company_id=ticket.company_id,
            top_k=5
        )
        
        # 3. Construir prompt
        prompt = build_prompt(
            config=company_config,
            ticket=ticket,
            rag_context=rag_context
        )
        
        # 4. Gerar resposta com LLM
        llm = get_llm(company_config)
        response_text = llm.invoke(prompt)
        
        # 5. Calcular processing time
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # 6. Salvar resposta AI
        ai_response = save_ai_response(
            ticket_id=ticket_id,
            response_text=response_text,
            context_used={
                "rag_sources": rag_context["sources"],
                "rag_relevance_avg": rag_context["avg_score"],
                "ticket_subject": ticket.subject,
                "ticket_category": ticket.category.name,
                "priority": ticket.priority
            },
            config_snapshot={
                "model": company_config.llm_model,
                "temperature": company_config.temperature,
                "tools_used": company_config.tools
            },
            processing_time_ms=processing_time_ms
        )
        
        # 7. Notificar agentes
        notify_agents_new_pending_response(ticket.company_id)
        
        return {"ai_response_id": ai_response.id}
```

---

## 6. Armazenamento para Aprendizado

### 6.1 Dados para Fine-tuning

```sql
-- View para extrair dados de treinamento
CREATE VIEW v_ai_training_data AS
SELECT 
    tar.id,
    tar.response_text,
    tar.context_used,
    tar.ai_rating,
    tar.rejection_reason,
    tar.is_example_good,
    tar.is_example_bad,
    tar.created_at,
    
    -- Parâmetros usados
    tar.config_snapshot->>'model' as model_used,
    
    -- Ticket info
    t.subject as ticket_subject,
    t.description as ticket_description,
    c.name as category_name
    
FROM ticket_ai_response tar
JOIN ticket t ON t.id = tar.ticket_id
JOIN category c ON c.id = t.category_id
WHERE 
    tar.status IN ('approved', 'edited')
    AND (tar.is_example_good = TRUE OR tar.ai_rating >= 4);

-- Exportar para JSONL (formato para fine-tuning)
-- Isso pode ser usado para criar datasets de treinamento
```

### 6.2 Métricas de Qualidade da IA

```sql
-- Dashboard de qualidade do agente AI
SELECT 
    DATE_TRUNC('week', created_at) as week,
    
    -- Volume
    COUNT(*) as total_responses,
    COUNT(*) FILTER (WHERE status = 'approved') as approved,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
    COUNT(*) FILTER (WHERE status = 'edited') as edited,
    
    -- Ratings
    AVG(ai_rating) as avg_rating,
    COUNT(*) FILTER (WHERE ai_rating >= 4) as high_rated,
    COUNT(*) FILTER (WHERE ai_rating <= 2) as low_rated,
    
    -- Performance
    AVG(processing_time_ms) as avg_processing_time,
    
    -- Patterns
    COUNT(*) FILTER (WHERE rejection_reason = 'informacao_incorreta') as wrong_info,
    COUNT(*) FILTER (WHERE rejection_reason = 'resposta_incompleta') as incomplete,
    COUNT(*) FILTER (WHERE rejection_reason = 'tom_inadequado') as bad_tone
    
FROM ticket_ai_response
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;
```

---

## 7. User Stories

### US-014: Sistema dispara IA automaticamente
**Como** sistema  
**Quero** disparar o agente de IA ao criar um ticket  
**Então** a resposta deve ser gerada e aguardada aprovação  

**Critérios de Aceite:**
- [ ] Ao criar ticket, status muda para "pending_ai"
- [ ] Atendente IA é disparado em background
- [ ] Resposta AI é salva com contexto e fontes RAG
- [ ] Atendentes são notificados de nova resposta pendente
- [ ] Tempo de geração é registrado

### US-015: Atendente aprova resposta AI
**Como** agente  
**Quero** aprovar uma resposta gerada por IA  
**Então** a resposta deve ser enviada ao cliente e avaliada  

**Critérios de Aceite:**
- [ ] Atendente vê lista de respostas pendentes
- [ ] Atendente pode visualizar a resposta e fontes RAG
- [ ] Atendente pode dar nota de 1-5 à resposta
- [ ] Atendente pode adicionar feedback textual
- [ ] Ao aprovar, mensagem é enviada ao cliente
- [ ] Ticket muda para status "pending_agent"

### US-016: Atendente rejeita resposta AI
**Como** agente  
**Quero** rejeitar uma resposta inadequada  
**Então** o ticket deve ficar pendente para resposta manual  

**Critérios de Aceite:**
- [ ] Atendente pode selecionar motivo da rejeição
- [ ] Atendente pode adicionar feedback textual
- [ ] Rejeição é registrada com todos os detalhes
- [ ] Ticket fica disponível para resposta manual
- [ ] Dado é marcado para excluir de future training (se aplicável)

### US-017: Atendente edita e envia resposta AI
**Como** agente  
**Quero** editar a resposta AI antes de enviar  
**Então** a resposta editada deve ser enviada e registrada  

**Critérios de Aceite:**
- [ ] Atendente pode editar texto da resposta
- [ ] Sistema registra texto original e editado
- [ ] Atendente pode avaliar a IA mesmo editando
- [ ] Resposta editada é enviada ao cliente
- [ ] Feedback é salvo para aprendizado

### US-018: Feedback é usado para aprendizado
**Como** sistema  
**Quero** coletar feedback para melhorar o agente  
**Então** devo armazenar dados para análise e future fine-tuning  

**Critérios de Aceite:**
- [ ] Ratings são armazenados (1-5)
- [ ] Feedback textual é salvo
- [ ] Motivos de rejeição são categorizados
- [ ] Exemplos bons/ruins podem ser marcados
- [ ] View para extrair dados de treinamento existe
- [ ] Dashboard de qualidade da IA disponível

---

## 8. Telas

### 8.1 Fila de Aprovação (`/agente/aprovacao`)

- Lista de tickets pendentes com preview da resposta AI
- Filtros por categoria, data, status
- Busca por conteúdo
- Ações rápidas: Aprovar ✗, Rejeitar ✓, Editar
- Indicador de tempo pendente

### 8.2 Detalhe do Ticket (`/agente/tickets/[id]`)

- Thread completa do ticket
- Mensagens do cliente
- Resposta AI (com rating e feedback)
- Área para resposta manual (se rejeitado)
- Botões de ação

### 8.3 Dashboard Admin - Métricas AI (`/admin/metricas-ai`)

- Rating médio da IA por semana
- Taxa de aprovação vs rejeição
- Tempo médio de geração
- Top razones de rejeição
- Exemplos de boas/mas respostas

---

## 9. Plano de Implementação

| Tarefa | Prioridade | Estimativa |
|--------|------------|------------|
| Criar tabela `ticket_ai_response` | Alta | 1h |
| Criar tabela `ai_feedback_log` | Alta | 1h |
| Atualizar `ticket_message` com tipos AI | Alta | 1h |
| Criar service `TicketAIService` | Alta | 4h |
| Criar task Celery `generate_ai_response` | Alta | 3h |
| Implementar endpoint approve/reject/edit | Alta | 3h |
| Criar fila de aprovação no frontend | Alta | 4h |
| Criar modal de avaliação/feedback | Alta | 3h |
| Criar task de notificação | Média | 2h |
| Dashboard de métricas AI | Média | 4h |
| View para training data | Média | 2h |
| Testes | Média | 4h |

---

**Documento criado:** `docs/spec-ticket-ai-flow.md`
