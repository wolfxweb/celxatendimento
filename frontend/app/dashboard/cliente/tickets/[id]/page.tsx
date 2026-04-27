'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { apiFetch, apiPost, apiUpload } from '@/lib/api'
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
  rating: number | null
  rating_comment: string | null
  rated_at: string | null
  messages: Message[]
}

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
  message_added: 'Mensagem adicionada',
  note_added: 'Nota adicionada',
  escalated: 'Escalado',
  closed: 'Fechado',
  reopened: 'Reaberto',
  rating_added: 'Avaliação adicionada',
}

type TabType = 'mensagens' | 'relacionados' | 'alteracoes' | 'anexos'

const ALLOWED_FILE_TYPES = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip']
const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export default function TicketDetailPage() {
  const params = useParams()
  const ticketId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [relations, setRelations] = useState<TicketRelation[]>([])
  const [auditLog, setAuditLog] = useState<AuditLog[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [pendingFiles, setPendingFiles] = useState<FilePreview[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('mensagens')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (ticketId) {
      loadTicket()
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

  function handleTabChange(tab: TabType) {
    setActiveTab(tab)
    if (tab === 'relacionados' && relations.length === 0) {
      loadRelations()
    } else if (tab === 'alteracoes' && auditLog.length === 0) {
      loadAuditLog()
    } else if (tab === 'anexos' && attachments.length === 0) {
      loadAttachments()
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

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() && pendingFiles.length === 0) return

    setSending(true)
    try {
      // Upload attachments first if any
      if (pendingFiles.length > 0) {
        const formData = new FormData()
        pendingFiles.forEach(f => formData.append('files', f.file))
        await apiUpload(`/tickets/${ticketId}/attachments`, formData)
        setPendingFiles([])
      }

      // Send message
      if (newMessage.trim()) {
        await apiPost(`/tickets/${ticketId}/messages`, {
          content: newMessage,
          is_internal: false,
        })
      }

      setNewMessage('')
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

  function getAttachmentUrl(attachment: Attachment): string | undefined {
    if (!attachment.storage_url) return undefined
    if (attachment.storage_url.startsWith('http')) return attachment.storage_url
    return `${API_URL}${attachment.storage_url}`
  }

  async function handleCloseTicket() {
    if (!confirm('Deseja realmente fechar este ticket?')) return

    try {
      await apiPost(`/tickets/${ticketId}`, { status: 'closed' })
      loadTicket()
    } catch (err) {
      alert('Erro ao fechar ticket')
    }
  }

  async function handleRate(rating: number) {
    const comment = prompt('Adicione um comentário (opcional):')
    
    try {
      await apiPost(`/tickets/${ticketId}/rate`, {
        rating,
        comment,
      })
      loadTicket()
    } catch (err) {
      alert('Erro ao avaliar atendimento')
    }
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="p-6 rounded-2xl bg-white shadow-card-modern border border-slate-100">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-slate-400">{ticket.ticket_number}</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${statusStyle.gradient}`}></span>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{ticket.subject}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <span>👤</span> {ticket.user_name}
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
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-100">
          {ticket.status === 'open' || ticket.status === 'pending_agent' ? (
            <button
              onClick={handleCloseTicket}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg hover:shadow-glow-primary transition-all"
            >
              <span>✓</span> Fechar Ticket
            </button>
          ) : null}
          
          {ticket.status === 'closed' && !ticket.rating && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Avaliar:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className="text-3xl text-gray-300 hover:text-yellow-400 hover:scale-110 transition-all"
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {ticket.rating && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-sm text-amber-700">Sua avaliação:</span>
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
      </div>

      {/* Tabs */}
      <div className="rounded-2xl bg-white shadow-card-modern border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100">
          <div className="flex">
            {(['mensagens', 'relacionados', 'alteracoes', 'anexos'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab === 'anexos' ? `Anexos (${attachments.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'mensagens' && ` (${ticket.messages.length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Mensagens Tab */}
          {activeTab === 'mensagens' && (
            <div className="space-y-4">
              {/* Original ticket description */}
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

              {/* Messages */}
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
                      <span className="text-xs text-slate-400 ml-auto">{formatDate(msg.created_at)}</span>
                    </div>
                    
                    <p className="text-slate-700 whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.was_edited && msg.original_ai_text && (
                      <details className="mt-3">
                        <summary className="text-sm text-primary-600 cursor-pointer hover:text-primary-700">
                          Ver resposta original da IA
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

          {/* Relacionados Tab */}
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

          {/* Alterações Tab */}
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

          {/* Anexos Tab */}
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

      {/* Reply Form */}
      {ticket.status !== 'closed' && ticket.status !== 'rejected' && (
        <div className="p-6 rounded-2xl bg-white shadow-card-modern border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Enviar Mensagem</h3>
          <form onSubmit={handleSendMessage}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
              placeholder="Digite sua mensagem..."
            />

            {/* Pending attachments preview */}
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
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
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
      )}
    </div>
  )
}
