'use client'

import { useState, useEffect } from 'react'
import { apiFetch, apiPost, apiPut, apiDelete } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface Article {
  id: number
  title: string
  content: string
  source_type: string
  source_url: string | null
  original_filename: string | null
  is_active: boolean
  is_indexed: boolean
  index_error: string | null
  last_indexed_at: string | null
  created_at: string
  updated_at: string
}

const SOURCE_TYPE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  pdf: { bg: 'bg-red-500/10', text: 'text-red-600', icon: '📄' },
  url: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: '🔗' },
  text: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: '📝' },
}

export default function AdminKnowledgePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadArticles()
  }, [])

  async function loadArticles() {
    try {
      setLoading(true)
      const data = await apiFetch<Article[]>('/knowledge')
      setArticles(data)
    } catch (err) {
      setError('Erro ao carregar artigos')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const articleData = { title, content }
      
      if (editingArticle) {
        await apiPut(`/knowledge/${editingArticle.id}`, articleData)
      } else {
        await apiPost('/knowledge', articleData)
      }
      
      setShowModal(false)
      setTitle('')
      setContent('')
      setEditingArticle(null)
      loadArticles()
    } catch (err) {
      setError('Erro ao salvar artigo')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(articleId: number) {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return

    try {
      await apiDelete(`/knowledge/${articleId}`)
      loadArticles()
    } catch (err) {
      alert('Erro ao excluir artigo')
    }
  }

  async function handleToggleActive(article: Article) {
    try {
      await apiPut(`/knowledge/${article.id}`, {
        is_active: !article.is_active,
      })
      loadArticles()
    } catch (err) {
      alert('Erro ao atualizar artigo')
    }
  }

  function openNewModal() {
    setEditingArticle(null)
    setTitle('')
    setContent('')
    setShowModal(true)
  }

  function openEditModal(article: Article) {
    setEditingArticle(article)
    setTitle(article.title)
    setContent(article.content)
    setShowModal(true)
  }

  const stats = {
    total: articles.length,
    indexed: articles.filter(a => a.is_indexed).length,
    pending: articles.filter(a => !a.is_indexed && !a.index_error).length,
    failed: articles.filter(a => a.index_error).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-primary-600">
              Base de Conhecimento
            </span>
          </h1>
          <p className="text-slate-500 mt-1">Gerencie artigos para o sistema RAG</p>
        </div>
        
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-glow-primary hover:scale-105 transition-all"
        >
          <span className="text-lg">+</span>
          Novo Artigo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white shadow-card-modern border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl">
              📚
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-slate-500">Total de Artigos</div>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white shadow-card-modern border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl">
              ✓
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{stats.indexed}</div>
              <div className="text-sm text-slate-500">Indexados</div>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white shadow-card-modern border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl">
              ⏳
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
              <div className="text-sm text-slate-500">Pendentes</div>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white shadow-card-modern border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-xl">
              ✗
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-slate-500">Com Erro</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-card-modern border border-slate-100">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-slate-700">Nenhum artigo cadastrado</h3>
          <p className="text-slate-500 mt-2">Clique em "Novo Artigo" para começar</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card-modern border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Título</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Atualizado</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.map((article) => {
                const sourceStyle = SOURCE_TYPE_STYLES[article.source_type] || SOURCE_TYPE_STYLES.text
                
                return (
                  <tr key={article.id} className="group hover:bg-gradient-to-r hover:from-primary-50/30 hover:to-violet-50/30 transition-all duration-300">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{article.title}</div>
                      <div className="text-sm text-slate-500 truncate max-w-md mt-1">
                        {article.content.substring(0, 80)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${sourceStyle.bg} ${sourceStyle.text}`}>
                        <span>{sourceStyle.icon}</span>
                        {article.source_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {article.is_indexed ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Indexado
                          </span>
                        ) : article.index_error ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-600" title={article.index_error}>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Erro
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-amber-500/10 text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Pendente
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">
                        {formatDate(article.updated_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(article)}
                          className="px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-600 hover:bg-primary-500/20 text-sm font-medium transition-colors"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleToggleActive(article)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            article.is_active 
                              ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' 
                              : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                          }`}
                        >
                          {article.is_active ? '⏸ Desativar' : '▶ Ativar'}
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 text-sm font-medium transition-colors"
                        >
                          🗑️ Excluir
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
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl bg-white shadow-2xl border border-slate-200">
            <button
              onClick={() => { setShowModal(false); setEditingArticle(null) }}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              {editingArticle ? '✏️ Editar Artigo' : '➕ Novo Artigo'}
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-semibold text-slate-700">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="Título do artigo"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-semibold text-slate-700">
                  Conteúdo <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={12}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all font-mono text-sm resize-none"
                  placeholder="Digite o conteúdo do artigo para a base de conhecimento..."
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
                  onClick={() => { setShowModal(false); setEditingArticle(null) }}
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