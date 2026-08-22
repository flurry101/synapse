import AddIcon from '@mui/icons-material/Add'
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import BenchmarkMetrics from '../../components/owner/BenchmarkMetrics'
import SectionCard from '../../components/workspace/SectionCard'
import { type BenchmarkResult, type OwnerModel } from '../../mocks/ownerData'
import modelService from '../../services/model.service'

export default function OwnerBenchmarks() {
  const [models, setModels] = useState<OwnerModel[]>([])
  const [rows, setRows] = useState<BenchmarkResult[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newResult, setNewResult] = useState({
    modelId: '',
    dataset: 'Synapse Eval v2',
    testDate: new Date().toISOString().slice(0, 10),
    accuracy: 89,
    precision: 88,
    recall: 87,
    f1Score: 87.5,
    latencyMs: 240,
    throughputRps: 40,
  })

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [modelsData, bmData] = await Promise.all([
          modelService.getOwnerModels(),
          modelService.getOwnerBenchmarks(),
        ])
        if (active) {
          setModels(modelsData)
          setRows(bmData)
          if (modelsData.length > 0) {
            setNewResult((prev) => ({ ...prev, modelId: modelsData[0].id }))
          }
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const latest = useMemo(() => rows[0], [rows])

  const addBenchmarkResult = async () => {
    setIsSubmitting(true)
    setSaved(null)
    const resultPayload: Partial<BenchmarkResult> = {
      modelId: newResult.modelId || models[0]?.id,
      dataset: newResult.dataset,
      testDate: newResult.testDate,
      accuracy: Number(newResult.accuracy),
      precision: Number(newResult.precision),
      recall: Number(newResult.recall),
      f1Score: Number(newResult.f1Score),
      latencyMs: Number(newResult.latencyMs),
      throughputRps: Number(newResult.throughputRps),
    }
    try {
      const added = await modelService.addOwnerBenchmark(resultPayload)
      setRows((prev) => [added, ...prev])
      setSaved(`Benchmark for "${added.dataset}" logged successfully!`)
    } catch {
      setSaved('Failed to add benchmark to backend.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <SectionCard title='Benchmark Results' subtitle='Loading benchmarks...'>
        <Stack alignItems='center' sx={{ py: 4 }}>
          <CircularProgress size={32} sx={{ color: '#fb7185' }} />
        </Stack>
      </SectionCard>
    )
  }

  return (
    <Stack spacing={3}>
      <SectionCard title='Benchmark Results' subtitle='Quality, latency, and throughput tracking'>
        {latest && (
          <BenchmarkMetrics
            accuracy={latest.accuracy}
            precision={latest.precision}
            recall={latest.recall}
            f1Score={latest.f1Score}
            latencyMs={latest.latencyMs}
            throughputRps={latest.throughputRps}
          />
        )}
      </SectionCard>

      <SectionCard
        title='Benchmark Results Table'
        subtitle='Dataset-level evaluation history for owner-managed models'
      >
        <TableContainer sx={{ border: '1px solid #1e293b', borderRadius: 3, bgcolor: '#0a0e17' }}>
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#0e1422' }}>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Model</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Benchmark Dataset</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Provenance</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Test Date</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Accuracy</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Precision</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Recall</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>F1 Score</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Latency</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Throughput</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 700 }}>
                    {models.find((model) => model.id === row.modelId)?.name ?? row.modelId}
                  </TableCell>
                  <TableCell sx={{ color: '#38bdf8' }}>{row.dataset}</TableCell>
                  <TableCell>
                    <Chip
                      size='small'
                      label='Verified HF / Owner'
                      sx={{
                        bgcolor: 'rgba(74, 222, 128, 0.15)',
                        color: '#4ade80',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        height: 22,
                        border: '1px solid rgba(74, 222, 128, 0.3)',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{row.testDate}</TableCell>
                  <TableCell sx={{ color: '#4ade80', fontWeight: 700 }}>
                    {row.accuracy.toFixed(1)}%
                  </TableCell>
                  <TableCell sx={{ color: '#cbd5e1' }}>{row.precision.toFixed(1)}%</TableCell>
                  <TableCell sx={{ color: '#cbd5e1' }}>{row.recall.toFixed(1)}%</TableCell>
                  <TableCell sx={{ color: '#c084fc', fontWeight: 700 }}>
                    {row.f1Score.toFixed(1)}%
                  </TableCell>
                  <TableCell sx={{ color: '#fde047' }}>{row.latencyMs}ms</TableCell>
                  <TableCell sx={{ color: '#cbd5e1' }}>{row.throughputRps} rps</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      <SectionCard
        title='Add Benchmark Result'
        subtitle='Submit a new benchmark dataset evaluation'
      >
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              select
              label='Model'
              value={newResult.modelId}
              onChange={(event) => {
                setSaved(null)
                setNewResult({ ...newResult, modelId: event.target.value })
              }}
            >
              {models.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label='Benchmark Dataset'
              value={newResult.dataset}
              onChange={(event) => {
                setSaved(null)
                setNewResult({ ...newResult, dataset: event.target.value })
              }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type='date'
              label='Test Date'
              value={newResult.testDate}
              InputLabelProps={{ shrink: true }}
              onChange={(event) => {
                setSaved(null)
                setNewResult({ ...newResult, testDate: event.target.value })
              }}
            />
            <TextField
              fullWidth
              type='number'
              label='Accuracy (%)'
              value={newResult.accuracy}
              onChange={(event) => {
                setSaved(null)
                setNewResult({ ...newResult, accuracy: Number(event.target.value) })
              }}
            />
            <TextField
              fullWidth
              type='number'
              label='Precision (%)'
              value={newResult.precision}
              onChange={(event) => {
                setSaved(null)
                setNewResult({ ...newResult, precision: Number(event.target.value) })
              }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type='number'
              label='Recall (%)'
              value={newResult.recall}
              onChange={(event) => {
                setSaved(null)
                setNewResult({ ...newResult, recall: Number(event.target.value) })
              }}
            />
            <TextField
              fullWidth
              type='number'
              label='F1 Score (%)'
              value={newResult.f1Score}
              onChange={(event) => {
                setSaved(null)
                setNewResult({ ...newResult, f1Score: Number(event.target.value) })
              }}
            />
            <TextField
              fullWidth
              type='number'
              label='Latency (ms)'
              value={newResult.latencyMs}
              onChange={(event) => {
                setSaved(null)
                setNewResult({ ...newResult, latencyMs: Number(event.target.value) })
              }}
            />
            <TextField
              fullWidth
              type='number'
              label='Throughput (rps)'
              value={newResult.throughputRps}
              onChange={(event) => {
                setSaved(null)
                setNewResult({ ...newResult, throughputRps: Number(event.target.value) })
              }}
            />
          </Stack>
          <Button
            variant='contained'
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color='inherit' /> : <AddIcon />}
            sx={{
              alignSelf: 'flex-start',
              bgcolor: '#fb7185',
              color: '#0f172a',
              fontWeight: 800,
              px: 3,
              py: 1,
              borderRadius: 2.5,
              '&:hover': { bgcolor: '#f43f5e' },
            }}
            onClick={addBenchmarkResult}
          >
            Add Benchmark Result
          </Button>
          {saved && (
            <Alert
              severity='success'
              sx={{
                bgcolor: 'rgba(74, 222, 128, 0.15)',
                color: '#86efac',
                border: '1px solid rgba(74, 222, 128, 0.3)',
              }}
            >
              {saved}
            </Alert>
          )}
        </Stack>
      </SectionCard>
    </Stack>
  )
}
