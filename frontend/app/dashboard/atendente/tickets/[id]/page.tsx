'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch, apiPost } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface Message {
  id: number
  ticket_id: string
  author_id: string | null
  author_name: string | null
  author_role: string | null
  content: string
  message_type: string
  ai_response_id: number | null
  was_edited: boolean
  original_ai_text: string | null
  is_internal: boolean
  created_at: string
}

interface TicketDetail {
  id: string
  ticket_number: string
  subject: string
  description: string
  status: string
  priority: string
  category_id: number | null
  category_name: string | null
  user_id: string
  user_name: string
  user_email: string
  assigned_to: string | null
  assignee_name: string | null
  created_at: string
  updated_at: string
  first_response_at: string | null
  resolved_at: string | null
  closed_at: string | null
  sla_due_at: string | null
  sla_breached: boolean
  rating: number | null
  rating_comment: string | null
  rated_at: string | null
  messages: Message[]
}

interface Agent {
  id: string
  full_name: string
  email: string
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Aberto',
  pending_ai: 'Aguardando IA',
  pending_agent: 'Aguardando Atendente',
  resolved: 'Resolvido',
  closed: 'Fechado',
  rejected: 'Rejeitado',
}

const MESSAGE_TYPE_LABELS: Record<string, string> = {
  customer: 'Cliente',
  agent: 'Atendente',
  ai_initial: 'IA (Pendente)',
  ai_approved: 'IA (Aprovada)',
  note: 'Nota Interna',
  system: 'Sistema',
}

export default function AtendenteTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (ticketId) {
      loadTicket()
      loadAgents()
    }
  }, [ticketId])

  async function loadTicket() {
    try {
      setLoading(true)
      const data = await apiFetch<TicketDetail>(`/tickets/${ticketId}`)
      setTicket(data)
    } catch (err) {
      setError('Erro ao carregar ticket')
    } finally {
      setLoading(false)
    }
  }

  async function loadAgents() {
    try {
      const data = await apiFetch<Agent[]>('/users?role=agent')
      setAgents(data)
    } catch (err) {
      console.error('Erro ao carregar agentes')
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    try {
      await apiPost(`/tickets/${ticketId}/messages`, {
        content: newMessage,
        is_internal: isInternal,
      })
      setNewMessage('')
      setIsInternal(false)
      loadTicket()
    } catch (err) {
      alert('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  async function handleAssign(assignedTo: string) {
    try {
      await apiPost(`/tickets/${ticketId}/assign`, {
        assigned_to: assignedTo,
        reason: 'manual',
      })
      loadTicket()
    } catch (err) {
      alert('Erro ao atribuir ticket')
    }
  }

  async function handleChangeStatus(newStatus: string) {
    try {
      await apiPost(`/tickets/${ticketId}`, {
        status: newStatus,
      })
      loadTicket()
    } catch (err) {
      alert('Erro ao alterar status')
    }
  }

  async function handleClose() {
    if (!confirm('Deseja realmente fechar este ticket?')) return
    handleChangeStatus('closed')
  }

  async function handleResolve() {
    handleChangeStatus('resolved')
  }

  if (loading) {
    return <div className="p-6 text-center">Carregando...</div>
  }

  if (error || !ticket) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded">{error || 'Ticket não encontrado'}</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-sm text-gray-500">{ticket.ticket_number}</span>
            <h1 className="text-2xl font-bold mt-1">{ticket.subject}</h1>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>Cliente: {ticket.user_name} ({ticket.user_email})</span>
              {ticket.category_name && <span>Categoria: {ticket.category_name}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium mb-2">{STATUS_LABELS[ticket.status] || ticket.status}</div>
            <div className={`text-sm ${
              ticket.priority === 'critical' ? 'text-red-600' :
              ticket.priority === 'high' ? 'text-orange-600' :
              ticket.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {ticket.priority.toUpperCase()}
            </div>
            {ticket.sla_due_at && (
              <div className={`text-xs mt-1 ${
                ticket.sla_breached ? 'text-red-600' : 'text-gray-500'
              }`}>
                SLA: {formatDate(ticket.sla_due_at)}
              </div>
            )}
          </div>
        </div>

        {/* Assignment */}
        <div className="mt-4 pt-4 border-t flex items-center gap-4">
          <span className="text-sm font-medium">Atendente:</span>
          {agents.length > 0 ? (
            <select
              value={ticket.assigned_to || ''}
              onChange={(e) => handleAssign(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="">Não atribuído</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.full_name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-gray-600">{ticket.assignee_name || 'Não atribuído'}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          {ticket.status === 'open' || ticket.status === 'pending_agent' ? (
            <>
              <button
                onClick={handleResolve}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Resolver
              </button>
              <button
                onClick={handleClose}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Fechar
              </button>
            </>
          ) : null}
          {ticket.status === 'resolved' && (
            <button
              onClick={() => handleChangeStatus('open')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reabrir
            </button>
          )}
          <Link
            href="/atendente/aprovacao"
            className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded hover:bg-yellow-200"
          >
            Ver IA Pendente
          </Link>
        </div>

        {/* Rating */}
        {ticket.rating && (
          <div className="mt-4 pt-4 border-t">
            <span className="text-sm font-medium">Avaliação do cliente:</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl text-yellow-500">
                {'★'.repeat(ticket.rating)}
                {'☆'.repeat(5 - ticket.rating)}
              </span>
              {ticket.rating_comment && (
                <span className="text-sm text-gray-600">"{ticket.rating_comment}"</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Mensagens</h2>
        
        <div className="space-y-4">
          {/* Original ticket description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-gray-700">Ticket Criado - {ticket.user_name}</span>
              <span className="text-sm text-gray-500">{formatDate(ticket.created_at)}</span>
            </div>
            <p className="text-gray-800">{ticket.description}</p>
          </div>

          {/* Conversation messages */}
          {ticket.messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-lg ${
                msg.is_internal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {msg.author_name || MESSAGE_TYPE_LABELS[msg.message_type] || 'Sistema'}
                  </span>
                  {msg.author_role && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      msg.author_role === 'customer' ? 'bg-blue-100 text-blue-700' :
                      msg.author_role === 'agent' ? 'bg-green-100 text-green-700' :
                      msg.author_role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {msg.author_role}
                    </span>
                  )}
                  {msg.is_internal && (
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
                      Interna
                    </span>
                  )}
                  {msg.message_type === 'ai_approved' && (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      IA
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{formatDate(msg.created_at)}</span>
              </div>
              
              <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
              
              {msg.was_edited && msg.original_ai_text && (
                <div className="mt-2 text-sm text-gray-500 italic">
                  <details className="cursor-pointer">
                    <summary className="text-blue-600">Ver resposta original da IA</summary>
                    <p className="mt-1 p-2 bg-gray-100 rounded">{msg.original_ai_text}</p>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reply form */}
      {ticket.status !== 'closed' && ticket.status !== 'rejected' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Responder</h2>
          <form onSubmit={handleSendMessage}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={4}
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Digite sua resposta..."
              required
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Nota interna (só atendentes veem)</span>
              </label>
              <button
                type="submit"
                disabled={sending}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}