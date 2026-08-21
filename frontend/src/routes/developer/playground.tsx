import { Stack } from '@mui/material'
import Playground from '../../components/developer/Playground'
import SectionCard from '../../components/workspace/SectionCard'
import { defaultPlaygroundInput, developerModels, mockPlaygroundOutput } from '../../mocks/developerData'

export default function DeveloperPlayground() {
  return (
    <Stack spacing={2.25}>
      <SectionCard title='Browser Playground' subtitle='Test sample prompts with mock model output and usage metrics'>
        <Playground
          models={developerModels}
          defaultInput={defaultPlaygroundInput}
          output={mockPlaygroundOutput}
        />
      </SectionCard>
    </Stack>
  )
}
