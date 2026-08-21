import { Add } from '@mui/icons-material'
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import OwnerModelCard from '../../components/owner/OwnerModelCard'
import MetricCard from '../../components/workspace/MetricCard'
import SectionCard from '../../components/workspace/SectionCard'
import { OwnerModel } from '../../mocks/ownerData'
import modelService from '../../services/model.service'

export default function OwnerDashboard() {
  const [models, setModels] = useState<OwnerModel[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await modelService.getOwnerModels()
        if (active) setModels(data)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const summary = useMemo(() => {
    const totalModels = models.length
    const totalRequests = models.reduce((sum, model) => sum + model.requests, 0)
    const revenue = models.reduce((sum, model) => sum + model.revenue, 0)
    const averageTrustScore =
      totalModels === 0 ? 0 : models.reduce((sum, model) => sum + model.trustScore, 0) / totalModels

    return {
      totalModels,
      totalRequests,
      revenue,
      averageTrustScore,
    }
  }, [models])

  return (
    <Stack spacing={2.25}>
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 2.25, sm: 3 },
          border: '1px solid #f0d8bf',
          background: 'linear-gradient(135deg, #693100 0%, #b35f18 52%, #f7cc88 100%)',
          color: 'white',
        }}
      >
        <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
          Model Owner Dashboard
        </Typography>
        <Typography sx={{ mt: 1, maxWidth: 830, color: '#fff6ea' }}>
          Manage your model portfolio, benchmarks, pricing, and live analytics directly linked to
          your Synapse AI Hub backend.
        </Typography>
        <Button
          component={NavLink}
          to='/owner/add-model'
          variant='contained'
          startIcon={<Add />}
          sx={{
            mt: 2,
            alignSelf: 'flex-start',
            bgcolor: '#fff4e5',
            color: '#6b3900',
            fontWeight: 800,
          }}
        >
          Add Model
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        }}
      >
        <MetricCard label='Total Models' value={String(summary.totalModels)} />
        <MetricCard label='Total Requests' value={summary.totalRequests.toLocaleString()} />
        <MetricCard label='Revenue' value={`$${summary.revenue.toLocaleString()}`} />
        <MetricCard
          label='Average Trust Score'
          value={`${summary.averageTrustScore.toFixed(1)}%`}
        />
      </Box>

      <SectionCard
        title='My Models'
        subtitle='Portfolio snapshot'
        action={
          <Button variant='outlined' onClick={() => navigate('/owner/model-profile')}>
            Open Profile Editor
          </Button>
        }
      >
        {loading ? (
          <Stack alignItems='center' sx={{ py: 4 }}>
            <CircularProgress size={32} />
          </Stack>
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
    </Stack>
  )
}
