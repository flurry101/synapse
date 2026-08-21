import { Stack } from '@mui/material'
import DeploymentPanel from '../../components/developer/DeploymentPanel'
import SectionCard from '../../components/workspace/SectionCard'
import { deploymentConfiguration, developerModels } from '../../mocks/developerData'

export default function DeveloperDeploy() {
  return (
    <Stack spacing={2.25}>
      <SectionCard
        title='Deploy'
        subtitle='Generate mock deployment config and endpoint for demo walkthroughs'
      >
        <DeploymentPanel
          selectedModelId={deploymentConfiguration.selectedModelId}
          models={developerModels}
          config={{
            environment: deploymentConfiguration.environment,
            region: deploymentConfiguration.region,
            maxTokens: deploymentConfiguration.maxTokens,
            temperature: deploymentConfiguration.temperature,
            rateLimitRpm: deploymentConfiguration.rateLimitRpm,
            endpoint: deploymentConfiguration.endpoint,
            usageExample: deploymentConfiguration.usageExample,
          }}
        />
      </SectionCard>
    </Stack>
  )
}
