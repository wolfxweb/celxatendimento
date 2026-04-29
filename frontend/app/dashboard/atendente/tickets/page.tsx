'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiDelete, apiFetch } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface Ticket {
  id: string
  ticket_number: string
  subject: string
  status: string
  priority: string
  customer_name: string | null
  category_name: string | null
  assignee_name: string | null
  created_at: string
}

interface Agent {
  id: string
  email: string
  full_name: string | null
}

interface Category {
  id: number
  name: string
}

interface TicketListResponse {
  tickets: Ticket[]
  total: number
  limit: number
  offset: number
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

const PAGE_SIZE = 20

export default function AtendenteTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('')
  const [customerName, setCustomerName] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    loadAgents()
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
  }, [filter, customerName, assignedTo, categoryId, dateFrom, dateTo, page])

  async function loadAgents() {
    try {
      const data = await apiFetch<Agent[]>('/users?role=agent')
      setAgents(data)
    } catch (err) {
      console.error('Erro ao carregar atendentes:', err)
    }
  }

  async function loadCategories() {
    try {
      const data = await apiFetch<{categories: Category[]}>('/categories/active')
      setCategories(data.categories)
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
    }
  }

  async function loadTickets() {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams()
      params.append('paginated', 'true')
      params.append('limit', String(PAGE_SIZE))
      params.append('offset', String((page - 1) * PAGE_SIZE))
      if (filter) params.append('status', filter)
      if (customerName.trim()) params.append('customer_name', customerName.trim())
      if (assignedTo) params.append('assigned_to', assignedTo)
      if (categoryId) params.append('category_id', categoryId)
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)

      const data = await apiFetch<TicketListResponse>(`/tickets?${params.toString()}`)
      setTickets(data.tickets)
      setTotal(data.total)
      setSelectedIds(new Set())
    } catch (err) {
      setError('Erro ao carregar tickets')
    } finally {
      setLoading(false)
    }
  }

  function resetFilters() {
    setFilter('')
    setCustomerName('')
    setAssignedTo('')
    setCategoryId('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  function toggleTicket(ticketId: string) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(ticketId)) {
        next.delete(ticketId)
      } else {
        next.add(ticketId)
      }
      return next
    })
  }

  function toggleCurrentPage() {
    setSelectedIds((current) => {
      const visibleIds = tickets.map((ticket) => ticket.id)
      const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => current.has(id))
      const next = new Set(current)

      visibleIds.forEach((id) => {
        if (allVisibleSelected) {
          next.delete(id)
        } else {
          next.add(id)
        }
      })

      return next
    })
  }

  async function confirmDeleteSelectedTickets() {
    if (selectedIds.size === 0) return

    try {
      setDeleting(true)
      setError('')
      await Promise.all(Array.from(selectedIds).map((ticketId) => apiDelete(`/tickets/${ticketId}`)))

      if (selectedIds.size === tickets.length && page > 1) {
        setPage((current) => Math.max(1, current - 1))
      } else {
        await loadTickets()
      }
    } catch (err) {
      setError('Erro ao excluir tickets selecionados')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasAdvancedFilters = customerName || assignedTo || categoryId || dateFrom || dateTo
  const selectedCount = selectedIds.size
  const allCurrentPageSelected = tickets.length > 0 && tickets.every((ticket) => selectedIds.has(ticket.id))

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
            <span className="text-2xl font-bold text-primary-600">{total}</span>
            <span className="text-sm text-slate-500 ml-2">tickets</span>
          </div>
        </div>
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
      </div>

      {/* Advanced filters */}
      <div className="p-4 bg-white rounded-2xl shadow-card-modern border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Cliente</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => { setCustomerName(e.target.value); setPage(1) }}
              placeholder="Nome ou email"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Atendente</label>
            <select
              value={assignedTo}
              onChange={(e) => { setAssignedTo(e.target.value); setPage(1) }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Todos</option>
              <option value="unassigned">Sem atendente</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.full_name || agent.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
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
        {(filter || hasAdvancedFilters) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={resetFilters}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 backdrop-blur-sm">
          {error}
        </div>
      )}

      {selectedCount > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-white rounded-2xl shadow-card-modern border border-red-100">
          <span className="text-sm font-medium text-slate-700">
            {selectedCount} ticket{selectedCount > 1 ? 's' : ''} selecionado{selectedCount > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-50 hover:bg-slate-50"
            >
              Limpar seleção
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold shadow-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Excluir selecionados
            </button>
          </div>
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
                <th className="text-left px-6 py-4">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={toggleCurrentPage}
                    aria-label="Selecionar tickets desta página"
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assunto</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Atendente</th>
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
                    className={`group transition-all duration-300 ${
                      selectedIds.has(ticket.id)
                        ? 'bg-red-50/60'
                        : 'hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-violet-50/50'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(ticket.id)}
                        onChange={() => toggleTicket(ticket.id)}
                        aria-label={`Selecionar ticket ${ticket.ticket_number}`}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
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
                      <span className="text-sm font-medium text-slate-700">
                        {ticket.customer_name || '-'}
                      </span>
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
                      <span className="text-sm text-slate-600">
                        {ticket.assignee_name || 'Sem atendente'}
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

      {!loading && tickets.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-sm text-slate-500">
            Mostrando {((page - 1) * PAGE_SIZE) + 1} - {Math.min(page * PAGE_SIZE, total)} de {total} tickets
          </span>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                ← Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                  let pageNumber: number
                  if (totalPages <= 5) {
                    pageNumber = index + 1
                  } else if (page <= 3) {
                    pageNumber = index + 1
                  } else if (page >= totalPages - 2) {
                    pageNumber = totalPages - 4 + index
                  } else {
                    pageNumber = page - 2 + index
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium ${
                        page === pageNumber
                          ? 'bg-gradient-primary text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      )}

      {showDeleteModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-card-hover border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                  <span className="text-xl">🗑️</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Excluir tickets</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Deseja realmente excluir {selectedCount} ticket{selectedCount > 1 ? 's' : ''} selecionado{selectedCount > 1 ? 's' : ''}?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 bg-slate-50">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteSelectedTickets}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold shadow-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
