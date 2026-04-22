import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        
        {/* Floating shapes */}
        <div className="absolute top-20 left-20 w-20 h-20 border border-primary-500/30 rounded-2xl rotate-12 animate-float"></div>
        <div className="absolute bottom-32 right-32 w-16 h-16 border border-violet-500/30 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-40 right-40 w-12 h-12 bg-gradient-primary rounded-lg rotate-45 animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-primary shadow-glow-primary mb-6 animate-float">
          <span className="text-white font-bold text-4xl">C</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-violet-400 to-cyan-400">
            celx-atendimento
          </span>
        </h1>
        <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
          Sistema inteligente de tickets com agentes de IA para suporte ao cliente
        </p>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <span className="text-emerald-400">✓</span>
            <span className="text-white text-sm">Respostas automáticas com IA</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <span className="text-emerald-400">✓</span>
            <span className="text-white text-sm">Aprovação humana</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <span className="text-emerald-400">✓</span>
            <span className="text-white text-sm">Base de conhecimento RAG</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/login"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-primary text-white font-semibold text-lg shadow-lg hover:shadow-glow-primary hover:scale-105 transition-all duration-300 group"
        >
          <span>Acessar Sistema</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        {/* Tech badges */}
        <div className="flex items-center justify-center gap-6 mt-12">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            FastAPI
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Next.js
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            LangGraph
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            PostgreSQL
          </div>
        </div>
      </div>
    </main>
  )
}