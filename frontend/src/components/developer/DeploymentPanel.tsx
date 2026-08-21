import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import type { DeveloperModel } from '../../mocks/developerData'
import modelService, { Deployment } from '../../services/model.service'

type DeploymentPanelProps = {
  models: DeveloperModel[]
  initialModelId?: string
}

export default function DeploymentPanel({ models, initialModelId }: DeploymentPanelProps) {
  const [selectedModelId, setSelectedModelId] = useState(
    initialModelId && models.some((m) => m.id === initialModelId)
      ? initialModelId
      : (models[0]?.id ?? ''),
  )
  const [environment, setEnvironment] = useState('production')
  const [region, setRegion] = useState('us-east-1')
  const [maxTokens, setMaxTokens] = useState(1024)
  const [rateLimitRpm, setRateLimitRpm] = useState(180)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [isDeploying, setIsDeploying] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function loadDeployments() {
      try {
        const list = await modelService.getDeployments()
        if (active) setDeployments(list)
      } catch {
        // Fallback
      }
    }
    loadDeployments()
    return () => {
      active = false
    }
  }, [])

  const handleDeploy = async () => {
    setIsDeploying(true)
    setSuccessMessage(null)
    try {
      const created = await modelService.createDeployment({
        model_id: selectedModelId,
        environment,
        region,
        max_tokens: maxTokens,
        rate_limit_rpm: rateLimitRpm,
      })
      setDeployments((prev) => [created, ...prev])
      setSuccessMessage(`API Key & Endpoint provisioned for "${created.model_name}"!`)
    } catch {
      setSuccessMessage('Failed to create deployment.')
    } finally {
      setIsDeploying(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await modelService.deleteDeployment(id)
      setDeployments((prev) => prev.filter((d) => d.id !== id))
    } catch {
      // Ignored
    }
  }

  const onCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedText(text)
  }

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #1e293b',
          borderRadius: 3.5,
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: '#111622',
        }}
      >
        <Typography variant='h6' sx={{ fontWeight: 800, color: '#f8fafc', mb: 0.5 }}>
          Provision Production Endpoint & API Key
        </Typography>
        <Typography variant='body2' sx={{ color: '#94a3b8', mb: 3 }}>
          Configure inference parameters and instantly generate dedicated API keys.
        </Typography>

        <Stack spacing={2.5}>
          <TextField
            select
            fullWidth
            label='Target Model'
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
          >
            {models.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name} ({m.task})
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              fullWidth
              label='Environment'
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
            >
              <MenuItem value='production'>Production (P99 Isolated)</MenuItem>
              <MenuItem value='staging'>Staging (Pre-release)</MenuItem>
              <MenuItem value='development'>Development (Sandbox)</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label='Region'
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <MenuItem value='us-east-1'>US East (N. Virginia)</MenuItem>
              <MenuItem value='us-west-2'>US West (Oregon)</MenuItem>
              <MenuItem value='eu-central-1'>EU (Frankfurt)</MenuItem>
              <MenuItem value='ap-southeast-1'>Asia Pacific (Singapore)</MenuItem>
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              type='number'
              fullWidth
              label='Max Output Tokens'
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
            />
            <TextField
              type='number'
              fullWidth
              label='Rate Limit (RPM)'
              value={rateLimitRpm}
              onChange={(e) => setRateLimitRpm(Number(e.target.value))}
            />
          </Stack>

          <Button
            variant='contained'
            disabled={isDeploying}
            startIcon={
              isDeploying ? <CircularProgress size={16} color='inherit' /> : <RocketLaunchIcon />
            }
            onClick={handleDeploy}
            sx={{
              alignSelf: 'flex-start',
              bgcolor: '#4ade80',
              color: '#052e16',
              fontWeight: 800,
              px: 3.5,
              py: 1.25,
              borderRadius: 2.5,
              '&:hover': { bgcolor: '#22c55e' },
            }}
          >
            {isDeploying ? 'Deploying...' : 'Provision Endpoint'}
          </Button>

          {successMessage && (
            <Alert
              severity='success'
              sx={{
                bgcolor: 'rgba(74, 222, 128, 0.15)',
                color: '#86efac',
                border: '1px solid rgba(74, 222, 128, 0.3)',
              }}
            >
              {successMessage}
            </Alert>
          )}
        </Stack>
      </Paper>

      {deployments.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #1e293b',
            borderRadius: 3.5,
            p: { xs: 2.5, sm: 3.5 },
            bgcolor: '#111622',
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 800, color: '#f8fafc', mb: 2 }}>
            Active Deployments & Endpoints ({deployments.length})
          </Typography>

          <Stack spacing={2}>
            {deployments.map((d) => (
              <Box
                key={d.id}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid #1e293b',
                  bgcolor: '#0a0e17',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent='space-between'
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={1.5}
                >
                  <Box>
                    <Typography variant='subtitle1' sx={{ fontWeight: 800, color: '#f8fafc' }}>
                      {d.model_name}
                    </Typography>
                    <Stack direction='row' spacing={1} sx={{ mt: 0.5 }}>
                      <Chip
                        label={d.environment}
                        size='small'
                        sx={{
                          height: 22,
                          fontSize: 11,
                          bgcolor: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                        }}
                      />
                      <Chip
                        label={d.region}
                        size='small'
                        sx={{
                          height: 22,
                          fontSize: 11,
                          bgcolor: 'rgba(192, 132, 252, 0.15)',
                          color: '#c084fc',
                        }}
                      />
                      <Chip
                        label={`${d.rate_limit_rpm} RPM`}
                        size='small'
                        sx={{
                          height: 22,
                          fontSize: 11,
                          bgcolor: 'rgba(74, 222, 128, 0.15)',
                          color: '#4ade80',
                        }}
                      />
                    </Stack>
                  </Box>
                  <Button
                    color='error'
                    size='small'
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => handleDelete(d.id)}
                    sx={{
                      color: '#f87171',
                      borderColor: 'rgba(248, 113, 113, 0.3)',
                      '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' },
                    }}
                  >
                    Revoke Key
                  </Button>
                </Stack>

                <Divider sx={{ my: 2, borderColor: '#1e293b' }} />

                <Stack spacing={1.5}>
                  <Box>
                    <Typography
                      variant='caption'
                      sx={{
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Provisioned API Key:
                    </Typography>
                    <Stack
                      direction='row'
                      spacing={1.5}
                      alignItems='center'
                      sx={{ mt: 0.5 }}
                      useFlexGap
                      flexWrap='wrap'
                    >
                      <Typography
                        sx={{
                          fontFamily: 'monospace',
                          bgcolor: '#111622',
                          color: '#fde047',
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 1.5,
                          border: '1px solid #1e293b',
                          fontSize: 13,
                        }}
                      >
                        {d.api_key}
                      </Typography>
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={() => onCopy(d.api_key)}
                        startIcon={<ContentCopyIcon />}
                        sx={{
                          color: '#38bdf8',
                          borderColor: 'rgba(56, 189, 248, 0.3)',
                          '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)' },
                        }}
                      >
                        Copy Key
                      </Button>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography
                      variant='caption'
                      sx={{
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Production Integration Snippet:
                    </Typography>
                    <Typography
                      component='pre'
                      sx={{
                        mt: 0.75,
                        mb: 0,
                        overflowX: 'auto',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: '#111622',
                        border: '1px solid #1e293b',
                        color: '#38bdf8',
                        fontFamily: 'monospace',
                        fontSize: 12.5,
                        lineHeight: 1.6,
                      }}
                    >
                      {d.curl_example ||
                        `curl -X POST ${d.endpoint_url} \\\n  -H "Authorization: Bearer ${d.api_key}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"prompt": "Hello world", "max_tokens": ${d.max_tokens}}'`}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      <Snackbar
        open={Boolean(copiedText)}
        autoHideDuration={1800}
        onClose={() => setCopiedText(null)}
      >
        <Alert
          severity='success'
          onClose={() => setCopiedText(null)}
          sx={{ bgcolor: '#111622', color: '#4ade80', border: '1px solid #4ade80' }}
        >
          Copied API key to clipboard!
        </Alert>
      </Snackbar>
    </Stack>
  )
}
