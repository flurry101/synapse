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
      title='Recommended models'
      subtitle='Intelligently ranked by composite trust score, accuracy, and latency metrics'
    >
      {loading ? (
        <Stack alignItems='center' sx={{ py: 4 }}>
          <CircularProgress size={32} />
        </Stack>
      ) : (
        <>
          {models.map((model, index) => (
            <Box key={model.id} sx={{ border: '1px solid #e5ebf4', borderRadius: 2.5, p: 2 }}>
              <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={1}>
                <Stack>
                  <Typography sx={{ fontWeight: 800 }}>
                    {index + 1}. {model.name}
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#5f6f88' }}>
                    {model.creator} • {model.description}
                  </Typography>
                </Stack>
                <Chip label={`${model.trustScore}% trust`} color='primary' />
              </Stack>
              <Stack direction='row' spacing={2} sx={{ mt: 1.5 }}>
                <Box sx={{ minWidth: 130 }}>
                  <Typography variant='caption' sx={{ color: '#5f6f88' }}>
                    Relevance score
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={model.accuracy}
                    sx={{ mt: 0.5, height: 7, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant='body2' sx={{ color: '#415673', alignSelf: 'center' }}>
                  {model.latencyMs}ms p95 • ${model.pricePerMInput.toFixed(2)} in / 1M • $
                  {model.pricePerMOutput.toFixed(2)} out / 1M
                </Typography>
              </Stack>
            </Box>
          ))}
          <Button
            component={NavLink}
            to='/developer/compare'
            variant='contained'
            endIcon={<ArrowForward />}
          >
            Continue to comparison
          </Button>
        </>
      )}
    </SectionCard>
  )
}
