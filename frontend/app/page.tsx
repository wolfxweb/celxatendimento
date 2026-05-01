'use client'

import Link from 'next/link'
import { useState } from 'react'

const features = [
  {
    icon: '⚡',
    title: 'Resposta em Segundos',
    desc: 'Seus clientes recebem uma resposta inteligente em segundos, a qualquer hora do dia — sem fila de espera.',
  },
  {
    icon: '🧠',
    title: 'IA que Conhece Seu Negócio',
    desc: 'Carregue seus manuais, FAQs e documentos. Nossa IA aprende com eles e responde como seu melhor atendente.',
  },
  {
    icon: '✅',
    title: 'Você Sempre Tem o Controle',
    desc: 'Toda resposta da IA passa pela aprovação da sua equipe antes de chegar ao cliente. Qualidade garantida.',
  },
  {
    icon: '📊',
    title: 'Veja Tudo em um Painel',
    desc: 'Acompanhe em tempo real quantos tickets foram resolvidos, o tempo médio e a satisfação dos clientes.',
  },
  {
    icon: '👥',
    title: 'Para Toda a Sua Equipe',
    desc: 'Do cliente ao gerente, cada pessoa tem seu espaço ideal: painel de cliente, atendente e administrador.',
  },
  {
    icon: '🔒',
    title: 'Seus Dados Só São Seus',
    desc: 'Cada empresa tem seus dados completamente isolados. Nenhuma informação vaza ou se mistura.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Cliente abre um chamado',
    desc: 'Pelo painel, seu cliente descreve o problema em segundos.',
  },
  {
    number: '02',
    title: 'A IA prepara a resposta',
    desc: 'Em instantes, a inteligência artificial monta uma resposta completa, usando os seus documentos.',
  },
  {
    number: '03',
    title: 'Seu time aprova e envia',
    desc: 'Com um clique, seu atendente revisa, aprova e o cliente recebe a resposta. Rápido e sem erros.',
  },
]





const faqs = [
  {
    q: 'Preciso saber de tecnologia para usar?',
    a: 'Não! A plataforma foi feita para qualquer pessoa. Você sobe seus documentos, e a IA faz o resto. A sua equipe só precisa clicar em "Aprovar".',
  },
  {
    q: 'Como a IA aprende sobre minha empresa?',
    a: 'Você carrega seus manuais, PDFs e documentos de suporte no painel. Em minutos, a IA processa tudo e começa a responder usando essas informações.',
  },
  {
    q: 'E se a resposta da IA estiver errada?',
    a: 'Nada é enviado sem sua aprovação! Sua equipe revisa cada resposta antes de o cliente receber. Você também pode editar o texto antes de aprovar.',
  },
  {
    q: 'Posso testar antes de assinar?',
    a: 'Sim! Clique em "Ver Demo" para acessar um ambiente completo com usuários de teste. Explore tudo sem precisar de cartão.',
  },
]

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-violet-500/30">
            C
          </div>
          <span className="font-bold text-lg tracking-tight">Celx Atendimento</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">
            Entrar
          </Link>
          <Link href="/login" className="text-sm bg-white text-slate-900 font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-all shadow-lg">
            Ver Demo →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-36 pb-28 px-6 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-violet-600/20 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          Novo: Chat com base de conhecimento por IA
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-tight mb-6">
          Suporte{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400">
            10× mais rápido
          </span>
          <br />sem contratar mais ninguém.
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Sua equipe responde chamados em minutos, com ajuda de uma IA que conhece cada detalhe do seu negócio.
          Você aprova, o cliente fica feliz.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-300"
          >
            Acessar a Demo Grátis
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <p className="text-sm text-slate-500">Sem cartão de crédito · Acesso imediato</p>
        </div>

        {/* Social proof bar */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm">
          <span className="flex items-center gap-2">
            <span className="text-yellow-400">★★★★★</span>
            Avaliado por equipes de suporte
          </span>
          <span className="w-px h-4 bg-slate-700 hidden sm:block" />
          <span>+500 chamados resolvidos por IA</span>
          <span className="w-px h-4 bg-slate-700 hidden sm:block" />
          <span>Aprovação humana em todos os fluxos</span>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sua equipe está sobrecarregada?</h2>
          <p className="text-slate-400 text-lg mb-14">Esses problemas são mais comuns do que parecem — e têm solução.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: '😓', text: 'Clientes esperando horas por uma resposta simples' },
              { emoji: '🔁', text: 'Atendentes respondendo as mesmas perguntas todo dia' },
              { emoji: '📉', text: 'Satisfação caindo porque o suporte não escala' },
            ].map((p, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left">
                <div className="text-3xl mb-4">{p.emoji}</div>
                <p className="text-slate-300 font-medium leading-snug">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Tudo que sua equipe precisa.</h2>
            <p className="text-slate-400 text-lg">Em uma plataforma simples de usar, sem precisar de TI.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-7 rounded-2xl bg-slate-900 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/80 transition-all duration-300 cursor-default"
              >
                <div className="text-3xl mb-5">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-violet-300 transition-colors">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simples assim.</h2>
            <p className="text-slate-400 text-lg">Em 3 passos, seu suporte vira máquina de satisfação.</p>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-violet-600 to-blue-600 opacity-30" />
            <div className="grid md:grid-cols-3 gap-10">
              {steps.map((s, i) => (
                <div key={i} className="text-center relative">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 mb-6 text-violet-400 font-black text-2xl">
                    {s.number}
                  </div>
                  <h3 className="font-bold text-xl mb-3">{s.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Um plano para cada momento.</h2>
            <p className="text-slate-400 text-lg">Converse com a gente e descubra o melhor formato para o seu negócio.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', desc: 'Para pequenas equipes que querem começar com IA no suporte.', features: ['Até 3 usuários', '100 chamados/mês', 'Base de conhecimento', 'Painel de aprovação'], highlight: false },
              { name: 'Pro', desc: 'Para equipes em crescimento que precisam de mais escala.', features: ['Até 10 usuários', '500 chamados/mês', 'Múltiplos documentos', 'Relatórios de satisfação'], highlight: true },
              { name: 'Enterprise', desc: 'Para empresas que precisam de customização e suporte dedicado.', features: ['Usuários ilimitados', 'Chamados ilimitados', 'SLA dedicado', 'Onboarding personalizado'], highlight: false },
            ].map((p, i) => (
              <div key={i} className={`relative p-8 rounded-2xl flex flex-col gap-6 border ${
                p.highlight ? 'bg-gradient-to-b from-violet-600/20 to-blue-600/10 border-violet-500/40 shadow-2xl shadow-violet-500/10' : 'bg-slate-900 border-white/5'
              }`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-xs font-bold">MAIS POPULAR</div>
                )}
                <div>
                  <h3 className="font-bold text-xl mb-2">{p.name}</h3>
                  <p className="text-slate-400 text-sm">{p.desc}</p>
                </div>
                <ul className="space-y-3 flex-1">
                  {p.features.map((feat, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="text-emerald-400 font-bold flex-shrink-0">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <a href="#contato" className={`w-full text-center py-3.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  p.highlight ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:opacity-90 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
                }`}>Consultar Preço</a>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm mt-10">Precisa de algo diferente? <a href="#contato" className="text-violet-400 hover:text-violet-300 underline">Fale conosco</a> e montamos um plano sob medida.</p>
        </div>
      </section>



      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Dúvidas? A gente responde.</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl bg-slate-900 border border-white/5 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold">{faq.q}</span>
                  <span className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-violet-600/20 via-blue-600/15 to-cyan-600/10 border border-violet-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-5 leading-tight">
                Seu suporte pode ser<br />
                <span className="text-violet-400">muito melhor</span> do que é hoje.
              </h2>
              <p className="text-slate-400 text-lg mb-10">
                Explore a demo sem compromisso. Veja como ficaria para a sua equipe.
              </p>
              <Link
                href="/login"
                className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-slate-900 font-bold text-lg hover:bg-slate-100 transition-all shadow-2xl hover:scale-105"
              >
                Acessar a Demo Agora
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <p className="mt-5 text-sm text-slate-500">Sem cartão · Acesso completo ao sistema de demonstração</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center font-bold text-xs">
              C
            </div>
            <span className="font-semibold text-slate-300">Celx Atendimento</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span>© 2026 Celx. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-slate-500">
            <a href="#precos" className="hover:text-white transition-colors">Planos</a>
            <a href="#contato" className="hover:text-white transition-colors">Contato</a>
            <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">Ver Demo →</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}