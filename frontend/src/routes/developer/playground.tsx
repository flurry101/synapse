import { CircularProgress, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import Playground from '../../components/developer/Playground'
import SectionCard from '../../components/workspace/SectionCard'
import { defaultPlaygroundInput, DeveloperModel } from '../../mocks/developerData'
import modelService from '../../services/model.service'

export default function DeveloperPlayground() {
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
        title='Model Playground & Prompt Arena'
        subtitle='Test prompts across catalog models and open-weight Hugging Face checkpoints'
      >
        {loading ? (
          <Stack alignItems='center' sx={{ py: 4 }}>
            <CircularProgress size={32} />
          </Stack>
        ) : (
          <Playground
            models={models}
            defaultInput={defaultPlaygroundInput}
            initialModelId={initialModel}
          />
        )}
      </SectionCard>
    </Stack>
  )
}
