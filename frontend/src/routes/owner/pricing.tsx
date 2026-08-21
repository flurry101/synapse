import { Alert, CircularProgress, MenuItem, Stack, TextField } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import PricingForm from '../../components/owner/PricingForm'
import SectionCard from '../../components/workspace/SectionCard'
import { type OwnerModel } from '../../mocks/ownerData'
import modelService from '../../services/model.service'

export default function OwnerPricing() {
  const [models, setModels] = useState<OwnerModel[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModelId, setSelectedModelId] = useState('')
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await modelService.getOwnerModels()
        if (active) {
          setModels(data)
          if (data.length > 0) {
            setSelectedModelId(data[0].id)
          }
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const selectedModel = useMemo(
    () => models.find((model) => model.id === selectedModelId) ?? models[0],
    [models, selectedModelId],
  )

  const savePricing = async (modelId: string, pricing: OwnerModel['pricing']) => {
    setSaved(null)
    try {
      const updated = await modelService.updateOwnerModel(modelId, { pricing })
      setModels((current) => current.map((m) => (m.id === modelId ? updated : m)))
      setSaved(`Pricing for "${updated.name}" updated successfully!`)
    } catch {
      setSaved('Failed to update pricing on backend.')
    }
  }

  if (loading) {
    return (
      <SectionCard title='Pricing & Monetization' subtitle='Loading pricing details...'>
        <Stack alignItems='center' sx={{ py: 4 }}>
          <CircularProgress size={32} sx={{ color: '#fb7185' }} />
        </Stack>
      </SectionCard>
    )
  }

  if (!selectedModel) {
    return (
      <SectionCard title='Pricing & Monetization' subtitle='Manage pricing'>
        <Alert
          severity='info'
          sx={{
            bgcolor: 'rgba(56, 189, 248, 0.1)',
            color: '#bae6fd',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}
        >
          No models found to configure pricing.
        </Alert>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title='Pricing & Monetization'
      subtitle='Manage per-request, token-based, and monthly retainer pricing tiers'
    >
      <Stack spacing={2.5}>
        <TextField
          select
          label='Select Model'
          value={selectedModel.id}
          onChange={(event) => {
            setSaved(null)
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
