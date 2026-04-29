'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch, apiDelete } from '@/lib/api'
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

interface Category {
  id: number
  name: string
}

type TicketListApiResponse = Ticket[] | {
  tickets?: Ticket[]
  total?: number
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

const STATUS_LABELS: Record<string, string> = {
  open: 'Aberto',
  pending_ai: 'Atendente',
  pending_agent: 'Atendente',
  pending_customer_feedback: 'Aguardando meu retorno',
  resolved: 'Resolvido',
  closed: 'Fechado',
  rejected: 'Rejeitado',
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

const PAGE_SIZE = 20

export default function ClienteTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('status')
    if (status) {
      setFilter(status)
      setPage(1)
    }
  }, [])

  useEffect(() => {
    loadTickets()
  }, [filter, page, search, categoryFilter, dateFrom, dateTo])

  async function loadCategories() {
    try {
      const data = await apiFetch<{categories: Category[]} >('/categories/active')
      setCategories(data.categories)
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
    }
  }

  async function loadTickets() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter) params.append('status', filter)
      if (search) params.append('search', search)
      if (categoryFilter) params.append('category_id', categoryFilter)
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)
      params.append('limit', String(PAGE_SIZE))
      params.append('offset', String((page - 1) * PAGE_SIZE))

      const data = await apiFetch<TicketListApiResponse>(`/tickets?${params.toString()}`)
      const nextTickets = Array.isArray(data) ? data : data.tickets ?? []

      setTickets(nextTickets)
      setTotal(Array.isArray(data) ? nextTickets.length : data.total ?? nextTickets.length)
    } catch (err) {
      setError('Erro ao carregar tickets')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(ticketId: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Deseja realmente excluir este ticket?')) return

    try {
      await apiDelete(`/tickets/${ticketId}`)
      loadTickets()
    } catch (err) {
      alert('Erro ao excluir ticket')
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

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
            onClick={() => { setFilter(f.key); setPage(1) }}
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
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
            showFilters ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🔍</span>
          Filtros
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-white rounded-2xl shadow-card-modern border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Buscar</label>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Assunto ou descrição..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Data de</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Data até</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
          {(search || categoryFilter || dateFrom || dateTo) && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => { setSearch(''); setCategoryFilter(''); setDateFrom(''); setDateTo(''); setPage(1) }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      )}

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
        <>
          <div className="space-y-4">
            {tickets.map((ticket, index) => {
              const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.open
              const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.low

              return (
                <div
                  key={ticket.id}
                  className="group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Link
                    href={`/dashboard/cliente/tickets/${ticket.id}`}
                    className="block"
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
                              {statusStyle.icon} {STATUS_LABELS[ticket.status] || ticket.status}
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

                        {/* Right side - Priority and Actions */}
                        <div className="flex flex-col items-end gap-2">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${priorityStyle.bg}`}>
                            <span className={`w-6 h-6 rounded-lg bg-gradient-to-r ${priorityStyle.gradient} flex items-center justify-center text-white text-xs font-bold`}>
                              {ticket.priority.charAt(0).toUpperCase()}
                            </span>
                            <span className={`text-sm font-semibold ${priorityStyle.text}`}>
                              {ticket.priority}
                            </span>
                          </div>

                          {/* Arrow and Delete */}
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                              →
                            </span>
                            {(ticket.status === 'closed' || ticket.status === 'resolved') && (
                              <button
                                onClick={(e) => handleDelete(ticket.id, e)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Excluir ticket"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Decorative element */}
                      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-r from-slate-50 to-white rounded-full opacity-50"></div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                ← Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium ${
                        page === pageNum
                          ? 'bg-gradient-primary text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Próxima →
              </button>
            </div>
          )}

          <div className="text-center text-sm text-slate-500 pt-2">
            Mostrando {((page - 1) * PAGE_SIZE) + 1} - {Math.min(page * PAGE_SIZE, total)} de {total} tickets
          </div>
        </>
      )}
    </div>
  )
}
