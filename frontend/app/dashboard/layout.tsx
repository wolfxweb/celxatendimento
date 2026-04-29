'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated, getToken } from '@/lib/auth'

interface NavItem {
  href: string
  label: string
  icon: string
  badge?: boolean
  roles: string[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['superadmin', 'admin', 'agent', 'customer'] },
  { href: '/dashboard/cliente/tickets', label: 'Meus Tickets', icon: '🎫', roles: ['admin', 'customer'] },
  { href: '/dashboard/atendente/tickets', label: 'Tickets', icon: '📋', roles: ['admin', 'agent'] },
  { href: '/dashboard/atendente/aprovacao', label: 'Aprovar IA', icon: '🤖', badge: true, roles: ['admin', 'agent'] },
  { href: '/dashboard/atendente/chat-kb', label: 'Chat Conhecimento', icon: '📚', roles: ['admin', 'agent'] },
  { href: '/dashboard/admin/usuarios', label: 'Usuários', icon: '👥', roles: ['admin'] },
  { href: '/dashboard/admin/categorias', label: 'Categorias', icon: '📁', roles: ['admin'] },
  { href: '/dashboard/admin/config-ia', label: 'Config IA', icon: '⚙️', roles: ['admin'] },
  { href: '/dashboard/admin/conhecimento', label: 'Conhecimento', icon: '🧠', roles: ['admin'] },
  { href: '/dashboard/superadmin/empresas', label: 'Empresas', icon: '🏢', roles: ['superadmin'] },
  { href: '/dashboard/superadmin/planos', label: 'Planos', icon: '📦', roles: ['superadmin'] },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; role: string; full_name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    try {
      const token = getToken()
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({
          email: payload.email || '',
          role: payload.role || 'customer',
          full_name: payload.full_name || 'User',
        })
      }
    } catch (e) {
      console.error('Error decoding token:', e)
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    const syncSidebar = () => {
      setSidebarOpen(window.innerWidth >= 768)
    }

    syncSidebar()
    window.addEventListener('resize', syncSidebar)
    return () => window.removeEventListener('resize', syncSidebar)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" style={{ animationDelay: '0.15s' }}></div>
        </div>
      </div>
    )
  }

  // Filtrar itens do menu baseado no role do usuário
  const navItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role || ''))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
        />
      )}

      {/* Modern Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-50 transition-all duration-300 ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-violet-400">
                celx-atendimento
              </span>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex absolute -right-3 top-20 w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full items-center justify-center text-white shadow-lg hover:shadow-glow-primary hover:scale-110 transition-all duration-300 border-2 border-slate-600 hover:border-primary-500"
          aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          {sidebarOpen ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setSidebarOpen(false)
                }
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              {sidebarOpen && (
                <span className="font-medium group-hover:text-primary-400 transition-colors">{item.label}</span>
              )}
              {item.badge && sidebarOpen && (
                <span className="ml-auto px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full text-xs font-medium">
                  NEW
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.full_name}</p>
                <p className="text-slate-400 text-xs truncate">{user?.email}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <Link
              href="/login"
              onClick={() => localStorage.removeItem('celx_token')}
              className="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 text-sm"
            >
              <span>⬆</span> Sair
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {/* Page Content */}
        <main className="p-4 sm:p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
