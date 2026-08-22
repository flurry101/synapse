import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { NavLink } from 'react-router'

type OwnerLoadingProps = {
  label?: string
}

export function OwnerLoading({ label = 'Loading...' }: OwnerLoadingProps) {
  return (
    <Stack alignItems='center' spacing={1.5} sx={{ py: 4 }}>
      <CircularProgress size={32} sx={{ color: '#fb7185' }} />
      <Typography variant='body2' sx={{ color: '#94a3b8' }}>
        {label}
      </Typography>
    </Stack>
  )
}

type OwnerErrorProps = {
  message: string
  onRetry?: () => void
}

export function OwnerError({ message, onRetry }: OwnerErrorProps) {
  return (
    <Alert
      severity='error'
      action={
        onRetry ? (
          <Button color='inherit' size='small' onClick={onRetry} sx={{ fontWeight: 700 }}>
            Retry
          </Button>
        ) : undefined
      }
      sx={{
        bgcolor: 'rgba(248, 113, 113, 0.15)',
        color: '#fca5a5',
        border: '1px solid rgba(248, 113, 113, 0.3)',
      }}
    >
      {message}
    </Alert>
  )
}

type OwnerEmptyProps = {
  title: string
  message: string
  actionLabel?: string
  actionTo?: string
}

export function OwnerEmpty({ title, message, actionLabel, actionTo }: OwnerEmptyProps) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px dashed #1e293b',
        bgcolor: '#0a0e17',
      }}
    >
      <Typography variant='h6' sx={{ fontWeight: 800, color: '#f8fafc' }}>
        {title}
      </Typography>
      <Typography variant='body2' sx={{ color: '#94a3b8' }}>
        {message}
      </Typography>
      {actionLabel && actionTo && (
        <Button
          component={NavLink}
          to={actionTo}
          variant='contained'
          sx={{
            alignSelf: 'flex-start',
            bgcolor: '#fb7185',
            color: '#0f172a',
            fontWeight: 800,
            borderRadius: 2,
            '&:hover': { bgcolor: '#f43f5e' },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Stack>
  )
}
