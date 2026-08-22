import { ArrowForward } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router'
import SectionCard from '../../components/workspace/SectionCard'
import { DeveloperModel } from '../../mocks/developerData'
import modelService from '../../services/model.service'

export default function DeveloperRecommendations() {
  const [models, setModels] = useState<DeveloperModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await modelService.getRecommendations({ limit: 4 })
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

  return (
    <SectionCard
      title='Recommended Models'
      subtitle='Intelligently ranked by composite trust score, accuracy, and latency benchmarks'
    >
      {loading ? (
        <Stack alignItems='center' sx={{ py: 4 }}>
          <CircularProgress size={32} sx={{ color: '#38bdf8' }} />
        </Stack>
      ) : (
        <Stack spacing={2.5}>
          {models.map((model, index) => (
            <Box
              key={model.id}
              sx={{
                border: '1px solid #1e293b',
                borderRadius: 3,
                p: 2.5,
                bgcolor: '#0a0e17',
                transition: 'border-color 0.2s ease',
                '&:hover': { borderColor: '#38bdf8' },
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent='space-between'
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1.5}
              >
                <Stack spacing={0.25}>
                  <Typography sx={{ fontWeight: 800, color: '#f8fafc', fontSize: 16 }}>
                    {index + 1}. {model.name}
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#94a3b8' }}>
                    {model.creator} • {model.description}
                  </Typography>
                </Stack>
                <Chip
                  label={`${model.trustScore}% Trust`}
                  sx={{
                    bgcolor: 'rgba(74, 222, 128, 0.15)',
                    color: '#4ade80',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                    fontWeight: 800,
                  }}
                />
              </Stack>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2.5}
                alignItems={{ md: 'center' }}
                sx={{ mt: 2 }}
              >
                <Box sx={{ minWidth: 150, width: { xs: '100%', md: 'auto' } }}>
                  <Typography
                    variant='caption'
                    sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}
                  >
                    Relevance Score ({model.accuracy}%)
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={model.accuracy}
                    sx={{
                      mt: 0.75,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#1e293b',
                      '& .MuiLinearProgress-bar': { bgcolor: '#38bdf8', borderRadius: 4 },
                    }}
                  />
                </Box>
                <Typography variant='body2' sx={{ color: '#cbd5e1' }}>
                  {model.latencyMs}ms P95 • ${model.pricePerMInput.toFixed(2)} in / $
                  {model.pricePerMOutput.toFixed(2)} out (1M tokens)
                </Typography>
              </Stack>
            </Box>
          ))}
          <Button
            component={NavLink}
            to='/developer/compare'
            variant='contained'
            endIcon={<ArrowForward />}
            sx={{
              alignSelf: 'flex-start',
              bgcolor: '#38bdf8',
              color: '#090d16',
              fontWeight: 800,
              px: 3,
              borderRadius: 2.5,
              '&:hover': { bgcolor: '#7dd3fc' },
            }}
          >
            Continue to Live Battle
          </Button>
        </Stack>
      )}
    </SectionCard>
  )
}
