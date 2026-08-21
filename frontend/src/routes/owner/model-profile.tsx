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
      <SectionCard title='Model Profile / Edit' subtitle='Loading models...'>
        <Stack alignItems='center' sx={{ py: 4 }}>
          <CircularProgress size={32} />
        </Stack>
      </SectionCard>
    )
  }

  if (!selectedModel) {
    return (
      <SectionCard title='Model Profile / Edit' subtitle='No models available'>
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
    <SectionCard title='Model Profile / Edit' subtitle='Update model metadata, tags, and status'>
      <Stack spacing={2}>
        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
          {models.map((model) => (
            <Chip
              key={model.id}
              label={model.name}
              clickable
              color={selected === model.id ? 'primary' : 'default'}
              onClick={() => {
                setSelected(model.id)
                setSaved(null)
              }}
            />
          ))}
        </Stack>

        <TextField
          label='Model name'
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
          label='Hugging Face ID'
          value={selectedModel.huggingFaceId}
          onChange={(event) => updateField({ huggingFaceId: event.target.value })}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
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

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <TextField
            fullWidth
            label='Owner name'
            value={selectedModel.owner.name}
            InputProps={{ readOnly: true }}
          />
          <TextField
            fullWidth
            label='Owner email'
            value={selectedModel.owner.email}
            InputProps={{ readOnly: true }}
          />
        </Stack>
        <TextField
          label='Owner organization'
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
          <MenuItem value='Draft'>Draft</MenuItem>
          <MenuItem value='Published'>Published</MenuItem>
          <MenuItem value='Paused'>Paused</MenuItem>
        </TextField>

        <Button
          variant='contained'
          startIcon={isSaving ? <CircularProgress size={16} color='inherit' /> : <SaveIcon />}
          disabled={isSaving}
          sx={{ alignSelf: 'flex-start' }}
          onClick={saveChanges}
        >
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
        {saved && <Alert severity='success'>{saved}</Alert>}
      </Stack>
    </SectionCard>
  )
}
