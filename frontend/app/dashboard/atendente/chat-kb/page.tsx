'use client'

import { useState, useEffect, useRef } from 'react'
import { apiFetch, apiPost } from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{
    id: number
    title: string
    score: number
    source_type: string
  }>
  confidence?: string
}

interface Agent {
  id: string
  name: string
  description: string
  agent_type: string
  is_active?: boolean
}

export default function ChatKBPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [conversationId] = useState(() => `conv-${Date.now()}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadAgents()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadAgents() {
    try {
      const data = await apiFetch<{ agents: Agent[] }>('/agentes')
      const kbAgents = data.agents.filter(
        (a: Agent) => a.agent_type === 'knowledge_query' && a.is_active
      )
      setAgents(kbAgents)
      if (kbAgents.length > 0 && !selectedAgentId) {
        setSelectedAgentId(kbAgents[0].id)
      }
    } catch (err: any) {
      setError('Erro ao carregar agentes')
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!inputValue.trim() || loading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}-1`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)
    setError('')

    try {
      const response = await apiPost<{
        success: boolean
        response: string
        confidence: string
        sources: Array<{
          id: number
          title: string
          score: number
          source_type: string
        }>
        error?: string
      }>('/agentes/chat-kb', {
        query: userMessage.content,
        agent_id: selectedAgentId,
        include_sources: true,
      })

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-2`,
        role: 'assistant',
        content: response.response || 'Desculpe, não consegui processar sua pergunta.',
        timestamp: new Date(),
        sources: response.sources || [],
        confidence: response.confidence || 'medium',
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      setError(err?.message || 'Erro ao processar resposta')
      setMessages(prev => prev.filter(m => m.id !== userMessage.id))
    } finally {
      setLoading(false)
    }
  }

  function formatTime(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  function getConfidenceColor(confidence?: string) {
    switch (confidence) {
      case 'high':
        return 'text-emerald-600 bg-emerald-50'
      case 'medium':
        return 'text-amber-600 bg-amber-50'
      case 'low':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-slate-600 bg-slate-50'
    }
  }

  function getConfidenceLabel(confidence?: string) {
    switch (confidence) {
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Média'
      case 'low':
        return 'Baixa'
      default:
        return 'N/A'
    }
  }

  function clearChat() {
    setMessages([])
  }

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
              Chat Base de Conhecimento
            </span>
          </h1>
          <p className="text-slate-500 text-sm">
            Tire suas dúvidas usando a base de conhecimento da empresa
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Agent Selector */}
          {agents.length > 1 && (
            <select
              value={selectedAgentId || ''}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all text-sm flex items-center gap-2"
            >
              <span>🗑️</span> Limpar
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50/50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Chat Messages - Full Width */}
      <div className="flex-1 overflow-hidden rounded-2xl bg-white shadow-card-modern border border-slate-100">
        <div className="h-full overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto h-full flex flex-col">
            {messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg">
                    📚
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">
                    Bem-vindo ao Chat de Conhecimento
                  </h3>
                  <p className="text-slate-500">
                    Digite sua pergunta para buscar informações na base de conhecimento.
                    A IA responderá com base nos artigos cadastrados.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6 flex-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl p-5 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-violet-500 to-primary-500 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {/* Message content */}
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>

                    {/* Timestamp and confidence */}
                    <div className={`flex items-center gap-3 mt-3 text-xs ${
                      message.role === 'user' ? 'text-white/70' : 'text-slate-400'
                    }`}>
                      <span>{formatTime(message.timestamp)}</span>
                      {message.role === 'assistant' && message.confidence && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(message.confidence)}`}>
                          Confiança: {getConfidenceLabel(message.confidence)}
                        </span>
                      )}
                    </div>

                    {/* Sources */}
                    {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 mb-3">📖 Fontes consultadas:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {message.sources.map((source, index) => (
                            <div key={source.id || index} className="flex items-center gap-2 p-2 bg-white/50 rounded-lg text-xs">
                              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-medium shrink-0">
                                {index + 1}
                              </span>
                              <span className="truncate flex-1 text-slate-700">{source.title}</span>
                              <span className="text-slate-400 shrink-0">
                                {typeof source.score === 'number' ? `${source.score.toFixed(1)}` : 'N/A'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-slate-500">Consultando base de conhecimento...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="mt-4">
        <div className="max-w-5xl mx-auto flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite sua pergunta sobre a base de conhecimento..."
            disabled={loading}
            className="flex-1 px-5 py-4 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all disabled:opacity-50 text-base"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-glow-secondary transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Enviando...
              </>
            ) : (
              <>
                <span>📤</span>
                Enviar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}