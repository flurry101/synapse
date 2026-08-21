import { CircularProgress, Container, Typography } from '@mui/material'
import { AxiosError } from 'axios'
import { useEffect } from 'react'
import { LoaderFunctionArgs, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../contexts/auth'
import { useSnackBar } from '../contexts/snackbar'
import authService from '../services/auth.service'
import userService from '../services/user.service'

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    if (token) {
      localStorage.setItem('token', token)
      return { token }
    }
    const response = await authService.refreshToken()
    if (response?.access_token) {
      localStorage.setItem('token', response.access_token)
      return { token: response.access_token }
    }
  } catch {
    // Non-fatal, component will verify token or handle fallback
  }
  return null
}

/**
 * Handles SSO callback, extracts access token from URL param or cookie,
 * loads user profile, and redirects to the appropriate role workspace.
 */
export default function SSOLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showSnackBar } = useSnackBar()
  const { setUser } = useAuth()

  useEffect(() => {
    let isMounted = true

    async function processSSOLogin() {
      const queryToken = searchParams.get('token')
      if (queryToken) {
        localStorage.setItem('token', queryToken)
      }
      const token = queryToken || localStorage.getItem('token')
      if (!token) {
        // Try one more refresh attempt
        try {
          const res = await authService.refreshToken()
          if (res?.access_token) {
            localStorage.setItem('token', res.access_token)
          }
        } catch {
          // Both token param and cookie refresh failed
          if (isMounted) {
            showSnackBar('Google SSO login failed. No valid authorization received.', 'error')
            setUser(undefined)
            navigate('/login')
          }
          return
        }
      }

      try {
        const user = await userService.getProfile()
        if (isMounted) {
          setUser(user)
          showSnackBar(`Welcome back, ${user.first_name || user.email}!`, 'success')

          // Smart redirect based on user roles
          const roles = user.roles || ['developer']
          if (roles.includes('developer') && !roles.includes('owner')) {
            navigate('/developer')
          } else if (roles.includes('owner') && !roles.includes('developer')) {
            navigate('/owner')
          } else {
            navigate('/developer')
          }
        }
      } catch (error) {
        if (isMounted) {
          let msg = 'Failed to load user profile after SSO login.'
          if (
            error instanceof AxiosError &&
            error.response &&
            typeof error.response.data.detail === 'string'
          ) {
            msg = error.response.data.detail
          } else if (error instanceof Error) {
            msg = error.message
          }
          showSnackBar(msg, 'error')
          setUser(undefined)
          navigate('/login')
        }
      }
    }

    processSSOLogin()

    return () => {
      isMounted = false
    }
  }, [navigate, setUser, showSnackBar])

  return (
    <Container
      component='main'
      maxWidth='sm'
      sx={{
        mt: 12,
        mb: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <CircularProgress sx={{ mb: 3, color: '#d8b4fe' }} />
      <Typography variant='h6' fontWeight={700}>
        Authenticating with Google...
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
        Finalizing session and setting up your workspace.
      </Typography>
    </Container>
  )
}
