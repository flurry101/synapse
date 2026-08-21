import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Box, Paper, Stack, Typography } from '@mui/material'

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
        borderRadius: 3,
        border: '1px solid #d7dee9',
        backgroundColor: 'white',
        p: 2,
      }}
    >
      <Typography variant='body2' sx={{ color: '#61758f', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant='h4' sx={{ mt: 0.75, color: '#142843', fontWeight: 800 }}>
        {value}
      </Typography>
      {delta && (
        <Stack direction='row' spacing={0.5} alignItems='center' sx={{ mt: 1 }}>
          <TrendingUpIcon sx={{ color: '#2e7d32', fontSize: 17 }} />
          <Typography variant='body2' sx={{ color: '#2e7d32', fontWeight: 700 }}>
            {delta}
          </Typography>
        </Stack>
      )}
    </Paper>
  )
}
