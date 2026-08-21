import { OpenInNew } from '@mui/icons-material'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { NavLink, useParams } from 'react-router'
import MetricCard from '../../components/workspace/MetricCard'
import SectionCard from '../../components/workspace/SectionCard'
import { developerModels, modelDetailsMetrics } from '../../mocks/developerData'

export default function DeveloperModelDetails() {
  const { modelId } = useParams()
  const selectedModel = useMemo(
    () => developerModels.find((model) => model.id === modelId) ?? developerModels[0],
    [modelId],
  )

  return (
    <Stack spacing={2.25}>
      <SectionCard
        title={selectedModel.name}
        subtitle={selectedModel.description}
        action={<Chip label={`Trust score ${selectedModel.trustScore}%`} color='primary' />}
      >
        <Stack spacing={0.5}>
          <Typography sx={{ color: '#4f6683' }}>
            Creator / Model Owner: {selectedModel.creator}
          </Typography>
          <Typography sx={{ color: '#4f6683' }}>
            Hugging Face ID (mock): {selectedModel.huggingFaceId}
          </Typography>
        </Stack>
        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
          <Button
            component={NavLink}
            to='/developer/playground'
            variant='contained'
            endIcon={<OpenInNew />}
          >
            Open Playground
          </Button>
          <Button component={NavLink} to='/developer/deploy' variant='outlined'>
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
        <MetricCard label='Accuracy' value={`${selectedModel.accuracy}%`} />
        <MetricCard label='Latency' value={`${selectedModel.latencyMs}ms`} />
        <MetricCard
          label='Price Input / 1M'
          value={`$${selectedModel.pricePerMInput.toFixed(2)}`}
        />
        <MetricCard
          label='Price Output / 1M'
          value={`$${selectedModel.pricePerMOutput.toFixed(2)}`}
        />
      </Box>

      <SectionCard title='Benchmark metrics'>
        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
          <Chip label={`MMLU: ${selectedModel.benchmarkResults.mmlu}`} />
          <Chip label={`HumanEval: ${selectedModel.benchmarkResults.humaneval}`} />
          <Chip label={`Long Context: ${selectedModel.benchmarkResults.longContext}`} />
        </Stack>
        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
          {modelDetailsMetrics.map((metric) => (
            <Chip key={metric.key} label={`${metric.label}: ${metric.value}`} variant='outlined' />
          ))}
        </Stack>
      </SectionCard>

      <SectionCard title='Usage information'>
        <Typography sx={{ color: '#4f6683' }}>
          Active apps: {selectedModel.usage.activeApps}
        </Typography>
        <Typography sx={{ color: '#4f6683' }}>
          Monthly requests: {selectedModel.usage.monthlyRequests}
        </Typography>
        <Typography sx={{ color: '#4f6683' }}>
          Observed uptime: {selectedModel.usage.uptime}
        </Typography>
      </SectionCard>
    </Stack>
  )
}
