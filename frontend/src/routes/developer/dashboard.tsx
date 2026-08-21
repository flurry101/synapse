import { ArrowForward, Bolt, RocketLaunch, Storage } from '@mui/icons-material'
import { Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import ModelCard from '../../components/developer/ModelCard'
import SearchBar from '../../components/developer/SearchBar'
import MetricCard from '../../components/workspace/MetricCard'
import SectionCard from '../../components/workspace/SectionCard'
import { DeveloperModel, popularTasks } from '../../mocks/developerData'
import modelService from '../../services/model.service'

export default function DeveloperDashboard() {
  const navigate = useNavigate()
  const [query, setQuery] = useState(
    'I need a reliable support assistant with low latency and strong factual grounding.',
  )
  const [recommended, setRecommended] = useState<DeveloperModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const models = await modelService.getDeveloperModels({ limit: 4 })
        if (active) setRecommended(models)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const onFindModels = () => {
    navigate(`/developer/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <Stack spacing={3}>
      {/* Welcome Banner */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: { xs: 2.5, sm: 3.5 },
          border: '1px solid #1e293b',
          background: 'linear-gradient(135deg, #111622 0%, #161f32 100%)',
          color: '#f8fafc',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <Typography variant='h4' sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
          Welcome to Synapse Developer Hub
        </Typography>
        <Typography sx={{ mt: 1, maxWidth: 840, color: '#94a3b8', lineHeight: 1.6 }}>
          Describe your application requirements, discover verified models from the Synapse Catalog
          & Hugging Face Hub, test prompts live in the playground, and deploy production keys in one
          click.
        </Typography>
        <Stack direction='row' spacing={1.5} sx={{ mt: 2.5, flexWrap: 'wrap' }} useFlexGap>
          <Chip
            icon={<Storage sx={{ color: '#38bdf8 !important', fontSize: 16 }} />}
            label='Live Hugging Face Integration'
            sx={{
              bgcolor: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontWeight: 700,
            }}
          />
          <Chip
            icon={<Bolt sx={{ color: '#4ade80 !important', fontSize: 16 }} />}
            label='Inference Playground'
            sx={{
              bgcolor: 'rgba(74, 222, 128, 0.12)',
              color: '#4ade80',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              fontWeight: 700,
            }}
          />
          <Chip
            icon={<RocketLaunch sx={{ color: '#c084fc !important', fontSize: 16 }} />}
            label='One-Click API Keys'
            sx={{
              bgcolor: 'rgba(192, 132, 252, 0.12)',
              color: '#c084fc',
              border: '1px solid rgba(192, 132, 252, 0.3)',
              fontWeight: 700,
            }}
          />
        </Stack>
      </Paper>

      {/* Describe Use Case */}
      <SectionCard
        title='Describe Your Use Case'
        subtitle='Tell Synapse what you are building and discover top-scoring models'
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          buttonLabel='Find Models'
          onSubmit={onFindModels}
          placeholder='Example: Build a code assistant with sub-150ms latency and high accuracy'
        />
        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap' sx={{ mt: 0.5 }}>
          {popularTasks.map((task) => (
            <Chip
              key={task}
              label={task}
              onClick={() => setQuery(task)}
              sx={{
                bgcolor: '#0a0e17',
                border: '1px solid #1e293b',
                color: '#cbd5e1',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#38bdf8',
                  color: '#38bdf8',
                  bgcolor: 'rgba(56, 189, 248, 0.1)',
                },
              }}
            />
          ))}
        </Stack>
      </SectionCard>

      {/* Metrics Row */}
      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        }}
      >
        <MetricCard
          label='Active Model Candidates'
          value={String(recommended.length || 12)}
          delta='+3 this week'
        />
        <MetricCard label='Average Latency Target' value='220ms' delta='18% faster' />
        <MetricCard label='Budget Guardrail' value='$0.65 / 1M out' delta='On target' />
        <MetricCard label='Deploy Readiness' value='94%' delta='+9 points' />
      </Box>

      {/* Recommended Models */}
      <SectionCard
        title='Recommended Models'
        subtitle='Curated models matching your current stack requirements'
      >
        {loading ? (
          <Stack alignItems='center' sx={{ py: 4 }}>
            <CircularProgress size={32} sx={{ color: '#38bdf8' }} />
          </Stack>
        ) : (
          <Stack spacing={2}>
            {recommended.map((model) => (
              <ModelCard key={model.id} model={model} showCompare={false} />
            ))}
          </Stack>
        )}
      </SectionCard>

      {/* Suggested Journey */}
      <SectionCard
        title='Suggested Next Steps'
        subtitle='Recommended builder path for zero-friction integration'
        action={
          <Button
            component={NavLink}
            to='/developer/search'
            variant='contained'
            endIcon={<ArrowForward />}
            sx={{
              bgcolor: '#38bdf8',
              color: '#090d16',
              fontWeight: 800,
              borderRadius: 2.5,
              '&:hover': { bgcolor: '#7dd3fc' },
            }}
          >
            Start Search
          </Button>
        }
      >
        <Stack spacing={1.5}>
          <Typography variant='body2' sx={{ color: '#cbd5e1', lineHeight: 1.6 }}>
            <strong style={{ color: '#38bdf8' }}>1. Describe & Search:</strong> Specify your app
            goals and filter by speed, budget, or task type.
          </Typography>
          <Typography variant='body2' sx={{ color: '#cbd5e1', lineHeight: 1.6 }}>
            <strong style={{ color: '#fde047' }}>2. Side-by-Side Battle:</strong> Compare 2-3 models
            on identical test queries in real time.
          </Typography>
          <Typography variant='body2' sx={{ color: '#cbd5e1', lineHeight: 1.6 }}>
            <strong style={{ color: '#4ade80' }}>3. Deploy & Issue Keys:</strong> Provision
            production endpoints and integrate with standard OpenAI-compatible SDKs.
          </Typography>
        </Stack>
      </SectionCard>
    </Stack>
  )
}
