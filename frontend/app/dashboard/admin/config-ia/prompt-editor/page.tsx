'use client'

import { useState, useEffect } from 'react'
import { apiFetch, apiPut } from '@/lib/api'

const AVAILABLE_VARIABLES = [
  { name: '{company_name}', description: 'Nome da empresa do cliente' },
  { name: '{rag_context}', description: 'Contexto da base de conhecimento (RAG)' },
  { name: '{ticket_subject}', description: 'Assunto do ticket' },
  { name: '{ticket_description}', description: 'Descrição completa do ticket' },
  { name: '{customer_name}', description: 'Nome do cliente' },
  { name: '{customer_email}', description: 'Email do cliente' },
  { name: '{ticket_priority}', description: 'Prioridade do ticket (critical/high/medium/low)' },
  { name: '{ticket_category}', description: 'Categoria do ticket' },
  { name: '{ticket_id}', description: 'ID único do ticket' },
  { name: '{ticket_number}', description: 'Número do ticket (ex: TKT-202604000001)' },
  { name: '{current_date}', description: 'Data atual' },
  { name: '{agent_name}', description: 'Nome do atendente (se atribuído)' },
]

const DEFAULT_PROMPT = `Você é um agente de atendimento ao cliente da {company_name}.

## Regras de Comunicação
1. Seja profissional e amigável --tratamento respeitoso em todas as interações
2. Seja claro e objetivo - respostas diretas, evitando rodeios
3. Use linguagem acessível - evite jargões técnicos desnecessários
4. Agradeça o contato - demonstre valorização pelo tempo do cliente

## Respondendo Tickets
1. **Entenda o problema** - Leia atentamente a descrição do ticket
2. **Identifique a categoria** - Determine se é dúvida, problema técnico, solicitação, etc.
3. **Forneça a solução** - Se souber a resposta, forneça imediatamente
4. **Se precisar de informações** - Solicite de forma clara e objetiva
5. **Defina próximos passos** - Informe o cliente sobre o que acontece a seguir

## Usando a Base de Conhecimento
Quando houver informações relevantes na base de conhecimento ({rag_context}), use-as para fundamentar sua resposta.
Cite as fontes quando usar informações da base de conhecimento.

## Quando Não Souber a Resposta
1. Não invente informações
2. Informe que vai verificar e retornará
3. Se necessário, escalone para um atendente humano

## Informações da Empresa
- Empresa: {company_name}
- Suporte: Segunda a Sexta, 9h às 18h
- Email: suporte@{company_name}.com

## Dados do Ticket Atual
- Número: {ticket_number}
- Assunto: {ticket_subject}
- Descrição: {ticket_description}
- Prioridade: {ticket_priority}
- Categoria: {ticket_category}
- Cliente: {customer_name} ({customer_email})`;

export default function PromptEditorPage() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [originalPrompt, setOriginalPrompt] = useState(DEFAULT_PROMPT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      setLoading(true)
      const data = await apiFetch<{ system_prompt: string }>('/ai-config')
      if (data.system_prompt) {
        setPrompt(data.system_prompt)
        setOriginalPrompt(data.system_prompt)
      }
    } catch (err) {
      console.error('Erro ao carregar config:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await apiPut('/ai-config', {
        system_prompt: prompt,
      })
      setOriginalPrompt(prompt)
      setSuccess('Prompt salvo com sucesso!')
    } catch (err) {
      setError('Erro ao salvar prompt')
    } finally {
      setSaving(false)
    }
  }

  function handleRestore() {
    if (confirm('Restaurar o prompt padrão? Esta ação não pode ser desfeita.')) {
      setPrompt(DEFAULT_PROMPT)
    }
  }

  function handleInsertVariable(variable: string) {
    const textarea = document.getElementById('prompt-editor') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newPrompt = prompt.substring(0, start) + variable + prompt.substring(end)
      setPrompt(newPrompt)
      
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    } else {
      setPrompt(prompt + variable)
    }
  }

  function generatePreview() {
    let previewText = prompt
      
    previewText = previewText.replace(/{company_name}/g, 'Minha Empresa Demo')
    previewText = previewText.replace(/{rag_context}/g, '[Artigo sobre política de devolução...\nArtigo sobre garantias...]')
    previewText = previewText.replace(/{ticket_subject}/g, 'Problema com meu pedido')
    previewText = previewText.replace(/{ticket_description}/g, 'Fiz um pedido há 5 dias e ainda não recebi. O rastreamento mostra "em trânsito" mas não atualiza há 2 dias.')
    previewText = previewText.replace(/{customer_name}/g, 'João Silva')
    previewText = previewText.replace(/{customer_email}/g, 'joao@email.com')
    previewText = previewText.replace(/{ticket_priority}/g, 'medium')
    previewText = previewText.replace(/{ticket_category}/g, 'Suporte - Entrega')
    previewText = previewText.replace(/{ticket_id}/g, '12345')
    previewText = previewText.replace(/{ticket_number}/g, 'TKT-202604000001')
    previewText = previewText.replace(/{current_date}/g, new Date().toLocaleDateString('pt-BR'))
    previewText = previewText.replace(/{agent_name}/g, 'Maria Atendente')
    
    setPreview(previewText)
    setShowPreview(true)
  }

  function highlightSyntax(text: string) {
    return text
      .replace(/^(## .+)$/gm, '<span class="text-violet-600 font-semibold">$1</span>')
      .replace(/(\{[^}]+\})/g, '<span class="text-primary-600 bg-primary-50 px-1 rounded">$1</span>')
      .replace(/(\*\*[^*]+\*\*)/g, '<strong>$1</strong>')
      .replace(/^([-*] .+)$/gm, '<span class="text-emerald-600">$1</span>')
      .replace(/^(\d+\. .+)$/gm, '<span class="text-emerald-600">$1</span>')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-primary-600">
              Editor de Prompt
            </span>
          </h1>
          <p className="text-slate-500 mt-1">Personalize o comportamento do agente de IA</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all"
          >
            {showPreview ? '🔧' : '👁️'} {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
          </button>
          <button
            onClick={handleRestore}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-300 text-amber-600 font-medium hover:bg-amber-50 transition-all"
          >
            🔄 Restaurar Padrão
          </button>
          <button
            onClick={handleSave}
            disabled={saving || prompt === originalPrompt}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-glow-primary transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              <>💾 Salvar Prompt</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
          {success}
        </div>
      )}

      {prompt !== originalPrompt && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          Você tem alterações não salvas
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        {/* Variables Sidebar */}
        <div className="p-5 rounded-2xl bg-white shadow-card-modern border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-lg">
              📋
            </div>
            <h3 className="font-bold text-slate-800">Variáveis</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Clique para inserir no prompt
          </p>
          <div className="space-y-2">
            {AVAILABLE_VARIABLES.map((v) => (
              <button
                key={v.name}
                onClick={() => handleInsertVariable(v.name)}
                className="block w-full text-left p-3 rounded-xl hover:bg-primary-50 border border-transparent hover:border-primary-200 transition-all"
                title={v.description}
              >
                <code className="text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded-lg block">
                  {v.name}
                </code>
                <span className="text-xs text-slate-500 mt-1 block">
                  {v.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="col-span-3 space-y-4">
          <div className="p-6 rounded-2xl bg-white shadow-card-modern border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Prompt do Sistema</h3>
              <button
                onClick={generatePreview}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                🔮 Gerar Preview Completo
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-4 mb-4 border-b border-slate-200">
              <button
                className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                  !showPreview ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                ✏️ Editar
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                  showPreview ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                👁️ Preview
              </button>
            </div>

            {showPreview ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-h-96 overflow-y-auto">
                <div
                  className="whitespace-pre-wrap text-sm"
                  dangerouslySetInnerHTML={{ __html: highlightSyntax(preview || prompt) }}
                />
              </div>
            ) : (
              <div>
                <textarea
                  id="prompt-editor"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all font-mono text-sm resize-none"
                  placeholder="Digite seu prompt aqui..."
                />
                
                <div className="flex justify-between items-center mt-3 text-sm text-slate-500">
                  <span>📝 {prompt.length} caracteres</span>
                  <span>~{Math.ceil(prompt.length / 4)} tokens (estimado)</span>
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-50/50 to-violet-50/50 border border-primary-100">
            <h4 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
              💡 Dicas para um bom prompt
            </h4>
            <ul className="text-sm text-primary-700 space-y-2">
              <li>• Use variáveis como <code className="bg-primary-100 px-2 py-0.5 rounded-lg">{'{customer_name}'}</code> para personalizar mensagens</li>
              <li>• Inclua regras claras de comunicação no início</li>
              <li>• Defina o que fazer quando não souber a resposta</li>
              <li>• Mencione a base de conhecimento com <code className="bg-primary-100 px-2 py-0.5 rounded-lg">{'{rag_context}'}</code></li>
              <li>• Teste o prompt com o botão "Ver Preview" antes de salvar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}