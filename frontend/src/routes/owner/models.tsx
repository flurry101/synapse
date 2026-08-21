import { Stack } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import OwnerModelCard from '../../components/owner/OwnerModelCard'
import SectionCard from '../../components/workspace/SectionCard'
import { getOwnerModels } from '../../mocks/ownerData'

export default function OwnerModels() {
  const [models] = useState(getOwnerModels())
  const navigate = useNavigate()

  return (
    <SectionCard title='My models' subtitle='Published and in-progress model catalog'>
      <Stack spacing={1.5}>
        {models.map((model) => (
          <OwnerModelCard
            key={model.id}
            model={model}
            onView={(modelId) => navigate(`/owner/model-profile?model=${modelId}`)}
            onEdit={(modelId) => navigate(`/owner/model-profile?model=${modelId}`)}
          />
        ))}
      </Stack>
    </SectionCard>
  )
}
