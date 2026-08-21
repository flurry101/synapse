import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import CodeIcon from '@mui/icons-material/Code'
import StorefrontIcon from '@mui/icons-material/Storefront'
import HubIcon from '@mui/icons-material/Hub'
import {
  Avatar,
  Box,
  Button,
  Collapse,
  FormControl,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router'
import { useSnackBar } from '../contexts/snackbar'
import { User } from '../models/user'
import authService from '../services/auth.service'
import { GoogleIcon } from './LoginForm'

const SHOW_EMAIL_REGISTER_FORM: string = import.meta.env.VITE_PWD_SIGNUP_ENABLED ?? 'true'

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>()
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()
  const [expanded, setExpanded] = useState(false)
  const [selectedRoleType, setSelectedRoleType] = useState<'developer' | 'owner' | 'both'>(
    'developer',
  )

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  const onSubmit: SubmitHandler<User> = async (data) => {
    try {
      const roles =
        selectedRoleType === 'both'
          ? ['developer', 'owner']
          : selectedRoleType === 'owner'
            ? ['owner']
            : ['developer']

      await authService.register({
        ...data,
        roles,
      })
      showSnackBar('Registration successful. Please sign in.', 'success')
      navigate('/login')
    } catch (error) {
      let msg
      if (
        error instanceof AxiosError &&
        error.response &&
        typeof error.response.data.detail == 'string'
      )
        msg = error.response.data.detail
      else if (error instanceof Error) msg = error.message
      else msg = String(error)
      showSnackBar(msg, 'error')
    }
  }

  const handleGoogleLogin = async () => {
    window.location.href = authService.getGoogleLoginUrl()
  }

  return (
    <div>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          Sign Up
        </Typography>
        <Box>
          <Typography variant='subtitle1' gutterBottom sx={{ mt: 1, color: 'text.secondary' }}>
            No need to sign up, simply connect with your Google account and we&apos;ll import your
            profile.
          </Typography>
        </Box>
        <Button
          variant='outlined'
          startIcon={<GoogleIcon />}
          sx={{ width: 1.0, mt: 2 }}
          onClick={handleGoogleLogin}
        >
          Connect with Google
        </Button>

        {SHOW_EMAIL_REGISTER_FORM && SHOW_EMAIL_REGISTER_FORM.toLowerCase() === 'true' && (
          <Button variant='outlined' sx={{ width: 1.0, mt: 2 }} onClick={handleExpandClick}>
            Sign up with your email address
          </Button>
        )}

        <Collapse in={expanded} timeout='auto'>
          <Box component='form' onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }} noValidate>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  autoComplete='given-name'
                  fullWidth
                  id='firstName'
                  label='First Name'
                  autoFocus
                  {...register('first_name')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label='Last Name'
                  autoComplete='family-name'
                  {...register('last_name')}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  required
                  fullWidth
                  id='email'
                  label='Email Address'
                  autoComplete='email'
                  error={!!errors.email}
                  helperText={errors.email && 'Please provide an email address.'}
                  {...register('email', { required: true })}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  required
                  fullWidth
                  label='Password'
                  type='password'
                  id='password'
                  autoComplete='new-password'
                  error={!!errors.password}
                  helperText={errors.password && 'Please provide a password.'}
                  {...register('password', { required: true })}
                />
              </Grid>

              {/* Account Type Selection */}
              <Grid size={12}>
                <FormControl component='fieldset' sx={{ width: '100%', mt: 1 }}>
                  <FormLabel component='legend' sx={{ color: '#d1d5db', fontWeight: 700, mb: 1 }}>
                    Choose your account type
                  </FormLabel>
                  <RadioGroup
                    value={selectedRoleType}
                    onChange={(e) =>
                      setSelectedRoleType(e.target.value as 'developer' | 'owner' | 'both')
                    }
                  >
                    <Paper
                      variant='outlined'
                      sx={{
                        p: 1.5,
                        mb: 1,
                        bgcolor: selectedRoleType === 'developer' ? '#152136' : 'transparent',
                        borderColor: selectedRoleType === 'developer' ? '#60a5fa' : '#374151',
                      }}
                    >
                      <FormControlLabel
                        value='developer'
                        control={<Radio size='small' />}
                        label={
                          <Stack direction='row' alignItems='center' spacing={1}>
                            <CodeIcon fontSize='small' sx={{ color: '#60a5fa' }} />
                            <Box>
                              <Typography variant='body2' fontWeight={700}>
                                Developer
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                Discover, evaluate, and query models for your applications.
                              </Typography>
                            </Box>
                          </Stack>
                        }
                      />
                    </Paper>

                    <Paper
                      variant='outlined'
                      sx={{
                        p: 1.5,
                        mb: 1,
                        bgcolor: selectedRoleType === 'owner' ? '#331f13' : 'transparent',
                        borderColor: selectedRoleType === 'owner' ? '#f59e0b' : '#374151',
                      }}
                    >
                      <FormControlLabel
                        value='owner'
                        control={<Radio size='small' />}
                        label={
                          <Stack direction='row' alignItems='center' spacing={1}>
                            <StorefrontIcon fontSize='small' sx={{ color: '#f59e0b' }} />
                            <Box>
                              <Typography variant='body2' fontWeight={700}>
                                Model Owner / Provider
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                Publish models, set pricing tiers, benchmark and track analytics.
                              </Typography>
                            </Box>
                          </Stack>
                        }
                      />
                    </Paper>

                    <Paper
                      variant='outlined'
                      sx={{
                        p: 1.5,
                        bgcolor: selectedRoleType === 'both' ? '#261b36' : 'transparent',
                        borderColor: selectedRoleType === 'both' ? '#c084fc' : '#374151',
                      }}
                    >
                      <FormControlLabel
                        value='both'
                        control={<Radio size='small' />}
                        label={
                          <Stack direction='row' alignItems='center' spacing={1}>
                            <HubIcon fontSize='small' sx={{ color: '#c084fc' }} />
                            <Box>
                              <Typography variant='body2' fontWeight={700}>
                                Both (Developer & Model Owner)
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                Access both developer and owner workspaces under one login.
                              </Typography>
                            </Box>
                          </Stack>
                        }
                      />
                    </Paper>
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
            <Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
              Sign Up
            </Button>
            <Grid container justifyContent='flex-end'>
              <Grid>
                <Link component={RouterLink} to='/login' variant='body2'>
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Box>
    </div>
  )
}
