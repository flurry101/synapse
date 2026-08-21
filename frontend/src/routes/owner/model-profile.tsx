import SaveIcon from '@mui/icons-material/Save'
import { Alert, Button, Chip, CircularProgress, MenuItem, Stack, TextField } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import SectionCard from '../../components/workspace/SectionCard'
import { OwnerModel } from '../../mocks/ownerData'
import modelService from '../../services/model.service'

export default function OwnerModelProfile() {
  const [searchParams] = useSearchParams()
  const [models, setModels] = useState<OwnerModel[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string>('')
  const [saved, setSaved] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let active = true
    async function loadModels() {
      try {
        const data = await modelService.getOwnerModels()
        if (active) {
          setModels(data)
          const paramModel = searchParams.get('model')
          const initial =
            paramModel && data.some((m) => m.id === paramModel) ? paramModel : data[0]?.id || ''
          setSelected(initial)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    loadModels()
    return () => {
      active = false
    }
  }, [searchParams])

  const selectedModel = useMemo(
    () => models.find((model) => model.id === selected) ?? models[0],
    [models, selected],
  )

  if (loading) {
    return (
      <SectionCard title='Model Profile & Settings' subtitle='Loading models...'>
        <Stack alignItems='center' sx={{ py: 4 }}>
          <CircularProgress size={32} sx={{ color: '#fb7185' }} />
        </Stack>
      </SectionCard>
    )
  }

  if (!selectedModel) {
    return (
      <SectionCard title='Model Profile & Settings' subtitle='No models available'>
        <Alert severity='info'>No models found in your account.</Alert>
      </SectionCard>
    )
  }

  const updateField = (partial: Partial<OwnerModel>) => {
    const updated = { ...selectedModel, ...partial }
    setModels((current) =>
      current.map((model) => (model.id === selectedModel.id ? updated : model)),
    )
    setSaved(null)
  }

  const saveChanges = async () => {
    setIsSaving(true)
    setSaved(null)
    try {
      await modelService.updateOwnerModel(selectedModel.id, selectedModel)
      setSaved(`Model "${selectedModel.name}" updated successfully!`)
    } catch {
      setSaved('Failed to update model on backend.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SectionCard
      title='Model Profile & Settings'
      subtitle='Update model metadata, tags, capabilities, and distribution status'
    >
      <Stack spacing={2.5}>
        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
          {models.map((model) => {
            const isSelected = selected === model.id
            return (
              <Chip
                key={model.id}
                label={model.name}
                clickable
                onClick={() => {
                  setSelected(model.id)
                  setSaved(null)
                }}
                sx={{
                  bgcolor: isSelected ? 'rgba(251, 113, 133, 0.15)' : '#0a0e17',
                  color: isSelected ? '#fb7185' : '#cbd5e1',
                  border: `1px solid ${isSelected ? '#fb7185' : '#1e293b'}`,
                  fontWeight: 700,
                  '&:hover': {
                    borderColor: '#fb7185',
                    bgcolor: 'rgba(251, 113, 133, 0.1)',
                  },
                }}
              />
            )
          })}
        </Stack>

        <TextField
          label='Model Name'
          value={selectedModel.name}
          onChange={(event) => updateField({ name: event.target.value })}
        />
        <TextField
          label='Description'
          multiline
          minRows={3}
          value={selectedModel.description}
          onChange={(event) => updateField({ description: event.target.value })}
        />
        <TextField
          label='Hugging Face Repo ID'
          value={selectedModel.huggingFaceId}
          onChange={(event) => updateField({ huggingFaceId: event.target.value })}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label='Task'
            value={selectedModel.task}
            onChange={(event) => updateField({ task: event.target.value })}
          />
          <TextField
            fullWidth
            label='Version'
            value={selectedModel.version}
            onChange={(event) => updateField({ version: event.target.value })}
          />
        </Stack>

        <TextField
          label='Tags (comma-separated)'
          value={selectedModel.tags.join(', ')}
          onChange={(event) =>
            updateField({
              tags: event.target.value
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0),
            })
          }
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label='Owner Name'
            value={selectedModel.owner.name}
            InputProps={{ readOnly: true }}
          />
          <TextField
            fullWidth
            label='Owner Email'
            value={selectedModel.owner.email}
            InputProps={{ readOnly: true }}
          />
        </Stack>
        <TextField
          label='Organization'
          value={selectedModel.owner.organization}
          onChange={(event) =>
            updateField({ owner: { ...selectedModel.owner, organization: event.target.value } })
          }
        />

        <TextField
          select
          label='Status'
          value={selectedModel.status}
          onChange={(event) =>
            updateField({ status: event.target.value as 'Draft' | 'Published' | 'Paused' })
          }
        >
          <MenuItem value='Draft'>Draft (Private)</MenuItem>
          <MenuItem value='Published'>Published (Public in Arena & Catalog)</MenuItem>
          <MenuItem value='Paused'>Paused (Temporarily disabled)</MenuItem>
        </TextField>

        <Button
          variant='contained'
          startIcon={isSaving ? <CircularProgress size={16} color='inherit' /> : <SaveIcon />}
          disabled={isSaving}
          sx={{
            alignSelf: 'flex-start',
            bgcolor: '#fb7185',
            color: '#0f172a',
            fontWeight: 800,
            px: 3,
            py: 1.2,
            borderRadius: 2.5,
            '&:hover': { bgcolor: '#f43f5e' },
          }}
          onClick={saveChanges}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        {saved && (
          <Alert
            severity='success'
            sx={{
              bgcolor: 'rgba(74, 222, 128, 0.15)',
              color: '#86efac',
              border: '1px solid rgba(74, 222, 128, 0.3)',
            }}
          >
            {saved}
          </Alert>
        )}
      </Stack>
    </SectionCard>
  )
}
