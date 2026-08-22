import { Alert, Stack } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import OwnerModelCard from '../../components/owner/OwnerModelCard'
import { OwnerEmpty, OwnerError, OwnerLoading } from '../../components/owner/OwnerQueryState'
import SectionCard from '../../components/workspace/SectionCard'
import { OwnerModel, OwnerModelStatus } from '../../mocks/ownerData'
import modelService from '../../services/model.service'

export default function OwnerModels() {
  const [models, setModels] = useState<OwnerModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await modelService.getOwnerModels()
      setModels(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models.')
      setModels([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleDelete = async (modelId: string) => {
    setFeedback(null)
    try {
      await modelService.deleteOwnerModel(modelId)
      const data = await modelService.getOwnerModels()
      setModels(data)
      setFeedback({ type: 'success', message: 'Model deleted from the hub.' })
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete model.',
      })
    }
  }

  const handleStatus = async (modelId: string, status: OwnerModelStatus) => {
    setFeedback(null)
    try {
      await modelService.updateOwnerModel(modelId, { status })
      const data = await modelService.getOwnerModels()
      setModels(data)
      setFeedback({
        type: 'success',
        message: status === 'Published' ? 'Model published.' : 'Model unpublished (Draft).',
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update status.',
      })
    }
  }

  return (
    <SectionCard title='My Models' subtitle='Published and in-progress listings from the database'>
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
              feedback.type === 'success' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'
            }`,
          }}
        >
          {feedback.message}
        </Alert>
      )}

      {loading ? (
        <OwnerLoading label='Loading models...' />
      ) : error ? (
        <OwnerError message={error} onRetry={() => void load()} />
      ) : models.length === 0 ? (
        <OwnerEmpty
          title='No models yet'
          message='Add your first model to see it listed here.'
          actionLabel='Add your first model'
          actionTo='/owner/add-model'
        />
      ) : (
        <Stack spacing={2}>
          {models.map((model) => (
            <OwnerModelCard
              key={model.id}
              model={model}
              onView={(modelId) => navigate(`/owner/model-profile?model=${modelId}`)}
              onEdit={(modelId) => navigate(`/owner/model-profile?model=${modelId}`)}
              onDelete={handleDelete}
              onStatusChange={handleStatus}
            />
          ))}
        </Stack>
      )}
    </SectionCard>
  )
}
