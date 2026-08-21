import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { DeveloperModel } from '../../mocks/developerData'

type PlaygroundProps = {
  models: DeveloperModel[]
  defaultInput: string
  output: {
    text: string
    responseTimeMs: number
    promptTokens: number
    completionTokens: number
    totalCost: string
  }
}

export default function Playground({ models, defaultInput, output }: PlaygroundProps) {
  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id ?? '')
  const [input, setInput] = useState(defaultInput)
  const [running, setRunning] = useState(false)
  const [hasResult, setHasResult] = useState(false)

  const onRun = () => {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      setHasResult(true)
    }, 850)
  }

  const onClear = () => {
    setInput('')
    setRunning(false)
    setHasResult(false)
  }

  return (
    <Stack spacing={2}>
      <TextField
        select
        label='Model selector'
        value={selectedModelId}
        onChange={(event) => setSelectedModelId(event.target.value)}
      >
        {models.map((model) => (
          <MenuItem key={model.id} value={model.id}>
            {model.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        multiline
        minRows={6}
        label='Sample input'
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />

      <Stack direction='row' spacing={1}>
        <Button onClick={onRun} variant='contained' startIcon={<PlayArrowIcon />}>
          Run / Test
        </Button>
        <Button onClick={onClear} variant='outlined' startIcon={<RestartAltIcon />}>
          Clear
        </Button>
      </Stack>

      {running && (
        <Stack direction='row' spacing={1} alignItems='center'>
          <CircularProgress size={20} />
          <Typography>Running mock inference...</Typography>
        </Stack>
      )}

      {!running && !hasResult && (
        <Alert severity='info'>Run a test to view mock output, response time, and token usage.</Alert>
      )}

      {!running && hasResult && (
        <Stack spacing={1}>
          <Alert severity='success'>Mock model output</Alert>
          <Typography sx={{ color: '#213a58' }}>{output.text}</Typography>
          <Typography variant='body2' sx={{ color: '#577191' }}>
            Response time: {output.responseTimeMs}ms
          </Typography>
          <Typography variant='body2' sx={{ color: '#577191' }}>
            Tokens: {output.promptTokens} prompt / {output.completionTokens} completion
          </Typography>
          <Typography variant='body2' sx={{ color: '#577191' }}>
            Usage cost: {output.totalCost}
          </Typography>
        </Stack>
      )}
    </Stack>
  )
}
