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
  status: OwnerModelStatus
  owner: {
    name: string
    email: string
    organization: string
  }
  pricing: {
    pricePerRequest: number
    pricePer1kTokens: number
    monthlyPrice?: number
    currency: 'USD' | 'EUR' | 'INR'
  }
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
  { label: 'Add Model', path: '/owner/add-model', hint: 'Create a new listing' },
  { label: 'Model Profile', path: '/owner/model-profile', hint: 'Edit model details' },
  { label: 'Benchmark Results', path: '/owner/benchmarks', hint: 'Track quality metrics' },
  { label: 'Pricing', path: '/owner/pricing', hint: 'Manage monetization' },
  { label: 'Usage / Analytics', path: '/owner/analytics', hint: 'Requests, latency, revenue' },
]

const defaultOwnerModels: OwnerModel[] = [
  {
    id: 'neuron-write-1',
    name: 'Neuron Write 1',
    huggingFaceId: 'neuronlabs/neuron-write-1',
    description: 'Structured writing assistant for enterprise workflows and summarization.',
    task: 'General Chat',
    version: '1.4.2',
    modelType: 'Decoder-only Transformer',
    tags: ['writing', 'enterprise', 'safe-completion'],
    trustScore: 93,
    requests: 182000,
    revenue: 1240,
    status: 'Published',
    owner: {
      name: 'Avery Johnson',
      email: 'avery@synapse.ai',
      organization: 'Neuron Labs',
    },
    pricing: {
      pricePerRequest: 0.0009,
      pricePer1kTokens: 0.014,
      monthlyPrice: 199,
      currency: 'USD',
    },
  },
  {
    id: 'neuron-code-2',
    name: 'Neuron Code 2',
    huggingFaceId: 'neuronlabs/neuron-code-2',
    description: 'Code-focused model tuned for pull request analysis and patch drafting.',
    task: 'Coding',
    version: '2.0.0-beta',
    modelType: 'Mixture of Experts',
    tags: ['code', 'review', 'tool-calling'],
    trustScore: 89,
    requests: 64000,
    revenue: 370,
    status: 'Draft',
    owner: {
      name: 'Avery Johnson',
      email: 'avery@synapse.ai',
      organization: 'Neuron Labs',
    },
    pricing: {
      pricePerRequest: 0.0012,
      pricePer1kTokens: 0.018,
      monthlyPrice: undefined,
      currency: 'USD',
    },
  },
  {
    id: 'neuron-vision-lite',
    name: 'Neuron Vision Lite',
    huggingFaceId: 'neuronlabs/neuron-vision-lite',
    description: 'Lightweight visual reasoning model for OCR and document triage.',
    task: 'Extraction',
    version: '0.9.3',
    modelType: 'Multimodal Transformer',
    tags: ['vision', 'ocr', 'low-latency'],
    trustScore: 86,
    requests: 41000,
    revenue: 210,
    status: 'Paused',
    owner: {
      name: 'Avery Johnson',
      email: 'avery@synapse.ai',
      organization: 'Neuron Labs',
    },
    pricing: {
      pricePerRequest: 0.0008,
      pricePer1kTokens: 0.012,
      monthlyPrice: 129,
      currency: 'USD',
    },
  },
]

const defaultBenchmarks: BenchmarkResult[] = [
  {
    id: 'bm-1',
    modelId: 'neuron-write-1',
    dataset: 'Synapse Eval v2',
    testDate: '2026-08-19',
    accuracy: 90.4,
    precision: 89.1,
    recall: 88.6,
    f1Score: 88.8,
    latencyMs: 238,
    throughputRps: 42,
  },
  {
    id: 'bm-2',
    modelId: 'neuron-code-2',
    dataset: 'CodeBench Internal',
    testDate: '2026-08-20',
    accuracy: 92.2,
    precision: 90.2,
    recall: 91.8,
    f1Score: 91.0,
    latencyMs: 281,
    throughputRps: 35,
  },
]

export const usageSeries: UsagePoint[] = [
  { label: 'Mon', requests: 168000, revenue: 980 },
  { label: 'Tue', requests: 179000, revenue: 1060 },
  { label: 'Wed', requests: 187000, revenue: 1120 },
  { label: 'Thu', requests: 204000, revenue: 1240 },
  { label: 'Fri', requests: 229000, revenue: 1410 },
  { label: 'Sat', requests: 191000, revenue: 1180 },
  { label: 'Sun', requests: 176000, revenue: 1040 },
]

export const recentUsageRows: UsageRow[] = [
  {
    id: 'u1',
    app: 'Acme Helpdesk AI',
    model: 'Neuron Write 1',
    requests: 48200,
    successRate: 99.2,
    revenue: 312,
    avgLatencyMs: 226,
    timestamp: '2026-08-22 09:14 UTC',
  },
  {
    id: 'u2',
    app: 'CodeFlow Reviewer',
    model: 'Neuron Code 2',
    requests: 19140,
    successRate: 98.4,
    revenue: 164,
    avgLatencyMs: 298,
    timestamp: '2026-08-22 08:50 UTC',
  },
  {
    id: 'u3',
    app: 'DocScan Ops',
    model: 'Neuron Vision Lite',
    requests: 14270,
    successRate: 97.9,
    revenue: 91,
    avgLatencyMs: 205,
    timestamp: '2026-08-22 08:11 UTC',
  },
]

const modelsStorageKey = 'synapse_owner_models'
const benchmarkStorageKey = 'synapse_owner_benchmarks'

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback
  }
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function getOwnerModels(): OwnerModel[] {
  return safeParse<OwnerModel[]>(localStorage.getItem(modelsStorageKey), defaultOwnerModels)
}

export function saveOwnerModels(models: OwnerModel[]) {
  localStorage.setItem(modelsStorageKey, JSON.stringify(models))
}

export function addOwnerModel(model: OwnerModel) {
  const models = getOwnerModels()
  saveOwnerModels([model, ...models])
}

export function updateOwnerModel(updatedModel: OwnerModel) {
  const models = getOwnerModels().map((model) =>
    model.id === updatedModel.id ? updatedModel : model,
  )
  saveOwnerModels(models)
}

export function getOwnerBenchmarks(): BenchmarkResult[] {
  return safeParse<BenchmarkResult[]>(localStorage.getItem(benchmarkStorageKey), defaultBenchmarks)
}

export function saveOwnerBenchmarks(rows: BenchmarkResult[]) {
  localStorage.setItem(benchmarkStorageKey, JSON.stringify(rows))
}

export const ownerTaskOptions = ['General Chat', 'Coding', 'RAG', 'Support', 'Extraction']
export const ownerModelTypeOptions = [
  'Decoder-only Transformer',
  'Encoder-Decoder',
  'Multimodal Transformer',
  'Mixture of Experts',
]
