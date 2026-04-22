'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch, apiPost } from '@/lib/api'

interface Category {
  id: number
  name: string
  description: string | null
  icon: string | null
  color: string | null
}

interface TicketCreateResponse {
  id: string
  ticket_number: string
  status: string
}

const PRIORITIES = [
  { value: 'low', label: 'Baixa', color: 'emerald', icon: '🟢' },
  { value: 'medium', label: 'Média', color: 'amber', icon: '🟡' },
  { value: 'high', label: 'Alta', color: 'orange', icon: '🟠' },
  { value: 'critical', label: 'Crítica', color: 'red', icon: '🔴' },
]

export default function NovoTicketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')
  
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [priority, setPriority] = useState('medium')

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const data = await apiFetch<Category[]>('/categories')
      setCategories(data)
    } catch (err) {
      console.error('Erro ao carregar categorias')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const ticketData = {
        subject,
        description,
        category_id: categoryId || null,
        priority,
      }
      
      const result = await apiPost<TicketCreateResponse>('/tickets', ticketData)
      
      alert(`Ticket ${result.ticket_number} criado com sucesso!`)
      router.push('/dashboard/cliente/tickets')
    } catch (err) {
      setError('Erro ao criar ticket. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-primary-600">
            Criar Novo Ticket
          </span>
        </h1>
        <p className="text-slate-500 mt-1">Descreva seu problema ou dúvida</p>
      </div>

      {/* Form Card */}
      <div className="p-8 rounded-2xl bg-white shadow-card-modern border border-slate-100">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-semibold text-slate-700">
              Assunto <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              placeholder="Descreva resumidamente o problema"
            />
            <span className="text-xs text-slate-400">{subject.length}/200</span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-slate-700">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={5000}
              required
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
              placeholder="Descreva detalhadamente o problema ou dúvida. Inclua informações como:\n- Quando começou o problema\n- O que você estava tentando fazer\n- Mensagens de erro (se houver)"
            />
            <span className="text-xs text-slate-400">{description.length}/5000</span>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-semibold text-slate-700">
              Categoria
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              <option value="">Selecione uma categoria (opcional)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Prioridade</label>
            <div className="grid grid-cols-4 gap-3">
              {PRIORITIES.map((p) => (
                <label
                  key={p.value}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    priority === p.value
                      ? p.color === 'emerald' ? 'border-emerald-500 bg-emerald-50' :
                        p.color === 'amber' ? 'border-amber-500 bg-amber-50' :
                        p.color === 'orange' ? 'border-orange-500 bg-orange-50' :
                        'border-red-500 bg-red-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={priority === p.value}
                    onChange={(e) => setPriority(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-2xl">{p.icon}</span>
                  <span className={`text-sm font-medium ${
                    priority === p.value
                      ? p.color === 'emerald' ? 'text-emerald-700' :
                        p.color === 'amber' ? 'text-amber-700' :
                        p.color === 'orange' ? 'text-orange-700' :
                        'text-red-700'
                      : 'text-slate-600'
                  }`}>
                    {p.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-glow-primary hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Criando...
                </>
              ) : (
                <>
                  <span>🎫</span>
                  Criar Ticket
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}