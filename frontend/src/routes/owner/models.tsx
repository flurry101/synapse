import { Alert, CircularProgress, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import OwnerModelCard from '../../components/owner/OwnerModelCard'
import SectionCard from '../../components/workspace/SectionCard'
import { OwnerModel } from '../../mocks/ownerData'
import modelService from '../../services/model.service'

export default function OwnerModels() {
  const [models, setModels] = useState<OwnerModel[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    async function fetchModels() {
      try {
        const data = await modelService.getOwnerModels()
        if (active) setModels(data)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchModels()
    return () => {
      active = false
    }
  }, [])

  return (
    <SectionCard title='My models' subtitle='Published and in-progress model catalog'>
      {loading ? (
        <Stack alignItems='center' sx={{ py: 4 }}>
          <CircularProgress size={32} />
        </Stack>
      ) : models.length === 0 ? (
        <Alert severity='info'>
          No models listed yet. Click &quot;Add Model&quot; to create one.
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          {models.map((model) => (
            <OwnerModelCard
              key={model.id}
              model={model}
              onView={(modelId) => navigate(`/owner/model-profile?model=${modelId}`)}
              onEdit={(modelId) => navigate(`/owner/model-profile?model=${modelId}`)}
            />
          ))}
        </Stack>
      )}
    </SectionCard>
  )
}
