import { Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import UsageChart from '../../components/owner/UsageChart'
import UsageStats from '../../components/owner/UsageStats'
import SectionCard from '../../components/workspace/SectionCard'
import { recentUsageRows, usageSeries } from '../../mocks/ownerData'

export default function OwnerAnalytics() {
  const totalRequests = usageSeries.reduce((sum, point) => sum + point.requests, 0)
  const totalRevenue = usageSeries.reduce((sum, point) => sum + point.revenue, 0)
  const failedRequests = Math.round(totalRequests * 0.014)
  const successfulRequests = totalRequests - failedRequests
  const averageLatencyMs =
    recentUsageRows.reduce((sum, row) => sum + row.avgLatencyMs, 0) / recentUsageRows.length

  return (
    <Stack spacing={2.25}>
      <SectionCard title='Usage / Analytics' subtitle='Request and revenue monitoring with local mock data'>
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
          points={usageSeries.map((point) => ({ label: point.label, value: point.requests }))}
          valueFormatter={(value) => `${Math.round(value / 1000)}k`}
        />
      </SectionCard>

      <SectionCard title='Revenue over time chart'>
        <UsageChart
          title='Revenue over time'
          color='#2e7d32'
          points={usageSeries.map((point) => ({ label: point.label, value: point.revenue }))}
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
              {recentUsageRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.app}</TableCell>
                  <TableCell>{row.model}</TableCell>
                  <TableCell>{row.requests.toLocaleString()}</TableCell>
                  <TableCell>{row.successRate.toFixed(1)}%</TableCell>
                  <TableCell>${row.revenue.toLocaleString()}</TableCell>
                  <TableCell>{row.avgLatencyMs}ms</TableCell>
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
