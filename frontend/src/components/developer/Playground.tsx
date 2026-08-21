import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { DeveloperModel } from '../../mocks/developerData'
import modelService, { PlaygroundResponse } from '../../services/model.service'

type PlaygroundProps = {
  models: DeveloperModel[]
  defaultInput: string
  initialModelId?: string
}

export default function Playground({ models, defaultInput, initialModelId }: PlaygroundProps) {
  const [selectedModelId, setSelectedModelId] = useState(
    initialModelId && models.some((m) => m.id === initialModelId)
      ? initialModelId
      : (models[0]?.id ?? ''),
  )
  const [input, setInput] = useState(defaultInput)
  const [temperature, setTemperature] = useState<number>(0.7)
  const [maxTokens, setMaxTokens] = useState<number>(256)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<PlaygroundResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onRun = async () => {
    if (!input.trim()) return
    setRunning(true)
    setError(null)
    try {
      const res = await modelService.runPlayground({
        model_id: selectedModelId,
        prompt: input,
        temperature,
        max_tokens: maxTokens,
      })
      setResult(res)
    } catch {
      setError('Error running playground inference.')
    } finally {
      setRunning(false)
    }
  }

  const onClear = () => {
    setInput('')
    setResult(null)
    setError(null)
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          fullWidth
          select
          label='Target Model'
          value={selectedModelId}
          onChange={(event) => setSelectedModelId(event.target.value)}
        >
          {models.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              {model.name} ({model.task})
            </MenuItem>
          ))}
        </TextField>
        <TextField
          type='number'
          label='Temperature'
          value={temperature}
          inputProps={{ step: 0.1, min: 0.0, max: 1.0 }}
          onChange={(e) => setTemperature(Number(e.target.value))}
          sx={{ width: { xs: '100%', sm: 140 } }}
        />
        <TextField
          type='number'
          label='Max Tokens'
          value={maxTokens}
          onChange={(e) => setMaxTokens(Number(e.target.value))}
          sx={{ width: { xs: '100%', sm: 140 } }}
        />
      </Stack>

      <TextField
        multiline
        minRows={5}
        label='Prompt input'
        placeholder='Type a prompt or instructions to test model behavior...'
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />

      <Stack direction='row' spacing={1}>
        <Button
          onClick={onRun}
          variant='contained'
          disabled={running || !input.trim()}
          startIcon={running ? <CircularProgress size={16} color='inherit' /> : <PlayArrowIcon />}
        >
          {running ? 'Executing...' : 'Run Inference'}
        </Button>
        <Button onClick={onClear} variant='outlined' startIcon={<RestartAltIcon />}>
          Clear
        </Button>
      </Stack>

      {error && <Alert severity='error'>{error}</Alert>}

      {!running && !result && (
        <Alert severity='info'>
          Run inference to view generated output, latency, token metrics, and cost calculation.
        </Alert>
      )}

      {result && (
        <Box
          sx={{
            p: 2,
            border: '1px solid #c8d6ea',
            borderRadius: 2,
            bgcolor: '#fafcff',
          }}
        >
          <Typography variant='subtitle2' sx={{ color: '#0f3a5e', fontWeight: 700, mb: 1 }}>
            Execution Output
          </Typography>
          <Typography
            sx={{
              color: '#213a58',
              whiteSpace: 'pre-wrap',
              bgcolor: '#ffffff',
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid #e1eaf5',
              fontFamily: 'inherit',
            }}
          >
            {result.output_text}
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mt: 1.5, color: '#577191' }}
            useFlexGap
            flexWrap='wrap'
          >
            <Typography variant='body2'>
              ⏱️ <strong>Latency:</strong> {result.latency_ms}ms
            </Typography>
            <Typography variant='body2'>
              📊 <strong>Tokens:</strong> {result.prompt_tokens} prompt + {result.completion_tokens}{' '}
              completion = {result.total_tokens} total
            </Typography>
            <Typography variant='body2'>
              💰 <strong>Estimated Cost:</strong> {result.cost_formatted}
            </Typography>
          </Stack>
        </Box>
      )}
    </Stack>
  )
}
