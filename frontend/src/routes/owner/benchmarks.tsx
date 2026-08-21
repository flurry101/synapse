import AddIcon from '@mui/icons-material/Add'
import {
  Alert,
  Button,
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
import { useMemo, useState } from 'react'
import BenchmarkMetrics from '../../components/owner/BenchmarkMetrics'
import SectionCard from '../../components/workspace/SectionCard'
import {
  getOwnerBenchmarks,
  getOwnerModels,
  saveOwnerBenchmarks,
  type BenchmarkResult,
} from '../../mocks/ownerData'

export default function OwnerBenchmarks() {
  const [models] = useState(getOwnerModels())
  const [rows, setRows] = useState(getOwnerBenchmarks())
  const [saved, setSaved] = useState(false)
  const [newResult, setNewResult] = useState({
    modelId: models[0]?.id ?? '',
    dataset: 'Synapse Eval v2',
    testDate: new Date().toISOString().slice(0, 10),
    accuracy: 89,
    precision: 88,
    recall: 87,
    f1Score: 87.5,
    latencyMs: 240,
    throughputRps: 40,
  })

  const latest = useMemo(() => rows[0], [rows])

  const addBenchmarkResult = () => {
    const result: BenchmarkResult = {
      id: `bm-${Date.now()}`,
      modelId: newResult.modelId,
      dataset: newResult.dataset,
      testDate: newResult.testDate,
      accuracy: Number(newResult.accuracy),
      precision: Number(newResult.precision),
      recall: Number(newResult.recall),
      f1Score: Number(newResult.f1Score),
      latencyMs: Number(newResult.latencyMs),
      throughputRps: Number(newResult.throughputRps),
    }
    const updated = [result, ...rows]
    setRows(updated)
    saveOwnerBenchmarks(updated)
    setSaved(true)
  }

  return (
    <Stack spacing={2.25}>
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

      <SectionCard title='Benchmark results table' subtitle='Dataset-level test history for owner-managed models'>
        <TableContainer sx={{ border: '1px solid #dce5f2', borderRadius: 2.5 }}>
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f6f9fe' }}>
                <TableCell sx={{ fontWeight: 800 }}>Model</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Benchmark dataset</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Test date</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Accuracy</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Precision</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Recall</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>F1 score</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Latency</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Throughput</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{models.find((model) => model.id === row.modelId)?.name ?? row.modelId}</TableCell>
                  <TableCell>{row.dataset}</TableCell>
                  <TableCell>{row.testDate}</TableCell>
                  <TableCell>{row.accuracy.toFixed(1)}%</TableCell>
                  <TableCell>{row.precision.toFixed(1)}%</TableCell>
                  <TableCell>{row.recall.toFixed(1)}%</TableCell>
                  <TableCell>{row.f1Score.toFixed(1)}%</TableCell>
                  <TableCell>{row.latencyMs}ms</TableCell>
                  <TableCell>{row.throughputRps} rps</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      <SectionCard title='Add Benchmark Result' subtitle='Mock/local entry only'>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <TextField
            fullWidth
            select
            label='Model'
            value={newResult.modelId}
            onChange={(event) => {
              setSaved(false)
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
            label='Benchmark dataset'
            value={newResult.dataset}
            onChange={(event) => {
              setSaved(false)
              setNewResult({ ...newResult, dataset: event.target.value })
            }}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <TextField
            fullWidth
            type='date'
            label='Test date'
            value={newResult.testDate}
            InputLabelProps={{ shrink: true }}
            onChange={(event) => {
              setSaved(false)
              setNewResult({ ...newResult, testDate: event.target.value })
            }}
          />
          <TextField
            fullWidth
            type='number'
            label='Accuracy'
            value={newResult.accuracy}
            onChange={(event) => {
              setSaved(false)
              setNewResult({ ...newResult, accuracy: Number(event.target.value) })
            }}
          />
          <TextField
            fullWidth
            type='number'
            label='Precision'
            value={newResult.precision}
            onChange={(event) => {
              setSaved(false)
              setNewResult({ ...newResult, precision: Number(event.target.value) })
            }}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <TextField
            fullWidth
            type='number'
            label='Recall'
            value={newResult.recall}
            onChange={(event) => {
              setSaved(false)
              setNewResult({ ...newResult, recall: Number(event.target.value) })
            }}
          />
          <TextField
            fullWidth
            type='number'
            label='F1 score'
            value={newResult.f1Score}
            onChange={(event) => {
              setSaved(false)
              setNewResult({ ...newResult, f1Score: Number(event.target.value) })
            }}
          />
          <TextField
            fullWidth
            type='number'
            label='Latency (ms)'
            value={newResult.latencyMs}
            onChange={(event) => {
              setSaved(false)
              setNewResult({ ...newResult, latencyMs: Number(event.target.value) })
            }}
          />
          <TextField
            fullWidth
            type='number'
            label='Throughput (rps)'
            value={newResult.throughputRps}
            onChange={(event) => {
              setSaved(false)
              setNewResult({ ...newResult, throughputRps: Number(event.target.value) })
            }}
          />
        </Stack>
        <Button variant='contained' startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }} onClick={addBenchmarkResult}>
          Add Benchmark Result
        </Button>
        {saved && <Alert severity='success'>Benchmark result added to local mock state.</Alert>}
      </SectionCard>
    </Stack>
  )
}
