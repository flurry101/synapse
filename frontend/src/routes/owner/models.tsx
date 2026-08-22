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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )
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

  const handleDelete = async (modelId: string) => {
    try {
      await modelService.deleteOwnerModel(modelId)
      setModels((current) => current.filter((m) => m.id !== modelId))
      setFeedback({ type: 'success', message: 'Model deleted successfully from the hub.' })
    } catch {
      setFeedback({ type: 'error', message: 'Failed to delete model from the backend.' })
    }
  }

  return (
    <SectionCard title='My Models' subtitle='Published and in-progress model catalog'>
      {feedback && (
        <Alert
          severity={feedback.type}
          onClose={() => setFeedback(null)}
          sx={{
            mb: 2.5,
            bgcolor:
              feedback.type === 'success'
                ? 'rgba(74, 222, 128, 0.15)'
                : 'rgba(248, 113, 113, 0.15)',
            color: feedback.type === 'success' ? '#86efac' : '#fca5a5',
            border: `1px solid ${
              feedback.type === 'success'
                ? 'rgba(74, 222, 128, 0.3)'
                : 'rgba(248, 113, 113, 0.3)'
            }`,
          }}
        >
          {feedback.message}
        </Alert>
      )}

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
              onDelete={handleDelete}
            />
          ))}
        </Stack>
      )}
    </SectionCard>
  )
}
