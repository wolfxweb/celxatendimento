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

const STATUS_STYLES: Record<string, { bg: string; text: string; gradient: string; icon: string }> = {
  open: { bg: 'bg-blue-500/10', text: 'text-blue-600', gradient: 'from-blue-500 to-cyan-500', icon: '🟢' },
  pending_ai: { bg: 'bg-amber-500/10', text: 'text-amber-600', gradient: 'from-amber-500 to-orange-500', icon: '🤖' },
  pending_agent: { bg: 'bg-orange-500/10', text: 'text-orange-600', gradient: 'from-orange-500 to-red-500', icon: '⏳' },
  pending_customer_feedback: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', gradient: 'from-cyan-500 to-blue-500', icon: '💬' },
  resolved: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-500', icon: '✅' },
  closed: { bg: 'bg-slate-500/10', text: 'text-slate-600', gradient: 'from-slate-500 to-gray-500', icon: '🔒' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-600', gradient: 'from-red-500 to-pink-500', icon: '❌' },
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; gradient: string }> = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-600', gradient: 'from-red-500 to-red-600' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-600', gradient: 'from-orange-500 to-orange-600' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-600', gradient: 'from-amber-500 to-amber-600' },
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', gradient: 'from-emerald-500 to-emerald-600' },
}

const filters = [
  { key: '', label: 'Todos', icon: '📋' },
  { key: 'open', label: 'Abertos', icon: '🟢' },
  { key: 'pending_agent', label: 'Em Atendimento', icon: '⏳' },
  { key: 'pending_customer_feedback', label: 'Aguardando meu retorno', icon: '💬' },
  { key: 'resolved', label: 'Resolvidos', icon: '✅' },
]

export default function ClienteTicketsPage() {
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
              Meus Tickets
            </span>
          </h1>
          <p className="text-slate-500 mt-1">Acompanhe todos os seus tickets de suporte</p>
        </div>
        
        {/* New Ticket Button */}
        <Link
          href="/dashboard/cliente/tickets/novo"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-glow-primary hover:scale-105 transition-all"
        >
          <span className="text-lg">+</span>
          Novo Ticket
        </Link>
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
          <p className="text-slate-500 mt-2">Suas solicitações aparecerão aqui</p>
          <Link
            href="/dashboard/cliente/tickets/novo"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-medium shadow-lg hover:shadow-glow-primary transition-all"
          >
            Criar primeiro ticket
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket, index) => {
            const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.open
            const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.low
            
            return (
              <Link
                key={ticket.id}
                href={`/dashboard/cliente/tickets/${ticket.id}`}
                className="block group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Card */}
                <div className="relative p-6 rounded-2xl bg-white shadow-card-modern border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary-200">
                  {/* Gradient border on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary-500/5 to-violet-500/5 -z-10"></div>
                  
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    {/* Left side - Content */}
                    <div className="flex-1 min-w-0">
                      {/* Ticket number and status badge */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-slate-400">{ticket.ticket_number}</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${statusStyle.gradient}`}></span>
                          {statusStyle.icon} {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {/* Subject */}
                      <h3 className="font-semibold text-lg text-slate-800 group-hover:text-primary-600 transition-colors">
                        {ticket.subject}
                      </h3>
                      
                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                        {ticket.category_name && (
                          <span className="flex items-center gap-1">
                            <span>📁</span> {ticket.category_name}
                          </span>
                        )}
                        {ticket.assignee_name && (
                          <span className="flex items-center gap-1">
                            <span>👤</span> {ticket.assignee_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span>📅</span> {formatDate(ticket.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Right side - Priority */}
                    <div className="flex flex-col items-end gap-2">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${priorityStyle.bg}`}>
                        <span className={`w-6 h-6 rounded-lg bg-gradient-to-r ${priorityStyle.gradient} flex items-center justify-center text-white text-xs font-bold`}>
                          {ticket.priority.charAt(0).toUpperCase()}
                        </span>
                        <span className={`text-sm font-semibold ${priorityStyle.text}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      
                      {/* Arrow indicator */}
                      <span className="text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                        →
                      </span>
                    </div>
                  </div>

                  {/* Decorative element */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-r from-slate-50 to-white rounded-full opacity-50"></div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
