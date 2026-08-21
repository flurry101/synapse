import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import PublishIcon from '@mui/icons-material/Publish'
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
  const [hfSearchInput, setHfSearchInput] = useState('')
  const [importStatus, setImportStatus] = useState<string | null>(null)

  const [form, setForm] = useState({
    modelName: '',
    huggingFaceId: '',
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
        setImportStatus(`Successfully populated metadata from Hugging Face repo '${targetRepo}'.`)
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
      trustScore: status === 'Published' ? 90 : 80,
      status,
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
        status === 'Published'
          ? `Model "${created.name}" published successfully!`
          : `Draft "${created.name}" saved successfully!`,
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

        <TextField
          label='Model Name'
          placeholder='e.g. Neuron Dialogue 3'
          value={form.modelName}
          onChange={(event) => setForm({ ...form, modelName: event.target.value })}
        />
        <TextField
          label='Hugging Face Model ID'
          placeholder='org/model-name'
          value={form.huggingFaceId}
          onChange={(event) => setForm({ ...form, huggingFaceId: event.target.value })}
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

        <Stack direction='row' spacing={1.5} sx={{ mt: 1 }}>
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
            disabled={isSubmitting}
            startIcon={<PublishIcon />}
            onClick={() => saveModel('Published')}
            sx={{
              bgcolor: '#fb7185',
              color: '#0f172a',
              fontWeight: 800,
              borderRadius: 2,
              '&:hover': { bgcolor: '#f43f5e' },
            }}
          >
            Publish to Hub
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
