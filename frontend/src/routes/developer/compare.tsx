import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router'
import ModelComparisonTable from '../../components/developer/ModelComparisonTable'
import SectionCard from '../../components/workspace/SectionCard'
import { DeveloperModel } from '../../mocks/developerData'
import modelService from '../../services/model.service'

const compareStorageKey = 'synapse_developer_compare'

export default function DeveloperCompare() {
  const [searchParams] = useSearchParams()
  const [models, setModels] = useState<DeveloperModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      let ids: string[] = []
      const urlModels = searchParams.get('models')
      if (urlModels) {
        ids = urlModels.split(',').map((s) => s.trim()).filter(Boolean)
      } else {
        const stored = localStorage.getItem(compareStorageKey)
        if (stored) {
          try {
            ids = JSON.parse(stored) as string[]
          } catch {
            ids = []
          }
        }
      }

      if (ids.length === 0) {
        ids = ['meta-llama/Llama-3.1-8B-Instruct', 'Qwen/Qwen3.8-27B']
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
  }, [searchParams])

  return (
    <Stack spacing={3}>
      <SectionCard
        title='Side-by-Side Model Battle & Comparison'
        subtitle='Compare shortlisted Hugging Face models across parameters, licenses, accuracy, speed, pricing, and evaluations'
        action={
          <Button
            component={NavLink}
            to='/developer/search'
            variant='outlined'
            sx={{
              color: '#38bdf8',
              borderColor: '#38bdf8',
              fontWeight: 700,
              borderRadius: 2.5,
              '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)', borderColor: '#7dd3fc' },
            }}
          >
            Update Selection in Search
          </Button>
        }
      >
        {loading ? (
          <Stack alignItems='center' sx={{ py: 6 }}>
            <CircularProgress size={36} sx={{ color: '#38bdf8' }} />
            <Typography variant='caption' sx={{ color: '#94a3b8', mt: 1.5, fontWeight: 700 }}>
              Benchmarking contenders and calculating token costs...
            </Typography>
          </Stack>
        ) : (
          <>
            {models.length < 2 && (
              <Alert
                severity='info'
                sx={{
                  mb: 2.5,
                  bgcolor: 'rgba(56, 189, 248, 0.1)',
                  color: '#bae6fd',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                Select at least two models from the Search Catalog to compare. Showing default
                Hugging Face models for now.
              </Alert>
            )}
            <ModelComparisonTable models={models} />
          </>
        )}
      </SectionCard>
      <Typography variant='body2' sx={{ color: '#94a3b8' }}>
        🏆 Strongest metrics are highlighted with green badges. For latency and pricing, lower
        values indicate better efficiency and cost savings.
      </Typography>
    </Stack>
  )
}
