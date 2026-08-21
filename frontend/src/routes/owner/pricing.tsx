import { Alert, MenuItem, Stack, TextField } from '@mui/material'
import { useMemo, useState } from 'react'
import PricingForm from '../../components/owner/PricingForm'
import SectionCard from '../../components/workspace/SectionCard'
import { getOwnerModels, updateOwnerModel, type OwnerModel } from '../../mocks/ownerData'

export default function OwnerPricing() {
  const [models, setModels] = useState(getOwnerModels())
  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id ?? '')
  const [saved, setSaved] = useState(false)

  const selectedModel = useMemo(
    () => models.find((model) => model.id === selectedModelId) ?? models[0],
    [models, selectedModelId],
  )

  const savePricing = (modelId: string, pricing: OwnerModel['pricing']) => {
    const next = models.map((model) => (model.id === modelId ? { ...model, pricing } : model))
    setModels(next)
    const updated = next.find((model) => model.id === modelId)
    if (updated) {
      updateOwnerModel(updated)
    }
    setSaved(true)
  }

  if (!selectedModel) {
    return null
  }

  return (
    <SectionCard title='Pricing' subtitle='Manage pricing for requests, tokens, and optional monthly plans'>
      <TextField
        select
        label='Model'
        value={selectedModel.id}
        onChange={(event) => {
          setSaved(false)
          setSelectedModelId(event.target.value)
        }}
      >
        {models.map((model) => (
          <MenuItem key={model.id} value={model.id}>
            {model.name}
          </MenuItem>
        ))}
      </TextField>

      <PricingForm model={selectedModel} onSave={savePricing} />
      {saved && <Alert severity='success'>Pricing saved to local mock state.</Alert>}
    </SectionCard>
  )
}
