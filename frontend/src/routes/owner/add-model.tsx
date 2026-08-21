import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import PublishIcon from '@mui/icons-material/Publish'
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import SectionCard from '../../components/workspace/SectionCard'
import {
  addOwnerModel,
  ownerModelTypeOptions,
  ownerTaskOptions,
  type OwnerModel,
} from '../../mocks/ownerData'

export default function OwnerAddModel() {
  const [submitted, setSubmitted] = useState<string | null>(null)
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

  const saveModel = (status: OwnerModel['status']) => {
    const slug = form.modelName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') || `model-${Date.now()}`
    const model: OwnerModel = {
      id: slug,
      name: form.modelName || 'Untitled Model',
      huggingFaceId: form.huggingFaceId || 'owner/mock-model-id',
      description: form.description || 'No description provided.',
      task: form.task,
      version: form.version || '1.0.0',
      modelType: form.modelType,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      trustScore: status === 'Published' ? 88 : 80,
      requests: 0,
      revenue: 0,
      status,
      owner: {
        name: 'Avery Johnson',
        email: 'avery@synapse.ai',
        organization: 'Neuron Labs',
      },
      pricing: {
        pricePerRequest: Number(form.pricePerRequest),
        pricePer1kTokens: Number(form.pricePer1kTokens),
        monthlyPrice: form.monthlyPrice === '' ? undefined : Number(form.monthlyPrice),
        currency: form.currency,
      },
    }

    addOwnerModel(model)
    setSubmitted(status === 'Published' ? 'Model published (mock).' : 'Draft saved (mock).')
  }

  return (
    <SectionCard title='Add Model' subtitle='Create and publish model metadata with local mock state'>
      <Stack spacing={1.25}>
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
          minRows={4}
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />
        <TextField select label='Task/category' value={form.task} onChange={(event) => setForm({ ...form, task: event.target.value })}>
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
            Pricing
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <TextField
              fullWidth
              type='number'
              label='Price per request'
              value={form.pricePerRequest}
              onChange={(event) => setForm({ ...form, pricePerRequest: Number(event.target.value) })}
            />
            <TextField
              fullWidth
              type='number'
              label='Price per 1K tokens'
              value={form.pricePer1kTokens}
              onChange={(event) => setForm({ ...form, pricePer1kTokens: Number(event.target.value) })}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mt: 1.25 }}>
            <TextField
              fullWidth
              type='number'
              label='Optional monthly pricing'
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

        <Stack direction='row' spacing={1}>
          <Button variant='outlined' startIcon={<AddCircleOutlineIcon />} onClick={() => saveModel('Draft')}>
            Save Draft
          </Button>
          <Button variant='contained' startIcon={<PublishIcon />} onClick={() => saveModel('Published')}>
            Publish
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
      </Stack>
      {submitted && <Alert severity='success'>{submitted} No backend API call was made.</Alert>}
    </SectionCard>
  )
}
