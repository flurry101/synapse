import { CircularProgress, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import DeploymentPanel from '../../components/developer/DeploymentPanel'
import SectionCard from '../../components/workspace/SectionCard'
import { DeveloperModel } from '../../mocks/developerData'
import modelService from '../../services/model.service'

export default function DeveloperDeploy() {
  const [searchParams] = useSearchParams()
  const initialModel = searchParams.get('model') || undefined
  const [models, setModels] = useState<DeveloperModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await modelService.getDeveloperModels()
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
    <Stack spacing={2.25}>
      <SectionCard
        title='API Keys & Deployments'
        subtitle='Generate secure API keys, configure rate limits, and get instant endpoint integration snippets'
      >
        {loading ? (
          <Stack alignItems='center' sx={{ py: 4 }}>
            <CircularProgress size={32} />
          </Stack>
        ) : (
          <DeploymentPanel models={models} initialModelId={initialModel} />
        )}
      </SectionCard>
    </Stack>
  )
}
