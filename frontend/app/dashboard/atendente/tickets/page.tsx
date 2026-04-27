'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface Ticket {
  id: string
  ticket_number: string
  subject: string
  status: string
  priority: string
  category_name: string | null
  assignee_name: string | null
  created_at: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string; gradient: string }> = {
  open: { bg: 'bg-blue-500/10', text: 'text-blue-600', gradient: 'from-blue-500 to-cyan-500' },
  pending_ai: { bg: 'bg-amber-500/10', text: 'text-amber-600', gradient: 'from-amber-500 to-orange-500' },
  pending_agent: { bg: 'bg-orange-500/10', text: 'text-orange-600', gradient: 'from-orange-500 to-red-500' },
  pending_customer_feedback: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', gradient: 'from-cyan-500 to-blue-500' },
  resolved: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-500' },
  closed: { bg: 'bg-slate-500/10', text: 'text-slate-600', gradient: 'from-slate-500 to-gray-500' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-600', gradient: 'from-red-500 to-pink-500' },
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

const PRIORITY_COLORS: Record<string, { text: string; gradient: string }> = {
  critical: { text: 'text-red-500', gradient: 'from-red-500 to-red-600' },
  high: { text: 'text-orange-500', gradient: 'from-orange-500 to-orange-600' },
  medium: { text: 'text-amber-500', gradient: 'from-amber-500 to-amber-600' },
  low: { text: 'text-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
}

const filters = [
  { key: '', label: 'Todos', icon: '📋' },
  { key: 'open', label: 'Abertos', icon: '🟢' },
  { key: 'pending_ai', label: 'Aprovações pendentes', icon: '🤖' },
  { key: 'pending_agent', label: 'Aguardando Atendente', icon: '⏳' },
  { key: 'pending_customer_feedback', label: 'Feedback cliente', icon: '💬' },
  { key: 'resolved', label: 'Resolvidos', icon: '✅' },
  { key: 'closed', label: 'Fechados', icon: '🔒' },
]

export default function AtendenteTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    loadTickets()
  }, [filter])

  async function loadTickets() {
    try {
      setLoading(true)
      const params = filter ? `?status=${filter}` : ''
      const data = await apiFetch<Ticket[]>(`/tickets${params}`)
      setTickets(data)
    } catch (err) {
      setError('Erro ao carregar tickets')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-primary-600">
              Tickets
            </span>
          </h1>
          <p className="text-slate-500 mt-1">Gerencie todos os tickets da empresa</p>
        </div>
        
        {/* Stats mini cards */}
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl bg-white shadow-card-modern border border-slate-100">
            <span className="text-2xl font-bold text-primary-600">{tickets.length}</span>
            <span className="text-sm text-slate-500 ml-2">tickets</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap p-1 bg-white rounded-2xl shadow-card-modern border border-slate-100">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              filter === f.key
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-card-modern border border-slate-100">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold text-slate-700">Nenhum ticket encontrado</h3>
          <p className="text-slate-500 mt-2">Não há tickets neste status no momento</p>
        </div>
      ) : (
        /* Modern Table */
        <div className="bg-white rounded-2xl shadow-card-modern border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assunto</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prioridade</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket, index) => {
                const statusStyle = STATUS_COLORS[ticket.status] || STATUS_COLORS.open
                const priorityStyle = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.low
                
                return (
                  <tr 
                    key={ticket.id} 
                    className="group hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-violet-50/50 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/atendente/tickets/${ticket.id}`}
                        className="font-semibold text-primary-600 hover:text-primary-700 transition-colors relative"
                      >
                        <span className="relative z-10">{ticket.ticket_number}</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/atendente/tickets/${ticket.id}`}
                        className="text-slate-700 hover:text-primary-600 transition-colors font-medium"
                      >
                        {ticket.subject}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-sm">
                        {ticket.category_name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${statusStyle.gradient}`}></span>
                        {STATUS_LABELS[ticket.status] || ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-lg bg-gradient-to-r ${priorityStyle.gradient} flex items-center justify-center text-white text-xs font-bold`}>
                          {ticket.priority.charAt(0).toUpperCase()}
                        </span>
                        <span className={`font-semibold ${priorityStyle.text}`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">
                        {formatDate(ticket.created_at)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
