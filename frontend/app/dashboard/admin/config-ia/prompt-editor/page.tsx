'use client'

import Link from 'next/link'

export default function PromptEditorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/config-ia"
          className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-primary-600"
        >
          ←
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Prompts no Langfuse</h1>
          <p className="text-slate-500 mt-1">
            Os prompts agora são criados, editados e versionados no Langfuse.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-card-modern">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">
          <p className="text-sm text-slate-700">
            Use a label <strong>production</strong> nos prompts ativos. O backend busca essa versão em runtime,
            usa o campo <strong>Config</strong> para modelo/temperatura e vincula cada geração ao prompt no trace.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-white/80 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Agente de atendimento</p>
              <p className="mt-1 font-mono text-sm text-slate-800">ticket-ai-response</p>
            </div>
            <div className="rounded-lg border border-white/80 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chat base de conhecimento</p>
              <p className="mt-1 font-mono text-sm text-slate-800">chat-kb-response</p>
            </div>
          </div>

          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Abrir Langfuse
          </a>
        </div>
      </div>
    </div>
  )
}
