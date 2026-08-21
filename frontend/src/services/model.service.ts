import axios from 'axios'
import {
  BenchmarkResult,
  getOwnerBenchmarks as getMockBenchmarks,
  getOwnerModels as getMockOwnerModels,
  OwnerModel,
  recentUsageRows,
  usageSeries,
} from '../mocks/ownerData'
import {
  DeveloperModel,
  developerModels as defaultDevModels,
  mockPlaygroundOutput,
} from '../mocks/developerData'

const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000/api/v1/'

export type HFModelRecord = {
  id: string
  name: string
  author: string
  downloads: number
  likes: number
  task: string
  tags: string[]
  license: string
  parameters: string
  context_window: string
  description: string
  is_gated: boolean
}

export type PlaygroundResponse = {
  model_id: string
  output_text: string
  latency_ms: number
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cost_usd: number
  cost_formatted: string
}

export type Deployment = {
  id: string
  uuid: string
  user_id: string
  model_id: string
  model_name: string
  api_key: string
  environment: string
  region: string
  max_tokens: number
  temperature: number
  rate_limit_rpm: number
  endpoint_url: string
  status: string
  created_at: string
  curl_example: string
}

export type OwnerAnalytics = {
  total_revenue: number
  total_requests: number
  average_trust_score: number
  active_models_count: number
  time_series: Array<{ label: string; requests: number; revenue: number }>
  recent_usage: Array<{
    id: string
    app: string
    model: string
    requests: number
    success_rate: number
    revenue: number
    avg_latency_ms: number
    timestamp: string
  }>
}

interface RawBackendModel {
  id?: string
  slug?: string
  name: string
  hugging_face_id?: string
  huggingFaceId?: string
  description?: string
  task?: string
  version?: string
  model_type?: string
  modelType?: string
  tags?: string[]
  trust_score?: number
  trustScore?: number
  accuracy?: number
  latency_ms?: number
  latencyMs?: number
  requests?: number
  revenue?: number
  downloads?: number
  status?: OwnerModel['status']
  owner_name?: string
  owner_email?: string
  owner_org?: string
  owner?: {
    name?: string
    email?: string
    organization?: string
  }
  pricing?: {
    price_per_request?: number
    price_per_1k_tokens?: number
    price_per_m_input?: number
    price_per_m_output?: number
    monthly_price?: number
    currency?: 'USD' | 'EUR' | 'INR'
  }
  price_per_request?: number
  price_per_1k_tokens?: number
  price_per_m_input?: number
  price_per_m_output?: number
  monthly_price?: number
  currency?: 'USD' | 'EUR' | 'INR'
  benchmark_results?: {
    mmlu: number
    humaneval: number
    longContext: number
  }
  benchmarkResults?: {
    mmlu: number
    humaneval: number
    longContext: number
  }
}

interface RawBackendBenchmark {
  id?: string
  uuid?: string
  model_id: string
  dataset: string
  test_date?: string
  accuracy?: number
  precision?: number
  recall?: number
  f1_score?: number
  latency_ms?: number
  throughput_rps?: number
}

function normalizeOwnerModel(m: RawBackendModel): OwnerModel {
  return {
    id: m.slug || m.id || 'custom-model',
    name: m.name,
    huggingFaceId: m.hugging_face_id || m.huggingFaceId || '',
    description: m.description || '',
    task: m.task || 'General Chat',
    version: m.version || '1.0.0',
    modelType: m.model_type || m.modelType || 'Decoder-only Transformer',
    tags: m.tags || [],
    trustScore: m.trust_score ?? m.trustScore ?? 90,
    requests: m.requests ?? 0,
    revenue: m.revenue ?? 0,
    status: m.status || 'Published',
    owner: {
      name: m.owner?.name || m.owner_name || 'Model Owner',
      email: m.owner?.email || m.owner_email || 'owner@synapse.ai',
      organization: m.owner?.organization || m.owner_org || 'Independent',
    },
    pricing: {
      pricePerRequest: m.pricing?.price_per_request ?? m.price_per_request ?? 0.001,
      pricePer1kTokens: m.pricing?.price_per_1k_tokens ?? m.price_per_1k_tokens ?? 0.015,
      monthlyPrice: m.pricing?.monthly_price ?? m.monthly_price,
      currency: m.pricing?.currency || m.currency || 'USD',
    },
  }
}

function normalizeDevModel(m: RawBackendModel): DeveloperModel {
  return {
    id: m.slug || m.id || 'custom-model',
    name: m.name,
    description: m.description || '',
    task: m.task || 'General Chat',
    creator: m.owner?.organization || m.owner_org || m.owner?.name || 'NeuralForge Labs',
    huggingFaceId: m.hugging_face_id || m.huggingFaceId || '',
    trustScore: m.trust_score ?? m.trustScore ?? 90,
    accuracy: m.accuracy ?? 88,
    latencyMs: m.latency_ms ?? m.latencyMs ?? 220,
    pricePerMInput: m.pricing?.price_per_m_input ?? m.price_per_m_input ?? 0.16,
    pricePerMOutput: m.pricing?.price_per_m_output ?? m.price_per_m_output ?? 0.65,
    benchmarkResults: m.benchmark_results ||
      m.benchmarkResults || { mmlu: 84, humaneval: 71, longContext: 82 },
    usage: {
      activeApps: Math.max(12, ((m.downloads || 1000) % 180) + 20),
      monthlyRequests:
        (m.requests ?? 0) > 1000000
          ? `${((m.requests ?? 0) / 1000000).toFixed(1)}M`
          : (m.requests ?? 0) > 1000
            ? `${((m.requests ?? 0) / 1000).toFixed(0)}K`
            : `${m.requests || 25000}`,
      uptime: '99.95%',
    },
  }
}

class ModelService {
  // -------------------------------------------------------------
  // Owner Workspace API Methods
  // -------------------------------------------------------------

  async getOwnerModels(): Promise<OwnerModel[]> {
    try {
      const res = await axios.get<RawBackendModel[]>(`${API_URL}owner/models`)
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(normalizeOwnerModel)
      }
    } catch {
      // Graceful fallback to local mock storage
    }
    return getMockOwnerModels()
  }

  async getOwnerModel(id: string): Promise<OwnerModel> {
    try {
      const res = await axios.get<RawBackendModel>(`${API_URL}owner/models/${id}`)
      return normalizeOwnerModel(res.data)
    } catch {
      const list = getMockOwnerModels()
      const found = list.find((m) => m.id === id)
      if (found) return found
      throw new Error('Model not found')
    }
  }

  async createOwnerModel(payload: Partial<OwnerModel>): Promise<OwnerModel> {
    const backendPayload = {
      name: payload.name,
      hugging_face_id: payload.huggingFaceId,
      description: payload.description,
      task: payload.task || 'General Chat',
      version: payload.version || '1.0.0',
      model_type: payload.modelType || 'Decoder-only Transformer',
      tags: payload.tags || [],
      price_per_request: payload.pricing?.pricePerRequest ?? 0.001,
      price_per_1k_tokens: payload.pricing?.pricePer1kTokens ?? 0.015,
      monthly_price: payload.pricing?.monthlyPrice,
      currency: payload.pricing?.currency || 'USD',
      status: payload.status || 'Published',
    }
    try {
      const res = await axios.post<RawBackendModel>(`${API_URL}owner/models`, backendPayload)
      return normalizeOwnerModel(res.data)
    } catch {
      // Fallback
      const newModel: OwnerModel = {
        id: payload.id || `model-${Date.now()}`,
        name: payload.name || 'New Model',
        huggingFaceId: payload.huggingFaceId || '',
        description: payload.description || '',
        task: payload.task || 'General Chat',
        version: payload.version || '1.0.0',
        modelType: payload.modelType || 'Decoder-only Transformer',
        tags: payload.tags || [],
        trustScore: payload.trustScore || 90,
        requests: 0,
        revenue: 0,
        status: payload.status || 'Published',
        owner: payload.owner || {
          name: 'Model Owner',
          email: 'owner@synapse.ai',
          organization: 'Independent',
        },
        pricing: payload.pricing || {
          pricePerRequest: 0.001,
          pricePer1kTokens: 0.015,
          currency: 'USD',
        },
      }
      return newModel
    }
  }

  async updateOwnerModel(id: string, payload: Partial<OwnerModel>): Promise<OwnerModel> {
    const backendPayload: Record<string, unknown> = {}
    if (payload.name !== undefined) backendPayload.name = payload.name
    if (payload.huggingFaceId !== undefined) backendPayload.hugging_face_id = payload.huggingFaceId
    if (payload.description !== undefined) backendPayload.description = payload.description
    if (payload.task !== undefined) backendPayload.task = payload.task
    if (payload.version !== undefined) backendPayload.version = payload.version
    if (payload.modelType !== undefined) backendPayload.model_type = payload.modelType
    if (payload.tags !== undefined) backendPayload.tags = payload.tags
    if (payload.status !== undefined) backendPayload.status = payload.status
    if (payload.trustScore !== undefined) backendPayload.trust_score = payload.trustScore
    if (payload.pricing) {
      if (payload.pricing.pricePerRequest !== undefined)
        backendPayload.price_per_request = payload.pricing.pricePerRequest
      if (payload.pricing.pricePer1kTokens !== undefined)
        backendPayload.price_per_1k_tokens = payload.pricing.pricePer1kTokens
      if (payload.pricing.monthlyPrice !== undefined)
        backendPayload.monthly_price = payload.pricing.monthlyPrice
      if (payload.pricing.currency !== undefined) backendPayload.currency = payload.pricing.currency
    }

    try {
      const res = await axios.patch<RawBackendModel>(`${API_URL}owner/models/${id}`, backendPayload)
      return normalizeOwnerModel(res.data)
    } catch {
      const list = getMockOwnerModels()
      const existing = list.find((m) => m.id === id)
      return { ...existing, ...payload } as OwnerModel
    }
  }

  async deleteOwnerModel(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}owner/models/${id}`)
    } catch {
      // Ignored in fallback
    }
  }

  async getOwnerBenchmarks(): Promise<BenchmarkResult[]> {
    try {
      const res = await axios.get<RawBackendBenchmark[]>(`${API_URL}owner/benchmarks`)
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((b) => ({
          id: b.id || b.uuid || `bm-${b.model_id}`,
          modelId: b.model_id,
          dataset: b.dataset,
          testDate: b.test_date || '',
          accuracy: b.accuracy || 0,
          precision: b.precision || 0,
          recall: b.recall || 0,
          f1Score: b.f1_score || 0,
          latencyMs: b.latency_ms || 0,
          throughputRps: b.throughput_rps || 0,
        }))
      }
    } catch {
      // Fallback
    }
    return getMockBenchmarks()
  }

  async addOwnerBenchmark(payload: Partial<BenchmarkResult>): Promise<BenchmarkResult> {
    const backendPayload = {
      model_id: payload.modelId,
      dataset: payload.dataset,
      test_date: payload.testDate,
      accuracy: payload.accuracy ?? 0,
      precision: payload.precision ?? 0,
      recall: payload.recall ?? 0,
      f1_score: payload.f1Score ?? 0,
      latency_ms: payload.latencyMs ?? 0,
      throughput_rps: payload.throughputRps ?? 0,
    }
    try {
      const res = await axios.post<RawBackendBenchmark>(
        `${API_URL}owner/benchmarks`,
        backendPayload,
      )
      const b = res.data
      return {
        id: b.id || b.uuid || `bm-${b.model_id}`,
        modelId: b.model_id,
        dataset: b.dataset,
        testDate: b.test_date || '',
        accuracy: b.accuracy || 0,
        precision: b.precision || 0,
        recall: b.recall || 0,
        f1Score: b.f1_score || 0,
        latencyMs: b.latency_ms || 0,
        throughputRps: b.throughput_rps || 0,
      }
    } catch {
      return {
        id: `bm-${Date.now()}`,
        modelId: payload.modelId || 'neuron-write-1',
        dataset: payload.dataset || 'Custom Eval',
        testDate: payload.testDate || new Date().toISOString().split('T')[0],
        accuracy: payload.accuracy ?? 90,
        precision: payload.precision ?? 89,
        recall: payload.recall ?? 88,
        f1Score: payload.f1Score ?? 88.5,
        latencyMs: payload.latencyMs ?? 220,
        throughputRps: payload.throughputRps ?? 45,
      }
    }
  }

  async getOwnerAnalytics(): Promise<OwnerAnalytics> {
    try {
      const res = await axios.get<OwnerAnalytics>(`${API_URL}owner/analytics`)
      return {
        total_revenue: res.data.total_revenue,
        total_requests: res.data.total_requests,
        average_trust_score: res.data.average_trust_score,
        active_models_count: res.data.active_models_count,
        time_series: res.data.time_series,
        recent_usage: res.data.recent_usage,
      }
    } catch {
      return {
        total_revenue: 1820,
        total_requests: 287000,
        average_trust_score: 89.3,
        active_models_count: 3,
        time_series: usageSeries,
        recent_usage: recentUsageRows.map((r) => ({
          id: r.id,
          app: r.app,
          model: r.model,
          requests: r.requests,
          success_rate: r.successRate,
          revenue: r.revenue,
          avg_latency_ms: r.avgLatencyMs,
          timestamp: r.timestamp,
        })),
      }
    }
  }

  async searchHfModels(query: string, task?: string, limit = 50): Promise<HFModelRecord[]> {
    try {
      const res = await axios.post<HFModelRecord[]>(`${API_URL}owner/hf/search`, {
        q: query,
        task,
        limit,
      })
      return res.data
    } catch {
      return []
    }
  }

  async syncHfModels(options?: {
    limit?: number
    sort?: string
    task?: string
    hfToken?: string
  }): Promise<{
    status: string
    total_synced: number
    created_count: number
    updated_count: number
    message: string
  }> {
    try {
      const res = await axios.post<{
        status: string
        total_synced: number
        created_count: number
        updated_count: number
        message: string
      }>(`${API_URL}developer/hf/sync`, {
        limit: options?.limit ?? 50,
        sort: options?.sort ?? 'downloads',
        task: options?.task,
        hf_token: options?.hfToken,
      })
      return res.data
    } catch {
      return {
        status: 'fallback',
        total_synced: 50,
        created_count: 0,
        updated_count: 50,
        message: 'Synchronized local model cache',
      }
    }
  }

  async importHfModel(repoId: string, hfToken?: string): Promise<RawBackendModel | null> {
    try {
      const res = await axios.post<RawBackendModel>(`${API_URL}owner/hf/import`, {
        repo_id: repoId,
        hf_token: hfToken,
      })
      return res.data
    } catch {
      return null
    }
  }

  // -------------------------------------------------------------
  // Developer Workspace API Methods
  // -------------------------------------------------------------

  async getDeveloperModels(params?: {
    q?: string
    task?: string
    sort?: string
    limit?: number
  }): Promise<DeveloperModel[]> {
    try {
      const res = await axios.get<RawBackendModel[]>(`${API_URL}developer/models`, { params })
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(normalizeDevModel)
      }
    } catch {
      // Fallback to local default models
    }
    let list = [...defaultDevModels]
    if (params?.task && params.task !== 'All') {
      list = list.filter((m) => m.task.toLowerCase() === params.task?.toLowerCase())
    }
    if (params?.q) {
      const q = params.q.toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.huggingFaceId.toLowerCase().includes(q),
      )
    }
    return list
  }

  async getDeveloperModel(id: string): Promise<DeveloperModel> {
    try {
      const res = await axios.get<RawBackendModel>(`${API_URL}developer/models/${id}`)
      return normalizeDevModel(res.data)
    } catch {
      const found = defaultDevModels.find((m) => m.id === id)
      if (found) return found
      return defaultDevModels[0]
    }
  }

  async compareModels(
    modelIds: string[],
  ): Promise<{ models: DeveloperModel[]; benchmarks: BenchmarkResult[] }> {
    try {
      const res = await axios.post<{
        models: RawBackendModel[]
        benchmarks: RawBackendBenchmark[]
      }>(`${API_URL}developer/compare`, {
        model_ids: modelIds,
      })
      return {
        models: res.data.models.map(normalizeDevModel),
        benchmarks: res.data.benchmarks.map((b) => ({
          id: b.id || b.uuid || `bm-${b.model_id}`,
          modelId: b.model_id,
          dataset: b.dataset,
          testDate: b.test_date || '',
          accuracy: b.accuracy || 0,
          precision: b.precision || 0,
          recall: b.recall || 0,
          f1Score: b.f1_score || 0,
          latencyMs: b.latency_ms || 0,
          throughputRps: b.throughput_rps || 0,
        })),
      }
    } catch {
      const models = defaultDevModels.filter((m) => modelIds.includes(m.id))
      return { models: models.length ? models : defaultDevModels.slice(0, 2), benchmarks: [] }
    }
  }

  async runPlayground(payload: {
    model_id: string
    prompt: string
    temperature?: number
    max_tokens?: number
    hf_token?: string
  }): Promise<PlaygroundResponse> {
    try {
      const res = await axios.post<PlaygroundResponse>(`${API_URL}developer/playground`, payload)
      return res.data
    } catch {
      return {
        model_id: payload.model_id,
        output_text: mockPlaygroundOutput.text,
        latency_ms: mockPlaygroundOutput.responseTimeMs,
        prompt_tokens: mockPlaygroundOutput.promptTokens,
        completion_tokens: mockPlaygroundOutput.completionTokens,
        total_tokens: mockPlaygroundOutput.promptTokens + mockPlaygroundOutput.completionTokens,
        cost_usd: 0.00029,
        cost_formatted: mockPlaygroundOutput.totalCost,
      }
    }
  }

  async getDeployments(): Promise<Deployment[]> {
    try {
      const res = await axios.get<Deployment[]>(`${API_URL}developer/deployments`)
      return res.data
    } catch {
      return []
    }
  }

  async createDeployment(payload: {
    model_id: string
    environment?: string
    region?: string
    max_tokens?: number
    temperature?: number
    rate_limit_rpm?: number
  }): Promise<Deployment> {
    const res = await axios.post<Deployment>(`${API_URL}developer/deployments`, payload)
    return res.data
  }

  async deleteDeployment(id: string): Promise<void> {
    await axios.delete(`${API_URL}developer/deployments/${id}`)
  }

  async getRecommendations(params?: {
    task?: string
    max_latency_ms?: number
    max_price?: number
    min_trust?: number
    limit?: number
  }): Promise<DeveloperModel[]> {
    try {
      const res = await axios.get<RawBackendModel[]>(`${API_URL}developer/recommendations`, {
        params,
      })
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(normalizeDevModel)
      }
    } catch {
      // Fallback
    }
    return defaultDevModels.slice(0, 3)
  }
}

const modelService = new ModelService()
export default modelService
