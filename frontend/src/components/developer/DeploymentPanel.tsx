import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Alert, Button, Paper, Snackbar, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import type { DeveloperModel } from '../../mocks/developerData'

type DeploymentPanelProps = {
  selectedModelId: string
  models: DeveloperModel[]
  config: {
    environment: string
    region: string
    maxTokens: number
    temperature: number
    rateLimitRpm: number
    endpoint: string
    usageExample: string
  }
}

export default function DeploymentPanel({ selectedModelId, models, config }: DeploymentPanelProps) {
  const [copied, setCopied] = useState(false)

  const modelName = useMemo(
    () => models.find((model) => model.id === selectedModelId)?.name ?? selectedModelId,
    [models, selectedModelId],
  )

  const onCopy = async () => {
    await navigator.clipboard.writeText(config.endpoint)
    setCopied(true)
  }

  return (
    <Stack spacing={2}>
      <Alert severity='warning'>
        Mock/demo data only. Backend integration and real deployment are not implemented yet.
      </Alert>

      <Paper elevation={0} sx={{ border: '1px solid #dce5f2', borderRadius: 2.5, p: 2 }}>
        <Typography variant='h6' sx={{ fontWeight: 800, color: '#12304f' }}>
          Selected model: {modelName}
        </Typography>
        <Typography variant='body2' sx={{ mt: 1, color: '#577191' }}>
          Environment: {config.environment} • Region: {config.region} • Max tokens:{' '}
          {config.maxTokens} • Temperature: {config.temperature} • RPM limit: {config.rateLimitRpm}
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid #dce5f2', borderRadius: 2.5, p: 2 }}>
        <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#12304f' }}>
          Generated mock API endpoint
        </Typography>
        <Typography
          sx={{
            mt: 1,
            p: 1.25,
            borderRadius: 2,
            bgcolor: '#f4f8fd',
            fontFamily: 'monospace',
            color: '#214060',
          }}
        >
          {config.endpoint}
        </Typography>
        <Button
          onClick={onCopy}
          variant='outlined'
          startIcon={<ContentCopyIcon />}
          sx={{ mt: 1.5 }}
        >
          Copy endpoint
        </Button>
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid #dce5f2', borderRadius: 2.5, p: 2 }}>
        <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#12304f' }}>
          API usage example
        </Typography>
        <Typography
          component='pre'
          sx={{
            mt: 1,
            mb: 0,
            overflowX: 'auto',
            p: 1.25,
            borderRadius: 2,
            bgcolor: '#0f1f33',
            color: '#dbe9f8',
            fontSize: 13,
          }}
        >
          {config.usageExample}
        </Typography>
      </Paper>

      <Snackbar open={copied} autoHideDuration={1800} onClose={() => setCopied(false)}>
        <Alert severity='success' onClose={() => setCopied(false)}>
          Mock endpoint copied.
        </Alert>
      </Snackbar>
    </Stack>
  )
}
