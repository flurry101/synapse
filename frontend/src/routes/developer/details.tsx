import { OpenInNew, RocketLaunch } from '@mui/icons-material'
import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { NavLink, useParams } from 'react-router'
import MetricCard from '../../components/workspace/MetricCard'
import SectionCard from '../../components/workspace/SectionCard'
import { DeveloperModel, modelDetailsMetrics } from '../../mocks/developerData'
import modelService from '../../services/model.service'

export default function DeveloperModelDetails() {
  const { modelId } = useParams()
  const [model, setModel] = useState<DeveloperModel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!modelId) return
      try {
        const data = await modelService.getDeveloperModel(modelId)
        if (active) setModel(data)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [modelId])

  if (loading || !model) {
    return (
      <SectionCard title='Model Specifications' subtitle='Loading model...'>
        <Stack alignItems='center' sx={{ py: 4 }}>
          <CircularProgress size={32} sx={{ color: '#38bdf8' }} />
        </Stack>
      </SectionCard>
    )
  }

  return (
    <Stack spacing={3}>
      <SectionCard
        title={model.name}
        subtitle={model.description}
        action={
          <Chip
            label={`Trust Score: ${model.trustScore}%`}
            sx={{
              bgcolor: 'rgba(74, 222, 128, 0.15)',
              color: '#4ade80',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              fontWeight: 800,
            }}
          />
        }
      >
        <Stack spacing={0.75}>
          <Typography sx={{ color: '#94a3b8' }}>
            Creator / Model Owner: <strong style={{ color: '#f8fafc' }}>{model.creator}</strong>
          </Typography>
          {model.huggingFaceId && (
            <Typography sx={{ color: '#94a3b8' }}>
              Hugging Face ID: <strong style={{ color: '#38bdf8' }}>{model.huggingFaceId}</strong>
            </Typography>
          )}
        </Stack>
        <Stack direction='row' spacing={2} useFlexGap flexWrap='wrap' sx={{ mt: 1 }}>
          <Button
            component={NavLink}
            to={`/developer/playground?model=${encodeURIComponent(model.id)}`}
            variant='contained'
            endIcon={<OpenInNew />}
            sx={{
              bgcolor: '#38bdf8',
              color: '#090d16',
              fontWeight: 800,
              borderRadius: 2.5,
              '&:hover': { bgcolor: '#7dd3fc' },
            }}
          >
            Open Playground
          </Button>
          <Button
            component={NavLink}
            to={`/developer/deploy?model=${encodeURIComponent(model.id)}`}
            variant='outlined'
            startIcon={<RocketLaunch />}
            sx={{
              color: '#4ade80',
              borderColor: '#4ade80',
              fontWeight: 800,
              borderRadius: 2.5,
              '&:hover': { bgcolor: 'rgba(74, 222, 128, 0.1)', borderColor: '#86efac' },
            }}
          >
            Deploy Model
          </Button>
        </Stack>
      </SectionCard>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        }}
      >
        <MetricCard label='Accuracy' value={`${model.accuracy}%`} delta='Benchmark P90' />
        <MetricCard label='P95 Latency' value={`${model.latencyMs}ms`} delta='Live TTFT' />
        <MetricCard
          label='Price Input / 1M'
          value={`$${model.pricePerMInput.toFixed(2)}`}
          delta='Prompt tokens'
        />
        <MetricCard
          label='Price Output / 1M'
          value={`$${model.pricePerMOutput.toFixed(2)}`}
          delta='Completion tokens'
        />
      </Box>

      <SectionCard
        title='Benchmark Metrics & Evaluations'
        subtitle='Standardized multi-dataset test results'
      >
        <Stack direction='row' spacing={1.5} useFlexGap flexWrap='wrap'>
          <Chip
            label={`MMLU Reasoning: ${model.benchmarkResults.mmlu ?? 84}`}
            sx={{
              bgcolor: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontWeight: 700,
            }}
          />
          <Chip
            label={`HumanEval Coding: ${model.benchmarkResults.humaneval ?? 71}`}
            sx={{
              bgcolor: 'rgba(192, 132, 252, 0.12)',
              color: '#c084fc',
              border: '1px solid rgba(192, 132, 252, 0.3)',
              fontWeight: 700,
            }}
          />
          <Chip
            label={`Long Context Needle: ${model.benchmarkResults.longContext ?? 82}`}
            sx={{
              bgcolor: 'rgba(253, 224, 71, 0.12)',
              color: '#fde047',
              border: '1px solid rgba(253, 224, 71, 0.3)',
              fontWeight: 700,
            }}
          />
        </Stack>
        <Stack direction='row' spacing={1.25} useFlexGap flexWrap='wrap' sx={{ mt: 1 }}>
          {modelDetailsMetrics.map((metric) => (
            <Chip
              key={metric.key}
              label={`${metric.label}: ${metric.value}`}
              sx={{
                bgcolor: '#0a0e17',
                border: '1px solid #1e293b',
                color: '#cbd5e1',
                fontWeight: 600,
              }}
            />
          ))}
        </Stack>
      </SectionCard>

      <SectionCard title='Usage & Reliability Information' subtitle='Marketplace observation logs'>
        <Stack spacing={1}>
          <Typography sx={{ color: '#94a3b8' }}>
            Active applications connected:{' '}
            <strong style={{ color: '#f8fafc' }}>{model.usage.activeApps}</strong>
          </Typography>
          <Typography sx={{ color: '#94a3b8' }}>
            Monthly request volume:{' '}
            <strong style={{ color: '#f8fafc' }}>{model.usage.monthlyRequests}</strong>
          </Typography>
          <Typography sx={{ color: '#94a3b8' }}>
            Observed 30-day uptime:{' '}
            <strong style={{ color: '#4ade80' }}>{model.usage.uptime}</strong>
          </Typography>
        </Stack>
      </SectionCard>
    </Stack>
  )
}
