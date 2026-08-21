import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import type { DeveloperModel } from '../../mocks/developerData'

type ModelComparisonTableProps = {
  models: DeveloperModel[]
}

const higherIsBetterKeys: Array<keyof DeveloperModel['benchmarkResults']> = ['mmlu', 'humaneval', 'longContext']

export default function ModelComparisonTable({ models }: ModelComparisonTableProps) {
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
    <TableContainer sx={{ border: '1px solid #dce5f2', borderRadius: 2.5, backgroundColor: 'white' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f8fc' }}>
            <TableCell sx={{ fontWeight: 800 }}>Metric</TableCell>
            {models.map((model) => (
              <TableCell key={model.id} sx={{ fontWeight: 800 }}>
                {model.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Accuracy</TableCell>
            {models.map((model) => (
              <TableCell key={`${model.id}-accuracy`} sx={cellStyle(model.accuracy === bestAccuracy)}>
                {model.accuracy}%
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell>Trust score</TableCell>
            {models.map((model) => (
              <TableCell key={`${model.id}-trust`} sx={cellStyle(model.trustScore === bestTrust)}>
                {model.trustScore}%
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell>Latency</TableCell>
            {models.map((model) => (
              <TableCell key={`${model.id}-latency`} sx={cellStyle(model.latencyMs === bestLatency)}>
                {model.latencyMs}ms
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell>Price (input+output / 1M)</TableCell>
            {models.map((model) => (
              <TableCell
                key={`${model.id}-price`}
                sx={cellStyle(model.pricePerMInput + model.pricePerMOutput === bestPrice)}
              >
                ${(model.pricePerMInput + model.pricePerMOutput).toFixed(2)}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell>Benchmark: MMLU</TableCell>
            {models.map((model) => (
              <TableCell key={`${model.id}-mmlu`} sx={cellStyle(model.benchmarkResults.mmlu === bestBenchmarks.mmlu)}>
                {model.benchmarkResults.mmlu}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell>Benchmark: HumanEval</TableCell>
            {models.map((model) => (
              <TableCell
                key={`${model.id}-humaneval`}
                sx={cellStyle(model.benchmarkResults.humaneval === bestBenchmarks.humaneval)}
              >
                {model.benchmarkResults.humaneval}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell>Benchmark: Long Context</TableCell>
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
            <TableCell>Action</TableCell>
            {models.map((model) => (
              <TableCell key={`${model.id}-action`}>
                <Button variant='contained' size='small'>
                  Use this model
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
    return undefined
  }
  return {
    backgroundColor: '#edf7ed',
    color: '#1f5422',
    fontWeight: 800,
  }
}
