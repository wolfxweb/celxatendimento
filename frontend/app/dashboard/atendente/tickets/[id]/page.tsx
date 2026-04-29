'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiFetch, apiPatch, apiPost, apiUpload } from '@/lib/api'
import { formatDate } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Attachment {
  id: number
  filename: string
  file_size: number
  mime_type: string
  uploaded_by: { id: number; name: string } | null
  created_at: string
  storage_url: string | null
}

interface FilePreview {
  id: string
  file: File
  preview?: string
}

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

interface TicketRelation {
  id: number
  relation_type: string
  description: string | null
  related_ticket: {
    id: string
    ticket_number: string
    subject: string
    status: string
    priority: string
  }
  created_at: string
}

interface AuditLog {
  id: number
  action_type: string
  user_id: string | null
  user_role: string | null
  old_values: any
  new_values: any
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

interface AIResponse {
  id: number
  ticket_id: number
  response_text: string
  context_used: any
  generated_at: string
  processing_time_ms: number | null
  status: string
  ai_rating: number | null
  ai_feedback: string | null
  is_example_good: boolean
  is_example_bad: boolean
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Aberto',
  pending_ai: 'Aprovação pendente',
  pending_agent: 'Aguardando Atendente',
  pending_customer_feedback: 'Aguardando feedback do cliente',
  resolved: 'Resolvido',
  closed: 'Fechado',
  rejected: 'Rejeitado',
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Aberto' },
  { value: 'pending_ai', label: 'Aprovação pendente' },
  { value: 'pending_agent', label: 'Aguardando Atendente' },
  { value: 'pending_customer_feedback', label: 'Aguardando feedback do cliente' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'closed', label: 'Fechado' },
  { value: 'rejected', label: 'Rejeitado' },
]

const STATUS_STYLES: Record<string, { bg: string; text: string; gradient: string }> = {
  open: { bg: 'bg-blue-500/10', text: 'text-blue-600', gradient: 'from-blue-500 to-cyan-500' },
  pending_ai: { bg: 'bg-amber-500/10', text: 'text-amber-600', gradient: 'from-amber-500 to-orange-500' },
  pending_agent: { bg: 'bg-orange-500/10', text: 'text-orange-600', gradient: 'from-orange-500 to-red-500' },
  pending_customer_feedback: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', gradient: 'from-cyan-500 to-blue-500' },
  resolved: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-500' },
  closed: { bg: 'bg-slate-500/10', text: 'text-slate-600', gradient: 'from-slate-500 to-gray-500' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-600', gradient: 'from-red-500 to-pink-500' },
}

const MESSAGE_TYPE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  customer: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: '👤' },
  agent: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: '👨‍💻' },
  ai_initial: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: '🤖' },
  ai_approved: { bg: 'bg-violet-500/10', text: 'text-violet-600', icon: '✨' },
  note: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', icon: '📝' },
  system: { bg: 'bg-slate-500/10', text: 'text-slate-600', icon: '⚙️' },
}

const RELATION_TYPES: Record<string, string> = {
  duplicate: 'Duplicado',
  causes: 'Causa',
  caused_by: 'Causado por',
  related: 'Relacionado',
  subtask: 'Subtarefa',
  parent: 'Ticket Pai',
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  created: 'Ticket criado',
  status_changed: 'Status alterado',
  priority_changed: 'Prioridade alterada',
  category_changed: 'Categoria alterada',
  assigned_to: 'Atribuído a',
  unassigned: 'Desatribuído',
  relation_added: 'Relação adicionada',
  relation_removed: 'Relação removida',
  ai_response_generated: 'Resposta IA gerada',
  ai_response_approved: 'Resposta IA aprovada',
  ai_response_rejected: 'Resposta IA rejeitada',
  ai_response_edited: 'Resposta IA editada',
  message_edited: 'Mensagem editada',
  message_added: 'Mensagem adicionada',
  note_added: 'Nota adicionada',
  escalated: 'Escalado',
  closed: 'Fechado',
  reopened: 'Reaberto',
  rating_added: 'Avaliação adicionada',
}

type TabType = 'mensagens' | 'aprovacao' | 'responder' | 'relacionados' | 'alteracoes' | 'anexos'

const ALLOWED_FILE_TYPES = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip']
const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export default function AtendenteTicketDetailPage() {
  const params = useParams()
  const ticketId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [categories, setCategories] = useState<{id: number; name: string}[]>([])
  const [relations, setRelations] = useState<TicketRelation[]>([])
  const [auditLog, setAuditLog] = useState<AuditLog[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([])
  const [editedAiResponses, setEditedAiResponses] = useState<Record<number, string>>({})
  const [pendingFiles, setPendingFiles] = useState<FilePreview[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('mensagens')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sending, setSending] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [processingAiResponse, setProcessingAiResponse] = useState<number | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [editingMessageContent, setEditingMessageContent] = useState('')
  const [editingMessageInternal, setEditingMessageInternal] = useState(false)
  const [savingMessageEdit, setSavingMessageEdit] = useState(false)

  useEffect(() => {
    if (ticketId) {
      loadTicket()
      loadAgents()
      loadCategories()
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
      console.error('Erro ao carregar agentes:', err)
    }
  }

  async function loadCategories() {
    try {
      const data = await apiFetch<{categories: {id: number; name: string}[]}>('/categories/active')
      setCategories(data.categories)
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
    }
  }

  async function handleChangeCategory(categoryId: string) {
    try {
      await apiPatch(`/tickets/${ticketId}`, {
        category_id: categoryId ? parseInt(categoryId) : null,
      })
      loadTicket()
    } catch (err) {
      alert('Erro ao alterar categoria')
    }
  }

  async function loadAttachments() {
    try {
      const data = await apiFetch<{ attachments: Attachment[] }>(`/tickets/${ticketId}/attachments`)
      setAttachments(data.attachments)
    } catch (err) {
      console.error('Erro ao carregar anexos:', err)
    }
  }

  async function loadRelations() {
    try {
      const data = await apiFetch<TicketRelation[]>(`/tickets/${ticketId}/relations`)
      setRelations(data)
    } catch (err) {
      console.error('Erro ao carregar relações:', err)
    }
  }

  async function loadAuditLog() {
    try {
      const data = await apiFetch<AuditLog[]>(`/tickets/${ticketId}/audit-log`)
      setAuditLog(data)
    } catch (err) {
      console.error('Erro ao carregar log:', err)
    }
  }

  async function loadAIResponses() {
    try {
      const data = await apiFetch<AIResponse[]>(`/tickets/${ticketId}/ai/responses`)
      setAiResponses(data)
      setEditedAiResponses(
        data.reduce<Record<number, string>>((acc, response) => {
          acc[response.id] = response.response_text
          return acc
        }, {})
      )
    } catch (err) {
      console.error('Erro ao carregar respostas IA:', err)
    }
  }

  function handleTabChange(tab: TabType) {
    setActiveTab(tab)
    if (tab === 'aprovacao' && aiResponses.length === 0) {
      loadAIResponses()
    } else if (tab === 'relacionados' && relations.length === 0) {
      loadRelations()
    } else if (tab === 'alteracoes' && auditLog.length === 0) {
      loadAuditLog()
    } else if (tab === 'anexos' && attachments.length === 0) {
      loadAttachments()
    }
  }

  async function handleApproveAIResponse(response: AIResponse) {
    const editedText = editedAiResponses[response.id]?.trim()
    setProcessingAiResponse(response.id)
    try {
      if (editedText && editedText !== response.response_text.trim()) {
        await apiPost(`/tickets/${ticketId}/ai/edit`, {
          ai_response_id: response.id,
          edited_response: editedText,
        })
      } else {
        await apiPost(`/tickets/${ticketId}/ai/approve`, {
          ai_response_id: response.id,
          rating: null,
          feedback: null,
        })
      }
      await loadTicket()
      await loadAIResponses()
    } catch (err) {
      alert('Erro ao aprovar resposta')
    } finally {
      setProcessingAiResponse(null)
    }
  }

  async function handleRejectAIResponse(response: AIResponse) {
    const reason = prompt('Motivo da rejeição:')
    if (!reason) return

    setProcessingAiResponse(response.id)
    try {
      await apiPost(`/tickets/${ticketId}/ai/reject`, {
        ai_response_id: response.id,
        rejection_reason: reason,
        rating: null,
        feedback: null,
      })
      await loadTicket()
      await loadAIResponses()
    } catch (err) {
      alert('Erro ao rejeitar resposta')
    } finally {
      setProcessingAiResponse(null)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const newFiles: FilePreview[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!ALLOWED_FILE_TYPES.includes(ext)) {
        alert(`Arquivo ${file.name}: extensão ${ext} não permitida`)
        continue
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(`Arquivo ${file.name}: excede limite de ${MAX_FILE_SIZE_MB}MB`)
        continue
      }
      newFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      })
    }
    setPendingFiles(prev => [...prev, ...newFiles])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePendingFile(id: string) {
    setPendingFiles(prev => {
      const f = prev.find(x => x.id === id)
      if (f?.preview) URL.revokeObjectURL(f.preview)
      return prev.filter(x => x.id !== id)
    })
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf': return '📄'
      case 'doc': case 'docx': return '📝'
      case 'xls': case 'xlsx': return '📊'
      case 'jpg': case 'jpeg': case 'png': return '🖼️'
      case 'zip': return '📦'
      case 'txt': return '📃'
      default: return '📎'
    }
  }

  function getAttachmentUrl(attachment: Attachment): string | undefined {
    if (!attachment.storage_url) return undefined
    if (attachment.storage_url.startsWith('http')) return attachment.storage_url
    return `${API_URL}${attachment.storage_url}`
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() && pendingFiles.length === 0) return

    setSending(true)
    try {
      if (pendingFiles.length > 0) {
        const formData = new FormData()
        pendingFiles.forEach(f => formData.append('files', f.file))
        await apiUpload(`/tickets/${ticketId}/attachments`, formData)
        setPendingFiles([])
      }

      if (newMessage.trim()) {
        await apiPost(`/tickets/${ticketId}/messages`, {
          content: newMessage,
          is_internal: isInternal,
        })
      }

      setNewMessage('')
      setIsInternal(false)
      loadTicket()
      loadAttachments()
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Erro ao enviar mensagem'
      alert(message)
    } finally {
      setSending(false)
    }
  }

  function startEditMessage(message: Message) {
    setEditingMessageId(message.id)
    setEditingMessageContent(message.content)
    setEditingMessageInternal(message.is_internal)
  }

  async function saveMessageEdit(messageId: number) {
    if (!editingMessageContent.trim()) return

    setSavingMessageEdit(true)
    try {
      await apiPatch(`/tickets/${ticketId}/messages/${messageId}`, {
        content: editingMessageContent.trim(),
        is_internal: editingMessageInternal,
      })
      setEditingMessageId(null)
      setEditingMessageContent('')
      setEditingMessageInternal(false)
      await loadTicket()
      if (activeTab === 'alteracoes') {
        await loadAuditLog()
      } else {
        setAuditLog([])
      }
    } catch (err) {
      alert('Erro ao editar mensagem')
    } finally {
      setSavingMessageEdit(false)
    }
  }

  async function handleAssign(assignedTo: string) {
    try {
      await apiPost(`/tickets/${ticketId}/assign`, {
        assigned_to: assignedTo || null,
        reason: 'manual',
      })
      loadTicket()
    } catch (err) {
      alert('Erro ao atribuir ticket')
    }
  }

  async function handleChangeStatus(newStatus: string) {
    if (!newStatus || newStatus === ticket?.status) return

    try {
      setUpdatingStatus(true)
      await apiPatch(`/tickets/${ticketId}`, {
        status: newStatus,
      })
      loadTicket()
    } catch (err) {
      alert('Erro ao alterar status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleClose() {
    if (!confirm('Deseja realmente fechar este ticket?')) return
    handleChangeStatus('closed')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600">
        {error || 'Ticket não encontrado'}
      </div>
    )
  }

  const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.open

  return (
    <div className="w-full space-y-6">
      <div className="p-6 rounded-2xl bg-white shadow-card-modern border border-slate-100">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-slate-400">{ticket.ticket_number}</span>
              <select
                value={ticket.status}
                onChange={(e) => handleChangeStatus(e.target.value)}
                disabled={updatingStatus}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border border-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 disabled:cursor-not-allowed ${statusStyle.bg} ${statusStyle.text}`}
                aria-label="Alterar status do ticket"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{ticket.subject}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <span>👤</span> {ticket.user_name}
              </span>
              <span className="flex items-center gap-1">
                <span>✉️</span> {ticket.user_email}
              </span>
              {ticket.category_name && (
                <span className="flex items-center gap-1">
                  <span>📁</span> {ticket.category_name}
                </span>
              )}
              {ticket.assignee_name && (
                <span className="flex items-center gap-1">
                  <span>👨‍💻</span> {ticket.assignee_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <span>📅</span> {formatDate(ticket.created_at)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1.5 rounded-xl font-semibold text-sm ${
              ticket.priority === 'critical' ? 'bg-red-500/10 text-red-600' :
              ticket.priority === 'high' ? 'bg-orange-500/10 text-orange-600' :
              ticket.priority === 'medium' ? 'bg-amber-500/10 text-amber-600' :
              'bg-emerald-500/10 text-emerald-600'
            }`}>
              {ticket.priority.toUpperCase()}
            </div>
            {ticket.sla_due_at && (
              <div className={`text-xs ${ticket.sla_breached ? 'text-red-600' : 'text-slate-400'}`}>
                SLA: {formatDate(ticket.sla_due_at)}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Atendente:</span>
            {agents.length > 0 ? (
              <select
                value={ticket.assigned_to || ''}
                onChange={(e) => handleAssign(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Não atribuído</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.full_name || agent.email}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm text-slate-500">{ticket.assignee_name || 'Não atribuído'}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Categoria:</span>
            {categories.length > 0 ? (
              <select
                value={ticket.category_id || ''}
                onChange={(e) => handleChangeCategory(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Sem categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm text-slate-500">{ticket.category_name || 'Sem categoria'}</span>
            )}
          </div>

          {ticket.status === 'open' || ticket.status === 'pending_agent' ? (
            <>
              <button
                onClick={() => handleChangeStatus('resolved')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg hover:shadow-glow-primary transition-all"
              >
                <span>✓</span> Resolver
              </button>
              <button
                onClick={handleClose}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 text-white font-medium shadow-lg hover:bg-slate-800 transition-all"
              >
                Fechar
              </button>
            </>
          ) : null}

          {ticket.status === 'resolved' && (
            <button
              onClick={() => handleChangeStatus('open')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white font-medium shadow-lg hover:bg-blue-600 transition-all"
            >
              Reabrir
            </button>
          )}

          <Link
            href="/dashboard/atendente/aprovacao"
            className="px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
          >
            Ver IA Pendente
          </Link>
        </div>

        {ticket.rating && (
          <div className="flex items-center gap-2 p-3 mt-4 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-sm text-amber-700">Avaliação do cliente:</span>
            <span className="text-2xl text-yellow-400">
              {'★'.repeat(ticket.rating)}
              {'☆'.repeat(5 - ticket.rating)}
            </span>
            {ticket.rating_comment && (
              <span className="text-sm text-amber-600 italic">"{ticket.rating_comment}"</span>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white shadow-card-modern border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100">
          <div className="flex">
            {(['mensagens', 'aprovacao', 'responder', 'relacionados', 'alteracoes', 'anexos'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab === 'anexos'
                  ? `Anexos (${attachments.length})`
                  : tab === 'responder'
                    ? 'Responder'
                    : tab === 'aprovacao'
                      ? `Aprovação${aiResponses.length > 0 ? ` (${aiResponses.length})` : ''}`
                      : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'mensagens' && ` (${ticket.messages.length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'mensagens' && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {ticket.user_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-semibold text-slate-700">{ticket.user_name}</span>
                  <span className="text-xs text-slate-400 ml-auto">{formatDate(ticket.created_at)}</span>
                </div>
                <p className="text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {ticket.messages.map((msg) => {
                const msgStyle = MESSAGE_TYPE_STYLES[msg.message_type] || MESSAGE_TYPE_STYLES.system

                return (
                  <div
                    key={msg.id}
                    className={`p-5 rounded-xl border transition-all ${
                      msg.is_internal
                        ? 'bg-yellow-50/50 border-yellow-200'
                        : 'bg-slate-50/50 border-slate-200 hover:border-primary-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${msg.is_internal ? 'bg-yellow-100' : msgStyle.bg}`}>
                        {msg.is_internal ? '📝' : msgStyle.icon}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {msg.author_name || msg.message_type}
                      </span>
                      {msg.author_role && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${msgStyle.bg} ${msgStyle.text}`}>
                          {msg.author_role}
                        </span>
                      )}
                      {msg.is_internal && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                          Interna
                        </span>
                      )}
                      {msg.message_type === 'ai_approved' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                          ✨ IA
                        </span>
                      )}
                      {msg.was_edited && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Editada
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">{formatDate(msg.created_at)}</span>
                      {(msg.message_type === 'agent' || msg.message_type === 'note') && (
                        <button
                          type="button"
                          onClick={() => startEditMessage(msg)}
                          className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:text-primary-600"
                        >
                          Editar
                        </button>
                      )}
                    </div>

                    {editingMessageId === msg.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editingMessageContent}
                          onChange={(event) => setEditingMessageContent(event.target.value)}
                          rows={5}
                          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={editingMessageInternal}
                              onChange={(event) => setEditingMessageInternal(event.target.checked)}
                              className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                            Nota interna
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingMessageId(null)}
                              disabled={savingMessageEdit}
                              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => saveMessageEdit(msg.id)}
                              disabled={savingMessageEdit || !editingMessageContent.trim()}
                              className="px-4 py-2 rounded-lg bg-gradient-primary text-sm font-semibold text-white shadow-lg hover:shadow-glow-primary disabled:opacity-50"
                            >
                              {savingMessageEdit ? 'Salvando...' : 'Salvar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-700 whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {msg.was_edited && msg.original_ai_text && (
                      <details className="mt-3">
                        <summary className="text-sm text-primary-600 cursor-pointer hover:text-primary-700">
                          {msg.message_type === 'ai_approved' ? 'Ver resposta original da IA' : 'Ver texto original'}
                        </summary>
                        <p className="mt-2 p-3 rounded-lg bg-slate-100 text-slate-600 text-sm font-mono">
                          {msg.original_ai_text}
                        </p>
                      </details>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'aprovacao' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-700">Respostas disponíveis para aprovação</h3>
                  <p className="text-sm text-slate-500">Revise, edite se necessário, aprove e envie ao cliente.</p>
                </div>
                <button
                  type="button"
                  onClick={loadAIResponses}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Atualizar
                </button>
              </div>

              {aiResponses.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-slate-200">
                  <div className="text-5xl mb-3">🤖</div>
                  <p className="font-medium text-slate-700">Nenhuma resposta pendente</p>
                  <p className="mt-1 text-sm text-slate-500">Quando a IA gerar uma resposta para este chamado, ela aparecerá aqui.</p>
                </div>
              ) : (
                aiResponses.map((response, index) => (
                  <div key={response.id} className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/60 to-violet-50/40 overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 bg-white/70 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-lg">🤖</span>
                        <div>
                          <div className="font-semibold text-slate-800">Resposta IA #{index + 1}</div>
                          <div className="text-xs text-slate-500">
                            Gerada em {formatDate(response.generated_at)}
                            {response.processing_time_ms ? ` · ${response.processing_time_ms}ms` : ''}
                          </div>
                        </div>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        Pendente
                      </span>
                    </div>

                    <div className="space-y-4 p-4">
                      <textarea
                        value={editedAiResponses[response.id] ?? response.response_text}
                        onChange={(event) =>
                          setEditedAiResponses((current) => ({
                            ...current,
                            [response.id]: event.target.value,
                          }))
                        }
                        disabled={processingAiResponse === response.id}
                        rows={10}
                        className="w-full min-h-[260px] rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 shadow-inner outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      {response.context_used?.rag_sources?.length > 0 && (
                        <details className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                          <summary className="px-4 py-3 bg-slate-100 cursor-pointer text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors">
                            📚 Ver fontes RAG ({response.context_used.rag_sources.length})
                          </summary>
                          <div className="p-4 space-y-3">
                            {response.context_used.rag_sources.map((source: any, sourceIndex: number) => (
                              <div key={sourceIndex} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="font-medium text-slate-700">{source.title || `Fonte ${sourceIndex + 1}`}</span>
                                {source.content && <p className="text-sm text-slate-600 mt-1">{source.content}</p>}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleApproveAIResponse(response)}
                          disabled={processingAiResponse === response.id}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg hover:shadow-glow-primary transition-all disabled:opacity-50"
                        >
                          <span>✓</span>
                          Aprovar e enviar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectAIResponse(response)}
                          disabled={processingAiResponse === response.id}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                        >
                          <span>✗</span>
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'responder' && (
            <div>
              {ticket.status !== 'closed' && ticket.status !== 'rejected' ? (
                <div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-4">Enviar Mensagem</h3>
                  <form onSubmit={handleSendMessage}>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                      placeholder="Digite sua mensagem..."
                    />

                    {pendingFiles.length > 0 && (
                      <div className="mt-3 space-y-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                        {pendingFiles.map(f => (
                          <div key={f.id} className="flex items-center justify-between p-2 bg-white rounded border border-slate-100">
                            <div className="flex items-center gap-2 min-w-0">
                              {f.preview ? (
                                <img src={f.preview} alt="" className="w-8 h-8 object-cover rounded" />
                              ) : (
                                <span className="text-lg">{getFileIcon(f.file.name)}</span>
                              )}
                              <span className="text-sm text-slate-600 truncate">{f.file.name}</span>
                              <span className="text-xs text-slate-400">({formatFileSize(f.file.size)})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePendingFile(f.id)}
                              className="p-1 text-slate-400 hover:text-red-500"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="file"
                          ref={fileInputRef}
                          multiple
                          accept={ALLOWED_FILE_TYPES.join(',')}
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                        >
                          📎 Anexar arquivos
                        </button>
                        {pendingFiles.length > 0 && (
                          <span className="text-xs text-slate-400">{pendingFiles.length} arquivo(s) pendente(s)</span>
                        )}
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                          />
                          Nota interna
                        </label>
                      </div>
                      <button
                        type="submit"
                        disabled={sending}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-medium shadow-lg hover:shadow-glow-primary transition-all disabled:opacity-50"
                      >
                        {sending ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <span>➤</span>
                            Enviar
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🔒</div>
                  <p className="text-slate-500">Este ticket não aceita novas mensagens</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'relacionados' && (
            <div>
              {relations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🔗</div>
                  <p className="text-slate-500">Nenhum ticket relacionado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {relations.map((rel) => (
                    <div key={rel.id} className="p-4 rounded-xl border border-slate-200 hover:border-primary-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          rel.related_ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                          rel.related_ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {rel.related_ticket.ticket_number}
                        </span>
                        <span className="font-medium text-slate-700">{rel.related_ticket.subject}</span>
                      </div>
                      <div className="mt-2 text-sm text-slate-500 flex items-center gap-2">
                        <span>{RELATION_TYPES[rel.relation_type] || rel.relation_type}</span>
                        {rel.description && <span>- {rel.description}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'alteracoes' && (
            <div>
              {auditLog.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📋</div>
                  <p className="text-slate-500">Nenhuma alteração registrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLog.map((log, index) => (
                    <div
                      key={log.id}
                      className="flex gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-600 text-sm font-bold">
                          {index + 1}
                        </div>
                        {index < auditLog.length - 1 && (
                          <div className="w-0.5 h-full bg-slate-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-slate-700">
                            {ACTION_TYPE_LABELS[log.action_type] || log.action_type}
                          </span>
                          {log.user_role && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              log.user_role === 'customer' ? 'bg-blue-100 text-blue-700' :
                              log.user_role === 'agent' ? 'bg-emerald-100 text-emerald-700' :
                              log.user_role === 'admin' ? 'bg-violet-100 text-violet-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {log.user_role}
                            </span>
                          )}
                        </div>
                        {log.new_values && (
                          <div className="mt-1 text-sm text-slate-500 flex flex-wrap gap-2">
                            {Object.entries(log.new_values).map(([key, value]) => (
                              <span key={key} className="px-2 py-1 rounded bg-slate-100">
                                <span className="text-slate-400">{key}:</span> <strong className="text-slate-700">{String(value)}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-slate-400 mt-1 block">{formatDate(log.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'anexos' && (
            <div>
              {attachments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📎</div>
                  <p className="text-slate-500">Nenhum anexo enviado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attachments.map((attachment) => {
                    const url = getAttachmentUrl(attachment)

                    return (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl shrink-0">{getFileIcon(attachment.filename)}</span>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-700 truncate">{attachment.filename}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                              <span>{formatFileSize(attachment.file_size)}</span>
                              <span>{formatDate(attachment.created_at)}</span>
                              {attachment.uploaded_by?.name && <span>{attachment.uploaded_by.name}</span>}
                            </div>
                          </div>
                        </div>
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
                          >
                            Abrir
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
