import { Outlet } from 'react-router'
import WorkspaceLayout from '../../components/workspace/WorkspaceLayout'
import { ownerNavItems } from '../../mocks/ownerData'

export default function OwnerLayout() {
  return (
    <WorkspaceLayout
      role='owner'
      title='Model Owner Dashboard'
      subtitle='Manage your model catalog, benchmark quality, tune pricing, and monitor usage analytics.'
      items={ownerNavItems}
    >
      <Outlet />
    </WorkspaceLayout>
  )
}
