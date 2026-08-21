export type RoleType = 'developer' | 'owner'

export type NavItem = {
  label: string
  path: string
  hint: string
}

export type ModelCard = {
  id: string
  name: string
  provider: string
  category: string
  contextWindow: string
  latencyMs: number
  benchmarkScore: number
  pricePerMInput: number
  pricePerMOutput: number
  description: string
  tags: string[]
}

export const developerNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/developer', hint: 'Overview and goals' },
  { label: 'Use Case Search', path: '/developer/search', hint: 'Describe what you need' },
  { label: 'Recommendations', path: '/developer/recommendations', hint: 'Best fit models' },
  { label: 'Compare Models', path: '/developer/compare', hint: 'Side-by-side metrics' },
  {
    label: 'Model Details',
    path: '/developer/details/gpt-4o-mini',
    hint: 'Capabilities and limits',
  },
  { label: 'Playground', path: '/developer/playground', hint: 'Try prompts in browser' },
  { label: 'Deploy', path: '/developer/deploy', hint: 'Mock deployment flow' },
]

export const ownerNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/owner', hint: 'Revenue and quality snapshot' },
  { label: 'My Models', path: '/owner/models', hint: 'Catalog and status' },
  { label: 'Add Model', path: '/owner/add-model', hint: 'Onboard a new model' },
  { label: 'Model Profile', path: '/owner/model-profile', hint: 'Edit metadata' },
  { label: 'Benchmarks', path: '/owner/benchmarks', hint: 'Test and quality trends' },
  { label: 'Pricing', path: '/owner/pricing', hint: 'Plans and discounts' },
  { label: 'Usage Analytics', path: '/owner/analytics', hint: 'Traffic and consumers' },
]

export const mockModels: ModelCard[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    category: 'General + Tool Use',
    contextWindow: '128K',
    latencyMs: 290,
    benchmarkScore: 91,
    pricePerMInput: 0.15,
    pricePerMOutput: 0.6,
    description: 'Balanced model for assistants, extraction workflows, and coding copilots.',
    tags: ['reasoning', 'tool-calls', 'stable'],
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    category: 'Fast Reasoning',
    contextWindow: '200K',
    latencyMs: 240,
    benchmarkScore: 88,
    pricePerMInput: 0.2,
    pricePerMOutput: 1.0,
    description: 'Fast-turnaround model that performs well on concise reasoning tasks.',
    tags: ['low-latency', 'summaries', 'chat'],
  },
  {
    id: 'gemini-1-5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    category: 'High Throughput',
    contextWindow: '1M',
    latencyMs: 200,
    benchmarkScore: 86,
    pricePerMInput: 0.12,
    pricePerMOutput: 0.45,
    description: 'Good for large-context tasks, retrieval-heavy pipelines, and analytics.',
    tags: ['large-context', 'batch', 'multimodal-ready'],
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    category: 'Enterprise QA',
    contextWindow: '32K',
    latencyMs: 330,
    benchmarkScore: 84,
    pricePerMInput: 0.8,
    pricePerMOutput: 2.4,
    description: 'Strong instruction fidelity and predictable behavior for guarded workloads.',
    tags: ['compliance', 'enterprise', 'function-calling'],
  },
]

export const useCasePrompts: string[] = [
  'Build an AI coding mentor that reviews pull requests and proposes patches.',
  'Create a support assistant that summarizes tickets and drafts responses.',
  'Run document extraction for invoices with confidence scoring.',
  'Power an internal search bot with retrieval and source citations.',
]

export const benchmarkRows = [
  { test: 'MMLU (Reasoning)', gpt4oMini: 82, claudeHaiku: 79, geminiFlash: 76 },
  { test: 'HumanEval (Code)', gpt4oMini: 73, claudeHaiku: 70, geminiFlash: 66 },
  { test: 'Long Context QA', gpt4oMini: 84, claudeHaiku: 85, geminiFlash: 90 },
  { test: 'Latency p95 (lower better)', gpt4oMini: 290, claudeHaiku: 240, geminiFlash: 200 },
]

export const ownerModels = [
  {
    id: 'neuron-write-1',
    name: 'Neuron Write 1',
    status: 'Published',
    requests24h: 182000,
    avgLatencyMs: 315,
    revenue24h: 1240,
  },
  {
    id: 'neuron-code-2',
    name: 'Neuron Code 2',
    status: 'Review',
    requests24h: 64000,
    avgLatencyMs: 410,
    revenue24h: 370,
  },
  {
    id: 'neuron-vision-lite',
    name: 'Neuron Vision Lite',
    status: 'Draft',
    requests24h: 0,
    avgLatencyMs: 0,
    revenue24h: 0,
  },
]

export const ownerBenchmarks = [
  { suite: 'Instruction Following', latest: 88, lastWeek: 86 },
  { suite: 'Safety Eval', latest: 93, lastWeek: 91 },
  { suite: 'Code Generation', latest: 79, lastWeek: 76 },
  { suite: 'Response Consistency', latest: 84, lastWeek: 80 },
]

export const ownerPricingPlans = [
  { tier: 'Starter', inputPerM: 0.18, outputPerM: 0.75, rpm: 60, monthlyMin: 0 },
  { tier: 'Growth', inputPerM: 0.14, outputPerM: 0.59, rpm: 180, monthlyMin: 299 },
  { tier: 'Enterprise', inputPerM: 0.11, outputPerM: 0.5, rpm: 600, monthlyMin: 1800 },
]

export const usageTrend = [
  { day: 'Mon', requests: 120000 },
  { day: 'Tue', requests: 138000 },
  { day: 'Wed', requests: 146000 },
  { day: 'Thu', requests: 171000 },
  { day: 'Fri', requests: 183000 },
  { day: 'Sat', requests: 155000 },
  { day: 'Sun', requests: 149000 },
]

export const mockPlaygroundResponse = {
  summary:
    'Use a retrieval-first architecture with semantic caching and model routing by intent. Keep expensive reasoning models behind confidence gates.',
  bullets: [
    'Index docs with chunk-level metadata and recency score.',
    'Route short factual queries to low-cost fast model.',
    'Escalate complex multi-step prompts to stronger model only when needed.',
  ],
  risk: 'Watch for stale context in long-running threads and enforce source-grounded answers.',
}
