import { Alert, Button, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { NavLink } from 'react-router'
import ModelComparisonTable from '../../components/developer/ModelComparisonTable'
import SectionCard from '../../components/workspace/SectionCard'
import { developerModels } from '../../mocks/developerData'

const compareStorageKey = 'synapse_developer_compare'

export default function DeveloperCompare() {
  const selectedModels = useMemo(() => {
    const stored = localStorage.getItem(compareStorageKey)
    if (!stored) {
      return developerModels.slice(0, 2)
    }
    try {
      const ids = JSON.parse(stored) as string[]
      const models = developerModels.filter((model) => ids.includes(model.id))
      return models.length > 0 ? models : developerModels.slice(0, 2)
    } catch {
      return developerModels.slice(0, 2)
    }
  }, [])

  return (
    <Stack spacing={2.25}>
      <SectionCard
        title='Model comparison'
        subtitle='Compare multiple mock models across quality, trust, speed, price, and benchmarks'
        action={
          <Button component={NavLink} to='/developer/search' variant='outlined'>
            Update selection
          </Button>
        }
      >
        {selectedModels.length < 2 && (
          <Alert severity='info'>
            Select at least two models from Search Results to compare. Showing default models for now.
          </Alert>
        )}
        <ModelComparisonTable models={selectedModels} />
      </SectionCard>
      <Typography variant='body2' sx={{ color: '#5f6f88' }}>
        Strongest values are highlighted. For latency and price, lower values are considered better.
      </Typography>
    </Stack>
  )
}
