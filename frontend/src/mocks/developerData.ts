export type DeveloperModel = {
  id: string
  name: string
  description: string
  task: string
  category?: string
  creator: string
  huggingFaceId: string
  trustScore: number
  accuracy: number
  latencyMs: number
  pricePerMInput: number
  pricePerMOutput: number
  parameters?: string
  license?: string
  contextWindow?: string
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
    path: '/developer/details',
    hint: 'Benchmark and pricing',
  },
  { label: 'Playground', path: '/developer/playground', hint: 'Test sample prompts' },
  { label: 'Deploy', path: '/developer/deploy', hint: 'Mock integration panel' },
]

export const popularTasks = [
  'Text Generation',
  'Code Generation',
  'Question Answering',
  'Sentence Similarity',
  'Text-to-Image',
  'Automatic Speech Recognition',
]

export const taskFilters = [
  'All',
  'Text Generation',
  'Code Generation',
  'Question Answering',
  'Sentence Similarity',
  'Text Classification',
  'Text-to-Image',
  'Automatic Speech Recognition',
]

export const categoryFilters = [
  'All',
  'Multimodal',
  'Computer Vision',
  'Natural Language Processing',
  'Audio',
  'Tabular',
  'Reinforcement Learning',
]

export const parameterFilters = ['All', '< 1B', '1B - 7B', '7B - 20B', '20B - 70B', '> 70B']

export const licenseFilters = ['All', 'apache-2.0', 'mit', 'llama3.1', 'llama3.3', 'gemma', 'other']

export const sortOptions = [
  { value: 'trust-desc', label: 'Trust score (high to low)' },
  { value: 'accuracy-desc', label: 'Accuracy (high to low)' },
  { value: 'latency-asc', label: 'Latency (low to high)' },
  { value: 'price-asc', label: 'Price (low to high)' },
]

export const developerModels: DeveloperModel[] = [
  {
    id: 'meta-llama-llama-3-1-8b-instruct',
    name: 'Llama 3.1 8B Instruct',
    description: "Meta's state-of-the-art 8B instruction tuned multilingual model.",
    task: 'Text Generation',
    category: 'Natural Language Processing',
    creator: 'meta-llama',
    huggingFaceId: 'meta-llama/Llama-3.1-8B-Instruct',
    trustScore: 94,
    accuracy: 92.5,
    latencyMs: 190,
    pricePerMInput: 0.15,
    pricePerMOutput: 0.45,
    parameters: '8B',
    license: 'llama3.1',
    contextWindow: '128K',
    benchmarkResults: { mmlu: 88, humaneval: 81, longContext: 89 },
    usage: { activeApps: 412, monthlyRequests: '14.8M', uptime: '99.98%' },
  },
  {
    id: 'qwen-qwen2-5-7b-instruct',
    name: 'Qwen 2.5 7B Instruct',
    description:
      'Flagship open weights model with exceptional coding, math, and instruction following.',
    task: 'Text Generation',
    category: 'Natural Language Processing',
    creator: 'Qwen',
    huggingFaceId: 'Qwen/Qwen2.5-7B-Instruct',
    trustScore: 93,
    accuracy: 91,
    latencyMs: 185,
    pricePerMInput: 0.14,
    pricePerMOutput: 0.42,
    parameters: '7B',
    license: 'apache-2.0',
    contextWindow: '128K',
    benchmarkResults: { mmlu: 87, humaneval: 84, longContext: 88 },
    usage: { activeApps: 280, monthlyRequests: '9.2M', uptime: '99.95%' },
  },
  {
    id: 'qwen-qwen3-8-27b',
    name: 'Qwen 3.8 27B',
    description:
      '27B dense VLM with Gated-DeltaNet hybrid attention, native vision, and dialable reasoning.',
    task: 'Text Generation',
    category: 'Multimodal',
    creator: 'Qwen',
    huggingFaceId: 'Qwen/Qwen3.8-27B',
    trustScore: 97.5,
    accuracy: 96,
    latencyMs: 210,
    pricePerMInput: 0.35,
    pricePerMOutput: 1.05,
    parameters: '27B',
    license: 'apache-2.0',
    contextWindow: '262K',
    benchmarkResults: { mmlu: 94, humaneval: 91, longContext: 95 },
    usage: { activeApps: 340, monthlyRequests: '11.5M', uptime: '99.99%' },
  },
  {
    id: 'deepseek-ai-deepseek-v3',
    name: 'DeepSeek V3',
    description:
      'Frontier 671B MoE model (37B active) setting new industry open weight efficiency records.',
    task: 'Text Generation',
    category: 'Natural Language Processing',
    creator: 'deepseek-ai',
    huggingFaceId: 'deepseek-ai/DeepSeek-V3',
    trustScore: 98,
    accuracy: 96.8,
    latencyMs: 240,
    pricePerMInput: 0.55,
    pricePerMOutput: 2.19,
    parameters: '671B',
    license: 'mit',
    contextWindow: '128K',
    benchmarkResults: { mmlu: 95, humaneval: 93, longContext: 94 },
    usage: { activeApps: 512, monthlyRequests: '24.1M', uptime: '99.96%' },
  },
  {
    id: 'mistralai-mistral-7b-instruct-v0-3',
    name: 'Mistral 7B Instruct v0.3',
    description: 'Instruction tuned Mistral 7B with function calling and v3 tokenizer.',
    task: 'Text Generation',
    category: 'Natural Language Processing',
    creator: 'mistralai',
    huggingFaceId: 'mistralai/Mistral-7B-Instruct-v0.3',
    trustScore: 92,
    accuracy: 89.5,
    latencyMs: 175,
    pricePerMInput: 0.14,
    pricePerMOutput: 0.42,
    parameters: '7B',
    license: 'apache-2.0',
    contextWindow: '32K',
    benchmarkResults: { mmlu: 85, humaneval: 79, longContext: 83 },
    usage: { activeApps: 198, monthlyRequests: '6.4M', uptime: '99.92%' },
  },
  {
    id: 'deepseek-ai-deepseek-r1-distill-qwen-7b',
    name: 'DeepSeek R1 Distill Qwen 7B',
    description: 'R1 reasoning capabilities distilled into an ultra-fast Qwen 7B base.',
    task: 'Question Answering',
    category: 'Natural Language Processing',
    creator: 'deepseek-ai',
    huggingFaceId: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    trustScore: 95,
    accuracy: 94,
    latencyMs: 230,
    pricePerMInput: 0.14,
    pricePerMOutput: 0.42,
    parameters: '7B',
    license: 'mit',
    contextWindow: '128K',
    benchmarkResults: { mmlu: 92, humaneval: 89, longContext: 91 },
    usage: { activeApps: 275, monthlyRequests: '8.8M', uptime: '99.94%' },
  },
]

export const defaultDevModels = developerModels

export const modelDetailsMetrics = [
  { key: 'hallucinationRate', label: 'Hallucination Rate', value: '1.4%' },
  { key: 'factuality', label: 'Factuality', value: '94.8%' },
  { key: 'consistency', label: 'Response Consistency', value: '96.2%' },
]

export const defaultPlaygroundInput =
  'Design a model-routing strategy for an AI support assistant balancing trust, speed, and cost.'

export const mockPlaygroundOutput = {
  text: 'Route short factual queries to Qwen 2.5 7B Instruct and escalate complex multi-step reasoning to Qwen 3.8 27B or DeepSeek V3. Add prompt grounding and semantic caching to maintain <200ms latency.',
  responseTimeMs: 210,
  promptTokens: 185,
  completionTokens: 140,
  totalCost: '$0.00032',
}

export const deploymentConfiguration = {
  selectedModelId: 'meta-llama/Llama-3.1-8B-Instruct',
  environment: 'production',
  region: 'us-east-2',
  maxTokens: 1024,
  temperature: 0.7,
  rateLimitRpm: 30,
  endpoint: 'https://router.huggingface.co/hf-inference/v1',
  usageExample: `curl https://router.huggingface.co/hf-inference/v1/chat/completions \\
  -H "Authorization: Bearer <YOUR_HF_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "meta-llama/Llama-3.1-8B-Instruct",
    "messages": [{"role": "user", "content": "Explain a KV cache in one paragraph."}],
    "max_tokens": 512,
    "temperature": 0.7
  }'`,
}
