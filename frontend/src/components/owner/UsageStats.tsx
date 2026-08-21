import { Box } from '@mui/material'
import MetricCard from '../workspace/MetricCard'

type UsageStatsProps = {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  revenue: number
  averageLatencyMs: number
}

export default function UsageStats({
  totalRequests,
  successfulRequests,
  failedRequests,
  revenue,
  averageLatencyMs,
}: UsageStatsProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.25,
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
      }}
    >
      <MetricCard label='Total requests' value={totalRequests.toLocaleString()} />
      <MetricCard label='Successful requests' value={successfulRequests.toLocaleString()} />
      <MetricCard label='Failed requests' value={failedRequests.toLocaleString()} />
      <MetricCard label='Revenue' value={`$${revenue.toLocaleString()}`} />
      <MetricCard label='Average latency' value={`${averageLatencyMs}ms`} />
    </Box>
  )
}
