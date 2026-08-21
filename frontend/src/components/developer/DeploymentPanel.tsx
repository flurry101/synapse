import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import {
  Alert,
  Box,
  Button,
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
    <Stack spacing={2.5}>
      <Paper elevation={0} sx={{ border: '1px solid #dce5f2', borderRadius: 2.5, p: 2.5 }}>
        <Typography variant='h6' sx={{ fontWeight: 800, color: '#12304f', mb: 2 }}>
          Deploy Model & Issue API Key
        </Typography>

        <Stack spacing={2}>
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              select
              fullWidth
              label='Environment'
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
            >
              <MenuItem value='production'>Production</MenuItem>
              <MenuItem value='staging'>Staging</MenuItem>
              <MenuItem value='development'>Development</MenuItem>
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
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
            sx={{ alignSelf: 'flex-start', px: 3, py: 1 }}
          >
            {isDeploying ? 'Deploying...' : 'Provision Endpoint'}
          </Button>

          {successMessage && <Alert severity='success'>{successMessage}</Alert>}
        </Stack>
      </Paper>

      {deployments.length > 0 && (
        <Paper elevation={0} sx={{ border: '1px solid #dce5f2', borderRadius: 2.5, p: 2.5 }}>
          <Typography variant='h6' sx={{ fontWeight: 800, color: '#12304f', mb: 2 }}>
            Active Deployments & Endpoints ({deployments.length})
          </Typography>

          <Stack spacing={2}>
            {deployments.map((d) => (
              <Box
                key={d.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e1eaf5',
                  bgcolor: '#fafcff',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent='space-between'
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={1}
                >
                  <Box>
                    <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#0f3a5e' }}>
                      {d.model_name}
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#577191' }}>
                      Env: <strong>{d.environment}</strong> • Region: <strong>{d.region}</strong> •
                      RPM: {d.rate_limit_rpm}
                    </Typography>
                  </Box>
                  <Button
                    color='error'
                    size='small'
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => handleDelete(d.id)}
                  >
                    Revoke
                  </Button>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1}>
                  <Box>
                    <Typography variant='caption' sx={{ fontWeight: 600, color: '#486581' }}>
                      API Key:
                    </Typography>
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Typography
                        sx={{
                          fontFamily: 'monospace',
                          bgcolor: '#ffffff',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          border: '1px solid #dce5f2',
                          fontSize: 13,
                        }}
                      >
                        {d.api_key}
                      </Typography>
                      <Button
                        size='small'
                        onClick={() => onCopy(d.api_key)}
                        startIcon={<ContentCopyIcon />}
                      >
                        Copy Key
                      </Button>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant='caption' sx={{ fontWeight: 600, color: '#486581' }}>
                      Usage Example:
                    </Typography>
                    <Typography
                      component='pre'
                      sx={{
                        mt: 0.5,
                        mb: 0,
                        overflowX: 'auto',
                        p: 1.25,
                        borderRadius: 1.5,
                        bgcolor: '#0f1f33',
                        color: '#dbe9f8',
                        fontSize: 12.5,
                      }}
                    >
                      {d.curl_example ||
                        `curl -X POST ${d.endpoint_url} \\\n  -H "Authorization: Bearer ${d.api_key}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"input": "Hello world"}'`}
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
        <Alert severity='success' onClose={() => setCopiedText(null)}>
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </Stack>
  )
}
