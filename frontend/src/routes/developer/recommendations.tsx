import { ArrowForward } from '@mui/icons-material'
import { Box, Button, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import { NavLink } from 'react-router'
import SectionCard from '../../components/workspace/SectionCard'
import { mockModels } from '../../mocks/synapse'

export default function DeveloperRecommendations() {
  return (
    <SectionCard title='Recommended models' subtitle='Ranked with mock relevance and performance confidence'>
      {mockModels.map((model, index) => (
        <Box key={model.id} sx={{ border: '1px solid #e5ebf4', borderRadius: 2.5, p: 2 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={1}>
            <Stack>
              <Typography sx={{ fontWeight: 800 }}>
                {index + 1}. {model.name}
              </Typography>
              <Typography variant='body2' sx={{ color: '#5f6f88' }}>
                {model.provider} • {model.description}
              </Typography>
            </Stack>
            <Chip label={`${model.benchmarkScore}% fit`} color='primary' />
          </Stack>
          <Stack direction='row' spacing={2} sx={{ mt: 1.5 }}>
            <Box sx={{ minWidth: 130 }}>
              <Typography variant='caption' sx={{ color: '#5f6f88' }}>
                Relevance score
              </Typography>
              <LinearProgress variant='determinate' value={model.benchmarkScore} sx={{ mt: 0.5, height: 7, borderRadius: 5 }} />
            </Box>
            <Typography variant='body2' sx={{ color: '#415673', alignSelf: 'center' }}>
              {model.latencyMs}ms p95 • ${model.pricePerMInput.toFixed(2)} in / 1M • ${model.pricePerMOutput.toFixed(2)} out / 1M
            </Typography>
          </Stack>
        </Box>
      ))}
      <Button component={NavLink} to='/developer/compare' variant='contained' endIcon={<ArrowForward />}>
        Continue to comparison
      </Button>
    </SectionCard>
  )
}
