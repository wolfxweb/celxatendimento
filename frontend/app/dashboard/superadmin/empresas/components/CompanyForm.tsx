'use client'

import { useState } from 'react'
import { apiPost } from '@/lib/api'

interface CompanyFormProps {
  onSuccess: () => void
  onClose: () => void
}

export default function CompanyForm({ onSuccess, onClose }: CompanyFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    billing_email: '',
    password: '',
    confirm_password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim() || formData.name.length < 3) {
      setError('Nome da empresa deve ter pelo menos 3 caracteres')
      return
    }
    if (!formData.contact_name.trim()) {
      setError('Nome do contato é obrigatório')
      return
    }
    if (!formData.contact_email.includes('@')) {
      setError('Email de contato inválido')
      return
    }
    if (formData.password.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres')
      return
    }
    if (formData.password !== formData.confirm_password) {
      setError('Senhas não conferem')
      return
    }

    setLoading(true)
    try {
      const { confirm_password, ...payload } = formData
      await apiPost('/companies', payload)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Erro ao criar empresa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Nova Empresa</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome da Empresa *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              placeholder="Ex: Empresa XYZ Ltda"
              minLength={3}
              maxLength={255}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Domínio
            </label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              placeholder="Ex: empresaxyz.com.br"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome do Contato *
            </label>
            <input
              type="text"
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              placeholder="Ex: João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email do Contato *
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              placeholder="Ex: joao@empresa.com.br"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              placeholder="Ex: (11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email de Cobrança
            </label>
            <input
              type="email"
              value={formData.billing_email}
              onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              placeholder="Ex: financeiro@empresa.com.br"
            />
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Conta do Administrador</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Senha do Admin *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
              />
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar Senha *
              </label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                placeholder="Repita a senha"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 text-white font-medium shadow hover:shadow-glow-primary transition-all disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
