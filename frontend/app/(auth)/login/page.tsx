'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiPost } from '@/lib/api'
import { setToken } from '@/lib/auth'

interface LoginResponse {
  access_token: string
  token_type?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Usuários de exemplo para testes
  const sampleUsers = [
    { email: 'superadmin@celx.com.br', password: 'admin123', role: 'Super Admin', icon: '👑', color: 'from-amber-500 to-orange-500' },
    { email: 'admin@celx.com.br', password: 'admin123', role: 'Admin', icon: '⚡', color: 'from-violet-500 to-purple-500' },
    { email: 'agente@celx.com.br', password: 'agente123', role: 'Atendente', icon: '👨‍💻', color: 'from-cyan-500 to-blue-500' },
    { email: 'cliente@celx.com.br', password: 'cliente123', role: 'Cliente', icon: '👤', color: 'from-emerald-500 to-teal-500' },
  ]

  function fillCredentials(user: typeof sampleUsers[0]) {
    setEmail(user.email)
    setPassword(user.password)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiPost<LoginResponse>('/auth/login', {
        email,
        password,
      })
      setToken(response.access_token)
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Email ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary shadow-glow-primary mb-4">
            <span className="text-white font-bold text-3xl">C</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            celx-atendimento
          </h1>
          <p className="text-slate-400">Sistema de tickets com IA</p>
        </div>

        {/* Login Form Card */}
        <div className="relative p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-violet-500/10 pointer-events-none"></div>
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm text-center backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border transition-all duration-300 text-white placeholder-slate-500 focus:outline-none ${
                    focusedField === 'email' 
                      ? 'border-primary-500 shadow-glow-primary' 
                      : 'border-white/10'
                  }`}
                  placeholder="seu@email.com"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/20 to-violet-500/20 opacity-0 transition-opacity duration-300 pointer-events-none"
                     style={{ opacity: focusedField === 'email' ? 1 : 0 }}></div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border transition-all duration-300 text-white placeholder-slate-500 focus:outline-none ${
                    focusedField === 'password' 
                      ? 'border-primary-500 shadow-glow-primary' 
                      : 'border-white/10'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-4 rounded-xl bg-gradient-primary font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-glow-primary hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <span className="text-lg">→</span>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Decorative elements */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl"></div>
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl"></div>
        </div>

        {/* Usuários de Exemplo */}
        <div className="mt-6 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <p className="text-center text-slate-400 text-sm mb-4">👆 Clique para preencher automaticamente</p>
          <div className="space-y-2">
            {sampleUsers.map((user) => (
              <button
                key={user.email}
                type="button"
                onClick={() => fillCredentials(user)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${user.color} flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform`}>
                  {user.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium text-sm">{user.role}</div>
                  <div className="text-slate-400 text-xs font-mono">{user.email}</div>
                </div>
                <div className="text-slate-500 text-xs group-hover:text-slate-300 transition-colors">
                  <span className="px-2 py-1 rounded bg-slate-800/50 text-slate-400 font-mono">
                    {user.password}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Sistema de atendimento com inteligência artificial
        </p>
      </div>
    </div>
  )
}