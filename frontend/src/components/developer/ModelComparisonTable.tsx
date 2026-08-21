import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useNavigate } from 'react-router'
import type { DeveloperModel } from '../../mocks/developerData'

type ModelComparisonTableProps = {
  models: DeveloperModel[]
}

const higherIsBetterKeys: Array<keyof DeveloperModel['benchmarkResults']> = [
  'mmlu',
  'humaneval',
  'longContext',
]

export default function ModelComparisonTable({ models }: ModelComparisonTableProps) {
  const navigate = useNavigate()
  if (models.length === 0) {
    return null
  }

  const bestAccuracy = Math.max(...models.map((model) => model.accuracy))
  const bestTrust = Math.max(...models.map((model) => model.trustScore))
  const bestLatency = Math.min(...models.map((model) => model.latencyMs))
  const bestPrice = Math.min(...models.map((model) => model.pricePerMInput + model.pricePerMOutput))

  const bestBenchmarks = higherIsBetterKeys.reduce<Record<string, number>>((acc, key) => {
    acc[key] = Math.max(...models.map((model) => model.benchmarkResults[key]))
    return acc
  }, {})

  return (
    <TableContainer
      sx={{
        border: '1px solid #1e293b',
        borderRadius: 3.5,
        backgroundColor: '#111622',
        overflowX: 'auto',
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#0e1422' }}>
            <TableCell sx={{ fontWeight: 800, color: '#94a3b8' }}>Metric</TableCell>
            {models.map((model) => (
              <TableCell key={model.id} sx={{ fontWeight: 800, color: '#f8fafc' }}>
                {model.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8' }}>Accuracy</TableCell>
            {models.map((model) => (
              <TableCell
                key={`${model.id}-accuracy`}
                sx={cellStyle(model.accuracy === bestAccuracy)}
              >
                {model.accuracy}% {model.accuracy === bestAccuracy && '🏆'}
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8' }}>Trust Score</TableCell>
            {models.map((model) => (
              <TableCell key={`${model.id}-trust`} sx={cellStyle(model.trustScore === bestTrust)}>
                {model.trustScore}% {model.trustScore === bestTrust && '🏆'}
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8' }}>P95 Latency</TableCell>
            {models.map((model) => (
              <TableCell
                key={`${model.id}-latency`}
                sx={cellStyle(model.latencyMs === bestLatency)}
              >
                {model.latencyMs}ms {model.latencyMs === bestLatency && '⚡'}
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8' }}>Price (1M tokens in+out)</TableCell>
            {models.map((model) => (
              <TableCell
                key={`${model.id}-price`}
                sx={cellStyle(model.pricePerMInput + model.pricePerMOutput === bestPrice)}
              >
                ${(model.pricePerMInput + model.pricePerMOutput).toFixed(2)}
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8' }}>MMLU Benchmark</TableCell>
            {models.map((model) => (
              <TableCell
                key={`${model.id}-mmlu`}
                sx={cellStyle(model.benchmarkResults.mmlu === bestBenchmarks.mmlu)}
              >
                {model.benchmarkResults.mmlu}
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8' }}>HumanEval Coding</TableCell>
            {models.map((model) => (
              <TableCell
                key={`${model.id}-humaneval`}
                sx={cellStyle(model.benchmarkResults.humaneval === bestBenchmarks.humaneval)}
              >
                {model.benchmarkResults.humaneval}
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8' }}>Long Context Retain</TableCell>
            {models.map((model) => (
              <TableCell
                key={`${model.id}-long-context`}
                sx={cellStyle(model.benchmarkResults.longContext === bestBenchmarks.longContext)}
              >
                {model.benchmarkResults.longContext}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: '#94a3b8' }}>Action</TableCell>
            {models.map((model) => (
              <TableCell key={`${model.id}-action`}>
                <Button
                  onClick={() => navigate(`/developer/playground?model=${model.id}`)}
                  variant='contained'
                  size='small'
                  sx={{
                    bgcolor: '#38bdf8',
                    color: '#090d16',
                    fontWeight: 800,
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#7dd3fc' },
                  }}
                >
                  Use Model
                </Button>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function cellStyle(highlight: boolean) {
  if (!highlight) {
    return { color: '#cbd5e1' }
  }
  return {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    color: '#4ade80',
    fontWeight: 800,
  }
}
