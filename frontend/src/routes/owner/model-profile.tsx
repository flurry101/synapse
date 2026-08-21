import SaveIcon from '@mui/icons-material/Save'
import { Alert, Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import SectionCard from '../../components/workspace/SectionCard'
import { getOwnerModels, updateOwnerModel } from '../../mocks/ownerData'

export default function OwnerModelProfile() {
  const [searchParams] = useSearchParams()
  const [models, setModels] = useState(getOwnerModels())
  const initialModel = searchParams.get('model') ?? models[0]?.id
  const [selected, setSelected] = useState(initialModel)
  const [saved, setSaved] = useState(false)

  const selectedModel = useMemo(
    () => models.find((model) => model.id === selected) ?? models[0],
    [models, selected],
  )

  if (!selectedModel) {
    return null
  }

  const updateField = (partial: Partial<(typeof selectedModel)>) => {
    const updated = { ...selectedModel, ...partial }
    setModels((current) => current.map((model) => (model.id === selectedModel.id ? updated : model)))
    setSaved(false)
  }

  const saveChanges = () => {
    updateOwnerModel(selectedModel)
    setSaved(true)
  }

  return (
    <SectionCard title='Model Profile / Edit' subtitle='Update model metadata and owner-side controls (local mock state)'>
      <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
        {models.map((model) => (
          <Chip
            key={model.id}
            label={model.name}
            clickable
            color={selected === model.id ? 'primary' : 'default'}
            onClick={() => setSelected(model.id)}
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
        label='Tags'
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
        <TextField fullWidth label='Owner name' value={selectedModel.owner.name} InputProps={{ readOnly: true }} />
        <TextField fullWidth label='Owner email' value={selectedModel.owner.email} InputProps={{ readOnly: true }} />
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
        startIcon={<SaveIcon />}
        sx={{ alignSelf: 'flex-start' }}
        onClick={saveChanges}
      >
        Save changes
      </Button>
      <Typography variant='body2' sx={{ color: '#5f6f88' }}>
        Changes are local to this frontend demo and do not call backend services.
      </Typography>
      {saved && <Alert severity='success'>Model profile saved to local mock state.</Alert>}
    </SectionCard>
  )
}
