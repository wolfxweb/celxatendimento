'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch, apiPost, apiUpload } from '@/lib/api'

interface CategoryActive {
  id: number
  name: string
}

interface FileAttachment {
  id: string
  file: File
  preview?: string
}

interface TicketCreateResponse {
  id: string
  ticket_number: string
  status: string
}

const PRIORITIES = [
  { value: 'low', label: 'Baixa', color: 'emerald', icon: '🟢' },
  { value: 'medium', label: 'Média', color: 'amber', icon: '🟡' },
  { value: 'high', label: 'Alta', color: 'orange', icon: '🟠' },
  { value: 'critical', label: 'Crítica', color: 'red', icon: '🔴' },
]

const ALLOWED_FILE_TYPES = [
  '.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip'
]

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export default function NovoTicketPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryActive[]>([])
  const [error, setError] = useState('')

  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [priority, setPriority] = useState('medium')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const data = await apiFetch<{ categories: CategoryActive[] }>('/categories/active')
      setCategories(data.categories)
    } catch (err) {
      console.error('Erro ao carregar categorias')
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const newAttachments: FileAttachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate extension
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!ALLOWED_FILE_TYPES.includes(ext)) {
        alert(`Arquivo ${file.name}: extensão ${ext} não permitida`)
        continue
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(`Arquivo ${file.name}: excede limite de ${MAX_FILE_SIZE_MB}MB`)
        continue
      }

      newAttachments.push({
        id: Math.random().toString(36).substring(7),
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      })
    }

    setAttachments(prev => [...prev, ...newAttachments])

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function removeAttachment(id: string) {
    setAttachments(prev => {
      const att = prev.find(a => a.id === id)
      if (att?.preview) {
        URL.revokeObjectURL(att.preview)
      }
      return prev.filter(a => a.id !== id)
    })
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf': return '📄'
      case 'doc':
      case 'docx': return '📝'
      case 'xls':
      case 'xlsx': return '📊'
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️'
      case 'zip': return '📦'
      case 'txt': return '📃'
      default: return '📎'
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // First create the ticket
      const ticketData = {
        subject,
        description,
        category_id: categoryId || null,
        priority,
      }

      const result = await apiPost<TicketCreateResponse>('/tickets', ticketData)

      if (attachments.length > 0) {
        const formData = new FormData()
        attachments.forEach(att => {
          formData.append('files', att.file)
        })

        try {
          const uploadResult = await apiUpload(`/tickets/${result.id}/attachments`, formData)
          console.log('Upload success:', uploadResult)
        } catch (uploadErr: any) {
          console.error('Erro ao upload anexos:', uploadErr)
          const errorMsg = uploadErr?.message || 'Erro desconhecido'
          alert(`ATENÇÃO: Ticket criado, mas falha ao enviar anexos: ${errorMsg}`)
        }
      }

      router.push('/dashboard/cliente/tickets')
    } catch (err) {
      setError('Erro ao criar ticket. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-primary-600">
            Criar Novo Ticket
          </span>
        </h1>
        <p className="text-slate-500 mt-1">Descreva seu problema ou dúvida</p>
      </div>

      {/* Form Card */}
      <div className="p-8 rounded-2xl bg-white shadow-card-modern border border-slate-100">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-semibold text-slate-700">
              Assunto <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              placeholder="Descreva resumidamente o problema"
            />
            <span className="text-xs text-slate-400">{subject.length}/200</span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-slate-700">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={5000}
              required
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
              placeholder="Descreva detalhadamente o problema ou dúvida. Inclua informações como:\n- Quando começou o problema\n- O que você estava tentando fazer\n- Mensagens de erro (se houver)"
            />
            <span className="text-xs text-slate-400">{description.length}/5000</span>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-semibold text-slate-700">
              Categoria
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              <option value="">Selecione uma categoria (opcional)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Prioridade</label>
            <div className="grid grid-cols-4 gap-3">
              {PRIORITIES.map((p) => (
                <label
                  key={p.value}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    priority === p.value
                      ? p.color === 'emerald' ? 'border-emerald-500 bg-emerald-50' :
                        p.color === 'amber' ? 'border-amber-500 bg-amber-50' :
                        p.color === 'orange' ? 'border-orange-500 bg-orange-50' :
                        'border-red-500 bg-red-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={priority === p.value}
                    onChange={(e) => setPriority(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-2xl">{p.icon}</span>
                  <span className={`text-sm font-medium ${
                    priority === p.value
                      ? p.color === 'emerald' ? 'text-emerald-700' :
                        p.color === 'amber' ? 'text-amber-700' :
                        p.color === 'orange' ? 'text-orange-700' :
                        'text-red-700'
                      : 'text-slate-600'
                  }`}>
                    {p.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">
              Anexos <span className="text-slate-400 font-normal">(opcional)</span>
            </label>

            {/* File list */}
            {attachments.length > 0 && (
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                      {att.preview ? (
                        <img src={att.preview} alt="" className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <span className="text-xl">{getFileIcon(att.file.name)}</span>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{att.file.name}</p>
                        <p className="text-xs text-slate-400">{formatFileSize(att.file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <div
              className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-400 hover:bg-primary-50/50 transition-all cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="text-xl">📎</span>
              <span className="text-sm text-slate-500">Adicionar arquivos</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <p className="text-xs text-slate-400">
              Máx. {MAX_FILE_SIZE_MB}MB por arquivo • jpg, png, pdf, doc, docx, xls, xlsx, txt, zip
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-glow-primary hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Criando...
                </>
              ) : (
                <>
                  <span>🎫</span>
                  Criar Ticket
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
