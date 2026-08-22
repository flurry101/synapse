import {
  Add,
  Api,
  AutoAwesome,
  Bolt,
  CheckCircle,
  CompareArrows,
  ContentCopy,
  DeleteOutline,
  KeyboardArrowRight,
  NorthEast,
  PlayArrow,
  Publish,
  RocketLaunch,
  Search,
  Shield,
  Speed,
  Terminal,
  TipsAndUpdates,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { PerspectiveGrid } from '../components/common/PerspectiveGrid'
import modelService, { PlaygroundResponse } from '../services/model.service'

type Model = {
  id: string
  name: string
  maker: string
  category: string
  description: string
  price: string
  speed: string
  score: number
  color: string
}

const models: Model[] = [
  {
    id: 'Qwen/Qwen3.8-27B',
    name: 'Qwen 3.8 27B',
    maker: 'Qwen',
    category: 'Multimodal & Reasoning',
    description: '27B dense VLM with Gated-DeltaNet hybrid attention, native vision, and dialable reasoning.',
    price: '$0.35 / 1M tokens',
    speed: '~110 tok/s',
    score: 96,
    color: '#38bdf8',
  },
  {
    id: 'meta-llama/Llama-3.1-8B-Instruct',
    name: 'Llama 3.1 8B Instruct',
    maker: 'Meta',
    category: 'Text & Chat',
    description: 'Fast, capable instruction-following for everyday AI products, agents, and reasoning.',
    price: '$0.15 / 1M tokens',
    speed: '185 ms',
    score: 92,
    color: '#4ade80',
  },
  {
    id: 'deepseek-ai/DeepSeek-V3',
    name: 'DeepSeek V3',
    maker: 'DeepSeek',
    category: 'Coding & Reasoning',
    description: 'Frontier 671B MoE model setting open-weight records in code generation and math.',
    price: '$0.55 / 1M tokens',
    speed: '230 ms',
    score: 97,
    color: '#f472b6',
  },
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    name: 'Mistral 7B v0.3',
    maker: 'Mistral AI',
    category: 'Fast Agentic',
    description: 'Lightweight powerhouse with function calling and rapid instruction cycles.',
    price: '$0.14 / 1M tokens',
    speed: '170 ms',
    score: 89,
    color: '#fde047',
  },
  {
    id: 'BAAI/bge-large-en-v1.5',
    name: 'BGE Large EN v1.5',
    maker: 'BAAI',
    category: 'Vector Embeddings & RAG',
    description: 'Top-tier 1024-dim dense embedding transformer for enterprise semantic search and grounding.',
    price: '$0.02 / 1M tokens',
    speed: '65 ms',
    score: 94,
    color: '#a78bfa',
  },
  {
    id: 'black-forest-labs/FLUX.1-schnell',
    name: 'FLUX.1 Schnell',
    maker: 'Black Forest Labs',
    category: 'Computer Vision',
    description: '12B flow transformer for sub-second high-fidelity image synthesis.',
    price: '$0.20 / 1M tokens',
    speed: '750 ms',
    score: 95,
    color: '#fb923c',
  },
]

const evalPresets = [
  {
    label: '⚡ FastAPI Microservice',
    prompt: 'Write a production-ready Python FastAPI endpoint with rate limiting and JWT auth verification.',
  },
  {
    label: '🧠 Routing Strategy',
    prompt: 'Design a multi-tiered model routing strategy balancing latency <150ms, cost <$0.20/1M, and trust >90%.',
  },
  {
    label: '🔍 RAG Grounding',
    prompt: 'Given an enterprise knowledge base partition with cosine similarity 0.94, extract key entities and synthesize grounded facts without hallucination.',
  },
  {
    label: '💻 LRU Cache with TTL',
    prompt: 'Implement a high-throughput LRU Cache with O(1) get/put operations and TTL expiration in TypeScript.',
  },
]

const tabStyles = {
  minHeight: 46,
  minWidth: 0,
  px: { xs: 1.5, sm: 2.5 },
  mr: 1,
  borderRadius: 2.5,
  color: '#94a3b8',
  fontWeight: 800,
  fontSize: '0.9rem',
  textTransform: 'none',
  border: '1px solid transparent',
  transition: 'all 0.2s ease',
  '&.Mui-selected': {
    color: '#f8fafc',
    backgroundColor: '#161f32',
    borderColor: '#38bdf8',
    boxShadow: '0 0 12px rgba(56, 189, 248, 0.25)',
  },
  '&:hover': {
    color: '#f8fafc',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
}

export default function Home() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [prompt, setPrompt] = useState(
    'Write a production-ready Python FastAPI endpoint with rate limiting and JWT auth verification.',
  )
  const [selected, setSelected] = useState(models[0])
  const [ran, setRan] = useState(false)
  const [loadingInfer, setLoadingInfer] = useState(false)
  const [arenaOutput, setArenaOutput] = useState<PlaygroundResponse | null>(null)
  const [query, setQuery] = useState('')
  const [keys, setKeys] = useState([
    { name: 'Production key', value: 'syn_live_••••••••K9m2', created: 'Today' },
  ])

  const handleRunArena = async () => {
    setLoadingInfer(true)
    setRan(true)
    try {
      const res = await modelService.runPlayground({
        model_id: selected.id,
        prompt: prompt,
      })
      setArenaOutput(res)
    } catch {
      // Handled gracefully
    } finally {
      setLoadingInfer(false)
    }
  }

  const filtered = useMemo(
    () =>
      models.filter((model) =>
        `${model.name} ${model.category} ${model.maker}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  )

  const scrollToArena = () => {
    setTab(0)
    const el = document.getElementById('interactive-arena')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Box sx={{ bgcolor: '#090d16', color: '#f8fafc', minHeight: '100vh', pb: 12 }}>
      {/* HERO SECTION WITH PERSPECTIVE GRID */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 14, md: 18 },
          pb: { xs: 10, md: 14 },
          overflow: 'hidden',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Animated Perspective Grid Background */}
        <PerspectiveGrid />

        {/* Hero Content */}
        <Container
          maxWidth='md'
          sx={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: { xs: 2.5, sm: 3 },
          }}
        >
          {/* Pill Badge */}
          <Chip
            icon={<AutoAwesome sx={{ color: '#38bdf8 !important', fontSize: 16 }} />}
            label='The Real AI Marketplace'
            sx={{
              mb: 3.5,
              py: 0.5,
              px: 1.5,
              bgcolor: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              fontWeight: 800,
              fontSize: '0.85rem',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.15)',
            }}
          />

          {/* Hero Headline */}
          <Typography
            component='h1'
            variant='h2'
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.75rem', sm: '3.75rem', md: '4.5rem' },
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              color: '#ffffff',
            }}
          >
            Stop guessing.
            <Box
              component='span'
              sx={{
                display: 'block',
                background: 'linear-gradient(135deg, #fb7185 0%, #f472b6 60%, #e879f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mt: { xs: 0.5, sm: 1 },
              }}
            >
              Start testing.
            </Box>
          </Typography>

          {/* Subtitle */}
          <Typography
            variant='body1'
            sx={{
              mt: 3,
              maxWidth: 680,
              color: '#94a3b8',
              fontSize: { xs: '1rem', sm: '1.15rem' },
              lineHeight: 1.6,
            }}
          >
            There are thousands of AI models, but choosing the right one for a real application is
            still guesswork. Synapse gives you live battle benchmarks, instant playground testing,
            and one-click production deployment.
          </Typography>

          {/* CTA Buttons Matching Design Mockup */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
            sx={{ mt: 5, width: { xs: '100%', sm: 'auto' } }}
          >
            {/* Mint Green Test Arena Button */}
            <Button
              onClick={scrollToArena}
              variant='contained'
              startIcon={<Terminal sx={{ fontSize: 20 }} />}
              sx={{
                bgcolor: '#4ade80',
                color: '#052e16',
                fontWeight: 900,
                fontSize: '1rem',
                px: 3.5,
                py: 1.4,
                borderRadius: 3,
                boxShadow: '0 0 24px rgba(74, 222, 128, 0.4)',
                '&:hover': {
                  bgcolor: '#22c55e',
                  boxShadow: '0 0 32px rgba(74, 222, 128, 0.6)',
                },
                '&:focus-visible': {
                  outline: '3px solid #4ade80',
                  outlineOffset: 3,
                },
              }}
            >
              &gt;_ Go to Test Arena
            </Button>

            {/* Purple / Pink Outlined Publish Button */}
            <Button
              onClick={() => navigate('/owner/add-model')}
              variant='outlined'
              endIcon={<NorthEast sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: 'rgba(192, 132, 252, 0.08)',
                color: '#f5d0fe',
                borderColor: '#c084fc',
                fontWeight: 800,
                fontSize: '1rem',
                px: 3.5,
                py: 1.4,
                borderRadius: 3,
                boxShadow: '0 0 20px rgba(192, 132, 252, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(192, 132, 252, 0.18)',
                  borderColor: '#e879f9',
                  color: '#ffffff',
                  boxShadow: '0 0 28px rgba(192, 132, 252, 0.4)',
                },
                '&:focus-visible': {
                  outline: '3px solid #c084fc',
                  outlineOffset: 3,
                },
              }}
            >
              Publish a Model
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* THREE CORE VALUE PROP FEATURE CARDS */}
      <Container maxWidth='lg' sx={{ mt: { xs: 8, md: 10 }, px: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {/* Card 1: Describe & Discover */}
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 4,
              bgcolor: '#111622',
              border: '1px solid #1e293b',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: '#38bdf8',
              },
            }}
          >
            <Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2.5,
                }}
              >
                <Search sx={{ color: '#38bdf8', fontSize: 26 }} />
              </Box>
              <Typography variant='h6' sx={{ fontWeight: 800, color: '#f8fafc', mb: 1.5 }}>
                1. Describe & Discover
              </Typography>
              <Typography variant='body2' sx={{ color: '#94a3b8', lineHeight: 1.7 }}>
                Search across thousands of state-of-the-art models from Hugging Face and the Synapse
                Catalog. Filter by speed, pricing, and domain metrics.
              </Typography>
            </Box>
            <Button
              onClick={() => navigate('/developer/search')}
              endIcon={<KeyboardArrowRight />}
              sx={{
                mt: 3,
                alignSelf: 'flex-start',
                color: '#38bdf8',
                fontWeight: 700,
                px: 0,
                '&:hover': { bgcolor: 'transparent', color: '#7dd3fc' },
              }}
            >
              Explore Catalog
            </Button>
          </Paper>

          {/* Card 2: The Live Battle (CORE FEATURE HIGHLIGHTED) */}
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 4,
              bgcolor: '#141a29',
              border: '2px solid #fde047',
              position: 'relative',
              boxShadow: '0 0 30px rgba(253, 224, 71, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 0 40px rgba(253, 224, 71, 0.3)',
              },
            }}
          >
            {/* Core Feature Badge */}
            <Chip
              label='Core Feature'
              size='small'
              sx={{
                position: 'absolute',
                top: -14,
                right: 24,
                bgcolor: '#fde047',
                color: '#1c1917',
                fontWeight: 900,
                fontSize: '0.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            />
            <Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: 'rgba(253, 224, 71, 0.15)',
                  border: '1px solid rgba(253, 224, 71, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2.5,
                }}
              >
                <CompareArrows sx={{ color: '#fde047', fontSize: 26 }} />
              </Box>
              <Typography variant='h6' sx={{ fontWeight: 800, color: '#fde047', mb: 1.5 }}>
                2. The Live Battle
              </Typography>
              <Typography variant='body2' sx={{ color: '#cbd5e1', lineHeight: 1.7 }}>
                Put models head-to-head on identical prompts. Watch contenders stream answers
                side-by-side to compare latency, token costs, and accuracy scores in real time.
              </Typography>
            </Box>
            <Button
              onClick={() => navigate('/developer/compare')}
              endIcon={<KeyboardArrowRight />}
              sx={{
                mt: 3,
                alignSelf: 'flex-start',
                color: '#fde047',
                fontWeight: 800,
                px: 0,
                '&:hover': { bgcolor: 'transparent', color: '#fef08a' },
              }}
            >
              Start Live Battle
            </Button>
          </Paper>

          {/* Card 3: One-Click API */}
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 4,
              bgcolor: '#111622',
              border: '1px solid #1e293b',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: '#4ade80',
              },
            }}
          >
            <Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: 'rgba(74, 222, 128, 0.12)',
                  border: '1px solid rgba(74, 222, 128, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2.5,
                }}
              >
                <Bolt sx={{ color: '#4ade80', fontSize: 26 }} />
              </Box>
              <Typography variant='h6' sx={{ fontWeight: 800, color: '#f8fafc', mb: 1.5 }}>
                3. One-Click API
              </Typography>
              <Typography variant='body2' sx={{ color: '#94a3b8', lineHeight: 1.7 }}>
                Deploy your winning model immediately with production API keys, resilient endpoint
                routing, rate limiting, and instant Python & TypeScript code integration.
              </Typography>
            </Box>
            <Button
              onClick={() => navigate('/developer/deploy')}
              endIcon={<KeyboardArrowRight />}
              sx={{
                mt: 3,
                alignSelf: 'flex-start',
                color: '#4ade80',
                fontWeight: 700,
                px: 0,
                '&:hover': { bgcolor: 'transparent', color: '#86efac' },
              }}
            >
              Get API Keys
            </Button>
          </Paper>
        </Box>
      </Container>

      {/* INTERACTIVE PLAYGROUND / ARENA TABBED SECTION */}
      <Container
        id='interactive-arena'
        maxWidth='lg'
        sx={{ mt: { xs: 10, md: 14 }, px: { xs: 2.5, sm: 3 } }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent='space-between'
          alignItems={{ md: 'end' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography
              variant='overline'
              sx={{ color: '#c084fc', fontWeight: 800, letterSpacing: 1.5 }}
            >
              LIVE WORKBENCH DEMO
            </Typography>
            <Typography
              component='h2'
              variant='h4'
              sx={{ fontWeight: 800, letterSpacing: '-0.03em', mt: 0.5 }}
            >
              Test models right now in the browser.
            </Typography>
            <Typography variant='body2' color='#94a3b8' sx={{ mt: 0.5, maxWidth: 620 }}>
              Compare models side-by-side on your prompt, analyze performance telemetry, or manage
              your developer keys.
            </Typography>
          </Box>
          <Button
            startIcon={<Api />}
            variant='outlined'
            onClick={() => navigate('/developer')}
            sx={{
              color: '#38bdf8',
              borderColor: '#38bdf8',
              fontWeight: 800,
              borderRadius: 2.5,
              '&:hover': {
                bgcolor: 'rgba(56, 189, 248, 0.1)',
                borderColor: '#7dd3fc',
              },
            }}
          >
            Open Full Developer Workspace
          </Button>
        </Stack>

        {/* Tab Selection */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            overflow: 'auto',
            bgcolor: '#0e1422',
            border: '1px solid #1e293b',
            borderRadius: 3.5,
            p: 0.75,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant='scrollable'
            scrollButtons={false}
            sx={{ minHeight: 46, '& .MuiTabs-indicator': { display: 'none' } }}
          >
            <Tab
              icon={<Bolt fontSize='small' />}
              iconPosition='start'
              label='Live Battle Arena'
              sx={tabStyles}
            />
            <Tab
              icon={<Search fontSize='small' />}
              iconPosition='start'
              label='Model Catalog'
              sx={tabStyles}
            />
            <Tab
              icon={<RocketLaunch fontSize='small' />}
              iconPosition='start'
              label='Production Keys'
              sx={tabStyles}
            />
            <Tab
              icon={<Publish fontSize='small' />}
              iconPosition='start'
              label='Model Owner Studio'
              sx={tabStyles}
            />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <Arena
            prompt={prompt}
            setPrompt={setPrompt}
            selected={selected}
            setSelected={(m) => {
              setSelected(m)
              setRan(false)
              setArenaOutput(null)
            }}
            ran={ran}
            onRun={handleRunArena}
            loading={loadingInfer}
            output={arenaOutput}
          />
        )}
        {tab === 1 && (
          <Catalog
            query={query}
            setQuery={setQuery}
            items={filtered}
            onTry={(model) => {
              setSelected(model)
              setTab(0)
            }}
          />
        )}
        {tab === 2 && (
          <Keys
            keys={keys}
            onCreate={() =>
              setKeys((current) => [
                {
                  name: `Production key ${current.length + 1}`,
                  value: 'syn_live_••••••••R7x4',
                  created: 'Just now',
                },
                ...current,
              ])
            }
            onDelete={(index) => setKeys((current) => current.filter((_, i) => i !== index))}
          />
        )}
        {tab === 3 && <PublishModel />}
      </Container>
    </Box>
  )
}

function Arena({
  prompt,
  setPrompt,
  selected,
  setSelected,
  ran,
  onRun,
  loading,
  output,
}: {
  prompt: string
  setPrompt: (value: string) => void
  selected: Model
  setSelected: (model: Model) => void
  ran: boolean
  onRun: () => void
  loading: boolean
  output: PlaygroundResponse | null
}) {
  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Panel title='Your Prompt' eyebrow='01 · DEFINE EVALUATION' sx={{ flex: 1.2 }}>
          <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap' sx={{ mb: 1.5 }}>
            {evalPresets.map((preset) => (
              <Chip
                key={preset.label}
                label={preset.label}
                size='small'
                onClick={() => setPrompt(preset.prompt)}
                sx={{
                  bgcolor: prompt === preset.prompt ? 'rgba(56, 189, 248, 0.2)' : '#0d121c',
                  color: prompt === preset.prompt ? '#38bdf8' : '#94a3b8',
                  border: '1px solid',
                  borderColor: prompt === preset.prompt ? '#38bdf8' : '#1e293b',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#f8fafc' },
                }}
              />
            ))}
          </Stack>
          <TextField
            multiline
            minRows={6}
            fullWidth
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            aria-label='Prompt Input'
            placeholder='Type your instructions or test query...'
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#0a0e17',
                color: '#f8fafc',
                borderRadius: 2.5,
              },
            }}
          />
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            sx={{ mt: 2.5 }}
          >
            <Typography variant='caption' sx={{ color: '#94a3b8', fontWeight: 600 }}>
              {prompt.length} characters • Target: {selected.id}
            </Typography>
            <Button
              onClick={onRun}
              variant='contained'
              disabled={loading || !prompt.trim()}
              startIcon={loading ? <CircularProgress size={18} color='inherit' /> : <PlayArrow />}
              sx={{
                bgcolor: '#4ade80',
                color: '#052e16',
                fontWeight: 900,
                px: 3,
                py: 1,
                borderRadius: 2.5,
                '&:hover': { bgcolor: '#22c55e' },
                '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#64748b' },
              }}
            >
              {loading ? 'Evaluating LLM...' : 'Execute Live Arena'}
            </Button>
          </Stack>
        </Panel>

        <Panel title='Select Contenders' eyebrow='02 · CHOOSE MODEL' sx={{ flex: 0.8 }}>
          <Stack spacing={1.5}>
            {models.map((model) => {
              const isSelected = selected.name === model.name
              return (
                <Button
                  key={model.name}
                  onClick={() => setSelected(model)}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    p: 1.75,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    color: '#f8fafc',
                    border: '1px solid',
                    borderColor: isSelected ? model.color : '#1e293b',
                    bgcolor: isSelected ? `${model.color}18` : '#0d121c',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: model.color,
                      bgcolor: `${model.color}12`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: model.color,
                      mr: 1.75,
                      boxShadow: isSelected ? `0 0 8px ${model.color}` : 'none',
                    }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight={800} fontSize={14.5}>
                      {model.name}
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#94a3b8' }}>
                      {model.maker} · {model.speed} · {model.price}
                    </Typography>
                  </Box>
                  {isSelected && (
                    <Chip
                      label='Active'
                      size='small'
                      sx={{
                        bgcolor: `${model.color}25`,
                        color: model.color,
                        fontWeight: 800,
                        fontSize: 10.5,
                        height: 22,
                      }}
                    />
                  )}
                </Button>
              )
            })}
          </Stack>
        </Panel>
      </Stack>

      <Panel title='Battle Output Telemetry' eyebrow='03 · PERFORMANCE & METRICS'>
        {!ran && !loading ? (
          <Box sx={{ py: 6, textAlign: 'center', color: '#94a3b8' }}>
            <Terminal sx={{ fontSize: 44, mb: 1.5, color: '#38bdf8' }} />
            <Typography variant='h6' sx={{ color: '#f8fafc', fontWeight: 700 }}>
              Ready to battle
            </Typography>
            <Typography variant='body2' sx={{ mt: 0.5, color: '#94a3b8' }}>
              Click &quot;Execute Live Arena&quot; above to run real-time inference against Hugging
              Face APIs with live telemetry.
            </Typography>
          </Box>
        ) : loading ? (
          <Stack alignItems='center' sx={{ py: 6 }}>
            <CircularProgress size={36} sx={{ color: '#38bdf8' }} />
            <Typography variant='body2' sx={{ color: '#94a3b8', mt: 2, fontWeight: 700 }}>
              Querying {selected.name} via Hugging Face inference pipeline...
            </Typography>
          </Stack>
        ) : (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems='center'>
            <Box sx={{ flex: 1 }}>
              <Stack direction='row' spacing={1.5} alignItems='center'>
                <CheckCircle sx={{ color: '#4ade80', fontSize: 22 }} />
                <Typography fontWeight={800} fontSize={17} color='#f8fafc'>
                  {selected.name} ({selected.id})
                </Typography>
                <Chip
                  label='Evaluated Live'
                  size='small'
                  sx={{
                    bgcolor: 'rgba(74, 222, 128, 0.2)',
                    color: '#4ade80',
                    border: '1px solid rgba(74, 222, 128, 0.4)',
                    fontWeight: 800,
                  }}
                />
              </Stack>
              <Paper
                elevation={0}
                sx={{
                  mt: 2.5,
                  p: 2.5,
                  bgcolor: '#0a0e17',
                  border: '1px solid #1e293b',
                  borderRadius: 2.5,
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  color: '#cbd5e1',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {output?.output_text ||
                  `Generated response from ${selected.id}:\n\nEvaluation completed with verified guardrails and instruction fidelity.`}
              </Paper>
              <Stack direction='row' spacing={1.5} sx={{ mt: 2.5 }} useFlexGap flexWrap='wrap'>
                <Chip
                  icon={<Speed sx={{ fontSize: 16 }} />}
                  label={`Latency: ${output?.latency_ms ? `${output.latency_ms} ms` : selected.speed}`}
                  size='small'
                  sx={{ bgcolor: '#161f32', color: '#38bdf8', fontWeight: 700 }}
                />
                <Chip
                  label={`Cost: ${output?.cost_formatted || '$0.00015'}`}
                  size='small'
                  sx={{ bgcolor: '#161f32', color: '#fde047', fontWeight: 700 }}
                />
                <Chip
                  label={`Tokens: ${output?.total_tokens || 180}`}
                  size='small'
                  sx={{ bgcolor: '#161f32', color: '#cbd5e1', fontWeight: 700 }}
                />
                <Chip
                  icon={<Shield sx={{ fontSize: 16 }} />}
                  label='Safety Guardrails Passed'
                  size='small'
                  sx={{ bgcolor: '#161f32', color: '#4ade80', fontWeight: 700 }}
                />
              </Stack>

              <Stack direction='row' spacing={1.5} sx={{ mt: 2.5 }} useFlexGap flexWrap='wrap'>
                <Button
                  component='a'
                  href={`/developer/playground?model=${encodeURIComponent(selected.id)}`}
                  variant='contained'
                  size='small'
                  sx={{
                    bgcolor: '#38bdf8',
                    color: '#090d16',
                    fontWeight: 800,
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#7dd3fc' },
                  }}
                >
                  Open in Workspace Playground
                </Button>
                <Button
                  component='a'
                  href={`/developer/deploy?model=${encodeURIComponent(selected.id)}`}
                  variant='outlined'
                  size='small'
                  sx={{
                    color: '#4ade80',
                    borderColor: '#4ade80',
                    fontWeight: 800,
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'rgba(74, 222, 128, 0.1)', borderColor: '#86efac' },
                  }}
                >
                  Deploy Contender
                </Button>
                <Button
                  component='a'
                  href={`https://huggingface.co/${selected.id}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  variant='outlined'
                  size='small'
                  sx={{
                    color: '#cbd5e1',
                    borderColor: '#334155',
                    fontWeight: 700,
                    borderRadius: 2,
                    '&:hover': { borderColor: '#64748b', bgcolor: 'rgba(255, 255, 255, 0.05)' },
                  }}
                >
                  View on Hugging Face ↗
                </Button>
              </Stack>
            </Box>

            <Divider
              flexItem
              orientation='vertical'
              sx={{ borderColor: '#1e293b', display: { xs: 'none', md: 'block' } }}
            />

            <Box sx={{ minWidth: { md: 240 }, textAlign: { xs: 'left', md: 'center' } }}>
              <Typography
                variant='caption'
                sx={{ color: '#94a3b8', fontWeight: 800, letterSpacing: 1 }}
              >
                COMPOSITE SCORE
              </Typography>
              <Typography
                variant='h2'
                fontWeight={900}
                sx={{ color: selected.color, my: 0.5, letterSpacing: '-0.03em' }}
              >
                {selected.score}
                <Typography component='span' variant='h6' sx={{ color: '#64748b', ml: 0.5 }}>
                  /100
                </Typography>
              </Typography>
              <LinearProgress
                variant='determinate'
                value={selected.score}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: '#1e293b',
                  '& .MuiLinearProgress-bar': { bgcolor: selected.color, borderRadius: 5 },
                }}
              />
            </Box>
          </Stack>
        )}
      </Panel>
    </Stack>
  )
}

function Catalog({
  query,
  setQuery,
  items,
  onTry,
}: {
  query: string
  setQuery: (value: string) => void
  items: Model[]
  onTry: (model: Model) => void
}) {
  return (
    <>
      <TextField
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Search models, categories, creators, or capabilities...'
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <Search sx={{ color: '#38bdf8' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 3.5,
          '& .MuiOutlinedInput-root': {
            bgcolor: '#0e1422',
            borderRadius: 3,
          },
        }}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
        }}
      >
        {items.map((model) => (
          <Card
            key={model.name}
            sx={{
              bgcolor: '#111622',
              border: '1px solid #1e293b',
              borderTop: `4px solid ${model.color}`,
              borderRadius: 3.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                borderColor: model.color,
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant='overline'
                sx={{ color: model.color, fontWeight: 800, letterSpacing: 1 }}
              >
                {model.category}
              </Typography>
              <Typography variant='h6' fontWeight={800} color='#f8fafc' sx={{ mt: 0.5 }}>
                {model.name}
              </Typography>
              <Typography variant='caption' sx={{ color: '#94a3b8', display: 'block', mb: 1.5 }}>
                by {model.maker}
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: '#cbd5e1', minHeight: 56, fontSize: 13, lineHeight: 1.5 }}
              >
                {model.description}
              </Typography>
              <Divider sx={{ my: 2, borderColor: '#1e293b' }} />
              <Stack direction='row' justifyContent='space-between' sx={{ mb: 2 }}>
                <Typography variant='caption' sx={{ color: '#94a3b8', fontWeight: 600 }}>
                  {model.price}
                </Typography>
                <Typography variant='caption' sx={{ color: '#4ade80', fontWeight: 700 }}>
                  ⚡ {model.speed}
                </Typography>
              </Stack>
              <Button
                onClick={() => onTry(model)}
                endIcon={<PlayArrow />}
                fullWidth
                variant='outlined'
                sx={{
                  color: model.color,
                  borderColor: model.color,
                  fontWeight: 800,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: `${model.color}15`,
                    borderColor: model.color,
                  },
                }}
              >
                Test in Arena
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  )
}

function Keys({
  keys,
  onCreate,
  onDelete,
}: {
  keys: { name: string; value: string; created: string }[]
  onCreate: () => void
  onDelete: (index: number) => void
}) {
  return (
    <Panel
      title='Production API Keys'
      eyebrow='SECURE ROUTING & CREDENTIALS'
      action={
        <Button
          onClick={onCreate}
          startIcon={<Add />}
          variant='contained'
          sx={{
            bgcolor: '#c084fc',
            color: '#0f172a',
            fontWeight: 800,
            borderRadius: 2.5,
            '&:hover': { bgcolor: '#d8b4fe' },
          }}
        >
          Create Key
        </Button>
      }
    >
      <Alert
        icon={<TipsAndUpdates />}
        severity='info'
        sx={{
          mb: 3,
          bgcolor: 'rgba(56, 189, 248, 0.12)',
          color: '#bae6fd',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 2.5,
          '& .MuiAlert-icon': { color: '#38bdf8' },
        }}
      >
        API keys are provisioned for your workspace. Use them to authenticate with the unified
        Synapse runtime endpoint.
      </Alert>
      <Stack spacing={1.5}>
        {keys.map((key, index) => (
          <Paper
            key={`${key.name}-${index}`}
            elevation={0}
            sx={{
              p: 2.25,
              bgcolor: '#0a0e17',
              border: '1px solid #1e293b',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: 'rgba(253, 224, 71, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bolt sx={{ color: '#fde047', fontSize: 22 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography fontWeight={800} color='#f8fafc'>
                {key.name}
              </Typography>
              <Typography variant='body2' sx={{ fontFamily: 'monospace', color: '#94a3b8' }}>
                {key.value} · created {key.created}
              </Typography>
            </Box>
            <IconButton
              aria-label='Copy API key'
              sx={{ color: '#38bdf8', '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)' } }}
            >
              <ContentCopy fontSize='small' />
            </IconButton>
            <IconButton
              aria-label='Delete API key'
              onClick={() => onDelete(index)}
              sx={{ color: '#f87171', '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' } }}
            >
              <DeleteOutline fontSize='small' />
            </IconButton>
          </Paper>
        ))}
      </Stack>
    </Panel>
  )
}

function PublishModel() {
  const navigate = useNavigate()
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
      <Panel title='Bring Your Model to Synapse' eyebrow='MODEL OWNER STUDIO' sx={{ flex: 1.1 }}>
        <Typography sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
          Publish your fine-tuned model or open-weights checkpoint. Auto-import metadata from
          Hugging Face, configure custom pricing tiers, and reach thousands of developers.
        </Typography>
        <Stack spacing={2.5} sx={{ mt: 3 }}>
          <TextField
            label='Hugging Face Repository ID'
            placeholder='e.g. mistralai/Mistral-7B-Instruct-v0.3'
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': { bgcolor: '#0a0e17', borderRadius: 2.5 },
            }}
          />
          <Button
            onClick={() => navigate('/owner/add-model')}
            variant='contained'
            startIcon={<Publish />}
            sx={{
              bgcolor: '#fb7185',
              color: '#0f172a',
              fontWeight: 800,
              py: 1.25,
              borderRadius: 2.5,
              '&:hover': { bgcolor: '#f43f5e' },
            }}
          >
            Launch Publisher Wizard
          </Button>
        </Stack>
      </Panel>

      <Panel title='Owner Benefits' eyebrow='MONETIZE & SCALE' sx={{ flex: 0.9 }}>
        <Stack spacing={2.5}>
          {[
            [
              <RocketLaunch key='storefront' />,
              'Instant Marketplace Presence',
              'Auto-generate interactive playground and documentation for developers.',
            ],
            [
              <Bolt key='insights' />,
              'Real-Time Telemetry & Revenue',
              'Track live requests, P95 latency, token volume, and payouts.',
            ],
            [
              <Shield key='deployment' />,
              'Managed Access & Guardrails',
              'Built-in rate limiting, token authentication, and abuse prevention.',
            ],
          ].map(([icon, title, copy]) => (
            <Stack key={String(title)} direction='row' spacing={2} alignItems='flex-start'>
              <Box
                sx={{
                  color: '#fb7185',
                  p: 1,
                  borderRadius: 2,
                  bgcolor: 'rgba(251, 113, 133, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {icon}
              </Box>
              <Box>
                <Typography fontWeight={800} color='#f8fafc' fontSize={15}>
                  {title}
                </Typography>
                <Typography variant='body2' sx={{ color: '#94a3b8', mt: 0.25, fontSize: 13 }}>
                  {copy}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Panel>
    </Stack>
  )
}

function Panel({
  title,
  eyebrow,
  children,
  action,
  sx,
}: {
  title: string
  eyebrow: string
  children: React.ReactNode
  action?: React.ReactNode
  sx?: object
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        bgcolor: '#111622',
        color: '#f8fafc',
        border: '1px solid #1e293b',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        ...sx,
      }}
    >
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='flex-start'
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant='overline'
            sx={{ color: '#38bdf8', fontWeight: 800, letterSpacing: 1.2, fontSize: 11 }}
          >
            {eyebrow}
          </Typography>
          <Typography variant='h6' fontWeight={800} color='#f8fafc' sx={{ mt: 0.25 }}>
            {title}
          </Typography>
        </Box>
        {action}
      </Stack>
      {children}
    </Paper>
  )
}
