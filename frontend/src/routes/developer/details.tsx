import { OpenInNew } from '@mui/icons-material'
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
          <CircularProgress size={32} />
        </Stack>
      </SectionCard>
    )
  }

  return (
    <Stack spacing={2.25}>
      <SectionCard
        title={model.name}
        subtitle={model.description}
        action={<Chip label={`Trust score ${model.trustScore}%`} color='primary' />}
      >
        <Stack spacing={0.5}>
          <Typography sx={{ color: '#4f6683' }}>Creator / Model Owner: {model.creator}</Typography>
          {model.huggingFaceId && (
            <Typography sx={{ color: '#4f6683' }}>
              Hugging Face ID: <strong>{model.huggingFaceId}</strong>
            </Typography>
          )}
        </Stack>
        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
          <Button
            component={NavLink}
            to={`/developer/playground?model=${encodeURIComponent(model.id)}`}
            variant='contained'
            endIcon={<OpenInNew />}
          >
            Open Playground
          </Button>
          <Button
            component={NavLink}
            to={`/developer/deploy?model=${encodeURIComponent(model.id)}`}
            variant='outlined'
          >
            Deploy Model
          </Button>
        </Stack>
      </SectionCard>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        }}
      >
        <MetricCard label='Accuracy' value={`${model.accuracy}%`} />
        <MetricCard label='Latency' value={`${model.latencyMs}ms`} />
        <MetricCard label='Price Input / 1M' value={`$${model.pricePerMInput.toFixed(2)}`} />
        <MetricCard label='Price Output / 1M' value={`$${model.pricePerMOutput.toFixed(2)}`} />
      </Box>

      <SectionCard title='Benchmark metrics'>
        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
          <Chip label={`MMLU: ${model.benchmarkResults.mmlu ?? 84}`} />
          <Chip label={`HumanEval: ${model.benchmarkResults.humaneval ?? 71}`} />
          <Chip label={`Long Context: ${model.benchmarkResults.longContext ?? 82}`} />
        </Stack>
        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
          {modelDetailsMetrics.map((metric) => (
            <Chip key={metric.key} label={`${metric.label}: ${metric.value}`} variant='outlined' />
          ))}
        </Stack>
      </SectionCard>

      <SectionCard title='Usage information'>
        <Typography sx={{ color: '#4f6683' }}>Active apps: {model.usage.activeApps}</Typography>
        <Typography sx={{ color: '#4f6683' }}>
          Monthly requests: {model.usage.monthlyRequests}
        </Typography>
        <Typography sx={{ color: '#4f6683' }}>Observed uptime: {model.usage.uptime}</Typography>
      </SectionCard>
    </Stack>
  )
}
