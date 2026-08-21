import { Add } from '@mui/icons-material'
import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material'
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
          Manage your model portfolio, published benchmarks, custom pricing tiers, and live
          monetization analytics on Synapse.
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
        <MetricCard
          label='Total Models'
          value={String(summary.totalModels)}
          delta='Active portfolio'
        />
        <MetricCard
          label='Total Requests'
          value={summary.totalRequests.toLocaleString()}
          delta='+12.4% MoM'
        />
        <MetricCard
          label='Gross Revenue'
          value={`$${summary.revenue.toLocaleString()}`}
          delta='Payout ready'
        />
        <MetricCard
          label='Average Trust Score'
          value={`${summary.averageTrustScore.toFixed(1)}%`}
          delta='Verified'
        />
      </Box>

      <SectionCard
        title='My Models'
        subtitle='Portfolio snapshot and live status'
        action={
          <Button
            variant='outlined'
            onClick={() => navigate('/owner/model-profile')}
            sx={{
              color: '#fb7185',
              borderColor: '#fb7185',
              fontWeight: 700,
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(251, 113, 133, 0.1)', borderColor: '#fda4af' },
            }}
          >
            Open Profile Editor
          </Button>
        }
      >
        {loading ? (
          <Stack alignItems='center' sx={{ py: 4 }}>
            <CircularProgress size={32} sx={{ color: '#fb7185' }} />
          </Stack>
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
