import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { OwnerModel } from '../../mocks/ownerData'

type OwnerModelCardProps = {
  model: OwnerModel
  onView?: (modelId: string) => void
  onEdit?: (modelId: string) => void
  onDelete?: (modelId: string) => void
}

export default function OwnerModelCard({ model, onView, onEdit, onDelete }: OwnerModelCardProps) {
  const isPublished = model.status === 'Published'
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleConfirmDelete = () => {
    setConfirmOpen(false)
    if (onDelete) {
      onDelete(model.id)
    }
  }

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

      <Stack direction='row' spacing={1.5} useFlexGap flexWrap='wrap' sx={{ mt: 2.5 }}>
        <Button
          variant='outlined'
          startIcon={<VisibilityIcon />}
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
          startIcon={<EditIcon />}
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
        <Button
          variant='outlined'
          startIcon={<DeleteOutlineIcon />}
          onClick={() => setConfirmOpen(true)}
          sx={{
            color: '#f87171',
            borderColor: 'rgba(248, 113, 113, 0.3)',
            fontWeight: 700,
            borderRadius: 2,
            '&:hover': {
              borderColor: '#f87171',
              bgcolor: 'rgba(248, 113, 113, 0.1)',
            },
          }}
        >
          Delete Model
        </Button>
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#0e1422',
            border: '1px solid #1e293b',
            borderRadius: 3,
            color: '#f8fafc',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#f87171' }}>Delete Model?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#94a3b8' }}>
            Are you sure you want to delete{' '}
            <strong style={{ color: '#f8fafc' }}>{model.name}</strong>? This action cannot be undone
            and will remove the model from developer access.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ color: '#94a3b8', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant='contained'
            sx={{
              bgcolor: '#ef4444',
              color: '#ffffff',
              fontWeight: 800,
              borderRadius: 2,
              '&:hover': { bgcolor: '#dc2626' },
            }}
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
