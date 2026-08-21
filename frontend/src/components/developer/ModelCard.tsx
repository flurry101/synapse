import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import { Box, Button, Checkbox, Chip, FormControlLabel, Stack, Typography } from '@mui/material'
import { NavLink } from 'react-router'
import type { DeveloperModel } from '../../mocks/developerData'

type ModelCardProps = {
  model: DeveloperModel
  selectedForCompare?: boolean
  onToggleCompare?: (modelId: string) => void
  showCompare?: boolean
}

export default function ModelCard({
  model,
  selectedForCompare = false,
  onToggleCompare,
  showCompare = true,
}: ModelCardProps) {
  return (
    <Box sx={{ border: '1px solid #dce5f2', borderRadius: 3, backgroundColor: 'white', p: 2 }}>
      <Stack direction='row' justifyContent='space-between' alignItems='flex-start' spacing={1}>
        <Stack spacing={0.5}>
          <Typography variant='h6' sx={{ fontWeight: 800, color: '#12304f' }}>
            {model.name}
          </Typography>
          <Typography variant='body2' sx={{ color: '#577191' }}>
            {model.description}
          </Typography>
          <Chip label={model.task} size='small' sx={{ alignSelf: 'flex-start', mt: 0.5 }} />
        </Stack>
        <Typography sx={{ color: '#4f6683', fontWeight: 700 }}>{model.creator}</Typography>
      </Stack>

      <Stack direction='row' spacing={1.5} useFlexGap flexWrap='wrap' sx={{ mt: 1.75 }}>
        <MetricPill label='Trust' value={`${model.trustScore}%`} />
        <MetricPill label='Accuracy' value={`${model.accuracy}%`} />
        <MetricPill label='Latency' value={`${model.latencyMs}ms`} />
        <MetricPill
          label='Price'
          value={`$${model.pricePerMInput.toFixed(2)} in / $${model.pricePerMOutput.toFixed(2)} out`}
        />
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ mt: 2 }}
      >
        {showCompare ? (
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedForCompare}
                onChange={() => onToggleCompare && onToggleCompare(model.id)}
              />
            }
            label='Compare'
            sx={{ m: 0 }}
          />
        ) : (
          <Box />
        )}
        <Stack direction='row' spacing={1}>
          {showCompare && (
            <Button
              variant={selectedForCompare ? 'contained' : 'outlined'}
              startIcon={<CompareArrowsIcon />}
              onClick={() => onToggleCompare && onToggleCompare(model.id)}
            >
              {selectedForCompare ? 'Selected' : 'Compare'}
            </Button>
          )}
          <Button component={NavLink} to={`/developer/details/${model.id}`} variant='outlined'>
            View Details
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction='row' spacing={0.75} sx={{ px: 1, py: 0.75, borderRadius: 2, bgcolor: '#f4f8fd' }}>
      <Typography variant='caption' sx={{ color: '#667f9f', fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant='caption' sx={{ color: '#1d3a58', fontWeight: 800 }}>
        {value}
      </Typography>
    </Stack>
  )
}
