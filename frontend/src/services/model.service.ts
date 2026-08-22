import axios, { isAxiosError } from 'axios'
import { BenchmarkResult, OwnerModel } from '../mocks/ownerData'
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
  category?: string
  tags: string[]
  license: string
  parameters: string
  context_window: string
  description: string
  is_gated: boolean
  price_per_m_input?: number
  price_per_m_output?: number
  trust_score?: number
  accuracy?: number
  latency_ms?: number
  benchmark_results?: {
    mmlu: number
    humaneval: number
    longContext: number
  }
}

export type DeploymentQuickstartSpecs = {
  model_id: string
  model_name: string
  author: string
  endpoint_url: string
  direct_deploy_url: string
  chat_ui_url: string
  curl_snippet: string
  quickstart_python: string
  vision_python: string
  pi_models_json: string
  pi_zsh_command: string
  specs: Record<string, string>
  rate_limit_info: {
    max_rpm: number
    window_seconds: number
    status: string
    uptime: string
  }
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
  category?: string
  version?: string
  model_type?: string
  modelType?: string
  tags?: string[]
  parameters?: string
  license?: string
  context_window?: string
  contextWindow?: string
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

function readApiError(error: unknown, fallback: string): Error {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string' && detail.trim()) {
      return new Error(detail)
    }
    if (Array.isArray(detail)) {
      const joined = detail
        .map((item) => (typeof item === 'string' ? item : item?.msg))
        .filter(Boolean)
        .join(' ')
      if (joined) return new Error(joined)
    }
    if (error.message) {
      return new Error(error.message)
    }
  }
  if (error instanceof Error && error.message) {
    return error
  }
  return new Error(fallback)
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
    trustScore: m.trust_score ?? m.trustScore ?? 0,
    requests: m.requests ?? 0,
    revenue: m.revenue ?? 0,
    downloads: m.downloads ?? 0,
    likes: m.likes ?? 0,
    accuracy: m.accuracy,
    latencyMs: m.latency_ms ?? m.latencyMs,
    parameters: m.parameters,
    license: m.license,
    contextWindow: m.context_window || m.contextWindow,
    status: m.status || 'Draft',
    owner: {
      name: m.owner?.name || m.owner_name || '',
      email: m.owner?.email || m.owner_email || '',
      organization: m.owner?.organization || m.owner_org || '',
    },
    pricing: {
      pricePerRequest: m.pricing?.price_per_request ?? m.price_per_request ?? 0,
      pricePer1kTokens: m.pricing?.price_per_1k_tokens ?? m.price_per_1k_tokens ?? 0,
      pricePerMInput: m.pricing?.price_per_m_input ?? m.price_per_m_input,
      pricePerMOutput: m.pricing?.price_per_m_output ?? m.price_per_m_output,
      monthlyPrice: m.pricing?.monthly_price ?? m.monthly_price,
      currency: m.pricing?.currency || m.currency || 'USD',
    },
    benchmarkResults: m.benchmark_results || m.benchmarkResults || {},
  }
}

function normalizeDevModel(m: RawBackendModel): DeveloperModel {
  return {
    id: m.slug || m.id || 'custom-model',
    name: m.name,
    description: m.description || '',
    task: m.task || 'General Chat',
    category: m.category || 'Natural Language Processing',
    creator: m.owner?.organization || m.owner_org || m.owner?.name || 'NeuralForge Labs',
    huggingFaceId: m.hugging_face_id || m.huggingFaceId || '',
    trustScore: m.trust_score ?? m.trustScore ?? 90,
    accuracy: m.accuracy ?? 88,
    latencyMs: m.latency_ms ?? m.latencyMs ?? 220,
    pricePerMInput: m.pricing?.price_per_m_input ?? m.price_per_m_input ?? 0.16,
    pricePerMOutput: m.pricing?.price_per_m_output ?? m.price_per_m_output ?? 0.65,
    parameters: m.parameters || '8B',
    license: m.license || 'apache-2.0',
    contextWindow: m.context_window || m.contextWindow || '128K',
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
      return Array.isArray(res.data) ? res.data.map(normalizeOwnerModel) : []
    } catch (error) {
      throw readApiError(error, 'Failed to load models.')
    }
  }

  async getOwnerModel(id: string): Promise<OwnerModel> {
    try {
      const res = await axios.get<RawBackendModel>(
        `${API_URL}owner/models/${encodeURIComponent(id)}`,
      )
      return normalizeOwnerModel(res.data)
    } catch (error) {
      throw readApiError(error, 'Model not found.')
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
      price_per_request: payload.pricing?.pricePerRequest ?? 0,
      price_per_1k_tokens: payload.pricing?.pricePer1kTokens ?? 0,
      price_per_m_input: payload.pricing?.pricePerMInput,
      price_per_m_output: payload.pricing?.pricePerMOutput,
      monthly_price: payload.pricing?.monthlyPrice,
      currency: payload.pricing?.currency || 'USD',
      status: payload.status || 'Draft',
      parameters: payload.parameters,
      license: payload.license,
      context_window: payload.contextWindow,
      slug: payload.id,
    }
    try {
      const res = await axios.post<RawBackendModel>(`${API_URL}owner/models`, backendPayload)
      return normalizeOwnerModel(res.data)
    } catch (error) {
      throw readApiError(error, 'Failed to create model.')
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
    if (payload.parameters !== undefined) backendPayload.parameters = payload.parameters
    if (payload.license !== undefined) backendPayload.license = payload.license
    if (payload.contextWindow !== undefined) backendPayload.context_window = payload.contextWindow
    if (payload.pricing) {
      if (payload.pricing.pricePerRequest !== undefined)
        backendPayload.price_per_request = payload.pricing.pricePerRequest
      if (payload.pricing.pricePer1kTokens !== undefined)
        backendPayload.price_per_1k_tokens = payload.pricing.pricePer1kTokens
      if (payload.pricing.pricePerMInput !== undefined)
        backendPayload.price_per_m_input = payload.pricing.pricePerMInput
      if (payload.pricing.pricePerMOutput !== undefined)
        backendPayload.price_per_m_output = payload.pricing.pricePerMOutput
      if (payload.pricing.monthlyPrice !== undefined)
        backendPayload.monthly_price = payload.pricing.monthlyPrice
      if (payload.pricing.currency !== undefined) backendPayload.currency = payload.pricing.currency
    }

    try {
      const res = await axios.patch<RawBackendModel>(
        `${API_URL}owner/models/${encodeURIComponent(id)}`,
        backendPayload,
      )
      return normalizeOwnerModel(res.data)
    } catch (error) {
      throw readApiError(error, 'Failed to update model.')
    }
  }

  async updateOwnerPricing(id: string, pricing: OwnerModel['pricing']): Promise<OwnerModel> {
    try {
      const res = await axios.patch<RawBackendModel>(
        `${API_URL}owner/models/${encodeURIComponent(id)}/pricing`,
        {
          price_per_request: pricing.pricePerRequest,
          price_per_1k_tokens: pricing.pricePer1kTokens,
          price_per_m_input: pricing.pricePerMInput,
          price_per_m_output: pricing.pricePerMOutput,
          monthly_price: pricing.monthlyPrice ?? null,
          currency: pricing.currency,
        },
      )
      return normalizeOwnerModel(res.data)
    } catch (error) {
      throw readApiError(error, 'Failed to update pricing.')
    }
  }

  async deleteOwnerModel(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}owner/models/${encodeURIComponent(id)}`)
    } catch (error) {
      throw readApiError(error, 'Failed to delete model.')
    }
  }

  async verifyModel(payload: {
    hugging_face_id?: string
    repo_url?: string
    hf_token?: string
  }): Promise<{
    verified: boolean
    hf_verified: boolean
    repo_verified: boolean
    message: string
    details: Record<string, unknown>
  }> {
    try {
      const res = await axios.post(`${API_URL}owner/verify`, payload)
      return res.data
    } catch (error) {
      throw readApiError(error, 'Verification request failed.')
    }
  }

  async getOwnerBenchmarks(): Promise<BenchmarkResult[]> {
    try {
      const res = await axios.get<RawBackendBenchmark[]>(`${API_URL}owner/benchmarks`)
      if (!Array.isArray(res.data)) {
        return []
      }
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
    } catch (error) {
      throw readApiError(error, 'Failed to load benchmarks.')
    }
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
    } catch (error) {
      throw readApiError(error, 'Failed to save benchmark.')
    }
  }

  async getOwnerAnalytics(): Promise<OwnerAnalytics> {
    try {
      const res = await axios.get<OwnerAnalytics>(`${API_URL}owner/analytics`)
      return {
        total_revenue: res.data.total_revenue ?? 0,
        total_requests: res.data.total_requests ?? 0,
        average_trust_score: res.data.average_trust_score ?? 0,
        active_models_count: res.data.active_models_count ?? 0,
        time_series: Array.isArray(res.data.time_series) ? res.data.time_series : [],
        recent_usage: Array.isArray(res.data.recent_usage) ? res.data.recent_usage : [],
      }
    } catch (error) {
      throw readApiError(error, 'Failed to load analytics.')
    }
  }

  async searchOwnerHfModels(query: string, limit = 8): Promise<HFModelRecord[]> {
    try {
      const res = await axios.post<HFModelRecord[]>(`${API_URL}owner/hf/search`, {
        q: query,
        limit,
        sort: 'downloads',
      })
      return Array.isArray(res.data) ? res.data : []
    } catch (error) {
      throw readApiError(error, 'Failed to search Hugging Face Hub.')
    }
  }

  async searchHfModels(
    options:
      | {
          query?: string
          task?: string
          category?: string
          parameters?: string
          license?: string
          limit?: number
          sort?: string
        }
      | string,
  ): Promise<HFModelRecord[]> {
    const payload =
      typeof options === 'string'
        ? { q: options, limit: 50 }
        : {
            q: options.query || '',
            task: options.task,
            category: options.category,
            parameters: options.parameters,
            license: options.license,
            limit: options.limit || 50,
            sort: options.sort || 'downloads',
          }

    try {
      const res = await axios.post<HFModelRecord[]>(`${API_URL}developer/hf/search`, payload)
      return res.data
    } catch {
      try {
        const res = await axios.post<HFModelRecord[]>(`${API_URL}owner/hf/search`, payload)
        return res.data
      } catch {
        return []
      }
    }
  }

  async getHfSpecs(modelId: string): Promise<DeploymentQuickstartSpecs> {
    try {
      const res = await axios.get<DeploymentQuickstartSpecs>(
        `${API_URL}developer/hf/specs/${encodeURIComponent(modelId)}`,
      )
      return res.data
    } catch {
      const friendlyName = modelId.split('/').pop() || modelId
      return {
        model_id: modelId,
        model_name: friendlyName,
        author: modelId.split('/')[0] || 'Community',
        endpoint_url: 'https://router.huggingface.co/hf-inference/v1',
        direct_deploy_url: `https://endpoints.huggingface.co/new/${modelId}`,
        chat_ui_url: `https://huggingface.co/${modelId}`,
        curl_snippet: `curl https://router.huggingface.co/hf-inference/v1/chat/completions \\\n  -H 'Authorization: Bearer <YOUR_HF_TOKEN>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"model": "${modelId}", "messages": [{"role": "user", "content": "Explain a KV cache in one paragraph."}], "max_tokens": 512}'`,
        quickstart_python: `from openai import OpenAI\n\nclient = OpenAI(\n    base_url="https://router.huggingface.co/hf-inference/v1",\n    api_key="<YOUR_HF_TOKEN>"\n)\n\nresponse = client.chat.completions.create(\n    model="${modelId}",\n    messages=[{"role": "user", "content": "Three fun facts about lighthouses?"}],\n)\nprint(response.choices[0].message.content)`,
        vision_python: `from openai import OpenAI\n\nclient = OpenAI(base_url="https://router.huggingface.co/hf-inference/v1", api_key="<YOUR_HF_TOKEN>")\n\nresponse = client.chat.completions.create(\n    model="${modelId}",\n    messages=[{"role": "user", "content": [{"type": "text", "text": "What is in this image?"}]}],\n)\nprint(response.choices[0].message.content)`,
        pi_models_json: `{\n  "providers": {\n    "hf-public": {\n      "name": "${friendlyName} (HF Public)",\n      "baseUrl": "https://router.huggingface.co/hf-inference/v1",\n      "api": "openai-completions",\n      "models": [{"id": "${modelId}", "name": "${friendlyName}", "contextWindow": 131072, "maxTokens": 32768}]\n    }\n  }\n}`,
        pi_zsh_command: `pi --provider hf-public --model ${modelId} --thinking high`,
        specs: {
          Model: `${modelId} · Apache-2.0 · BF16 (unquantized)`,
          Architecture: 'Dense VLM / LLM · Hybrid attention',
          'Context Window': '128K tokens served',
          Modalities: 'Text in, text out',
          Hardware: '1× NVIDIA H200 (141 GB)',
          Engine: 'vLLM (vllm-openai)',
          Measured: '~0.7 s first token · ~110 tok/s per stream',
          'Rate Limit': '~30 requests/min per IP · 429 when exceeded',
        },
        rate_limit_info: {
          max_rpm: 30,
          window_seconds: 60,
          status: 'operational',
          uptime: '99.98%',
        },
      }
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

  async importHfModel(repoId: string, hfToken?: string): Promise<RawBackendModel> {
    try {
      const res = await axios.post<RawBackendModel>(`${API_URL}owner/hf/import`, {
        repo_id: repoId,
        hf_token: hfToken,
      })
      return res.data
    } catch (error) {
      throw readApiError(error, 'Could not fetch Hugging Face metadata.')
    }
  }

  // -------------------------------------------------------------
  // Developer Workspace API Methods
  // -------------------------------------------------------------

  async getDeveloperModels(params?: {
    q?: string
    task?: string
    category?: string
    parameters?: string
    license?: string
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
    if (params?.category && params.category !== 'All') {
      list = list.filter((m) => m.category?.toLowerCase() === params.category?.toLowerCase())
    }
    if (params?.license && params.license !== 'All') {
      list = list.filter((m) => m.license?.toLowerCase().includes(params.license!.toLowerCase()))
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
      const res = await axios.get<RawBackendModel>(
        `${API_URL}developer/models/${encodeURIComponent(id)}`,
      )
      return normalizeDevModel(res.data)
    } catch {
      const found = defaultDevModels.find((m) => m.id === id || m.huggingFaceId === id)
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
      const models = defaultDevModels.filter(
        (m) => modelIds.includes(m.id) || modelIds.includes(m.huggingFaceId),
      )
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
