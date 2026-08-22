import { Add } from '@mui/icons-material'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import OwnerModelCard from '../../components/owner/OwnerModelCard'
import { OwnerEmpty, OwnerError, OwnerLoading } from '../../components/owner/OwnerQueryState'
import MetricCard from '../../components/workspace/MetricCard'
import SectionCard from '../../components/workspace/SectionCard'
import { OwnerModel } from '../../mocks/ownerData'
import modelService from '../../services/model.service'

export default function OwnerDashboard() {
  const [models, setModels] = useState<OwnerModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  const summary = useMemo(() => {
    const totalModels = models.length
    const totalRequests = models.reduce((sum, model) => sum + model.requests, 0)
    const revenue = models.reduce((sum, model) => sum + model.revenue, 0)
    const listedScores = models.filter((model) => model.trustScore > 0)
    const averageTrustScore =
      listedScores.length === 0
        ? null
        : listedScores.reduce((sum, model) => sum + model.trustScore, 0) / listedScores.length

    return {
      totalModels,
      totalRequests,
      revenue,
      averageTrustScore,
    }
  }, [models])

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: { xs: 2.5, sm: 3.5 },
          border: '1px solid #1e293b',
          background: 'linear-gradient(135deg, #111622 0%, #1f1422 100%)',
          color: '#f8fafc',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <Typography variant='h4' sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
          Model Owner Studio
        </Typography>
        <Typography sx={{ mt: 1, maxWidth: 830, color: '#94a3b8', lineHeight: 1.6 }}>
          Manage your model portfolio, reported benchmarks, pricing, and recorded usage on Synapse.
        </Typography>
        <Button
          component={NavLink}
          to='/owner/add-model'
          variant='contained'
          startIcon={<Add />}
          sx={{
            mt: 2.5,
            bgcolor: '#fb7185',
            color: '#0f172a',
            fontWeight: 800,
            px: 3,
            py: 1,
            borderRadius: 2.5,
            '&:hover': { bgcolor: '#f43f5e' },
          }}
        >
          Add New Model
        </Button>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        }}
      >
        <MetricCard label='Total Models' value={String(summary.totalModels)} />
        <MetricCard label='Recorded Requests' value={summary.totalRequests.toLocaleString()} />
        <MetricCard label='Recorded Revenue' value={`$${summary.revenue.toLocaleString()}`} />
        <MetricCard
          label='Listing Score (avg)'
          value={
            summary.averageTrustScore === null ? '—' : `${summary.averageTrustScore.toFixed(1)}`
          }
          delta='Stored listing signal, not an independent evaluation'
        />
      </Box>

      <SectionCard
        title='My Models'
        subtitle='Portfolio snapshot from your owner account'
        action={
          <Button
            variant='outlined'
            onClick={() => navigate('/owner/models')}
            sx={{
              color: '#fb7185',
              borderColor: '#fb7185',
              fontWeight: 700,
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(251, 113, 133, 0.1)', borderColor: '#fda4af' },
            }}
          >
            View All Models
          </Button>
        }
      >
        {loading ? (
          <OwnerLoading label='Loading your models...' />
        ) : error ? (
          <OwnerError message={error} onRetry={() => void load()} />
        ) : models.length === 0 ? (
          <OwnerEmpty
            title='No models yet'
            message='Add your first model to start listing it on Synapse.'
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
              />
            ))}
          </Stack>
        )}
      </SectionCard>
    </Stack>
  )
}
