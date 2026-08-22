import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import {
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
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
  const bestPriceIn = Math.min(...models.map((model) => model.pricePerMInput))
  const bestPriceOut = Math.min(...models.map((model) => model.pricePerMOutput))

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
            <TableCell sx={{ fontWeight: 800, color: '#94a3b8', minWidth: 160 }}>
              Contender Spec
            </TableCell>
            {models.map((model) => (
              <TableCell key={model.id} sx={{ fontWeight: 900, color: '#f8fafc', minWidth: 200 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 900, color: '#38bdf8' }}>
                  {model.name}
                </Typography>
                <Typography variant='caption' sx={{ color: '#94a3b8', display: 'block' }}>
                  {model.creator || 'Community'} • {model.task}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Parameters Size</TableCell>
            {models.map((model) => (
              <TableCell key={`${model.id}-params`} sx={{ color: '#cbd5e1' }}>
                <Chip
                  label={model.parameters || '8B'}
                  size='small'
                  sx={{
                    bgcolor: 'rgba(168, 85, 247, 0.15)',
                    color: '#c084fc',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    fontWeight: 800,
                  }}
                />
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>License</TableCell>
            {models.map((model) => (
              <TableCell key={`${model.id}-license`} sx={{ color: '#cbd5e1' }}>
                <Chip
                  label={model.license || 'apache-2.0'}
                  size='small'
                  sx={{ bgcolor: '#0a0e17', color: '#94a3b8', border: '1px solid #1e293b' }}
                />
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Context Window</TableCell>
            {models.map((model) => (
              <TableCell key={`${model.id}-ctx`} sx={{ color: '#cbd5e1' }}>
                {model.contextWindow || '128K'} tokens
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Accuracy Benchmark</TableCell>
            {models.map((model) => (
              <TableCell
                key={`${model.id}-accuracy`}
                sx={cellStyle(model.accuracy === bestAccuracy)}
              >
                {model.accuracy}%
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Trust / Safety Score</TableCell>
            {models.map((model) => (
              <TableCell key={`${model.id}-trust`} sx={cellStyle(model.trustScore === bestTrust)}>
                {model.trustScore}%
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Latency (TTFT)</TableCell>
            {models.map((model) => (
              <TableCell
                key={`${model.id}-latency`}
                sx={cellStyle(model.latencyMs === bestLatency)}
              >
                {model.latencyMs}ms
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Input Pricing</TableCell>
            {models.map((model) => (
              <TableCell
                key={`${model.id}-price-in`}
                sx={cellStyle(model.pricePerMInput === bestPriceIn)}
              >
                ${model.pricePerMInput.toFixed(2)} / 1M tokens
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Output Pricing</TableCell>
            {models.map((model) => (
              <TableCell
                key={`${model.id}-price-out`}
                sx={cellStyle(model.pricePerMOutput === bestPriceOut)}
              >
                ${model.pricePerMOutput.toFixed(2)} / 1M tokens
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>MMLU Score</TableCell>
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
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>HumanEval Coding</TableCell>
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
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Long Context Retain</TableCell>
            {models.map((model) => (
              <TableCell
                key={`${model.id}-long-context`}
                sx={cellStyle(model.benchmarkResults.longContext === bestBenchmarks.longContext)}
              >
                {model.benchmarkResults.longContext}
              </TableCell>
            ))}
          </TableRow>
          <TableRow sx={{ backgroundColor: '#0e1422' }}>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>Actions</TableCell>
            {models.map((model) => {
              const targetId = model.huggingFaceId || model.id
              return (
                <TableCell key={`${model.id}-action`}>
                  <Stack direction='row' spacing={1}>
                    <Button
                      onClick={() =>
                        navigate(`/developer/playground?model=${encodeURIComponent(targetId)}`)
                      }
                      variant='outlined'
                      size='small'
                      startIcon={<PlayArrowIcon />}
                      sx={{
                        color: '#38bdf8',
                        borderColor: '#38bdf8',
                        fontWeight: 800,
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)', borderColor: '#7dd3fc' },
                      }}
                    >
                      Playground
                    </Button>
                    <Button
                      onClick={() =>
                        navigate(`/developer/deploy?model=${encodeURIComponent(targetId)}`)
                      }
                      variant='contained'
                      size='small'
                      startIcon={<RocketLaunchIcon />}
                      sx={{
                        bgcolor: '#4ade80',
                        color: '#052e16',
                        fontWeight: 800,
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#22c55e' },
                      }}
                    >
                      Deploy
                    </Button>
                  </Stack>
                </TableCell>
              )
            })}
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
