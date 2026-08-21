import { Box, Stack, Typography } from '@mui/material'

type UsageChartPoint = {
  label: string
  value: number
}

type UsageChartProps = {
  title: string
  color: string
  points: UsageChartPoint[]
  valueFormatter?: (value: number) => string
}

export default function UsageChart({ title, color, points, valueFormatter }: UsageChartProps) {
  const width = 720
  const height = 220
  const padding = 28
  const maxValue = Math.max(...points.map((point) => point.value), 1)
  const stepX = (width - padding * 2) / Math.max(points.length - 1, 1)

  const path = points
    .map((point, index) => {
      const x = padding + index * stepX
      const y = height - padding - (point.value / maxValue) * (height - padding * 2)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <Stack spacing={1}>
      <Typography variant='subtitle1' sx={{ fontWeight: 800, color: '#143252' }}>
        {title}
      </Typography>
      <Box sx={{ border: '1px solid #dce5f2', borderRadius: 2, p: 1, bgcolor: '#fbfdff' }}>
        <svg width='100%' viewBox={`0 0 ${width} ${height}`} role='img' aria-label={title}>
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke='#cfd9e7'
          />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke='#cfd9e7' />
          <path d={path} fill='none' stroke={color} strokeWidth='3' />
          {points.map((point, index) => {
            const x = padding + index * stepX
            const y = height - padding - (point.value / maxValue) * (height - padding * 2)
            return (
              <g key={point.label}>
                <circle cx={x} cy={y} r='4' fill={color} />
                <text x={x} y={height - 8} textAnchor='middle' fontSize='11' fill='#5d7290'>
                  {point.label}
                </text>
                <text x={x} y={y - 10} textAnchor='middle' fontSize='11' fill='#2e4a69'>
                  {valueFormatter ? valueFormatter(point.value) : point.value}
                </text>
              </g>
            )
          })}
        </svg>
      </Box>
    </Stack>
  )
}
