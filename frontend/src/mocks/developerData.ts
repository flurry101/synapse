export type DeveloperModel = {
  id: string
  name: string
  description: string
  task: string
  creator: string
  huggingFaceId: string
  trustScore: number
  accuracy: number
  latencyMs: number
  pricePerMInput: number
  pricePerMOutput: number
  benchmarkResults: {
    mmlu: number
    humaneval: number
    longContext: number
  }
  usage: {
    activeApps: number
    monthlyRequests: string
    uptime: string
  }
}

export const developerNavItems = [
  { label: 'Dashboard', path: '/developer', hint: 'Discover and shortlist models' },
  { label: 'Search Results', path: '/developer/search', hint: 'Filter and sort candidates' },
  { label: 'Comparison', path: '/developer/compare', hint: 'Compare shortlisted models' },
  {
    label: 'Model Details',
    path: '/developer/details/synapse-gpt-lite',
    hint: 'Benchmark and pricing',
  },
  { label: 'Playground', path: '/developer/playground', hint: 'Test sample prompts' },
  { label: 'Deploy', path: '/developer/deploy', hint: 'Mock integration panel' },
]

export const popularTasks = [
  'Customer Support Assistant',
  'Code Review Copilot',
  'Document Q&A',
  'Data Extraction',
  'Multilingual Chat',
  'Semantic Search',
]

export const taskFilters = ['All', 'General Chat', 'Coding', 'RAG', 'Support', 'Extraction']

export const sortOptions = [
  { value: 'trust-desc', label: 'Trust score (high to low)' },
  { value: 'accuracy-desc', label: 'Accuracy (high to low)' },
  { value: 'latency-asc', label: 'Latency (low to high)' },
  { value: 'price-asc', label: 'Price (low to high)' },
]

export const developerModels: DeveloperModel[] = [
  {
    id: 'synapse-gpt-lite',
    name: 'Synapse GPT Lite',
    description: 'Balanced assistant model for product copilots and workflow automation.',
    task: 'General Chat',
    creator: 'NeuralForge Labs',
    huggingFaceId: 'neuralforge/synapse-gpt-lite',
    trustScore: 92,
    accuracy: 89,
    latencyMs: 210,
    pricePerMInput: 0.16,
    pricePerMOutput: 0.65,
    benchmarkResults: { mmlu: 84, humaneval: 71, longContext: 82 },
    usage: { activeApps: 178, monthlyRequests: '3.8M', uptime: '99.95%' },
  },
  {
    id: 'codepilot-x',
    name: 'CodePilot X',
    description: 'Code-first model tuned for repository understanding and patch generation.',
    task: 'Coding',
    creator: 'StackNeuron',
    huggingFaceId: 'stackneuron/codepilot-x',
    trustScore: 88,
    accuracy: 91,
    latencyMs: 260,
    pricePerMInput: 0.24,
    pricePerMOutput: 0.92,
    benchmarkResults: { mmlu: 79, humaneval: 86, longContext: 76 },
    usage: { activeApps: 94, monthlyRequests: '2.1M', uptime: '99.90%' },
  },
  {
    id: 'retrieval-pro-2',
    name: 'Retrieval Pro 2',
    description: 'Long-context model optimized for source-grounded responses and RAG apps.',
    task: 'RAG',
    creator: 'VectorPeak AI',
    huggingFaceId: 'vectorpeak/retrieval-pro-2',
    trustScore: 90,
    accuracy: 87,
    latencyMs: 230,
    pricePerMInput: 0.18,
    pricePerMOutput: 0.69,
    benchmarkResults: { mmlu: 80, humaneval: 67, longContext: 91 },
    usage: { activeApps: 131, monthlyRequests: '4.5M', uptime: '99.97%' },
  },
  {
    id: 'support-fast-1',
    name: 'Support Fast 1',
    description: 'Low-latency support model for ticket triage and conversational workflows.',
    task: 'Support',
    creator: 'ServiceMind',
    huggingFaceId: 'servicemind/support-fast-1',
    trustScore: 85,
    accuracy: 84,
    latencyMs: 170,
    pricePerMInput: 0.12,
    pricePerMOutput: 0.5,
    benchmarkResults: { mmlu: 75, humaneval: 55, longContext: 78 },
    usage: { activeApps: 207, monthlyRequests: '6.2M', uptime: '99.88%' },
  },
]

export const modelDetailsMetrics = [
  { key: 'hallucinationRate', label: 'Hallucination Rate', value: '2.6%' },
  { key: 'factuality', label: 'Factuality', value: '91%' },
  { key: 'consistency', label: 'Response Consistency', value: '89%' },
]

export const defaultPlaygroundInput =
  'Design a model-routing strategy for an AI support assistant balancing trust, speed, and cost.'

export const mockPlaygroundOutput = {
  text: 'Route short factual tickets to Support Fast 1 and escalate unresolved or multi-step issues to Synapse GPT Lite. Add confidence thresholds and retrieval verification before final responses.',
  responseTimeMs: 248,
  promptTokens: 176,
  completionTokens: 121,
  totalCost: '$0.00029',
}

export const deploymentConfiguration = {
  selectedModelId: 'synapse-gpt-lite',
  environment: 'production',
  region: 'us-east-1',
  maxTokens: 1024,
  temperature: 0.3,
  rateLimitRpm: 180,
  endpoint: 'https://api.synapse.dev/mock/v1/models/synapse-gpt-lite/infer',
  usageExample: `curl -X POST https://api.synapse.dev/mock/v1/models/synapse-gpt-lite/infer \\
  -H "Authorization: Bearer <mock_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "Summarize this support thread",
    "max_tokens": 256,
    "temperature": 0.3
  }'`,
}
