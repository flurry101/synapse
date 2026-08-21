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
    <SectionCard title='My Models' subtitle='Published and in-progress model catalog'>
      {loading ? (
        <Stack alignItems='center' sx={{ py: 4 }}>
          <CircularProgress size={32} sx={{ color: '#fb7185' }} />
        </Stack>
      ) : models.length === 0 ? (
        <Alert
          severity='info'
          sx={{
            bgcolor: 'rgba(56, 189, 248, 0.1)',
            color: '#bae6fd',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}
        >
          No models listed yet. Click &quot;Add Model&quot; to create or import one.
        </Alert>
      ) : (
        <Stack spacing={2}>
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
