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

interface Agent {
  id: string
  name: string
  description: string | null
  agent_type: string
  llm_model: string
  temperature: number
  max_tokens: number
  embedding_model: string
  tools: string[]
  autonomy_level: string
  is_active: boolean
  display_order: number
  system_prompt?: string
}

interface Prompt {
  id: string
  name: string
  prompt_type: string
  content: string
  version: number
  is_active: boolean
  is_default: boolean
  variables: string[]
}

interface AgentConfigResponse {
  agents: Agent[]
  prompts?: Prompt[]
  total: number
}

interface AIConfigResponse {
  config: {
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
  llm_models: Model[]
  embedding_models: Model[]
  tools: Tool[]
}

const AUTONOMY_OPTIONS = [
  { value: 'low', label: 'Baixo', description: 'Todas as respostas precisam de aprovação', icon: '🔒', color: 'emerald' },
  { value: 'high', label: 'Alto', description: 'IA responde diretamente (não recomendado)', icon: '🚀', color: 'red' },
]

const AGENT_TABS = [
  { id: 'customer_service', label: '🎧 Atendimento', description: 'Agente de atendimento ao cliente' },
  { id: 'knowledge_query', label: '📚 Consulta KB', description: 'Agente de consulta à base de conhecimento' },
]

export default function AdminConfigIAPage() {
  const [activeTab, setActiveTab] = useState('customer_service')
  const [agentsData, setAgentsData] = useState<AgentConfigResponse | null>(null)
  const [aiConfigData, setAiConfigData] = useState<AIConfigResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // API Key state
  const [apiKey, setApiKey] = useState('');

  // Current agent config
  const [llmModel, setLlmModel] = useState('');
  const [embeddingModel, setEmbeddingModel] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [autonomyLevel, setAutonomyLevel] = useState('low');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Current agent being edited
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (agentsData && activeTab) {
      const agent = agentsData.agents.find(a => a.agent_type === activeTab)
      if (agent) {
        setCurrentAgentId(agent.id)
        setLlmModel(agent.llm_model)
        setEmbeddingModel(agent.embedding_model)
        setTemperature(agent.temperature)
        setMaxTokens(agent.max_tokens)
        setSystemPrompt(agent.system_prompt || '')
        setAutonomyLevel(agent.autonomy_level)
        setSelectedTools(agent.tools || [])
      } else {
        setCurrentAgentId(null)
        setLlmModel('')
        setEmbeddingModel('')
        setTemperature(0.7)
        setMaxTokens(2048)
        setSystemPrompt('')
        setAutonomyLevel('low')
        setSelectedTools(['rag'])
      }
    }
  }, [activeTab, agentsData])

  async function loadAllData() {
    try {
      setLoading(true);
      const [agentsRes, aiConfigRes] = await Promise.all([
        apiFetch<AgentConfigResponse>('/agentes/config/full'),
        apiFetch<AIConfigResponse>('/ai-config').catch(() => null),
      ])
      setAgentsData(agentsRes)
      if (aiConfigRes) {
        setAiConfigData(aiConfigRes)
      }
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
      if (currentAgentId) {
        await apiPut(`/agentes/${currentAgentId}`, {
          llm_model: llmModel,
          embedding_model: embeddingModel,
          temperature: temperature,
          max_tokens: maxTokens,
          autonomy_level: autonomyLevel,
          tools: selectedTools,
        });
      } else {
        // Create new agent
        await apiPost('/agentes', {
          name: activeTab === 'customer_service' ? 'Agente de Atendimento' : 'Agente de Consulta KB',
          agent_type: activeTab,
          llm_model: llmModel || 'google/gemini-2.5-flash-lite',
          embedding_model: embeddingModel || 'text-embedding-3-small',
          temperature,
          max_tokens: maxTokens,
          tools: selectedTools,
          autonomy_level: autonomyLevel,
        });
      }
      setSuccess('Configurações salvas com sucesso!');
      loadAllData();
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
      loadAllData();
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
    // For knowledge_query, only allow rag
    if (activeTab === 'knowledge_query' && toolName !== 'rag') {
      return;
    }
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

  const llm_models = aiConfigData?.llm_models || []
  const embedding_models = aiConfigData?.embedding_models || []
  const tools = aiConfigData?.tools || []
  const apiKeyIsSet = aiConfigData?.config?.api_key_is_set || false

  const selectedModel = llm_models.find(m => m.name === llmModel)
  const selectedEmbeddingModel = embedding_models.find(m => m.name === embeddingModel)

  const freeModels = llm_models.filter(m => m.name.endsWith(':free') || m.name === 'openrouter/free' || m.display_name.includes('FREE'))
  const cheapModels = llm_models.filter(m =>
    !freeModels.some(freeModel => freeModel.id === m.id) &&
    (m.display_name.toLowerCase().includes('barato') || m.display_name.toLowerCase().includes('baixo custo') || m.name.includes('gemma') || m.name.includes('qwen') || m.name.includes('deepseek') || m.name.includes('gpt-4o-mini'))
  )
  const premiumModels = llm_models.filter(m =>
    !freeModels.some(freeModel => freeModel.id === m.id) && !cheapModels.some(cheapModel => cheapModel.id === m.id) && (m.name.includes('gpt') || m.name.includes('claude'))
  )
  const otherModels = llm_models.filter(model =>
    !freeModels.some(freeModel => freeModel.id === model.id) && !cheapModels.some(cheapModel => cheapModel.id === model.id) && !premiumModels.some(premiumModel => premiumModel.id === model.id)
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

      {/* Agent Tabs */}
      <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200">
        <div className="grid grid-cols-2 gap-2">
          {AGENT_TABS.map((tab) => {
            const agent = agentsData?.agents.find(a => a.agent_type === tab.id)
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white shadow-md text-primary-700'
                    : 'hover:bg-white/50 text-slate-600'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500 to-primary-500 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.id === 'customer_service' ? '🎧' : '📚'}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div className="text-xs text-slate-500">
                    {agent ? `✓ ${agent.name}` : 'Não configurado'}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* API Key Section - Shared */}
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
            apiKeyIsSet ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
          }`}>
            {apiKeyIsSet ? '✓ Configurada' : '✗ Não configurada'}
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
            {apiKeyIsSet && (
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

      {/* Agent Configuration - Tab specific */}
      <form onSubmit={handleSaveConfig}>
        <div className="p-6 rounded-2xl bg-white shadow-card-modern border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
              activeTab === 'customer_service' ? 'from-blue-500 to-cyan-500' : 'from-emerald-500 to-teal-500'
            } flex items-center justify-center text-white text-xl`}>
              {activeTab === 'customer_service' ? '🎧' : '📚'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {activeTab === 'customer_service' ? 'Agente de Atendimento' : 'Agente de Consulta KB'}
              </h2>
              <p className="text-sm text-slate-500">
                {activeTab === 'customer_service'
                  ? 'Configure o modelo para atendimento aos clientes'
                  : 'Configure o modelo para consulta à base de conhecimento'}
              </p>
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
                    <option key={model.id} value={model.name}>{model.display_name}</option>
                  ))}
                </optgroup>
                <optgroup label="💸 Baratos">
                  {cheapModels.map((model) => (
                    <option key={model.id} value={model.name}>{model.display_name}</option>
                  ))}
                </optgroup>
                <optgroup label="💰 Premium">
                  {premiumModels.map((model) => (
                    <option key={model.id} value={model.name}>{model.display_name}</option>
                  ))}
                </optgroup>
                {otherModels.length > 0 && (
                  <optgroup label="Outros">
                    {otherModels.map((model) => (
                      <option key={model.id} value={model.name}>{model.display_name}</option>
                    ))}
                  </optgroup>
                )}
              </select>

              {llmModel && selectedModel && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  {selectedModel.supports_function_calling && (
                    <span className="text-emerald-600">✓ Suporta Function Calling</span>
                  )}
                  {selectedModel.max_tokens && (
                    <span className="text-slate-500 block">Max: {selectedModel.max_tokens.toLocaleString()} tokens</span>
                  )}
                </div>
              )}
            </div>

            {/* Embedding Model */}
            <div className="space-y-3">
              <label htmlFor="embeddingModel" className="text-sm font-semibold text-slate-700">
                Modelo de Embedding
              </label>
              <select
                id="embeddingModel"
                value={embeddingModel}
                onChange={(e) => setEmbeddingModel(e.target.value)}
                disabled={embedding_models.length === 0}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
                {embedding_models.length === 0 && (
                  <option value="">Nenhum embedding cadastrado</option>
                )}
                {embedding_models.map((model) => (
                  <option key={model.id} value={model.name}>{model.display_name}</option>
                ))}
              </select>
              {selectedEmbeddingModel && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-500">Dimensões: {selectedEmbeddingModel.embedding_dimensions?.toLocaleString() || 'não informado'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
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

            {/* Max Tokens */}
            <div className="space-y-3">
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
        </div>

        {/* Tools Section - varies by agent type */}
        <div className="p-6 rounded-2xl bg-white shadow-card-modern border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl">
              🛠️
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Ferramentas do Agente</h2>
              <p className="text-sm text-slate-500">
                {activeTab === 'customer_service'
                  ? 'Selecione as ferramentas que o agente de IA pode usar'
                  : 'Ferramentas disponíveis para consulta à base de conhecimento'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {tools.map((tool) => {
              const isDisabled = activeTab === 'knowledge_query' && tool.name !== 'rag'
              return (
                <label
                  key={tool.name}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedTools.includes(tool.name)
                      ? 'border-primary-500 bg-primary-50/50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTools.includes(tool.name)}
                    onChange={() => handleToolToggle(tool.name)}
                    disabled={isDisabled}
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
                      {isDisabled && (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                          Não disponível
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{tool.description}</p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Autonomy Level - varies by agent type */}
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
            {AUTONOMY_OPTIONS.map((option) => {
              const isDisabled = activeTab === 'knowledge_query' && option.value === 'high'
              return (
                <label
                  key={option.value}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    autonomyLevel === option.value
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="autonomy"
                    value={option.value}
                    checked={autonomyLevel === option.value}
                    onChange={(e) => !isDisabled && setAutonomyLevel(e.target.value)}
                    disabled={isDisabled}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{option.icon}</span>
                      <span className="font-semibold text-slate-800">{option.label}</span>
                      {isDisabled && (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                          Não recomendado
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{option.description}</div>
                  </div>
                </label>
              )
            })}
          </div>

          {autonomyLevel === 'high' && activeTab === 'customer_service' && (
            <div className="mt-4 p-4 rounded-xl bg-red-50/50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <strong>Nível alto:</strong> As respostas serão enviadas diretamente aos clientes sem revisão.
                Use com cautela e apenas em ambientes controlados!
              </div>
            </div>
          )}
        </div>

        {/* System Prompt */}
        <div className="p-6 rounded-2xl bg-white shadow-card-modern border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xl">
              📝
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Prompts no Langfuse</h2>
              <p className="text-sm text-slate-500">Criação, edição e versionamento são feitos no Langfuse</p>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <p className="text-sm text-slate-700">
              Use os prompts <strong>ticket-ai-response</strong> e <strong>chat-kb-response</strong> no Langfuse com a label <strong>production</strong>.
              O modelo, temperatura e demais parâmetros devem ficar no campo <strong>Config</strong> do prompt.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-white/80 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Agente de atendimento</p>
                <p className="mt-1 font-mono text-sm text-slate-800">ticket-ai-response</p>
              </div>
              <div className="rounded-lg border border-white/80 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chat base de conhecimento</p>
                <p className="mt-1 font-mono text-sm text-slate-800">chat-kb-response</p>
              </div>
            </div>

            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Abrir Langfuse
            </a>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
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
      </form>
    </div>
  )
}
