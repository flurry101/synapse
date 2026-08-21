import { Paper, Stack, Typography } from '@mui/material'

type SectionCardProps = {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export default function SectionCard({ title, subtitle, action, children }: SectionCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3.5,
        border: '1px solid #1e293b',
        backgroundColor: '#111622',
        color: '#f8fafc',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='flex-start'
        spacing={2}
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2.25,
          borderBottom: '1px solid #1e293b',
          bgcolor: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <Stack spacing={0.5}>
          <Typography
            variant='h6'
            sx={{ fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant='body2' sx={{ color: '#94a3b8', fontSize: 13.5 }}>
              {subtitle}
            </Typography>
          )}
        </Stack>
        {action}
      </Stack>
      <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 3 } }}>
        {children}
      </Stack>
    </Paper>
  )
}
