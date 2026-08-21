import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router'
import ModelComparisonTable from '../../components/developer/ModelComparisonTable'
import SectionCard from '../../components/workspace/SectionCard'
import { DeveloperModel } from '../../mocks/developerData'
import modelService from '../../services/model.service'

const compareStorageKey = 'synapse_developer_compare'

export default function DeveloperCompare() {
  const [models, setModels] = useState<DeveloperModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      let ids: string[] = []
      const stored = localStorage.getItem(compareStorageKey)
      if (stored) {
        try {
          ids = JSON.parse(stored) as string[]
        } catch {
          ids = []
        }
      }
      try {
        const res = await modelService.compareModels(ids)
        if (active) setModels(res.models)
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
    <Stack spacing={2.25}>
      <SectionCard
        title='Model comparison'
        subtitle='Compare shortlisted models side-by-side across quality, trust, speed, price, and benchmarks'
        action={
          <Button component={NavLink} to='/developer/search' variant='outlined'>
            Update selection
          </Button>
        }
      >
        {loading ? (
          <Stack alignItems='center' sx={{ py: 4 }}>
            <CircularProgress size={32} />
          </Stack>
        ) : (
          <>
            {models.length < 2 && (
              <Alert severity='info' sx={{ mb: 2 }}>
                Select at least two models from the Search Catalog to compare. Showing default
                models for now.
              </Alert>
            )}
            <ModelComparisonTable models={models} />
          </>
        )}
      </SectionCard>
      <Typography variant='body2' sx={{ color: '#5f6f88' }}>
        Strongest values are highlighted. For latency and price, lower values are considered better.
      </Typography>
    </Stack>
  )
}
