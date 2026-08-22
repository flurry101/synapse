export type OwnerModelStatus = 'Draft' | 'Published' | 'Paused'

export type OwnerModel = {
  id: string
  name: string
  huggingFaceId: string
  description: string
  task: string
  version: string
  modelType: string
  tags: string[]
  trustScore: number
  requests: number
  revenue: number
  downloads: number
  likes: number
  accuracy?: number
  latencyMs?: number
  parameters?: string
  license?: string
  contextWindow?: string
  status: OwnerModelStatus
  owner: {
    name: string
    email: string
    organization: string
  }
  pricing: {
    pricePerRequest: number
    pricePer1kTokens: number
    pricePerMInput?: number
    pricePerMOutput?: number
    monthlyPrice?: number
    currency: 'USD' | 'EUR' | 'INR'
  }
  benchmarkResults: Record<string, number>
}

export type BenchmarkResult = {
  id: string
  modelId: string
  dataset: string
  testDate: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  latencyMs: number
  throughputRps: number
}

export type UsagePoint = {
  label: string
  requests: number
  revenue: number
}

export type UsageRow = {
  id: string
  app: string
  model: string
  requests: number
  successRate: number
  revenue: number
  avgLatencyMs: number
  timestamp: string
}

export const ownerNavItems = [
  { label: 'Dashboard', path: '/owner', hint: 'Portfolio and revenue snapshot' },
  { label: 'My Models', path: '/owner/models', hint: 'Published and draft listings' },
  { label: 'Add Model', path: '/owner/add-model', hint: 'Create a new listing' },
  { label: 'Model Profile', path: '/owner/model-profile', hint: 'Edit model details' },
  { label: 'Benchmark Results', path: '/owner/benchmarks', hint: 'Track quality metrics' },
  { label: 'Pricing', path: '/owner/pricing', hint: 'Manage monetization' },
  { label: 'Usage / Analytics', path: '/owner/analytics', hint: 'Requests, latency, revenue' },
]

export const ownerTaskOptions = ['General Chat', 'Coding', 'RAG', 'Support', 'Extraction']
export const ownerModelTypeOptions = [
  'Decoder-only Transformer',
  'Encoder-Decoder',
  'Multimodal Transformer',
  'Mixture of Experts',
]
