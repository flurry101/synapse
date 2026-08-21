import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import type { OwnerModel } from '../../mocks/ownerData'

type OwnerModelCardProps = {
  model: OwnerModel
  onView?: (modelId: string) => void
  onEdit?: (modelId: string) => void
}

export default function OwnerModelCard({ model, onView, onEdit }: OwnerModelCardProps) {
  const isPublished = model.status === 'Published'

  return (
    <Box
      sx={{
        border: '1px solid #1e293b',
        borderRadius: 3.5,
        p: 2.5,
        bgcolor: '#111622',
        transition: 'border-color 0.2s ease',
        '&:hover': { borderColor: '#fb7185' },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
        spacing={1.5}
      >
        <Stack spacing={0.5}>
          <Typography variant='h6' sx={{ fontWeight: 800, color: '#f8fafc' }}>
            {model.name}
          </Typography>
          <Typography variant='body2' sx={{ color: '#94a3b8' }}>
            {model.task} • Version {model.version}
          </Typography>
        </Stack>
        <Chip
          label={model.status}
          sx={{
            bgcolor: isPublished ? 'rgba(74, 222, 128, 0.15)' : 'rgba(253, 224, 71, 0.15)',
            color: isPublished ? '#4ade80' : '#fde047',
            border: `1px solid ${
              isPublished ? 'rgba(74, 222, 128, 0.3)' : 'rgba(253, 224, 71, 0.3)'
            }`,
            fontWeight: 800,
          }}
        />
      </Stack>

      <Stack direction='row' useFlexGap flexWrap='wrap' spacing={1.25} sx={{ mt: 2 }}>
        <Chip
          size='small'
          label={`Trust: ${model.trustScore}%`}
          sx={{ bgcolor: '#0a0e17', border: '1px solid #1e293b', color: '#4ade80' }}
        />
        <Chip
          size='small'
          label={`${model.requests.toLocaleString()} Requests`}
          sx={{ bgcolor: '#0a0e17', border: '1px solid #1e293b', color: '#38bdf8' }}
        />
        <Chip
          size='small'
          label={`$${model.revenue.toLocaleString()} Revenue`}
          sx={{ bgcolor: '#0a0e17', border: '1px solid #1e293b', color: '#fde047' }}
        />
      </Stack>

      <Stack direction='row' spacing={1.5} sx={{ mt: 2.5 }}>
        <Button
          variant='outlined'
          onClick={() => onView && onView(model.id)}
          sx={{
            color: '#cbd5e1',
            borderColor: '#1e293b',
            fontWeight: 700,
            borderRadius: 2,
            '&:hover': { borderColor: '#64748b', bgcolor: 'rgba(255, 255, 255, 0.05)' },
          }}
        >
          View Profile
        </Button>
        <Button
          variant='contained'
          onClick={() => onEdit && onEdit(model.id)}
          sx={{
            bgcolor: '#fb7185',
            color: '#0f172a',
            fontWeight: 800,
            borderRadius: 2,
            '&:hover': { bgcolor: '#f43f5e' },
          }}
        >
          Edit Model
        </Button>
      </Stack>
    </Box>
  )
}
