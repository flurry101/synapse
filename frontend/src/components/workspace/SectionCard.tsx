import { Paper, Stack, Typography } from '@mui/material'

type SectionCardProps = {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export default function SectionCard({ title, subtitle, action, children }: SectionCardProps) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #d7dee9', backgroundColor: 'white' }}>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='flex-start'
        sx={{ px: 2.25, py: 2, borderBottom: '1px solid #edf1f7' }}
      >
        <Stack spacing={0.25}>
          <Typography variant='h6' sx={{ fontWeight: 700, color: '#122744' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant='body2' sx={{ color: '#5c6f88' }}>
              {subtitle}
            </Typography>
          )}
        </Stack>
        {action}
      </Stack>
      <Stack spacing={2} sx={{ p: 2.25 }}>
        {children}
      </Stack>
    </Paper>
  )
}
