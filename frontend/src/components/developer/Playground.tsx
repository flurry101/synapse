import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
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
    initialModelId ||
      models[0]?.huggingFaceId ||
      models[0]?.id ||
      'meta-llama/Llama-3.1-8B-Instruct',
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

  const isCustomModel =
    selectedModelId &&
    !models.some((m) => m.id === selectedModelId || m.huggingFaceId === selectedModelId)

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          select
          label='Target Model'
          value={selectedModelId}
          onChange={(event) => setSelectedModelId(event.target.value)}
        >
          {isCustomModel && (
            <MenuItem key={selectedModelId} value={selectedModelId}>
              {selectedModelId} (Hugging Face)
            </MenuItem>
          )}
          {models.map((model) => {
            const val = model.huggingFaceId || model.id
            return (
              <MenuItem key={val} value={val}>
                {model.name} ({val}) · {model.task}
              </MenuItem>
            )
          })}
        </TextField>
        <TextField
          type='number'
          label='Temperature'
          value={temperature}
          inputProps={{ step: 0.1, min: 0.0, max: 1.0 }}
          onChange={(e) => setTemperature(Number(e.target.value))}
          sx={{ width: { xs: '100%', sm: 150 } }}
        />
        <TextField
          type='number'
          label='Max Tokens'
          value={maxTokens}
          onChange={(e) => setMaxTokens(Number(e.target.value))}
          sx={{ width: { xs: '100%', sm: 150 } }}
        />
      </Stack>

      <TextField
        multiline
        minRows={5}
        label='Prompt Input'
        placeholder='Type a prompt or instructions to test model behavior...'
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />

      <Stack direction='row' spacing={1.5}>
        <Button
          onClick={onRun}
          variant='contained'
          disabled={running || !input.trim()}
          startIcon={running ? <CircularProgress size={16} color='inherit' /> : <PlayArrowIcon />}
          sx={{
            bgcolor: '#4ade80',
            color: '#052e16',
            fontWeight: 800,
            px: 3,
            '&:hover': { bgcolor: '#22c55e' },
          }}
        >
          {running ? 'Running Model...' : 'Run Inference'}
        </Button>
        <Button
          onClick={onClear}
          variant='outlined'
          startIcon={<RestartAltIcon />}
          sx={{
            color: '#94a3b8',
            borderColor: '#1e293b',
            '&:hover': { borderColor: '#64748b', bgcolor: 'rgba(255, 255, 255, 0.05)' },
          }}
        >
          Clear
        </Button>
        <Button
          component='a'
          href={`https://huggingface.co/spaces?q=${encodeURIComponent(selectedModelId)}`}
          target='_blank'
          rel='noopener noreferrer'
          variant='outlined'
          sx={{
            color: '#c084fc',
            borderColor: 'rgba(192, 132, 252, 0.3)',
            fontWeight: 700,
            '&:hover': { borderColor: '#c084fc', bgcolor: 'rgba(192, 132, 252, 0.08)' },
          }}
        >
          Explore Spaces for Model ↗
        </Button>
      </Stack>

      {error && (
        <Alert
          severity='error'
          sx={{
            bgcolor: 'rgba(248, 113, 113, 0.15)',
            border: '1px solid rgba(248, 113, 113, 0.3)',
            color: '#fca5a5',
          }}
        >
          {error}
        </Alert>
      )}

      {!running && !result && (
        <Alert
          severity='info'
          sx={{
            bgcolor: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#bae6fd',
            '& .MuiAlert-icon': { color: '#38bdf8' },
          }}
        >
          Run inference to view generated output, latency, token metrics, and cost calculation.
        </Alert>
      )}

      {result && (
        <Box
          sx={{
            p: 2.5,
            border: '1px solid #1e293b',
            borderRadius: 3,
            bgcolor: '#0a0e17',
          }}
        >
          <Typography
            variant='caption'
            sx={{
              color: '#38bdf8',
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              mb: 1.5,
              display: 'block',
            }}
          >
            Live Execution Output
          </Typography>
          <Paper
            elevation={0}
            sx={{
              color: '#f8fafc',
              whiteSpace: 'pre-wrap',
              bgcolor: '#111622',
              p: 2,
              borderRadius: 2,
              border: '1px solid #1e293b',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
          >
            {result.output_text}
          </Paper>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ mt: 2 }}
            useFlexGap
            flexWrap='wrap'
          >
            <Chip
              label={`Latency: ${result.latency_ms}ms`}
              sx={{
                bgcolor: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                fontWeight: 700,
              }}
            />
            <Chip
              label={`Tokens: ${result.prompt_tokens} prompt + ${result.completion_tokens} completion (${result.total_tokens} total)`}
              sx={{
                bgcolor: 'rgba(74, 222, 128, 0.12)',
                color: '#4ade80',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                fontWeight: 700,
              }}
            />
            <Chip
              label={`Cost: ${result.cost_formatted}`}
              sx={{
                bgcolor: 'rgba(192, 132, 252, 0.12)',
                color: '#c084fc',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                fontWeight: 700,
              }}
            />
          </Stack>
        </Box>
      )}
    </Stack>
  )
}
