'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { getToken, isAuthenticated } from '@/lib/auth'
import { formatDate } from '@/lib/utils'

interface UserSession {
  email: string
  role: string
  full_name: string
}

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

type TicketListApiResponse = Ticket[] | {
  tickets?: Ticket[]
  total?: number
}

interface AdminUser {
  id: string
  role: string
  is_active: boolean
}

interface AdminCategory {
  id: number
  name: string
  is_active: boolean
  ticket_count?: number
}

interface AdminArticle {
  id: number
  is_active: boolean
  is_indexed: boolean
  index_error: string | null
}

interface AdminAgent {
  id: string
  is_active: boolean
}

interface AdminAIConfigResponse {
  agents?: AdminAgent[]
  total?: number
}

const CUSTOMER_STATUS_LABELS: Record<string, string> = {
  open: 'Aberto',
  pending_ai: 'Atendente',
  pending_agent: 'Atendente',
  pending_customer_feedback: 'Aguardando você',
  resolved: 'Resolvido',
  closed: 'Fechado',
  rejected: 'Rejeitado',
}

const CUSTOMER_STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-700',
  pending_ai: 'bg-orange-500/10 text-orange-700',
  pending_agent: 'bg-orange-500/10 text-orange-700',
  pending_customer_feedback: 'bg-cyan-500/10 text-cyan-700',
  resolved: 'bg-emerald-500/10 text-emerald-700',
  closed: 'bg-slate-500/10 text-slate-700',
  rejected: 'bg-red-500/10 text-red-700',
}

const AGENT_STATUS_LABELS: Record<string, string> = {
  open: 'Aberto',
  pending_ai: 'Aprovação pendente',
  pending_agent: 'Aguardando atendente',
  pending_customer_feedback: 'Feedback do cliente',
  resolved: 'Resolvido',
  closed: 'Fechado',
  rejected: 'Rejeitado',
}

const AGENT_STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-700',
  pending_ai: 'bg-amber-500/10 text-amber-700',
  pending_agent: 'bg-orange-500/10 text-orange-700',
  pending_customer_feedback: 'bg-cyan-500/10 text-cyan-700',
  resolved: 'bg-emerald-500/10 text-emerald-700',
  closed: 'bg-slate-500/10 text-slate-700',
  rejected: 'bg-red-500/10 text-red-700',
}

function getCurrentUser(): UserSession {
  const token = getToken()
  if (!token) {
    return { email: '', role: 'customer', full_name: 'Cliente' }
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      email: payload.email || '',
      role: payload.role || 'customer',
      full_name: payload.full_name || 'Cliente',
    }
  } catch {
    return { email: '', role: 'customer', full_name: 'Cliente' }
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [adminCategories, setAdminCategories] = useState<AdminCategory[]>([])
  const [adminArticles, setAdminArticles] = useState<AdminArticle[]>([])
  const [adminAiConfig, setAdminAiConfig] = useState<AdminAIConfigResponse | null>(null)
  const [adminLoading, setAdminLoading] = useState(false)
  const [user, setUser] = useState<UserSession | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const session = getCurrentUser()
    setUser(session)
    setLoading(false)

    if (session.role === 'customer' || session.role === 'agent') {
      loadDashboardTickets()
    } else if (session.role === 'admin') {
      loadAdminDashboard()
    }
  }, [router])

  async function loadDashboardTickets() {
    setTicketsLoading(true)
    setError('')

    try {
      const data = await apiFetch<TicketListApiResponse>('/tickets?limit=100')
      setTickets(Array.isArray(data) ? data : data.tickets ?? [])
    } catch {
      setError('Não foi possível carregar seus tickets agora.')
    } finally {
      setTicketsLoading(false)
    }
  }

  async function loadAdminDashboard() {
    setAdminLoading(true)
    setTicketsLoading(true)
    setError('')

    try {
      const [ticketsData, usersData, categoriesData, articlesData, aiConfigData] = await Promise.all([
        apiFetch<TicketListApiResponse>('/tickets?limit=100'),
        apiFetch<AdminUser[]>('/users'),
        apiFetch<AdminCategory[]>('/categories/?include_inactive=true&include_stats=true'),
        apiFetch<AdminArticle[]>('/knowledge'),
        apiFetch<AdminAIConfigResponse>('/agentes/config/full').catch(() => null),
      ])

      setTickets(Array.isArray(ticketsData) ? ticketsData : ticketsData.tickets ?? [])
      setAdminUsers(usersData)
      setAdminCategories(categoriesData)
      setAdminArticles(articlesData)
      setAdminAiConfig(aiConfigData)
    } catch {
      setError('Não foi possível carregar os dados administrativos agora.')
    } finally {
      setTicketsLoading(false)
      setAdminLoading(false)
    }
  }

  const customerMetrics = useMemo(() => {
    const activeStatuses = new Set(['open', 'pending_ai', 'pending_agent'])
    const waitingForCustomer = tickets.filter((ticket) => ticket.status === 'pending_customer_feedback').length
    const active = tickets.filter((ticket) => activeStatuses.has(ticket.status)).length
    const resolved = tickets.filter((ticket) => ['resolved', 'closed'].includes(ticket.status)).length
    const critical = tickets.filter((ticket) => ['critical', 'high'].includes(ticket.priority) && !['resolved', 'closed', 'rejected'].includes(ticket.status)).length
    const recent = tickets.slice(0, 4)

    return {
      total: tickets.length,
      active,
      waitingForCustomer,
      resolved,
      critical,
      recent,
    }
  }, [tickets])

  const agentMetrics = useMemo(() => {
    const actionable = tickets.filter((ticket) => ['pending_ai', 'pending_agent', 'open'].includes(ticket.status)).length
    const pendingAi = tickets.filter((ticket) => ticket.status === 'pending_ai').length
    const waitingAgent = tickets.filter((ticket) => ticket.status === 'pending_agent').length
    const customerFeedback = tickets.filter((ticket) => ticket.status === 'pending_customer_feedback').length
    const highPriority = tickets.filter((ticket) => ['critical', 'high'].includes(ticket.priority) && !['resolved', 'closed', 'rejected'].includes(ticket.status)).length
    const resolved = tickets.filter((ticket) => ['resolved', 'closed'].includes(ticket.status)).length
    const recent = tickets.slice(0, 5)
    const priorityQueue = tickets
      .filter((ticket) => ['critical', 'high'].includes(ticket.priority) && !['resolved', 'closed', 'rejected'].includes(ticket.status))
      .slice(0, 4)

    return {
      actionable,
      pendingAi,
      waitingAgent,
      customerFeedback,
      highPriority,
      resolved,
      recent,
      priorityQueue,
    }
  }, [tickets])

  const adminMetrics = useMemo(() => {
    const activeTickets = tickets.filter((ticket) => !['resolved', 'closed', 'rejected'].includes(ticket.status)).length
    const pendingAi = tickets.filter((ticket) => ticket.status === 'pending_ai').length
    const waitingAgent = tickets.filter((ticket) => ticket.status === 'pending_agent').length
    const highPriority = tickets.filter((ticket) => ['critical', 'high'].includes(ticket.priority) && !['resolved', 'closed', 'rejected'].includes(ticket.status)).length
    const activeUsers = adminUsers.filter((item) => item.is_active).length
    const agents = adminUsers.filter((item) => item.role === 'agent').length
    const customers = adminUsers.filter((item) => item.role === 'customer').length
    const inactiveCategories = adminCategories.filter((item) => !item.is_active).length
    const indexedArticles = adminArticles.filter((item) => item.is_indexed && !item.index_error).length
    const failedArticles = adminArticles.filter((item) => item.index_error).length
    const activeAiAgents = adminAiConfig?.agents?.filter((item) => item.is_active).length ?? 0
    const recentTickets = tickets.slice(0, 5)

    return {
      activeTickets,
      pendingAi,
      waitingAgent,
      highPriority,
      activeUsers,
      agents,
      customers,
      inactiveCategories,
      indexedArticles,
      failedArticles,
      activeAiAgents,
      recentTickets,
    }
  }, [adminAiConfig, adminArticles, adminCategories, adminUsers, tickets])

  const quickActions = [
    {
      href: '/dashboard/cliente/tickets',
      title: 'Meus Tickets',
      description: 'Visualize e crie tickets de suporte',
      icon: '🎫',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      href: '/dashboard/atendente/tickets',
      title: 'Tickets',
      description: 'Gerencie tickets da empresa',
      icon: '📋',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      href: '/dashboard/atendente/aprovacao',
      title: 'Aprovar IA',
      description: 'Revise respostas geradas por IA',
      icon: '🤖',
      gradient: 'from-violet-500 to-purple-500',
      badge: 'Pendente',
      badgeColor: 'bg-amber-500',
    },
    {
      href: '/dashboard/atendente/chat-kb',
      title: 'Chat KB',
      description: 'Consulte a base de conhecimento',
      icon: '📚',
      gradient: 'from-amber-500 to-orange-500',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (user?.role === 'customer') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Olá, {user.full_name}</h1>
            <p className="mt-1 text-slate-500">Resumo objetivo dos seus chamados de suporte.</p>
          </div>

          <Link
            href="/dashboard/cliente/tickets/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-glow-primary"
          >
            <span className="text-lg">+</span>
            Novo Ticket
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card-modern">
            <div className="text-sm font-medium text-slate-500">Tickets ativos</div>
            <div className="mt-3 text-3xl font-bold text-blue-600">{ticketsLoading ? '-' : customerMetrics.active}</div>
            <p className="mt-2 text-sm text-slate-500">Abertos ou em atendimento.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card-modern">
            <div className="text-sm font-medium text-slate-500">Aguardando você</div>
            <div className="mt-3 text-3xl font-bold text-cyan-600">{ticketsLoading ? '-' : customerMetrics.waitingForCustomer}</div>
            <p className="mt-2 text-sm text-slate-500">Precisam de resposta sua.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card-modern">
            <div className="text-sm font-medium text-slate-500">Resolvidos</div>
            <div className="mt-3 text-3xl font-bold text-emerald-600">{ticketsLoading ? '-' : customerMetrics.resolved}</div>
            <p className="mt-2 text-sm text-slate-500">Finalizados no seu histórico.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card-modern">
            <div className="text-sm font-medium text-slate-500">Alta prioridade</div>
            <div className="mt-3 text-3xl font-bold text-orange-600">{ticketsLoading ? '-' : customerMetrics.critical}</div>
            <p className="mt-2 text-sm text-slate-500">Chamados ativos críticos ou altos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card-modern xl:col-span-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Tickets recentes</h2>
                <p className="text-sm text-slate-500">Acompanhe rapidamente o que mudou.</p>
              </div>
              <Link href="/dashboard/cliente/tickets" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                Ver todos
              </Link>
            </div>

            {ticketsLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-10 w-10 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin"></div>
              </div>
            ) : customerMetrics.recent.length > 0 ? (
              <div className="space-y-3">
                {customerMetrics.recent.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/dashboard/cliente/tickets/${ticket.id}`}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-primary-200 hover:bg-white md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{ticket.ticket_number}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${CUSTOMER_STATUS_STYLES[ticket.status] || CUSTOMER_STATUS_STYLES.open}`}>
                          {CUSTOMER_STATUS_LABELS[ticket.status] || ticket.status}
                        </span>
                      </div>
                      <div className="mt-1 truncate font-semibold text-slate-800">{ticket.subject}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {ticket.category_name || 'Sem categoria'} · {formatDate(ticket.created_at)}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary-600">Abrir</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <h3 className="font-semibold text-slate-700">Você ainda não tem tickets</h3>
                <p className="mt-1 text-sm text-slate-500">Crie um chamado quando precisar de suporte.</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card-modern xl:col-span-4">
            <h2 className="text-lg font-semibold text-slate-800">Próxima ação</h2>
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              {customerMetrics.waitingForCustomer > 0 ? (
                <>
                  <div className="font-semibold text-cyan-700">Responder feedback pendente</div>
                  <p className="mt-1 text-sm text-slate-500">Há ticket aguardando sua resposta para o atendimento continuar.</p>
                  <Link href="/dashboard/cliente/tickets?status=pending_customer_feedback" className="mt-4 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">
                    Ver pendências
                  </Link>
                </>
              ) : customerMetrics.active > 0 ? (
                <>
                  <div className="font-semibold text-orange-700">Acompanhar atendimento</div>
                  <p className="mt-1 text-sm text-slate-500">Seus chamados ativos estão com a equipe de atendimento.</p>
                  <Link href="/dashboard/cliente/tickets" className="mt-4 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">
                    Abrir meus tickets
                  </Link>
                </>
              ) : (
                <>
                  <div className="font-semibold text-emerald-700">Tudo em dia</div>
                  <p className="mt-1 text-sm text-slate-500">Nenhum ticket exige ação sua neste momento.</p>
                  <Link href="/dashboard/cliente/tickets/novo" className="mt-4 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">
                    Criar novo ticket
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (user?.role === 'agent') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Painel do atendente</h1>
            <p className="mt-1 text-slate-500">Fila de trabalho, aprovações e prioridades do atendimento.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/atendente/tickets"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-card-modern transition-colors hover:border-primary-200 hover:text-primary-600"
            >
              <span>📋</span>
              Ver fila
            </Link>
            <Link
              href="/dashboard/atendente/aprovacao"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-glow-primary"
            >
              <span>🤖</span>
              Aprovar IA
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/dashboard/atendente/tickets?status=pending_ai" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card-modern transition-all hover:border-amber-200 hover:shadow-card-hover">
            <div className="text-sm font-medium text-slate-500">Aprovações IA</div>
            <div className="mt-3 text-3xl font-bold text-amber-600">{ticketsLoading ? '-' : agentMetrics.pendingAi}</div>
            <p className="mt-2 text-sm text-slate-500">Respostas aguardando revisão.</p>
          </Link>
          <Link href="/dashboard/atendente/tickets?status=pending_agent" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card-modern transition-all hover:border-orange-200 hover:shadow-card-hover">
            <div className="text-sm font-medium text-slate-500">Aguardando atendente</div>
            <div className="mt-3 text-3xl font-bold text-orange-600">{ticketsLoading ? '-' : agentMetrics.waitingAgent}</div>
            <p className="mt-2 text-sm text-slate-500">Chamados prontos para ação.</p>
          </Link>
          <Link href="/dashboard/atendente/tickets?status=pending_customer_feedback" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card-modern transition-all hover:border-cyan-200 hover:shadow-card-hover">
            <div className="text-sm font-medium text-slate-500">Feedback cliente</div>
            <div className="mt-3 text-3xl font-bold text-cyan-600">{ticketsLoading ? '-' : agentMetrics.customerFeedback}</div>
            <p className="mt-2 text-sm text-slate-500">Aguardando retorno do cliente.</p>
          </Link>
          <Link href="/dashboard/atendente/tickets" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card-modern transition-all hover:border-red-200 hover:shadow-card-hover">
            <div className="text-sm font-medium text-slate-500">Alta prioridade</div>
            <div className="mt-3 text-3xl font-bold text-red-600">{ticketsLoading ? '-' : agentMetrics.highPriority}</div>
            <p className="mt-2 text-sm text-slate-500">Críticos ou altos ainda ativos.</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card-modern xl:col-span-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Fila recente</h2>
                <p className="text-sm text-slate-500">Últimos tickets criados ou atualizados na fila.</p>
              </div>
              <Link href="/dashboard/atendente/tickets" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                Ver todos
              </Link>
            </div>

            {ticketsLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-10 w-10 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin"></div>
              </div>
            ) : agentMetrics.recent.length > 0 ? (
              <div className="space-y-3">
                {agentMetrics.recent.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/dashboard/atendente/tickets/${ticket.id}`}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-primary-200 hover:bg-white md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{ticket.ticket_number}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${AGENT_STATUS_STYLES[ticket.status] || AGENT_STATUS_STYLES.open}`}>
                          {AGENT_STATUS_LABELS[ticket.status] || ticket.status}
                        </span>
                      </div>
                      <div className="mt-1 truncate font-semibold text-slate-800">{ticket.subject}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {ticket.customer_name || 'Cliente'} · {ticket.category_name || 'Sem categoria'} · {formatDate(ticket.created_at)}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary-600">Abrir</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <h3 className="font-semibold text-slate-700">Nenhum ticket na fila</h3>
                <p className="mt-1 text-sm text-slate-500">A fila está limpa no momento.</p>
              </div>
            )}
          </div>

          <div className="space-y-6 xl:col-span-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card-modern">
              <h2 className="text-lg font-semibold text-slate-800">Próxima ação</h2>
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                {agentMetrics.pendingAi > 0 ? (
                  <>
                    <div className="font-semibold text-amber-700">Revisar respostas da IA</div>
                    <p className="mt-1 text-sm text-slate-500">Há respostas prontas esperando aprovação humana.</p>
                    <Link href="/dashboard/atendente/aprovacao" className="mt-4 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">
                      Ir para aprovações
                    </Link>
                  </>
                ) : agentMetrics.waitingAgent > 0 ? (
                  <>
                    <div className="font-semibold text-orange-700">Atender chamados pendentes</div>
                    <p className="mt-1 text-sm text-slate-500">Existem tickets aguardando ação do atendimento.</p>
                    <Link href="/dashboard/atendente/tickets?status=pending_agent" className="mt-4 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">
                      Abrir fila pendente
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="font-semibold text-emerald-700">Fila sob controle</div>
                    <p className="mt-1 text-sm text-slate-500">Nenhuma ação crítica apareceu nos últimos tickets carregados.</p>
                    <Link href="/dashboard/atendente/tickets" className="mt-4 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">
                      Ver fila completa
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card-modern">
              <h2 className="text-lg font-semibold text-slate-800">Prioridades</h2>
              <div className="mt-4 space-y-3">
                {agentMetrics.priorityQueue.length > 0 ? (
                  agentMetrics.priorityQueue.map((ticket) => (
                    <Link key={ticket.id} href={`/dashboard/atendente/tickets/${ticket.id}`} className="block rounded-xl bg-slate-50 p-3 hover:bg-slate-100">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-slate-800">{ticket.subject}</span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${ticket.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {ticket.priority === 'critical' ? 'Crítica' : 'Alta'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{ticket.ticket_number}</div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Nenhum ticket de alta prioridade ativo.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Painel administrativo</h1>
            <p className="mt-1 text-slate-500">Visão de operação, usuários, conhecimento e configuração da IA.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/admin/usuarios" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-card-modern transition-colors hover:border-primary-200 hover:text-primary-600">
              <span>👥</span>
              Usuários
            </Link>
            <Link href="/dashboard/admin/config-ia" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-glow-primary">
              <span>⚙️</span>
              Configurar IA
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/dashboard/atendente/tickets" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card-modern transition-all hover:border-blue-200 hover:shadow-card-hover">
            <div className="text-sm font-medium text-slate-500">Tickets ativos</div>
            <div className="mt-3 text-3xl font-bold text-blue-600">{adminLoading ? '-' : adminMetrics.activeTickets}</div>
            <p className="mt-2 text-sm text-slate-500">Abertos, em atendimento ou aguardando ação.</p>
          </Link>
          <Link href="/dashboard/atendente/aprovacao" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card-modern transition-all hover:border-amber-200 hover:shadow-card-hover">
            <div className="text-sm font-medium text-slate-500">Aprovações IA</div>
            <div className="mt-3 text-3xl font-bold text-amber-600">{adminLoading ? '-' : adminMetrics.pendingAi}</div>
            <p className="mt-2 text-sm text-slate-500">Respostas aguardando validação.</p>
          </Link>
          <Link href="/dashboard/admin/usuarios" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card-modern transition-all hover:border-emerald-200 hover:shadow-card-hover">
            <div className="text-sm font-medium text-slate-500">Usuários ativos</div>
            <div className="mt-3 text-3xl font-bold text-emerald-600">{adminLoading ? '-' : adminMetrics.activeUsers}</div>
            <p className="mt-2 text-sm text-slate-500">{adminMetrics.agents} atendentes · {adminMetrics.customers} clientes.</p>
          </Link>
          <Link href="/dashboard/admin/conhecimento" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card-modern transition-all hover:border-red-200 hover:shadow-card-hover">
            <div className="text-sm font-medium text-slate-500">Falhas na base</div>
            <div className="mt-3 text-3xl font-bold text-red-600">{adminLoading ? '-' : adminMetrics.failedArticles}</div>
            <p className="mt-2 text-sm text-slate-500">Artigos com erro de indexação.</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card-modern xl:col-span-7">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Operação de tickets</h2>
                <p className="text-sm text-slate-500">Resumo da fila que exige acompanhamento.</p>
              </div>
              <Link href="/dashboard/atendente/tickets" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                Ver fila
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Link href="/dashboard/atendente/tickets?status=pending_agent" className="rounded-xl bg-orange-50 p-4 hover:bg-orange-100">
                <div className="text-2xl font-bold text-orange-700">{adminLoading ? '-' : adminMetrics.waitingAgent}</div>
                <div className="mt-1 text-sm text-orange-700">Aguardando atendente</div>
              </Link>
              <Link href="/dashboard/atendente/tickets?status=pending_ai" className="rounded-xl bg-amber-50 p-4 hover:bg-amber-100">
                <div className="text-2xl font-bold text-amber-700">{adminLoading ? '-' : adminMetrics.pendingAi}</div>
                <div className="mt-1 text-sm text-amber-700">Pendentes IA</div>
              </Link>
              <Link href="/dashboard/atendente/tickets" className="rounded-xl bg-red-50 p-4 hover:bg-red-100">
                <div className="text-2xl font-bold text-red-700">{adminLoading ? '-' : adminMetrics.highPriority}</div>
                <div className="mt-1 text-sm text-red-700">Alta prioridade</div>
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {adminMetrics.recentTickets.length > 0 ? (
                adminMetrics.recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/dashboard/atendente/tickets/${ticket.id}`}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-primary-200 hover:bg-white md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{ticket.ticket_number}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${AGENT_STATUS_STYLES[ticket.status] || AGENT_STATUS_STYLES.open}`}>
                          {AGENT_STATUS_LABELS[ticket.status] || ticket.status}
                        </span>
                      </div>
                      <div className="mt-1 truncate font-semibold text-slate-800">{ticket.subject}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {ticket.customer_name || 'Cliente'} · {ticket.category_name || 'Sem categoria'} · {formatDate(ticket.created_at)}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary-600">Abrir</span>
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <h3 className="font-semibold text-slate-700">Sem tickets carregados</h3>
                  <p className="mt-1 text-sm text-slate-500">A operação não retornou tickets recentes.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 xl:col-span-5">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card-modern">
              <h2 className="text-lg font-semibold text-slate-800">Saúde da configuração</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link href="/dashboard/admin/config-ia" className="rounded-xl bg-violet-50 p-4 hover:bg-violet-100">
                  <div className="text-2xl font-bold text-violet-700">{adminLoading ? '-' : adminMetrics.activeAiAgents}</div>
                  <div className="mt-1 text-sm text-violet-700">Agentes IA ativos</div>
                </Link>
                <Link href="/dashboard/admin/conhecimento" className="rounded-xl bg-emerald-50 p-4 hover:bg-emerald-100">
                  <div className="text-2xl font-bold text-emerald-700">{adminLoading ? '-' : adminMetrics.indexedArticles}</div>
                  <div className="mt-1 text-sm text-emerald-700">Artigos indexados</div>
                </Link>
                <Link href="/dashboard/admin/categorias" className="rounded-xl bg-slate-50 p-4 hover:bg-slate-100">
                  <div className="text-2xl font-bold text-slate-700">{adminLoading ? '-' : adminCategories.length}</div>
                  <div className="mt-1 text-sm text-slate-600">Categorias totais</div>
                </Link>
                <Link href="/dashboard/admin/categorias" className="rounded-xl bg-red-50 p-4 hover:bg-red-100">
                  <div className="text-2xl font-bold text-red-700">{adminLoading ? '-' : adminMetrics.inactiveCategories}</div>
                  <div className="mt-1 text-sm text-red-700">Categorias inativas</div>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card-modern">
              <h2 className="text-lg font-semibold text-slate-800">Próxima ação</h2>
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                {adminMetrics.failedArticles > 0 ? (
                  <>
                    <div className="font-semibold text-red-700">Corrigir base de conhecimento</div>
                    <p className="mt-1 text-sm text-slate-500">Há conteúdo com erro de indexação que pode afetar respostas da IA.</p>
                    <Link href="/dashboard/admin/conhecimento" className="mt-4 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">
                      Revisar conhecimento
                    </Link>
                  </>
                ) : adminMetrics.pendingAi > 0 ? (
                  <>
                    <div className="font-semibold text-amber-700">Acompanhar aprovações de IA</div>
                    <p className="mt-1 text-sm text-slate-500">Existem respostas aguardando validação humana.</p>
                    <Link href="/dashboard/atendente/aprovacao" className="mt-4 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">
                      Ir para aprovações
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="font-semibold text-emerald-700">Ambiente em ordem</div>
                    <p className="mt-1 text-sm text-slate-500">Nenhuma pendência crítica apareceu nos dados carregados.</p>
                    <Link href="/dashboard/admin/config-ia" className="mt-4 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">
                      Revisar IA
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <h1 className="text-4xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-primary-600 to-violet-600">
            Dashboard
          </span>
        </h1>
        <p className="text-slate-500 mt-2">Gerencie suas atividades e tickets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative p-6 rounded-2xl bg-white shadow-card-modern overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                {action.badge && (
                  <span className={`absolute top-4 right-4 px-2 py-0.5 ${action.badgeColor} text-white rounded-full text-xs font-semibold`}>
                    {action.badge}
                  </span>
                )}
                <h2 className={`mt-4 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${action.gradient}`}>
                  {action.title}
                </h2>
                <p className="mt-2 text-slate-500 text-sm leading-relaxed">{action.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r ${action.gradient}`}>Acessar</span>
                  <span className={`bg-gradient-to-r ${action.gradient} bg-clip-text text-transparent`}>→</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
