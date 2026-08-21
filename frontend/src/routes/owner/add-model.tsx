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
      subtitle='Register a new model manually or import directly from the Hugging Face Hub'
    >
      <Stack spacing={2}>
        <Box sx={{ p: 2, bgcolor: '#f0f7ff', borderRadius: 2, border: '1px solid #cce3ff' }}>
          <Typography variant='subtitle2' sx={{ color: '#0052cc', fontWeight: 600, mb: 1 }}>
            Import from Hugging Face Hub
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
              color='primary'
              size='medium'
              disabled={isImporting}
              startIcon={
                isImporting ? <CircularProgress size={16} color='inherit' /> : <CloudDownloadIcon />
              }
              onClick={handleImportHf}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {isImporting ? 'Importing...' : 'Fetch HF Metadata'}
            </Button>
          </Stack>
          {importStatus && (
            <Alert severity='info' sx={{ mt: 1.5 }}>
              {importStatus}
            </Alert>
          )}
        </Box>

        <Divider />

        <TextField
          label='Model name'
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
          label='Task/category'
          value={form.task}
          onChange={(event) => setForm({ ...form, task: event.target.value })}
        >
          {ownerTaskOptions.map((task) => (
            <MenuItem key={task} value={task}>
              {task}
            </MenuItem>
          ))}
        </TextField>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <TextField
            fullWidth
            label='Version'
            value={form.version}
            onChange={(event) => setForm({ ...form, version: event.target.value })}
          />
          <TextField
            fullWidth
            select
            label='Model type'
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
        <Box>
          <Typography variant='subtitle2' sx={{ color: '#1d3a58', mb: 1 }}>
            Pricing & Monetization
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <TextField
              fullWidth
              type='number'
              label='Price per request ($)'
              value={form.pricePerRequest}
              onChange={(event) =>
                setForm({ ...form, pricePerRequest: Number(event.target.value) })
              }
            />
            <TextField
              fullWidth
              type='number'
              label='Price per 1K tokens ($)'
              value={form.pricePer1kTokens}
              onChange={(event) =>
                setForm({ ...form, pricePer1kTokens: Number(event.target.value) })
              }
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mt: 1.25 }}>
            <TextField
              fullWidth
              type='number'
              label='Optional monthly pricing ($)'
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
              <MenuItem value='USD'>USD</MenuItem>
              <MenuItem value='EUR'>EUR</MenuItem>
              <MenuItem value='INR'>INR</MenuItem>
            </TextField>
          </Stack>
        </Box>

        <Stack direction='row' spacing={1.5}>
          <Button
            variant='outlined'
            disabled={isSubmitting}
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => saveModel('Draft')}
          >
            Save Draft
          </Button>
          <Button
            variant='contained'
            disabled={isSubmitting}
            startIcon={<PublishIcon />}
            onClick={() => saveModel('Published')}
          >
            Publish to Hub
          </Button>
          <Button variant='text' onClick={() => navigate('/owner/models')}>
            View My Models
          </Button>
        </Stack>

        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
          {form.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
            .map((tag) => (
              <Chip key={tag} label={tag} size='small' />
            ))}
        </Stack>

        {submitted && <Alert severity='success'>{submitted}</Alert>}
      </Stack>
    </SectionCard>
  )
}
