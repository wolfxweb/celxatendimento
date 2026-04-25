'use client'

import { useState, useEffect } from 'react'
import { apiFetch, apiPost, apiPatch, apiDelete } from '@/lib/api'

interface Category {
  id: number
  name: string
  description: string | null
  sla_minutes: number
  icon: string | null
  color: string | null
  is_active: boolean
  is_default: boolean
  require_approval: boolean
  parent_category_id: number | null
  ticket_count: number
  created_at: string
}

interface CategoryFormData {
  name: string
  description: string
  sla_minutes: number
  require_approval: boolean
}

interface ModalState {
  isOpen: boolean
  mode: 'create' | 'edit' | null
  category: Category | null
}

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<ModalState>({ isOpen: false, mode: null, category: null })
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    sla_minutes: 1440,
    require_approval: false,
  })
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      setLoading(true)
      const data = await apiFetch<Category[]>('/categories/?include_inactive=true&include_stats=true')
      setCategories(data)
    } catch (err) {
      setError('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setFormData({
      name: '',
      description: '',
      sla_minutes: 1440,
      require_approval: false,
    })
    setModal({ isOpen: true, mode: 'create', category: null })
  }

  function openEditModal(category: Category) {
    setFormData({
      name: category.name,
      description: category.description || '',
      sla_minutes: category.sla_minutes,
      require_approval: category.require_approval,
    })
    setModal({ isOpen: true, mode: 'edit', category })
  }

  function closeModal() {
    setModal({ isOpen: false, mode: null, category: null })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (modal.mode === 'create') {
        await apiPost('/categories/', formData)
      } else if (modal.mode === 'edit' && modal.category) {
        await apiPatch(`/categories/${modal.category.id}/`, formData)
      }
      closeModal()
      loadCategories()
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar categoria')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(category: Category) {
    const newStatus = !category.is_active
    const action = newStatus ? 'ativar' : 'inativar'

    if (!newStatus && category.ticket_count > 0) {
      if (!confirm(`Esta categoria está em uso por ${category.ticket_count} tickets. Deseja inativar mesmo assim?`)) {
        return
      }
    } else if (newStatus) {
      if (!confirm(`Ativar a categoria "${category.name}"?`)) {
        return
      }
    } else {
      if (!confirm(`Inativar a categoria "${category.name}"?`)) {
        return
      }
    }

    try {
      await apiPatch(`/categories/${category.id}/`, { is_active: newStatus })
      loadCategories()
    } catch (err: any) {
      alert(err?.message || 'Erro ao atualizar status')
    }
  }

  async function handleDelete(category: Category) {
    if (category.ticket_count > 0) {
      alert(`Não é possível excluir esta categoria pois ela está em uso por ${category.ticket_count} tickets.`)
      return
    }

    if (!confirm(`Excluir definitivamente a categoria "${category.name}"?`)) {
      return
    }

    try {
      await apiDelete(`/categories/${category.id}/`)
      loadCategories()
    } catch (err: any) {
      alert(err?.message || 'Erro ao excluir categoria')
    }
  }

  function formatSla(minutes: number): string {
    if (minutes < 60) return `${minutes} minutos`
    if (minutes < 1440) return `${Math.floor(minutes / 60)} horas`
    const days = Math.floor(minutes / 1440)
    return `${days} dia${days > 1 ? 's' : ''}`
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-primary-600">
              Categorias
            </span>
          </h1>
          <p className="text-slate-500 mt-1">Gerencie as categorias da sua empresa</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-medium shadow-lg hover:shadow-glow-primary transition-all"
          >
            <span>➕</span>
            Nova Categoria
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Empty state */}
          {categories.length === 0 && (
            <div className="p-12 rounded-2xl bg-white shadow-card-modern border border-slate-100 text-center">
              <span className="text-6xl">📁</span>
              <h3 className="text-xl font-semibold text-slate-700 mt-4">Nenhuma categoria</h3>
              <p className="text-slate-500 mt-2">Cadastre sua primeira categoria para organizar seus tickets</p>
              <button
                onClick={openCreateModal}
                className="mt-6 px-6 py-3 rounded-xl bg-gradient-primary text-white font-medium shadow-lg hover:shadow-glow-primary transition-all"
              >
                ➕ Criar Categoria
              </button>
            </div>
          )}

          {/* Categories list */}
          {categories.length > 0 && (
            <div className="space-y-3">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl bg-white shadow-card-modern border border-slate-100 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        cat.is_active ? 'bg-primary-100' : 'bg-slate-100'
                      }`}>
                        {cat.icon || '📁'}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-800">{cat.name}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cat.is_active
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {cat.is_active ? '🟢 Ativa' : '🔴 Inativa'}
                          </span>
                          {cat.require_approval && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              ⚠️ Aprovação
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <span>⏱️</span> SLA: {formatSla(cat.sla_minutes)}
                          </span>
                          <span className="flex items-center gap-1">
                            <span>🎫</span> {cat.ticket_count} ticket{cat.ticket_count !== 1 ? 's' : ''}
                          </span>
                          {cat.description && (
                            <span className="text-slate-400 truncate max-w-md">{cat.description}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          cat.is_active
                            ? 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300'
                        }`}
                        title={cat.is_active ? 'Inativar' : 'Ativar'}
                      >
                        {cat.is_active ? '⛔' : '✅'}
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm h-screen">
          <div className="w-full max-w-lg mx-4 rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {modal.mode === 'create' ? 'Nova Categoria' : 'Editar Categoria'}
              </h2>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-slate-700">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="Ex: Suporte Técnico"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-semibold text-slate-700">
                  Descrição
                </label>
                <input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="Breve descrição da categoria (opcional)"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sla" className="text-sm font-semibold text-slate-700">
                  SLA (minutos)
                </label>
                <input
                  id="sla"
                  type="number"
                  value={formData.sla_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, sla_minutes: parseInt(e.target.value) || 0 }))}
                  min={1}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
                <p className="text-xs text-slate-400">
                  {formatSla(formData.sla_minutes)} ({formData.sla_minutes} minutos)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="require_approval"
                  type="checkbox"
                  checked={formData.require_approval}
                  onChange={(e) => setFormData(prev => ({ ...prev, require_approval: e.target.checked }))}
                  className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="require_approval" className="text-sm text-slate-700">
                  Exigir aprovação de IA para tickets desta categoria
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-glow-primary transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Salvando...
                    </span>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}