import { ArrowForward } from '@mui/icons-material'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import ModelCard from '../../components/developer/ModelCard'
import SearchBar from '../../components/developer/SearchBar'
import MetricCard from '../../components/workspace/MetricCard'
import SectionCard from '../../components/workspace/SectionCard'
import { developerModels, popularTasks } from '../../mocks/developerData'

export default function DeveloperDashboard() {
  const navigate = useNavigate()
  const [query, setQuery] = useState(
    'I need a reliable support assistant with low latency and strong factual grounding.',
  )
  const recommended = useMemo(() => developerModels.slice(0, 3), [])

  const onFindModels = () => {
    navigate(`/developer/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <Stack spacing={2.25}>
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 2.25, sm: 3 },
          border: '1px solid #c8d6ea',
          background: 'linear-gradient(120deg, #0f3a5e 0%, #2f6b9f 55%, #8cc4f5 100%)',
          color: 'white',
        }}
      >
        <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
          Welcome to Synapse Developer Workspace
        </Typography>
        <Typography sx={{ mt: 1, maxWidth: 840, color: '#e3eefb' }}>
          Describe your use case, discover top model candidates, compare core metrics, and ship a
          mock integration in minutes.
        </Typography>
        <Stack direction='row' spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }} useFlexGap>
          <Chip
            label='Mock Playground Ready'
            sx={{ bgcolor: '#f5f9ff', color: '#0f3a5e', fontWeight: 700 }}
          />
          <Chip
            label='No Backend Required'
            sx={{ bgcolor: '#f5f9ff', color: '#0f3a5e', fontWeight: 700 }}
          />
          <Chip
            label='Hackathon Demo Flow'
            sx={{ bgcolor: '#f5f9ff', color: '#0f3a5e', fontWeight: 700 }}
          />
        </Stack>
      </Box>

      <SectionCard
        title='Describe your use case'
        subtitle='Tell Synapse what you are building and find matching models'
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          buttonLabel='Find Models'
          onSubmit={onFindModels}
          placeholder='Example: Build an AI QA assistant with strong trust score and low cost'
        />
        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
          {popularTasks.map((task) => (
            <Chip
              key={task}
              label={task}
              onClick={() => setQuery(task)}
              variant='outlined'
              clickable
            />
          ))}
        </Stack>
      </SectionCard>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        }}
      >
        <MetricCard label='Active Model Candidates' value='12' delta='+3 this week' />
        <MetricCard label='Average Latency Target' value='250ms' delta='18% faster' />
        <MetricCard label='Budget Guardrail' value='$0.70 / 1M out' delta='On target' />
        <MetricCard label='Deploy Readiness' value='82%' delta='+9 points' />
      </Box>

      <SectionCard title='Recommended models' subtitle='Top picks for common hackathon workloads'>
        <Stack spacing={1.5}>
          {recommended.map((model) => (
            <ModelCard key={model.id} model={model} showCompare={false} />
          ))}
        </Stack>
      </SectionCard>

      <SectionCard
        title='Suggested Next Steps'
        subtitle='Recommended journey for first-time builders'
        action={
          <Button
            component={NavLink}
            to='/developer/search'
            variant='contained'
            endIcon={<ArrowForward />}
          >
            Start Flow
          </Button>
        }
      >
        <Typography color='text.secondary'>
          1. Describe your app goal and latency/cost constraints in Use Case Search.
        </Typography>
        <Typography color='text.secondary'>
          2. Review model recommendations and compare benchmark fit.
        </Typography>
        <Typography color='text.secondary'>
          3. Validate output quality in Playground and proceed to Deploy.
        </Typography>
      </SectionCard>
    </Stack>
  )
}
