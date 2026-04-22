'use client'

import { useState, useEffect } from 'react'
import { apiFetch, apiPost, apiPut, apiDelete } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
  last_login_at: string | null
}

const ROLE_LABELS: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  customer: { label: 'Cliente', bg: 'bg-blue-500/10', text: 'text-blue-600', icon: '👤' },
  agent: { label: 'Atendente', bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: '👨‍💻' },
  admin: { label: 'Admin', bg: 'bg-violet-500/10', text: 'text-violet-600', icon: '⚡' },
  superadmin: { label: 'Super Admin', bg: 'bg-red-500/10', text: 'text-red-600', icon: '👑' },
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('customer')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      const data = await apiFetch<User[]>('/users')
      setUsers(data)
    } catch (err) {
      setError('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const userData = {
        email,
        full_name: fullName,
        role,
        ...(password && { password }),
      }

      if (editingUser) {
        await apiPut(`/users/${editingUser.id}`, userData)
      } else {
        await apiPost('/users/register', userData)
      }

      setShowModal(false)
      resetForm()
      loadUsers()
    } catch (err) {
      setError('Erro ao salvar usuário')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(user: User) {
    try {
      await apiPut(`/users/${user.id}`, { is_active: !user.is_active })
      loadUsers()
    } catch (err) {
      alert('Erro ao atualizar usuário')
    }
  }

  async function handleResetPassword(userId: string) {
    if (!confirm('Deseja redefinir a senha deste usuário?')) return

    try {
      await apiPost(`/users/${userId}/reset-password`, {})
      alert('Senha redefinida! O usuário receberá um email com instruções.')
    } catch (err) {
      alert('Erro ao redefinir senha')
    }
  }

  function resetForm() {
    setEmail('')
    setFullName('')
    setRole('customer')
    setPassword('')
    setEditingUser(null)
  }

  function openNewModal() {
    resetForm()
    setShowModal(true)
  }

  function openEditModal(user: User) {
    setEditingUser(user)
    setEmail(user.email)
    setFullName(user.full_name)
    setRole(user.role)
    setPassword('')
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-primary-600">
              Gerenciar Usuários
            </span>
          </h1>
          <p className="text-slate-500 mt-1">Cadastre e gerencie usuários do sistema</p>
        </div>
        
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-glow-primary hover:scale-105 transition-all"
        >
          <span className="text-lg">+</span>
          Novo Usuário
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600">
          {error}
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-card-modern border border-slate-100">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-slate-700">Nenhum usuário cadastrado</h3>
          <p className="text-slate-500 mt-2">Clique em "Novo Usuário" para começar</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card-modern border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Função</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Último Login</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const roleStyle = ROLE_LABELS[user.role] || ROLE_LABELS.customer
                
                return (
                  <tr key={user.id} className="group hover:bg-gradient-to-r hover:from-primary-50/30 hover:to-violet-50/30 transition-all duration-300">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${roleStyle.bg} ${roleStyle.text}`}>
                        <span>{roleStyle.icon}</span>
                        {roleStyle.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${
                        user.is_active 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : 'bg-red-500/10 text-red-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">
                        {user.last_login_at ? formatDate(user.last_login_at) : 'Nunca'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-600 hover:bg-primary-500/20 text-sm font-medium transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            user.is_active 
                              ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' 
                              : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                          }`}
                        >
                          {user.is_active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 text-sm font-medium transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-8 rounded-2xl bg-white shadow-2xl border border-slate-200">
            {/* Close button */}
            <button
              onClick={() => { setShowModal(false); resetForm() }}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              {editingUser ? '✏️ Editar Usuário' : '➕ Novo Usuário'}
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="João Silva"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="joao@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-semibold text-slate-700">
                  Função <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                >
                  <option value="customer">👤 Cliente</option>
                  <option value="agent">👨‍💻 Atendente</option>
                  <option value="admin">⚡ Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  Senha {editingUser ? '(deixe em branco para não alterar)' : ''}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingUser}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="••••••••"
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