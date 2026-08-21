import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Paper, Stack, Typography } from '@mui/material'

type MetricCardProps = {
  label: string
  value: string
  delta?: string
}

export default function MetricCard({ label, value, delta }: MetricCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3.5,
        border: '1px solid #1e293b',
        backgroundColor: '#111622',
        p: 2.5,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#2a3b54',
        },
      }}
    >
      <Typography
        variant='caption'
        sx={{
          color: '#94a3b8',
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          fontSize: 11.5,
        }}
      >
        {label}
      </Typography>
      <Typography variant='h4' sx={{ mt: 1, color: '#f8fafc', fontWeight: 800 }}>
        {value}
      </Typography>
      {delta && (
        <Stack direction='row' spacing={0.75} alignItems='center' sx={{ mt: 1.25 }}>
          <TrendingUpIcon sx={{ color: '#4ade80', fontSize: 18 }} />
          <Typography variant='body2' sx={{ color: '#4ade80', fontWeight: 700, fontSize: 13 }}>
            {delta}
          </Typography>
        </Stack>
      )}
    </Paper>
  )
}
