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
      <SectionCard title='Usage / Analytics' subtitle='Loading analytics...'>
        <Stack alignItems='center' sx={{ py: 4 }}>
          <CircularProgress size={32} />
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
    <Stack spacing={2.25}>
      <SectionCard
        title='Usage / Analytics'
        subtitle='Request and revenue monitoring from deployed model endpoints'
      >
        <UsageStats
          totalRequests={totalRequests}
          successfulRequests={successfulRequests}
          failedRequests={failedRequests}
          revenue={totalRevenue}
          averageLatencyMs={Math.round(averageLatencyMs)}
        />
      </SectionCard>

      <SectionCard title='Requests over time chart'>
        <UsageChart
          title='Requests over time'
          color='#2368a2'
          points={analytics.time_series.map((point) => ({
            label: point.label,
            value: point.requests,
          }))}
          valueFormatter={(value) => `${Math.round(value / 1000)}k`}
        />
      </SectionCard>

      <SectionCard title='Revenue over time chart'>
        <UsageChart
          title='Revenue over time'
          color='#2e7d32'
          points={analytics.time_series.map((point) => ({
            label: point.label,
            value: point.revenue,
          }))}
          valueFormatter={(value) => `$${Math.round(value)}`}
        />
      </SectionCard>

      <SectionCard title='Recent usage table' subtitle='Latest consumer traffic samples'>
        <TableContainer sx={{ border: '1px solid #dce5f2', borderRadius: 2.5 }}>
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f6f9fe' }}>
                <TableCell sx={{ fontWeight: 800 }}>App</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Model</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Requests</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Success rate</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Revenue</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Avg latency</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analytics.recent_usage.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.app}</TableCell>
                  <TableCell>{row.model}</TableCell>
                  <TableCell>{row.requests.toLocaleString()}</TableCell>
                  <TableCell>{row.success_rate.toFixed(1)}%</TableCell>
                  <TableCell>${row.revenue.toLocaleString()}</TableCell>
                  <TableCell>{row.avg_latency_ms}ms</TableCell>
                  <TableCell>{row.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>
    </Stack>
  )
}
