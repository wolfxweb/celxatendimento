'use client'

import { useState, useEffect } from 'react'
import { apiFetch, apiPost, apiPut, apiDelete } from '@/lib/api'

interface Plan {
  id: number
  name: string
  price_monthly: number
  price_yearly: number
  max_users: number
  max_tickets: number
  features: string[]
  is_active: boolean
  created_at: string
}

const PLAN_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
]

export default function SuperAdminPlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

  const [name, setName] = useState('')
  const [priceMonthly, setPriceMonthly] = useState(0)
  const [priceYearly, setPriceYearly] = useState(0)
  const [maxUsers, setMaxUsers] = useState(10)
  const [maxTickets, setMaxTickets] = useState(100)
  const [features, setFeatures] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [])

  async function loadPlans() {
    try {
      setLoading(true)
      const data = await apiFetch<Plan[]>('/plans')
      setPlans(data)
    } catch (err) {
      setError('Erro ao carregar planos')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const planData = {
        name,
        price_monthly: priceMonthly,
        price_yearly: priceYearly,
        max_users: maxUsers,
        max_tickets: maxTickets,
        features: features.split('\n').filter(f => f.trim()),
      }

      if (editingPlan) {
        await apiPut(`/plans/${editingPlan.id}`, planData)
      } else {
        await apiPost('/plans', planData)
      }

      setShowModal(false)
      resetForm()
      loadPlans()
    } catch (err) {
      setError('Erro ao salvar plano')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(plan: Plan) {
    try {
      await apiPut(`/plans/${plan.id}`, {
        is_active: !plan.is_active,
      })
      loadPlans()
    } catch (err) {
      alert('Erro ao atualizar plano')
    }
  }

  async function handleDelete(planId: number) {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return

    try {
      await apiDelete(`/plans/${planId}`)
      loadPlans()
    } catch (err) {
      alert('Erro ao excluir plano')
    }
  }

  function resetForm() {
    setName('')
    setPriceMonthly(0)
    setPriceYearly(0)
    setMaxUsers(10)
    setMaxTickets(100)
    setFeatures('')
    setEditingPlan(null)
  }

  function openNewModal() {
    resetForm()
    setShowModal(true)
  }

  function openEditModal(plan: Plan) {
    setEditingPlan(plan)
    setName(plan.name)
    setPriceMonthly(plan.price_monthly)
    setPriceYearly(plan.price_yearly)
    setMaxUsers(plan.max_users)
    setMaxTickets(plan.max_tickets)
    setFeatures(plan.features.join('\n'))
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-primary-600">
              Planos de Assinatura
            </span>
          </h1>
          <p className="text-slate-500 mt-1">Gerencie os planos disponíveis para as empresas</p>
        </div>
        
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-glow-primary hover:scale-105 transition-all"
        >
          <span className="text-lg">+</span>
          Novo Plano
        </button>
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
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-card-modern border border-slate-100">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-slate-700">Nenhum plano cadastrado</h3>
          <p className="text-slate-500 mt-2">Clique em "Novo Plano" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const gradient = PLAN_COLORS[index % PLAN_COLORS.length]
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl bg-white shadow-card-modern border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 ${!plan.is_active ? 'opacity-60' : ''}`}
              >
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-slate-800">{plan.name}</h2>
                    <span className={`px-3 py-1 rounded-xl text-xs font-medium ${
                      plan.is_active 
                        ? 'bg-emerald-500/10 text-emerald-600' 
                        : 'bg-slate-500/10 text-slate-600'
                    }`}>
                      {plan.is_active ? '✓ Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-violet-600">
                        R$ {plan.price_monthly.toFixed(2)}
                      </span>
                      <span className="text-slate-400">/mês</span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      R$ {plan.price_yearly.toFixed(2)}/ano
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                      <span className="text-sm text-slate-600">👥 Usuários</span>
                      <span className="font-semibold text-slate-800">
                        {plan.max_users === -1 ? '∞ Ilimitado' : plan.max_users}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                      <span className="text-sm text-slate-600">🎫 Tickets/mês</span>
                      <span className="font-semibold text-slate-800">
                        {plan.max_tickets === -1 ? '∞ Ilimitado' : plan.max_tickets}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="border-t border-slate-100 pt-4 mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Funcionalidades:</h3>
                    <ul className="space-y-2">
                      {plan.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-emerald-500">✓</span>
                          <span className="text-slate-600">{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-sm text-slate-400">
                          +{plan.features.length - 4} mais...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium shadow hover:shadow-glow-primary transition-all"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleToggleActive(plan)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        plan.is_active
                          ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                      }`}
                    >
                      {plan.is_active ? '⏸' : '▶'}
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 text-sm font-medium transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-8 rounded-2xl bg-white shadow-2xl border border-slate-200">
            <button
              onClick={() => { setShowModal(false); resetForm() }}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              {editingPlan ? '✏️ Editar Plano' : '➕ Novo Plano'}
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-slate-700">
                  Nome do Plano <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="Ex: Plano Basic"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="priceMonthly" className="text-sm font-semibold text-slate-700">
                    Preço Mensal (R$) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="priceMonthly"
                    type="number"
                    step="0.01"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(parseFloat(e.target.value))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="priceYearly" className="text-sm font-semibold text-slate-700">
                    Preço Anual (R$) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="priceYearly"
                    type="number"
                    step="0.01"
                    value={priceYearly}
                    onChange={(e) => setPriceYearly(parseFloat(e.target.value))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="maxUsers" className="text-sm font-semibold text-slate-700">
                    Máximo de Usuários
                  </label>
                  <input
                    id="maxUsers"
                    type="number"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    placeholder="-1 para ilimitado"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="maxTickets" className="text-sm font-semibold text-slate-700">
                    Máximo de Tickets/mês
                  </label>
                  <input
                    id="maxTickets"
                    type="number"
                    value={maxTickets}
                    onChange={(e) => setMaxTickets(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    placeholder="-1 para ilimitado"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="features" className="text-sm font-semibold text-slate-700">
                  Funcionalidades (uma por linha)
                </label>
                <textarea
                  id="features"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                  placeholder="Suporte por email&#10;Relatórios básicos&#10;..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-glow-primary transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    <>✓ Salvar</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}