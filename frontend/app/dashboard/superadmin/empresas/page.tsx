'use client'

import { useState, useEffect } from 'react'
import { apiFetch, apiPost } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface Company {
  id: string
  name: string
  domain: string
  contact_email: string
  contact_name: string
  status: string
  status_reason: string | null
  total_users: number
  total_tickets: number
  created_at: string
  approved_at: string | null
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: '⏳' },
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: '✓' },
  suspended: { bg: 'bg-orange-500/10', text: 'text-orange-600', icon: '⏸' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-600', icon: '✗' },
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  active: 'Ativa',
  suspended: 'Suspensa',
  cancelled: 'Cancelada',
}

const filters = [
  { key: 'pending', label: 'Pendente', icon: '⏳' },
  { key: 'active', label: 'Ativas', icon: '✓' },
  { key: 'suspended', label: 'Suspensas', icon: '⏸' },
  { key: '', label: 'Todas', icon: '📋' },
]

export default function SuperAdminEmpresasPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('pending')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadCompanies()
  }, [filter])

  async function loadCompanies() {
    try {
      setLoading(true)
      const params = filter ? `?status=${filter}` : ''
      const data = await apiFetch<Company[]>(`/companies${params}`)
      setCompanies(data)
    } catch (err) {
      setError('Erro ao carregar empresas')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(companyId: string) {
    setProcessing(companyId)
    try {
      await apiPost(`/companies/${companyId}/approve`, {})
      loadCompanies()
    } catch (err) {
      alert('Erro ao aprovar empresa')
    } finally {
      setProcessing(null)
    }
  }

  async function handleReject(companyId: string) {
    const reason = prompt('Motivo da rejeição:')
    if (!reason) return

    setProcessing(companyId)
    try {
      await apiPost(`/companies/${companyId}/reject`, {
        reason,
      })
      loadCompanies()
    } catch (err) {
      alert('Erro ao rejeitar empresa')
    } finally {
      setProcessing(null)
    }
  }

  async function handleSuspend(companyId: string) {
    if (!confirm('Tem certeza que deseja suspender esta empresa?')) return

    setProcessing(companyId)
    try {
      await apiPost(`/companies/${companyId}/suspend`, {})
      loadCompanies()
    } catch (err) {
      alert('Erro ao suspender empresa')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-primary-600">
            Gerenciar Empresas
          </span>
        </h1>
        <p className="text-slate-500 mt-1">Aprovar e gerenciar empresas do sistema</p>
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

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-card-modern border border-slate-100">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-slate-700">Nenhuma empresa encontrada</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card-modern border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estatísticas</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((company) => {
                const statusStyle = STATUS_STYLES[company.status] || STATUS_STYLES.pending
                
                return (
                  <tr key={company.id} className="group hover:bg-gradient-to-r hover:from-primary-50/30 hover:to-violet-50/30 transition-all duration-300">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{company.name}</div>
                          <div className="text-sm text-slate-500">{company.domain}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{company.contact_name}</div>
                      <div className="text-sm text-slate-500">{company.contact_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        <span>{statusStyle.icon}</span>
                        {STATUS_LABELS[company.status] || company.status}
                      </span>
                      {company.status_reason && (
                        <div className="text-xs text-slate-400 mt-1 max-w-xs truncate" title={company.status_reason}>
                          {company.status_reason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">👥</span>
                          <span className="font-medium text-slate-700">{company.total_users}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">🎫</span>
                          <span className="font-medium text-slate-700">{company.total_tickets}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">
                        {formatDate(company.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {company.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(company.id)}
                            disabled={processing === company.id}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow hover:shadow-glow-primary transition-all disabled:opacity-50"
                          >
                            ✓ Aprovar
                          </button>
                          <button
                            onClick={() => handleReject(company.id)}
                            disabled={processing === company.id}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium shadow hover:scale-105 transition-all disabled:opacity-50"
                          >
                            ✗ Rejeitar
                          </button>
                        </div>
                      )}
                      {company.status === 'active' && (
                        <button
                          onClick={() => handleSuspend(company.id)}
                          disabled={processing === company.id}
                          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium shadow hover:scale-105 transition-all disabled:opacity-50"
                        >
                          ⏸ Suspender
                        </button>
                      )}
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