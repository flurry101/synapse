import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import SpeedIcon from '@mui/icons-material/Speed'
import TerminalIcon from '@mui/icons-material/Terminal'
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
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import type { DeveloperModel } from '../../mocks/developerData'
import modelService, { Deployment, DeploymentQuickstartSpecs } from '../../services/model.service'

type DeploymentPanelProps = {
  models: DeveloperModel[]
  initialModelId?: string
}

export default function DeploymentPanel({ models, initialModelId }: DeploymentPanelProps) {
  const [selectedModelId, setSelectedModelId] = useState(
    initialModelId &&
      models.some((m) => m.id === initialModelId || m.huggingFaceId === initialModelId)
      ? initialModelId
      : models[0]?.huggingFaceId || models[0]?.id || 'Qwen/Qwen3.8-27B',
  )
  const [environment, setEnvironment] = useState('production')
  const [region, setRegion] = useState('us-east-2')
  const [maxTokens, setMaxTokens] = useState(1024)
  const [rateLimitRpm, setRateLimitRpm] = useState(30)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [isDeploying, setIsDeploying] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [specsLoading, setSpecsLoading] = useState(false)
  const [hfSpecs, setHfSpecs] = useState<DeploymentQuickstartSpecs | null>(null)
  const [codeTab, setCodeTab] = useState(0)

  useEffect(() => {
    let active = true
    async function loadSpecs() {
      if (!selectedModelId) return
      setSpecsLoading(true)
      try {
        const data = await modelService.getHfSpecs(selectedModelId)
        if (active) setHfSpecs(data)
      } finally {
        if (active) setSpecsLoading(false)
      }
    }
    loadSpecs()
    return () => {
      active = false
    }
  }, [selectedModelId])

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
    <Stack spacing={3.5}>
      {/* SECTION 1: Hugging Face Inference Quickstart & Live Specs */}
      <Paper
        elevation={0}
        sx={{
          border: '2px solid #38bdf8',
          borderRadius: 3.5,
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: '#0a0f1d',
          boxShadow: '0 0 25px rgba(56, 189, 248, 0.12)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Chip
                label='Official Hugging Face Quickstart'
                size='small'
                sx={{
                  bgcolor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  fontWeight: 800,
                }}
              />
              <Chip
                icon={<SpeedIcon sx={{ fontSize: 16, color: '#4ade80 !important' }} />}
                label='Rate Limiting & Uptime Guard Active'
                size='small'
                sx={{
                  bgcolor: 'rgba(74, 222, 128, 0.15)',
                  color: '#4ade80',
                  border: '1px solid rgba(74, 222, 128, 0.4)',
                  fontWeight: 800,
                }}
              />
            </Stack>
            <Typography variant='h5' sx={{ fontWeight: 900, color: '#f8fafc', mt: 1 }}>
              Getting Started with {hfSpecs?.model_name || selectedModelId}
            </Typography>
            <Typography variant='body2' sx={{ color: '#94a3b8', mt: 0.5 }}>
              One base URL, standard OpenAI API format, model ID{' '}
              <code style={{ color: '#f8fafc' }}>{selectedModelId}</code>.
            </Typography>
          </Box>

          <Stack direction='row' spacing={1.5} useFlexGap flexWrap='wrap'>
            {hfSpecs?.direct_deploy_url && (
              <Button
                component='a'
                href={hfSpecs.direct_deploy_url}
                target='_blank'
                rel='noopener noreferrer'
                variant='contained'
                endIcon={<OpenInNewIcon />}
                sx={{
                  bgcolor: '#ff9800',
                  color: '#1a1001',
                  fontWeight: 900,
                  borderRadius: 2.5,
                  '&:hover': { bgcolor: '#fb8c00' },
                }}
              >
                1-Click Dedicated HF Deploy
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Model Selector for Quickstart Specs */}
        <TextField
          select
          fullWidth
          size='small'
          label='Select Active Model for Quickstart & Telemetry'
          value={selectedModelId}
          onChange={(e) => setSelectedModelId(e.target.value)}
          sx={{ mb: 3 }}
        >
          {models.map((m) => {
            const val = m.huggingFaceId || m.id
            return (
              <MenuItem key={val} value={val}>
                {m.name} ({val}) · {m.task}
              </MenuItem>
            )
          })}
        </TextField>

        {specsLoading ? (
          <Stack alignItems='center' sx={{ py: 6 }}>
            <CircularProgress size={32} sx={{ color: '#38bdf8' }} />
          </Stack>
        ) : hfSpecs ? (
          <Stack spacing={3}>
            {/* Endpoint URL display */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: '#050811',
                border: '1px solid #1e293b',
              }}
            >
              <Typography
                variant='caption'
                sx={{ color: '#94a3b8', fontWeight: 800, letterSpacing: 0.5 }}
              >
                OPENAI COMPATIBLE BASE URL
              </Typography>
              <Stack
                direction='row'
                spacing={2}
                alignItems='center'
                justifyContent='space-between'
                sx={{ mt: 0.5 }}
              >
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    color: '#38bdf8',
                    fontSize: '0.95rem',
                    wordBreak: 'break-all',
                  }}
                >
                  {hfSpecs.endpoint_url}
                </Typography>
                <Button
                  size='small'
                  startIcon={<ContentCopyIcon />}
                  onClick={() => onCopy(hfSpecs.endpoint_url)}
                  sx={{ color: '#38bdf8', fontWeight: 700 }}
                >
                  Copy
                </Button>
              </Stack>
            </Box>

            {/* Quickstart Code Tabs */}
            <Box>
              <Tabs
                value={codeTab}
                onChange={(_, v) => setCodeTab(v)}
                variant='scrollable'
                scrollButtons={false}
                sx={{
                  borderBottom: '1px solid #1e293b',
                  mb: 1.5,
                  '& .MuiTab-root': {
                    color: '#94a3b8',
                    fontWeight: 800,
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    '&.Mui-selected': { color: '#38bdf8' },
                  },
                  '& .MuiTabs-indicator': { bgcolor: '#38bdf8' },
                }}
              >
                <Tab
                  icon={<TerminalIcon fontSize='small' />}
                  iconPosition='start'
                  label='Terminal — curl'
                />
                <Tab label='quickstart.py' />
                <Tab label='vision.py' />
                <Tab label='~/.pi/agent/models.json' />
                <Tab label='Terminal (pi command)' />
              </Tabs>

              {codeTab === 0 && <CodeSnippetBlock code={hfSpecs.curl_snippet} onCopy={onCopy} />}
              {codeTab === 1 && (
                <CodeSnippetBlock code={hfSpecs.quickstart_python} onCopy={onCopy} />
              )}
              {codeTab === 2 && <CodeSnippetBlock code={hfSpecs.vision_python} onCopy={onCopy} />}
              {codeTab === 3 && <CodeSnippetBlock code={hfSpecs.pi_models_json} onCopy={onCopy} />}
              {codeTab === 4 && <CodeSnippetBlock code={hfSpecs.pi_zsh_command} onCopy={onCopy} />}
            </Box>

            {/* Hardware & Endpoint Specifications */}
            <Box>
              <Typography variant='subtitle2' sx={{ fontWeight: 900, color: '#f8fafc', mb: 1.5 }}>
                Hardware & Endpoint Telemetry (Verified Live)
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 1.5,
                }}
              >
                {Object.entries(hfSpecs.specs).map(([key, val]) => (
                  <Box
                    key={key}
                    sx={{
                      p: 1.75,
                      borderRadius: 2,
                      bgcolor: '#0e1424',
                      border: '1px solid #1e293b',
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{ color: '#94a3b8', fontWeight: 700, display: 'block' }}
                    >
                      {key}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ color: '#f8fafc', fontWeight: 800, mt: 0.25 }}
                    >
                      {val}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Stack>
        ) : null}
      </Paper>

      {/* SECTION 2: Generate Dedicated Synapse API Key & Production Gateway */}
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
          Provision Synapse Managed Gateway & API Keys
        </Typography>
        <Typography variant='body2' sx={{ color: '#94a3b8', mb: 3 }}>
          Configure inference parameters, regional endpoints, and custom rate limits for your apps.
        </Typography>

        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              fullWidth
              label='Environment'
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
            >
              <MenuItem value='production'>Production (Isolated High-Throughput)</MenuItem>
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
              <MenuItem value='us-east-2'>US East (Ohio - AWS)</MenuItem>
              <MenuItem value='us-east-1'>US East (N. Virginia)</MenuItem>
              <MenuItem value='us-west-2'>US West (Oregon)</MenuItem>
              <MenuItem value='eu-central-1'>EU (Frankfurt)</MenuItem>
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
            {isDeploying ? 'Deploying...' : 'Provision Synapse Gateway Key'}
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

      {/* SECTION 3: Active Deployments List */}
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
            Active Production Deployments ({deployments.length})
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
                        `curl ${d.endpoint_url}/chat/completions \\\n  -H "Authorization: Bearer ${d.api_key}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model": "${d.model_id}", "messages": [{"role": "user", "content": "Hello world"}], "max_tokens": ${d.max_tokens}}'`}
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
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </Stack>
  )
}

function CodeSnippetBlock({ code, onCopy }: { code: string; onCopy: (text: string) => void }) {
  return (
    <Box sx={{ position: 'relative' }}>
      <Button
        size='small'
        startIcon={<ContentCopyIcon />}
        onClick={() => onCopy(code)}
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          color: '#94a3b8',
          bgcolor: 'rgba(30, 41, 59, 0.8)',
          '&:hover': { bgcolor: '#334155', color: '#f8fafc' },
          fontSize: '0.75rem',
          borderRadius: 1.5,
          zIndex: 2,
        }}
      >
        Copy
      </Button>
      <Typography
        component='pre'
        sx={{
          m: 0,
          p: 2.5,
          borderRadius: 2.5,
          bgcolor: '#050811',
          border: '1px solid #1e293b',
          color: '#38bdf8',
          fontFamily: 'monospace',
          fontSize: 13,
          lineHeight: 1.6,
          overflowX: 'auto',
        }}
      >
        {code}
      </Typography>
    </Box>
  )
}
