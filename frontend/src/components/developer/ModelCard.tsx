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
    <Box
      sx={{
        border: '1px solid #1e293b',
        borderRadius: 3.5,
        backgroundColor: '#111622',
        p: 2.5,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        transition: 'border-color 0.2s ease, transform 0.2s ease',
        '&:hover': {
          borderColor: '#38bdf8',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
        spacing={1}
      >
        <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
          <Typography variant='h6' sx={{ fontWeight: 800, color: '#f8fafc' }}>
            {model.name}
          </Typography>
          <Typography variant='body2' sx={{ color: '#94a3b8', fontSize: 13.5 }}>
            {model.description}
          </Typography>
          <Chip
            label={model.task}
            size='small'
            sx={{
              alignSelf: 'flex-start',
              mt: 1,
              bgcolor: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontWeight: 700,
              fontSize: 11.5,
            }}
          />
        </Stack>
        <Chip
          label={model.creator}
          size='small'
          sx={{
            bgcolor: '#0e1422',
            color: '#cbd5e1',
            border: '1px solid #1e293b',
            fontWeight: 700,
          }}
        />
      </Stack>

      <Stack direction='row' spacing={1.5} useFlexGap flexWrap='wrap' sx={{ mt: 2.25 }}>
        <MetricPill label='Trust' value={`${model.trustScore}%`} color='#4ade80' />
        <MetricPill label='Accuracy' value={`${model.accuracy}%`} color='#38bdf8' />
        <MetricPill label='Latency' value={`${model.latencyMs}ms`} color='#fde047' />
        <MetricPill
          label='Price'
          value={`$${model.pricePerMInput.toFixed(2)} in / $${model.pricePerMOutput.toFixed(2)} out`}
          color='#c084fc'
        />
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        sx={{ mt: 2.5, pt: 1.5, borderTop: '1px solid #1e293b' }}
      >
        {showCompare ? (
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedForCompare}
                onChange={() => onToggleCompare && onToggleCompare(model.id)}
                sx={{
                  color: '#64748b',
                  '&.Mui-checked': { color: '#38bdf8' },
                }}
              />
            }
            label={
              <Typography variant='body2' sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                Select to Compare
              </Typography>
            }
            sx={{ m: 0 }}
          />
        ) : (
          <Box />
        )}
        <Stack direction='row' spacing={1.25} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          {showCompare && (
            <Button
              variant={selectedForCompare ? 'contained' : 'outlined'}
              startIcon={<CompareArrowsIcon />}
              onClick={() => onToggleCompare && onToggleCompare(model.id)}
              sx={{
                bgcolor: selectedForCompare ? '#38bdf8' : 'transparent',
                color: selectedForCompare ? '#090d16' : '#38bdf8',
                borderColor: '#38bdf8',
                fontWeight: 800,
                flex: { xs: 1, sm: 'initial' },
                '&:hover': {
                  bgcolor: selectedForCompare ? '#7dd3fc' : 'rgba(56, 189, 248, 0.1)',
                  borderColor: '#7dd3fc',
                },
              }}
            >
              {selectedForCompare ? 'Selected' : 'Compare'}
            </Button>
          )}
          <Button
            component={NavLink}
            to={`/developer/details/${model.id}`}
            variant='outlined'
            sx={{
              color: '#f8fafc',
              borderColor: '#1e293b',
              fontWeight: 700,
              flex: { xs: 1, sm: 'initial' },
              '&:hover': {
                borderColor: '#64748b',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            View Details
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

function MetricPill({
  label,
  value,
  color = '#f8fafc',
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <Stack
      direction='row'
      spacing={0.75}
      sx={{
        px: 1.25,
        py: 0.75,
        borderRadius: 2,
        bgcolor: '#0a0e17',
        border: '1px solid #1e293b',
      }}
    >
      <Typography variant='caption' sx={{ color: '#94a3b8', fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant='caption' sx={{ color, fontWeight: 800 }}>
        {value}
      </Typography>
    </Stack>
  )
}
