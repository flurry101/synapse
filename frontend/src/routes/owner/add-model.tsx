import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import PublishIcon from '@mui/icons-material/Publish'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import SectionCard from '../../components/workspace/SectionCard'
import { ownerModelTypeOptions, ownerTaskOptions, type OwnerModel } from '../../mocks/ownerData'
import modelService from '../../services/model.service'

export default function OwnerAddModel() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationFeedback, setVerificationFeedback] = useState<{
    verified: boolean
    message: string
  } | null>(null)
  const [hfSearchInput, setHfSearchInput] = useState('')
  const [importStatus, setImportStatus] = useState<string | null>(null)

  const [form, setForm] = useState({
    modelName: '',
    huggingFaceId: '',
    repoUrl: '',
    hfToken: '',
    description: '',
    task: ownerTaskOptions[0],
    version: '1.0.0',
    modelType: ownerModelTypeOptions[0],
    tags: 'chat, productivity',
    pricePerRequest: 0.001,
    pricePer1kTokens: 0.015,
    monthlyPrice: '',
    currency: 'USD' as 'USD' | 'EUR' | 'INR',
  })

  const handleVerify = async () => {
    setIsVerifying(true)
    setVerificationFeedback(null)
    try {
      const res = await modelService.verifyModel({
        hugging_face_id: form.huggingFaceId.trim(),
        repo_url: form.repoUrl.trim(),
        hf_token: form.hfToken.trim() || undefined,
      })
      setIsVerified(res.verified)
      setVerificationFeedback({
        verified: res.verified,
        message: res.message,
      })
    } catch {
      setVerificationFeedback({
        verified: false,
        message: 'Verification check failed. Please verify your network and credentials.',
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleImportHf = async () => {
    const targetRepo = hfSearchInput.trim() || form.huggingFaceId.trim()
    if (!targetRepo) {
      setImportStatus(
        'Please enter a Hugging Face Repo ID (e.g. meta-llama/Llama-3.1-8B-Instruct).',
      )
      return
    }
    setIsImporting(true)
    setImportStatus(null)
    try {
      const details = await modelService.importHfModel(targetRepo)
      if (details) {
        setForm((prev) => ({
          ...prev,
          modelName: details.name || prev.modelName,
          huggingFaceId: details.hugging_face_id || targetRepo,
          description: details.description || prev.description,
          task: details.task || prev.task,
          tags: details.tags && details.tags.length > 0 ? details.tags.join(', ') : prev.tags,
          pricePerRequest: details.price_per_request ?? prev.pricePerRequest,
          pricePer1kTokens: details.price_per_1k_tokens ?? prev.pricePer1kTokens,
        }))
        setIsVerified(true)
        setVerificationFeedback({
          verified: true,
          message: `Hugging Face repository "${targetRepo}" verified directly with Hugging Face Hub.`,
        })
        setImportStatus(`Successfully populated metadata and verified repo '${targetRepo}'.`)
      } else {
        setImportStatus(
          'Could not fetch metadata from Hugging Face. Please fill in details manually.',
        )
      }
    } catch {
      setImportStatus('Error querying Hugging Face API.')
    } finally {
      setIsImporting(false)
    }
  }

  const saveModel = async (status: OwnerModel['status']) => {
    if (status === 'Published' && !isVerified) {
      setVerificationFeedback({
        verified: false,
        message:
          'Publication blocked: You must verify your Hugging Face model ID or Open-Weights repository (GitHub/GitLab) before publishing.',
      })
      return
    }

    setIsSubmitting(true)
    setSubmitted(null)
    const slug =
      form.modelName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-') || `model-${Date.now()}`

    const modelPayload: Partial<OwnerModel> = {
      id: slug,
      name: form.modelName || 'Untitled Model',
      huggingFaceId: form.huggingFaceId || '',
      description: form.description || 'No description provided.',
      task: form.task,
      version: form.version || '1.0.0',
      modelType: form.modelType,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      trustScore: isVerified ? 95 : 80,
      status: isVerified && status === 'Published' ? 'Published' : 'Draft',
      pricing: {
        pricePerRequest: Number(form.pricePerRequest),
        pricePer1kTokens: Number(form.pricePer1kTokens),
        monthlyPrice: form.monthlyPrice === '' ? undefined : Number(form.monthlyPrice),
        currency: form.currency,
      },
    }

    try {
      const created = await modelService.createOwnerModel(modelPayload)
      setSubmitted(
        created.status === 'Published'
          ? `Model "${created.name}" verified and published successfully to the hub!`
          : `Draft "${created.name}" saved successfully! (Verification required before public listing)`,
      )
    } catch {
      setSubmitted('Failed to save model to backend.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SectionCard
      title='Add Model'
      subtitle='Register a new model manually or auto-import metadata from the Hugging Face Hub'
    >
      <Stack spacing={2.5}>
        <Box
          sx={{
            p: 2.5,
            bgcolor: '#0a0e17',
            borderRadius: 3,
            border: '1px solid #1e293b',
          }}
        >
          <Typography
            variant='caption'
            sx={{
              color: '#38bdf8',
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              mb: 1,
              display: 'block',
            }}
          >
            Hugging Face Auto-Import
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems='center'>
            <TextField
              fullWidth
              size='small'
              placeholder='e.g. meta-llama/Llama-3.1-8B-Instruct or mistralai/Mistral-7B-Instruct-v0.3'
              value={hfSearchInput}
              onChange={(e) => setHfSearchInput(e.target.value)}
            />
            <Button
              variant='contained'
              disabled={isImporting}
              startIcon={
                isImporting ? <CircularProgress size={16} color='inherit' /> : <CloudDownloadIcon />
              }
              onClick={handleImportHf}
              sx={{
                bgcolor: '#38bdf8',
                color: '#090d16',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                px: 2.5,
                borderRadius: 2,
                '&:hover': { bgcolor: '#7dd3fc' },
              }}
            >
              {isImporting ? 'Importing...' : 'Fetch Metadata'}
            </Button>
          </Stack>
          {importStatus && (
            <Alert
              severity='info'
              sx={{
                mt: 2,
                bgcolor: 'rgba(56, 189, 248, 0.1)',
                color: '#bae6fd',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              {importStatus}
            </Alert>
          )}
        </Box>

        <Divider sx={{ borderColor: '#1e293b' }} />

        {/* Verification & Source Authenticity Section */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: isVerified ? 'rgba(74, 222, 128, 0.05)' : '#0a0e17',
            borderRadius: 3,
            border: '1px solid',
            borderColor: isVerified ? 'rgba(74, 222, 128, 0.4)' : '#1e293b',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent='space-between'
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Stack direction='row' spacing={1} alignItems='center'>
              <VerifiedUserIcon sx={{ color: isVerified ? '#4ade80' : '#fb7185' }} />
              <Typography variant='subtitle1' fontWeight={800} color='#f8fafc'>
                Model Source & Verification Guard
              </Typography>
            </Stack>
            <Chip
              icon={isVerified ? <CheckCircleIcon /> : <ErrorOutlineIcon />}
              label={isVerified ? 'Verified Authenticity' : 'Unverified (Draft Only)'}
              color={isVerified ? 'success' : 'default'}
              sx={{ fontWeight: 800 }}
            />
          </Stack>

          <Typography variant='body2' sx={{ color: '#94a3b8', mb: 2 }}>
            Synapse Public Model Hub requires verified ownership of the Hugging Face repository or
            an active Open Source repository (GitHub or GitLab) before listing models for developer
            use.
          </Typography>

          <Stack spacing={2}>
            <TextField
              fullWidth
              label='Hugging Face Model ID'
              placeholder='e.g. meta-llama/Llama-3.1-8B-Instruct or Qwen/Qwen3.8-27B'
              value={form.huggingFaceId}
              onChange={(event) => {
                setForm({ ...form, huggingFaceId: event.target.value })
                setIsVerified(false)
              }}
            />
            <TextField
              fullWidth
              label='Open-Weights Repository (GitHub / GitLab URL)'
              placeholder='e.g. https://github.com/meta-llama/llama3 or https://gitlab.com/...'
              value={form.repoUrl}
              onChange={(event) => {
                setForm({ ...form, repoUrl: event.target.value })
                setIsVerified(false)
              }}
            />
            <TextField
              fullWidth
              type='password'
              label='Optional Hugging Face Token (for private / gated repositories)'
              placeholder='hf_••••••••••••••••••••'
              value={form.hfToken}
              onChange={(event) => setForm({ ...form, hfToken: event.target.value })}
            />

            <Button
              variant='contained'
              disabled={isVerifying || (!form.huggingFaceId.trim() && !form.repoUrl.trim())}
              startIcon={
                isVerifying ? <CircularProgress size={16} color='inherit' /> : <VerifiedUserIcon />
              }
              onClick={handleVerify}
              sx={{
                alignSelf: 'flex-start',
                bgcolor: isVerified ? '#4ade80' : '#fb7185',
                color: isVerified ? '#052e16' : '#0f172a',
                fontWeight: 800,
                borderRadius: 2,
                px: 2.5,
                '&:hover': { bgcolor: isVerified ? '#22c55e' : '#f43f5e' },
              }}
            >
              {isVerifying ? 'Verifying with Registries...' : 'Verify Model Ownership'}
            </Button>
          </Stack>

          {verificationFeedback && (
            <Alert
              severity={verificationFeedback.verified ? 'success' : 'warning'}
              sx={{
                mt: 2,
                bgcolor: verificationFeedback.verified
                  ? 'rgba(74, 222, 128, 0.15)'
                  : 'rgba(253, 224, 71, 0.15)',
                color: verificationFeedback.verified ? '#86efac' : '#fde047',
                border: `1px solid ${
                  verificationFeedback.verified
                    ? 'rgba(74, 222, 128, 0.3)'
                    : 'rgba(253, 224, 71, 0.3)'
                }`,
              }}
            >
              {verificationFeedback.message}
            </Alert>
          )}
        </Box>

        <Divider sx={{ borderColor: '#1e293b' }} />

        <TextField
          label='Model Display Name'
          placeholder='e.g. Neuron Dialogue 3'
          value={form.modelName}
          onChange={(event) => setForm({ ...form, modelName: event.target.value })}
        />
        <TextField
          label='Description'
          multiline
          minRows={3}
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />
        <TextField
          select
          label='Task Category'
          value={form.task}
          onChange={(event) => setForm({ ...form, task: event.target.value })}
        >
          {ownerTaskOptions.map((task) => (
            <MenuItem key={task} value={task}>
              {task}
            </MenuItem>
          ))}
        </TextField>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label='Version'
            value={form.version}
            onChange={(event) => setForm({ ...form, version: event.target.value })}
          />
          <TextField
            fullWidth
            select
            label='Model Type'
            value={form.modelType}
            onChange={(event) => setForm({ ...form, modelType: event.target.value })}
          >
            {ownerModelTypeOptions.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <TextField
          label='Tags'
          placeholder='chat, enterprise, low-latency'
          value={form.tags}
          onChange={(event) => setForm({ ...form, tags: event.target.value })}
        />

        <Box sx={{ p: 2.5, bgcolor: '#0a0e17', borderRadius: 3, border: '1px solid #1e293b' }}>
          <Typography
            variant='caption'
            sx={{
              color: '#fb7185',
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              mb: 1.5,
              display: 'block',
            }}
          >
            Pricing & Monetization Settings
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type='number'
              label='Price Per Request ($)'
              value={form.pricePerRequest}
              onChange={(event) =>
                setForm({ ...form, pricePerRequest: Number(event.target.value) })
              }
            />
            <TextField
              fullWidth
              type='number'
              label='Price Per 1K Tokens ($)'
              value={form.pricePer1kTokens}
              onChange={(event) =>
                setForm({ ...form, pricePer1kTokens: Number(event.target.value) })
              }
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type='number'
              label='Optional Monthly Retainer ($)'
              value={form.monthlyPrice}
              onChange={(event) => setForm({ ...form, monthlyPrice: event.target.value })}
            />
            <TextField
              fullWidth
              select
              label='Currency'
              value={form.currency}
              onChange={(event) =>
                setForm({ ...form, currency: event.target.value as 'USD' | 'EUR' | 'INR' })
              }
            >
              <MenuItem value='USD'>USD ($)</MenuItem>
              <MenuItem value='EUR'>EUR (€)</MenuItem>
              <MenuItem value='INR'>INR (₹)</MenuItem>
            </TextField>
          </Stack>
        </Box>

        <Stack direction='row' spacing={1.5} sx={{ mt: 1 }} useFlexGap flexWrap='wrap'>
          <Button
            variant='outlined'
            disabled={isSubmitting}
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => saveModel('Draft')}
            sx={{
              color: '#cbd5e1',
              borderColor: '#1e293b',
              fontWeight: 700,
              borderRadius: 2,
              '&:hover': { borderColor: '#64748b', bgcolor: 'rgba(255, 255, 255, 0.05)' },
            }}
          >
            Save Draft
          </Button>
          <Button
            variant='contained'
            disabled={isSubmitting || !isVerified}
            startIcon={<PublishIcon />}
            onClick={() => saveModel('Published')}
            sx={{
              bgcolor: '#fb7185',
              color: '#0f172a',
              fontWeight: 800,
              borderRadius: 2,
              '&:hover': { bgcolor: '#f43f5e' },
              '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#64748b' },
            }}
          >
            {isVerified ? 'Publish to Hub' : 'Verification Required to Publish'}
          </Button>
          <Button
            variant='text'
            onClick={() => navigate('/owner/models')}
            sx={{ color: '#94a3b8', fontWeight: 700 }}
          >
            View My Models
          </Button>
        </Stack>

        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
          {form.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
            .map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size='small'
                sx={{ bgcolor: '#0a0e17', border: '1px solid #1e293b', color: '#cbd5e1' }}
              />
            ))}
        </Stack>

        {submitted && (
          <Alert
            severity='success'
            sx={{
              bgcolor: 'rgba(74, 222, 128, 0.15)',
              color: '#86efac',
              border: '1px solid rgba(74, 222, 128, 0.3)',
            }}
          >
            {submitted}
          </Alert>
        )}
      </Stack>
    </SectionCard>
  )
}
