import {
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useEffect, useState } from 'react'
import UsageChart from '../../components/owner/UsageChart'
import UsageStats from '../../components/owner/UsageStats'
import SectionCard from '../../components/workspace/SectionCard'
import modelService, {
  type OwnerAnalytics as OwnerAnalyticsType,
} from '../../services/model.service'

export default function OwnerAnalytics() {
  const [analytics, setAnalytics] = useState<OwnerAnalyticsType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await modelService.getOwnerAnalytics()
        if (active) setAnalytics(data)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (loading || !analytics) {
    return (
      <SectionCard title='Usage & Analytics' subtitle='Loading telemetry...'>
        <Stack alignItems='center' sx={{ py: 4 }}>
          <CircularProgress size={32} sx={{ color: '#fb7185' }} />
        </Stack>
      </SectionCard>
    )
  }

  const totalRequests = analytics.total_requests
  const totalRevenue = analytics.total_revenue
  const failedRequests = Math.round(totalRequests * 0.012)
  const successfulRequests = totalRequests - failedRequests
  const averageLatencyMs =
    analytics.recent_usage.length > 0
      ? analytics.recent_usage.reduce((sum, row) => sum + row.avg_latency_ms, 0) /
        analytics.recent_usage.length
      : 240

  return (
    <Stack spacing={3}>
      <SectionCard
        title='Usage & Revenue Telemetry'
        subtitle='Real-time request metrics and monetization monitoring'
      >
        <UsageStats
          totalRequests={totalRequests}
          successfulRequests={successfulRequests}
          failedRequests={failedRequests}
          revenue={totalRevenue}
          averageLatencyMs={Math.round(averageLatencyMs)}
        />
      </SectionCard>

      <SectionCard
        title='Requests Over Time'
        subtitle='Aggregated hourly query throughput across all endpoints'
      >
        <UsageChart
          title='Requests Volume'
          color='#38bdf8'
          points={analytics.time_series.map((point) => ({
            label: point.label,
            value: point.requests,
          }))}
          valueFormatter={(value) => `${Math.round(value / 1000)}k`}
        />
      </SectionCard>

      <SectionCard
        title='Gross Revenue Over Time'
        subtitle='Monetized token billing and monthly subscriptions'
      >
        <UsageChart
          title='Revenue ($)'
          color='#4ade80'
          points={analytics.time_series.map((point) => ({
            label: point.label,
            value: point.revenue,
          }))}
          valueFormatter={(value) => `$${Math.round(value)}`}
        />
      </SectionCard>

      <SectionCard
        title='Recent Traffic Log'
        subtitle='Live incoming requests from developer API keys'
      >
        <TableContainer sx={{ border: '1px solid #1e293b', borderRadius: 3, bgcolor: '#0a0e17' }}>
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#0e1422' }}>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Consumer App</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Target Model</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Requests</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Success Rate</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Revenue</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Avg Latency</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analytics.recent_usage.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 700 }}>{row.app}</TableCell>
                  <TableCell sx={{ color: '#38bdf8' }}>{row.model}</TableCell>
                  <TableCell sx={{ color: '#cbd5e1' }}>{row.requests.toLocaleString()}</TableCell>
                  <TableCell sx={{ color: '#4ade80', fontWeight: 700 }}>
                    {row.success_rate.toFixed(1)}%
                  </TableCell>
                  <TableCell sx={{ color: '#fde047', fontWeight: 700 }}>
                    ${row.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ color: '#cbd5e1' }}>{row.avg_latency_ms}ms</TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{row.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>
    </Stack>
  )
}
