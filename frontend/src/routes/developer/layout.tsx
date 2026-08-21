import { Outlet } from 'react-router'
import WorkspaceLayout from '../../components/workspace/WorkspaceLayout'
import { developerNavItems } from '../../mocks/developerData'

export default function DeveloperLayout() {
  return (
    <WorkspaceLayout
      role='developer'
      title='Developer Dashboard'
      subtitle='Discover, evaluate, and launch AI models for your use case using guided mock workflows.'
      items={developerNavItems}
    >
      <Outlet />
    </WorkspaceLayout>
  )
}
