import { Button, Chip, Stack, Typography } from '@mui/material'
import type { OwnerModel } from '../../mocks/ownerData'

type OwnerModelCardProps = {
  model: OwnerModel
  onView?: (modelId: string) => void
  onEdit?: (modelId: string) => void
}

export default function OwnerModelCard({ model, onView, onEdit }: OwnerModelCardProps) {
  const statusColor =
    model.status === 'Published' ? 'success' : model.status === 'Paused' ? 'warning' : 'default'

  return (
    <Stack
      spacing={1.25}
      sx={{ border: '1px solid #dce5f2', borderRadius: 2.5, p: 2, bgcolor: 'white' }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' spacing={1}>
        <Stack spacing={0.5}>
          <Typography variant='h6' sx={{ fontWeight: 800, color: '#12304f' }}>
            {model.name}
          </Typography>
          <Typography variant='body2' sx={{ color: '#577191' }}>
            {model.task}
          </Typography>
        </Stack>
        <Chip label={model.status} color={statusColor} sx={{ alignSelf: 'flex-start' }} />
      </Stack>

      <Stack direction='row' useFlexGap flexWrap='wrap' spacing={1}>
        <Chip size='small' label={`Trust ${model.trustScore}%`} />
        <Chip size='small' label={`${model.requests.toLocaleString()} requests`} />
        <Chip size='small' label={`$${model.revenue.toLocaleString()} revenue`} />
      </Stack>

      <Stack direction='row' spacing={1}>
        <Button variant='outlined' onClick={() => onView && onView(model.id)}>
          View
        </Button>
        <Button variant='contained' onClick={() => onEdit && onEdit(model.id)}>
          Edit
        </Button>
      </Stack>
    </Stack>
  )
}
