import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../contexts/auth'
import { RoleType } from '../mocks/synapse'

interface ProtectedRouteProps {
  requiredRole?: RoleType
  children?: React.ReactNode
}

export default function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const hasToken = Boolean(localStorage.getItem('token'))

  // If token exists but user profile is still loading
  if (hasToken && user === undefined) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Not authenticated
  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  // Superuser bypasses role checks
  if (user.is_superuser) {
    return children ? <>{children}</> : <Outlet />
  }

  // Check required role
  const userRoles = user.roles && user.roles.length > 0 ? user.roles : ['developer']
  if (requiredRole && !userRoles.includes(requiredRole)) {
    const isOwnerTarget = requiredRole === 'owner'
    const targetWorkspace = isOwnerTarget ? 'Model Owner' : 'Developer'
    const currentWorkspace = userRoles.includes('developer') ? 'Developer' : 'Model Owner'
    const currentWorkspaceUrl = userRoles.includes('developer') ? '/developer' : '/owner'

    return (
      <Box
        sx={{
          maxWidth: 640,
          mx: 'auto',
          mt: 8,
          p: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid #30343b',
            bgcolor: '#14161a',
            color: '#f3f4f6',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <LockOutlinedIcon fontSize='large' />
          </Box>
          <Typography variant='h5' fontWeight={800} gutterBottom>
            {targetWorkspace} Access Required
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Your account ({user.email}) currently has access to the{' '}
            <strong>{currentWorkspace}</strong> workspace only. Developer and Model Owner accounts
            are separated for independent security and isolation.
          </Typography>
          <Typography variant='body2' sx={{ mb: 4, color: '#9ca3af' }}>
            If you manage or provide models and need both workspaces, you can enable Model Owner
            access in your Profile settings.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='center'>
            <Button
              variant='outlined'
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(currentWorkspaceUrl)}
              sx={{ color: '#d1d5db', borderColor: '#4b5563' }}
            >
              Go to {currentWorkspace} Workspace
            </Button>
            <Button
              variant='contained'
              startIcon={<ManageAccountsIcon />}
              onClick={() => navigate('/profile')}
              sx={{ bgcolor: '#d8b4fe', color: '#261530', fontWeight: 700 }}
            >
              Manage Account Roles
            </Button>
          </Stack>
        </Paper>
      </Box>
    )
  }

  return children ? <>{children}</> : <Outlet />
}
