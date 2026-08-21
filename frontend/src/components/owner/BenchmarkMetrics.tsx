import { Box } from '@mui/material'
import MetricCard from '../workspace/MetricCard'

type BenchmarkMetricsProps = {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  latencyMs: number
  throughputRps: number
}

export default function BenchmarkMetrics({
  accuracy,
  precision,
  recall,
  f1Score,
  latencyMs,
  throughputRps,
}: BenchmarkMetricsProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.25,
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      }}
    >
      <MetricCard label='Accuracy' value={`${accuracy.toFixed(1)}%`} />
      <MetricCard label='Precision' value={`${precision.toFixed(1)}%`} />
      <MetricCard label='Recall' value={`${recall.toFixed(1)}%`} />
      <MetricCard label='F1 score' value={`${f1Score.toFixed(1)}%`} />
      <MetricCard label='Latency' value={`${latencyMs}ms`} />
      <MetricCard label='Throughput' value={`${throughputRps} rps`} />
    </Box>
  )
}
