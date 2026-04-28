'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch, apiPost } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface PendingTicket {
  id: string
  ticket_number: string
  subject: string
  description: string
  priority: string
  status: string
  customer_name: string
  category_name: string | null
  created_at: string
  ai_response: {
    id: number
    response_text: string
    context_used: any
    generated_at: string
    processing_time_ms: number
    ai_rating?: number
    is_example_good?: boolean
    is_example_bad?: boolean
  } | null
}

interface FeedbackStats {
  total_rated: number
  average_rating: number
  rating_distribution: Record<number, number>
  good_examples: number
  bad_examples: number
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-600' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-600' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
}

export default function AprovacaoPage() {
  const [tickets, setTickets] = useState<PendingTicket[]>([])
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [feedbackMode, setFeedbackMode] = useState<string | null>(null)
  const [feedbackModal, setFeedbackModal] = useState<{
    ticketId: string
    rating: number
    isExampleGood: boolean
    isExampleBad: boolean
  } | null>(null)
  const [feedbackText, setFeedbackText] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [ticketsData, statsData] = await Promise.all([
        apiFetch<PendingTicket[]>('/tickets?status=pending_ai'),
        apiFetch<FeedbackStats>('/tickets/ai/stats'),
      ])
      setTickets(ticketsData)
      setStats(statsData)
    } catch (err) {
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(ticketId: string) {
    setProcessing(ticketId)
    try {
      await apiPost(`/tickets/${ticketId}/ai/approve`, {
        rating: null,
        feedback: null,
      })
      loadData()
    } catch (err) {
      alert('Erro ao aprovar resposta')
    } finally {
      setProcessing(null)
    }
  }

  async function handleReject(ticketId: string) {
    const reason = prompt('Motivo da rejeição:')
    if (!reason) return

    setProcessing(ticketId)
    try {
      await apiPost(`/tickets/${ticketId}/ai/reject`, {
        rejection_reason: reason,
        rating: null,
        feedback: null,
      })
      loadData()
    } catch (err) {
      alert('Erro ao rejeitar resposta')
    } finally {
      setProcessing(null)
    }
  }

  async function handleEdit(ticketId: string) {
    const newText = prompt('Digite a nova resposta:')
    if (!newText) return

    setProcessing(ticketId)
    try {
      await apiPost(`/tickets/${ticketId}/ai/edit`, {
        edited_response: newText,
      })
      loadData()
    } catch (err) {
      alert('Erro ao editar resposta')
    } finally {
      setProcessing(null)
    }
  }

  function openFeedbackModal(ticketId: string, rating: number, isExampleGood: boolean, isExampleBad: boolean) {
    setFeedbackText('')
    setFeedbackModal({ ticketId, rating, isExampleGood, isExampleBad })
  }

  async function handleRate() {
    if (!feedbackModal) return

    setProcessing(feedbackModal.ticketId)
    try {
      await apiPost(`/tickets/${feedbackModal.ticketId}/ai/feedback`, {
        rating: feedbackModal.rating,
        feedback: feedbackText.trim() || null,
        is_example_good: feedbackModal.isExampleGood,
        is_example_bad: feedbackModal.isExampleBad,
      })
      setFeedbackMode(null)
      setFeedbackModal(null)
      setFeedbackText('')
      loadData()
    } catch (err) {
      alert('Erro ao enviar feedback')
    } finally {
      setProcessing(null)
    }
  }

  async function handleMarkAsExample(ticketId: string, isGood: boolean) {
    const reason = isGood 
      ? prompt('Por que esta é uma boa resposta? (opcional):')
      : prompt('Por que esta é uma má resposta? (opcional):')
    
    try {
      await apiPost(`/tickets/${ticketId}/ai/example`, {
        is_good: isGood,
        reason,
      })
      loadData()
    } catch (err) {
      alert('Erro ao marcar exemplo')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" style={{ animationDelay: '0.15s' }}></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 backdrop-blur-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-primary-600">
              Aprovação de IA
            </span>
          </h1>
          <p className="text-slate-500 mt-1">Revise e aprove respostas geradas por inteligência artificial</p>
        </div>
        
        {/* Stats mini cards */}
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500/10 to-primary-500/10 border border-violet-500/20">
            <span className="text-2xl font-bold text-violet-600">{tickets.length}</span>
            <span className="text-sm text-slate-500 ml-2">pendentes</span>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white shadow-card-modern border border-slate-100">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-primary">{stats.total_rated}</div>
            <div className="text-sm text-slate-500">Total Avaliados</div>
          </div>
          <div className="p-4 rounded-2xl bg-white shadow-card-modern border border-slate-100">
            <div className="text-2xl font-bold text-amber-500">
              {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '-'}
            </div>
            <div className="text-sm text-slate-500">Média (1-5)</div>
          </div>
          <div className="p-4 rounded-2xl bg-white shadow-card-modern border border-slate-100 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={`text-xl ${star <= Math.round(stats.average_rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="text-sm text-slate-500 mt-1">Rating</div>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <div className="text-2xl font-bold text-emerald-600">{stats.good_examples}</div>
            <div className="text-sm text-slate-500">Bons Exemplos</div>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20">
            <div className="text-2xl font-bold text-red-600">{stats.bad_examples}</div>
            <div className="text-sm text-slate-500">Maos Exemplos</div>
          </div>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && (
        <div className="p-6 rounded-2xl bg-white shadow-card-modern border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">Distribuição de Ratings</h3>
          <div className="flex gap-2 items-end h-24">
            {[1, 2, 3, 4, 5].map((star) => {
              const count = stats.rating_distribution[star] || 0
              const maxCount = Math.max(...Object.values(stats.rating_distribution), 1)
              const height = (count / maxCount) * 100
              return (
                <div key={star} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-primary-500/20 to-violet-500/60 rounded-t transition-all"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-xs mt-1 text-slate-500">{count}</span>
                  <span className="text-yellow-400">{'★'.repeat(star)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white shadow-card-modern border border-slate-100 text-center">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-xl font-semibold text-slate-700">Nenhum ticket pendente</h3>
          <p className="text-slate-500 mt-2">Todas as respostas de IA foram revisadas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.low
            const isExpanded = expandedId === ticket.id
            
            return (
              <div key={ticket.id} className="rounded-2xl bg-white shadow-card-modern border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-card-hover">
                {/* Ticket Header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <span className="text-sm text-slate-400 font-mono">{ticket.ticket_number}</span>
                      <Link href={`/dashboard/atendente/tickets/${ticket.id}`} className="block">
                        <h3 className="font-semibold text-lg text-slate-800 hover:text-primary-600 transition-colors">
                          {ticket.subject}
                        </h3>
                      </Link>
                      <div className="flex gap-3 text-sm text-slate-500">
                        <span>👤 {ticket.customer_name}</span>
                        {ticket.category_name && <span>📁 {ticket.category_name}</span>}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-xl text-sm font-medium ${priorityStyle.bg} ${priorityStyle.text}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(ticket.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                {ticket.ai_response && (
                  <div className="p-5 bg-gradient-to-br from-violet-50/50 to-primary-50/50">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🤖</span>
                        <span className="font-semibold text-violet-700">Resposta Gerada por IA</span>
                        {ticket.ai_response.ai_rating && (
                          <span className="flex items-center gap-1 text-sm text-yellow-500">
                            {'★'.repeat(ticket.ai_response.ai_rating)}
                          </span>
                        )}
                        {ticket.ai_response.is_example_good && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                            ✓ Bom Exemplo
                          </span>
                        )}
                        {ticket.ai_response.is_example_bad && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            ✗ Mau Exemplo
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        ⏱ {ticket.ai_response.processing_time_ms}ms
                      </span>
                    </div>
                    
                    {isExpanded ? (
                      <div className="space-y-4">
                        {/* Full response */}
                        <div className="p-4 rounded-xl bg-white border border-slate-200 font-mono text-sm whitespace-pre-wrap">
                          {ticket.ai_response.response_text}
                        </div>
                        
                        {/* RAG Context */}
                        {ticket.ai_response.context_used && (
                          <details className="rounded-xl overflow-hidden border border-slate-200">
                            <summary className="px-4 py-3 bg-slate-100 cursor-pointer text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors">
                              📚 Ver Fontes RAG ({ticket.ai_response.context_used.rag_sources?.length || 0})
                            </summary>
                            <div className="p-4 bg-white space-y-3">
                              {ticket.ai_response.context_used.rag_sources?.map((source: any, i: number) => (
                                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                  <span className="font-medium text-slate-700">{source.title}</span>
                                  <p className="text-sm text-slate-600 mt-1">{source.content}</p>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 flex-wrap">
                          <button
                            onClick={() => handleApprove(ticket.id)}
                            disabled={processing === ticket.id}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg hover:shadow-glow-primary transition-all disabled:opacity-50"
                          >
                            <span>✓</span> Aprovar e Enviar
                          </button>
                          <button
                            onClick={() => handleEdit(ticket.id)}
                            disabled={processing === ticket.id}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-lg hover:shadow-glow-secondary transition-all disabled:opacity-50"
                          >
                            <span>✎</span> Editar
                          </button>
                          <button
                            onClick={() => handleReject(ticket.id)}
                            disabled={processing === ticket.id}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                          >
                            <span>✗</span> Rejeitar
                          </button>
                        </div>

                        {/* Feedback Section */}
                        <div className="pt-4 border-t border-slate-200">
                          <h4 className="font-medium text-slate-700 mb-3">Avaliar Resposta</h4>
                          
                          {/* Star Rating */}
                          <div className="mb-3">
                            <span className="text-sm text-slate-500 block mb-2">Nota:</span>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setFeedbackMode(`rate-${star}`)}
                                  className={`text-3xl transition-all ${
                                    feedbackMode === `rate-${star}` 
                                      ? 'text-yellow-400 scale-110' 
                                      : 'text-gray-300 hover:text-yellow-300 hover:scale-105'
                                  }`}
                                  disabled={processing === ticket.id}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleMarkAsExample(ticket.id, true)}
                              disabled={processing === ticket.id || ticket.ai_response.is_example_good}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                ticket.ai_response.is_example_good 
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                              }`}
                            >
                              ✓ Marcar como Bom Exemplo
                            </button>
                            <button
                              onClick={() => handleMarkAsExample(ticket.id, false)}
                              disabled={processing === ticket.id || ticket.ai_response.is_example_bad}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                ticket.ai_response.is_example_bad 
                                  ? 'bg-red-100 text-red-700 border border-red-300'
                                  : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
                              }`}
                            >
                              ✗ Marcar como Mau Exemplo
                            </button>
                          </div>

                          {/* Submit Feedback Button */}
                          {feedbackMode && feedbackMode.startsWith('rate-') && (
                            <div className="flex items-center gap-3 mt-4">
                              <button
                                onClick={() => {
                                  const rating = parseInt(feedbackMode.split('-')[1])
                                  openFeedbackModal(ticket.id, rating, false, false)
                                }}
                                disabled={processing === ticket.id}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-glow-primary transition-all disabled:opacity-50"
                              >
                                📤 Enviar Avaliação ({feedbackMode.split('-')[1]}★)
                              </button>
                              <button
                                onClick={() => setFeedbackMode(null)}
                                className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setExpandedId(null)}
                          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          ▲ Recolher resposta
                        </button>
                      </div>
                    ) : (
                      /* Collapsed view */
                      <div>
                        <p className="text-sm text-slate-700 line-clamp-3">
                          {ticket.ai_response.response_text}
                        </p>
                        <div className="flex justify-between items-center mt-3">
                          <button
                            onClick={() => setExpandedId(ticket.id)}
                            className="text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors"
                          >
                            Ver resposta completa
                          </button>
                          {ticket.ai_response.ai_rating && (
                            <span className="text-sm text-yellow-500">
                              ★ {ticket.ai_response.ai_rating}/5
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              )
            })}
          </div>
        )}

      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-card-hover border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                  <span className="text-xl">★</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Avaliar resposta da IA</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Feedback sobre a resposta da IA (opcional):
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                placeholder="Digite seu feedback..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 p-4 bg-slate-50">
              <button
                onClick={() => {
                  setFeedbackModal(null)
                  setFeedbackText('')
                }}
                disabled={processing === feedbackModal.ticketId}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRate}
                disabled={processing === feedbackModal.ticketId}
                className="px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-semibold shadow-lg hover:shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing === feedbackModal.ticketId ? 'Enviando...' : 'Enviar avaliação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
