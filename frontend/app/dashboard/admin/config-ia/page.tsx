'use client'

import { useState, useEffect } from 'react'
import { apiFetch, apiPost, apiPut } from '@/lib/api'

interface Model {
  id: number
  name: string
  display_name: string
  model_type: string
  max_tokens: number | null
  embedding_dimensions: number | null
  supports_function_calling: boolean
}

interface Tool {
  id: number
  name: string
  display_name: string
  description: string
  icon: string | null
  requires_integration: boolean
  integration_type: string | null
  is_enabled: boolean
}

interface AIConfig {
  id: number
  company_id: string
  provider_id: number
  api_key_is_set: boolean
  llm_model: string
  temperature: number
  max_tokens: number
  embedding_model: string
  system_prompt: string
  tools: string[]
  autonomy_level: string
  is_active: boolean
}

interface AIConfigResponse {
  config: AIConfig
  llm_models: Model[]
  embedding_models: Model[]
  tools: Tool[]
}

const AUTONOMY_OPTIONS = [
  { value: 'low', label: 'Baixo', description: 'Todas as respostas precisam de aprovação', icon: '🔒', color: 'emerald' },
  { value: 'medium', label: 'Médio', description: 'IA responde e notifica os atendentes', icon: '⚖️', color: 'amber' },
  { value: 'high', label: 'Alto', description: 'IA responde diretamente (não recomendado)', icon: '🚀', color: 'red' },
]

export default function AdminConfigIAPage() {
  const [data, setData] = useState<AIConfigResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [apiKey, setApiKey] = useState('');
  const [llmModel, setLlmModel] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [autonomyLevel, setAutonomyLevel] = useState('low');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      setLoading(true);
      const result = await apiFetch<AIConfigResponse>('/ai-config');
      setData(result);
      
      setLlmModel(result.config.llm_model);
      setTemperature(result.config.temperature);
      setMaxTokens(result.config.max_tokens);
      setSystemPrompt(result.config.system_prompt);
      setAutonomyLevel(result.config.autonomy_level);
      setSelectedTools(result.config.tools || []);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar configuração');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiPut('/ai-config', {
        llm_model: llmModel,
        temperature: temperature,
        max_tokens: maxTokens,
        system_prompt: systemPrompt,
        autonomy_level: autonomyLevel,
        tools: selectedTools,
      });
      setSuccess('Configurações salvas com sucesso!');
      loadConfig();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveApiKey(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiPost('/ai-config/api-key', {
        api_key: apiKey,
      });
      setApiKey('');
      setSuccess('Chave API salva com sucesso!');
      loadConfig();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar chave API');
    } finally {
      setSaving(false);
    }
  }

  async function handleTestApiKey() {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiPost('/ai-config/test', {});
      setSuccess('Chave API válida! Conexão estabelecida.');
    } catch (err: any) {
      setError(err?.message || 'Chave API inválida ou erro de conexão');
    } finally {
      setSaving(false);
    }
  }

  function handleToolToggle(toolName: string) {
    if (selectedTools.includes(toolName)) {
      setSelectedTools(selectedTools.filter(t => t !== toolName));
    } else {
      setSelectedTools([...selectedTools, toolName]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" style={{ animationDelay: '0.15s' }}></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600">
        Erro ao carregar dados
      </div>
    );
  }

  const { config, llm_models, tools } = data;
  const selectedModel = llm_models.find(m => m.name === llmModel)
  const freeModels = llm_models.filter(m => m.name.includes('gemini') || m.name.includes('llama') || m.name.includes('mistral'))
  const paidModels = llm_models.filter(m => m.name.includes('gpt') || m.name.includes('claude'))
  const otherModels = llm_models.filter(model =>
    !freeModels.some(freeModel => freeModel.id === model.id) &&
    !paidModels.some(paidModel => paidModel.id === model.id)
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-primary-600">
            Configuração da IA
          </span>
        </h1>
        <p className="text-slate-500 mt-1">Configure o modelo de linguagem e ferramentas do agente</p>
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

      {/* API Key Section */}
      <div className="p-6 rounded-2xl bg-white shadow-card-modern border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-primary-500 flex items-center justify-center text-white text-xl">
            🔑
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Chave API OpenRouter</h2>
            <p className="text-sm text-slate-500">Gerencie sua chave de acesso ao provedor de IA</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
            config.api_key_is_set 
              ? 'bg-emerald-500/10 text-emerald-600' 
              : 'bg-red-500/10 text-red-600'
          }`}>
            {config.api_key_is_set ? '✓ Configurada' : '✗ Não configurada'}
          </span>
        </div>

        <form onSubmit={handleSaveApiKey} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-semibold text-slate-700">
              Chave API OpenRouter
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
            <p className="text-xs text-slate-400">
              🔒 Sua chave é criptografada e armazenada com segurança.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || !apiKey.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-medium shadow-lg hover:shadow-glow-primary transition-all disabled:opacity-50"
            >
              <span>💾</span> Salvar Chave
            </button>
            {config.api_key_is_set && (
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg hover:shadow-glow-secondary transition-all disabled:opacity-50"
              >
                <span>🧪</span> Testar Conexão
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Model Selection */}
      <div className="p-6 rounded-2xl bg-white shadow-card-modern border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl">
            🤖
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Modelo de LLM</h2>
            <p className="text-sm text-slate-500">Configure o modelo de linguagem para o agente</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* LLM Model */}
          <div className="space-y-3">
            <label htmlFor="llmModel" className="text-sm font-semibold text-slate-700">
              Modelo de Linguagem
            </label>
            <select
              id="llmModel"
              value={llmModel}
              onChange={(e) => setLlmModel(e.target.value)}
              disabled={llm_models.length === 0}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              {llm_models.length === 0 && (
                <option value="">Nenhum modelo cadastrado</option>
              )}
              <optgroup label="🎁 Gratuitos (OpenRouter)">
                {freeModels.map((model) => (
                  <option key={model.id} value={model.name}>
                    {model.display_name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="💰 Pago">
                {paidModels.map((model) => (
                  <option key={model.id} value={model.name}>
                    {model.display_name}
                  </option>
                ))}
              </optgroup>
              {otherModels.length > 0 && (
                <optgroup label="Outros">
                  {otherModels.map((model) => (
                    <option key={model.id} value={model.name}>
                      {model.display_name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            
            {/* Model Info */}
            {llmModel && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                {selectedModel?.supports_function_calling && (
                  <span className="text-emerald-600">✓ Suporta Function Calling</span>
                )}
                {selectedModel?.max_tokens && (
                  <span className="text-slate-500 block">Max: {selectedModel.max_tokens.toLocaleString()} tokens</span>
                )}
              </div>
            )}
          </div>

          {/* Temperature */}
          <div className="space-y-3">
            <label htmlFor="temperature" className="text-sm font-semibold text-slate-700">
              Temperatura: <span className="text-primary-600">{temperature}</span>
            </label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none bg-slate-200"
              style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(temperature/2)*100}%, #e2e8f0 ${(temperature/2)*100}%, #e2e8f0 100%)` }}
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>🔬 Preciso</span>
              <span>⚖️ Equilibrado</span>
              <span>🎨 Criativo</span>
            </div>
          </div>
        </div>

        {/* Max Tokens */}
        <div className="mt-6 space-y-3">
          <label htmlFor="maxTokens" className="text-sm font-semibold text-slate-700">
            Máximo de Tokens: <span className="text-primary-600">{maxTokens.toLocaleString()}</span>
          </label>
          <input
            id="maxTokens"
            type="range"
            min="256"
            max="128000"
            step="256"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none bg-slate-200"
            style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((maxTokens-256)/(128000-256))*100}%, #e2e8f0 ${((maxTokens-256)/(128000-256))*100}%, #e2e8f0 100%)` }}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>256</span>
            <span>32K</span>
            <span>128K</span>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="p-6 rounded-2xl bg-white shadow-card-modern border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl">
            🛠️
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Ferramentas do Agente</h2>
            <p className="text-sm text-slate-500">Selecione as ferramentas que o agente de IA pode usar</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {tools.map((tool) => (
            <label
              key={tool.name}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedTools.includes(tool.name)
                  ? 'border-primary-500 bg-primary-50/50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              } ${tool.requires_integration ? 'opacity-60' : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedTools.includes(tool.name)}
                onChange={() => handleToolToggle(tool.name)}
                className="mt-1 w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">{tool.display_name}</span>
                  {tool.requires_integration && (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                      Requer integração
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">{tool.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Autonomy Level */}
      <div className="p-6 rounded-2xl bg-white shadow-card-modern border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white text-xl">
            ⚙️
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Nível de Autonomia</h2>
            <p className="text-sm text-slate-500">Configure o quanto o agente pode agir autonomamente</p>
          </div>
        </div>

        <div className="space-y-3">
          {AUTONOMY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                autonomyLevel === option.value
                  ? `border-${option.color}-500 bg-${option.color}-50/50`
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              style={{
                borderColor: autonomyLevel === option.value 
                  ? option.color === 'emerald' ? '#10b981' : option.color === 'amber' ? '#f59e0b' : '#ef4444'
                  : undefined,
                backgroundColor: autonomyLevel === option.value
                  ? option.color === 'emerald' ? 'rgba(16, 185, 129, 0.05)' : option.color === 'amber' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                  : undefined
              }}
            >
              <input
                type="radio"
                name="autonomy"
                value={option.value}
                checked={autonomyLevel === option.value}
                onChange={(e) => setAutonomyLevel(e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{option.icon}</span>
                  <span className="font-semibold text-slate-800">{option.label}</span>
                </div>
                <div className="text-sm text-slate-600 mt-1">{option.description}</div>
              </div>
            </label>
          ))}
        </div>

        {autonomyLevel === 'high' && (
          <div className="mt-4 p-4 rounded-xl bg-red-50/50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <strong>Nível alto:</strong> As respostas serão enviadas diretamente aos clientes sem revisão.
              Use com cautela e apenas em ambientes controlados!
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-glow-primary hover:scale-105 transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Salvando...
            </>
          ) : (
            <>
              <span>💾</span>
              Salvar Configurações
            </>
          )}
        </button>
      </div>
    </div>
  )
}
