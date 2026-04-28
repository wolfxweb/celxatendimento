'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

interface StatCard {
  label: string
  value: string | number
  icon: string
  gradient: string
  delay: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }, [router])

  const quickActions = [
    {
      href: '/dashboard/cliente/tickets',
      title: 'Meus Tickets',
      description: 'Visualize e crie tickets de suporte',
      icon: '🎫',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'hover:from-blue-600 hover:to-cyan-600',
    },
    {
      href: '/dashboard/atendente/tickets',
      title: 'Tickets',
      description: 'Gerencie tickets da empresa',
      icon: '📋',
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'hover:from-emerald-600 hover:to-teal-600',
    },
    {
      href: '/dashboard/atendente/aprovacao',
      title: 'Aprovar IA',
      description: 'Revise respostas geradas por IA',
      icon: '🤖',
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'hover:from-violet-600 hover:to-purple-600',
      badge: 'Pendente',
      badgeColor: 'bg-amber-500',
    },
    {
      href: '/dashboard/atendente/chat-kb',
      title: 'Chat KB',
      description: 'Consulte a base de conhecimento',
      icon: '📚',
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'hover:from-amber-600 hover:to-orange-600',
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

  return (
    <div className="space-y-8">
      {/* Page Title with animated gradient */}
      <div className="relative">
        <h1 className="text-4xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-primary-600 to-violet-600">
            Dashboard
          </span>
        </h1>
        <p className="text-slate-500 mt-2">Gerencie suas atividades e tickets</p>
        
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl"></div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Card */}
            <div className="relative p-6 rounded-2xl bg-white shadow-card-modern overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
              {/* Gradient border effect on hover */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${action.gradient} -z-10`} style={{ margin: '-1px' }} />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon with gradient background */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                
                {/* Badge if exists */}
                {action.badge && (
                  <span className={`absolute top-4 right-4 px-2 py-0.5 ${action.badgeColor} text-white rounded-full text-xs font-semibold`}>
                    {action.badge}
                  </span>
                )}
                
                <h2 className={`mt-4 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${action.gradient}`}>
                  {action.title}
                </h2>
                <p className="mt-2 text-slate-500 text-sm leading-relaxed">
                  {action.description}
                </p>
                
                {/* Arrow indicator */}
                <div className="mt-4 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r ${action.gradient}`}>
                    Acessar
                  </span>
                  <span className={`bg-gradient-to-r ${action.gradient} bg-clip-text text-transparent`}>
                    →
                  </span>
                </div>
              </div>

              {/* Decorative circles */}
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-50 rounded-full opacity-50"></div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity Card */}
        <div className="p-6 rounded-2xl bg-white shadow-card-modern border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Atividade Recente</h3>
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <span className="text-primary-500">📊</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-slate-600">Ticket #123 resolvido com sucesso</span>
              <span className="text-xs text-slate-400 ml-auto">2h atrás</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-sm text-slate-600">Nova resposta IA pendente</span>
              <span className="text-xs text-slate-400 ml-auto">4h atrás</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm text-slate-600">Ticket #122 atribuído a você</span>
              <span className="text-xs text-slate-400 ml-auto">1d atrás</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-card-modern overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Estatísticas</h3>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="text-white">⚡</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-3xl font-bold text-white">12</div>
                <div className="text-sm text-slate-400">Tickets Abertos</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-3xl font-bold text-emerald-400">8</div>
                <div className="text-sm text-slate-400">Resolvidos Hoje</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-3xl font-bold text-amber-400">3</div>
                <div className="text-sm text-slate-400">Aguardando IA</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-3xl font-bold text-violet-400">98%</div>
                <div className="text-sm text-slate-400">Satisfação</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}