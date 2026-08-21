import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  FormGroup,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import CodeIcon from '@mui/icons-material/Code'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { useAuth } from '../contexts/auth'
import { useSnackBar } from '../contexts/snackbar'
import { User } from '../models/user'
import userService from '../services/user.service'
import { GoogleIcon } from './LoginForm'

interface UserProfileProps {
  userProfile: User
  onUserUpdated?: (user: User) => void
  allowDelete: boolean
}

export default function UserProfile(props: UserProfileProps) {
  const { userProfile, onUserUpdated } = props
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<User>({
    defaultValues: userProfile,
  })
  const navigate = useNavigate()
  const { user: currentUser, setUser, logout } = useAuth()
  const { showSnackBar } = useSnackBar()
  const [open, setOpen] = useState(false)

  const initialRoles =
    userProfile.roles && userProfile.roles.length > 0 ? userProfile.roles : ['developer']
  const [devRole, setDevRole] = useState(initialRoles.includes('developer'))
  const [ownerRole, setOwnerRole] = useState(initialRoles.includes('owner'))

  useEffect(() => {
    reset(userProfile)
    const currentRoles =
      userProfile.roles && userProfile.roles.length > 0 ? userProfile.roles : ['developer']
    setDevRole(currentRoles.includes('developer'))
    setOwnerRole(currentRoles.includes('owner'))
  }, [userProfile, reset])

  const onSubmit: SubmitHandler<User> = async (data) => {
    let updatedUser: User
    try {
      // Calculate updated roles
      const updatedRoles: string[] = []
      if (devRole) updatedRoles.push('developer')
      if (ownerRole) updatedRoles.push('owner')
      if (updatedRoles.length === 0) updatedRoles.push('developer') // ensure at least one

      const payload = {
        ...data,
        roles: updatedRoles,
      }

      if (currentUser?.uuid === userProfile.uuid) {
        // Updating user profile.
        updatedUser = await userService.updateProfile(payload)
        setUser(updatedUser)
        showSnackBar('User profile updated successfully.', 'success')
      } else {
        // Updating user different from current user.
        updatedUser = await userService.updateUser(userProfile.uuid, payload)
        showSnackBar('User profile updated successfully.', 'success')
      }
      if (onUserUpdated) {
        onUserUpdated(updatedUser)
      }
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

  const handleDeleteProfile = async () => {
    setOpen(true)
  }

  const handleCancel = () => setOpen(false)

  const handleConfirm = async () => {
    setOpen(false)
    await userService.deleteSelf()
    showSnackBar('Your account has been deleted.', 'success')
    logout()
    navigate('/')
  }

  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <IconButton aria-label='upload picture' component='label' sx={{ mt: 1 }}>
          <input hidden accept='image/*' type='file' />
          <Avatar
            sx={{ width: 56, height: 56 }}
            alt={userProfile.first_name + ' ' + userProfile.last_name}
            src={userProfile.picture && userProfile.picture}
          />
        </IconButton>

        <Box
          component='form'
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 3, width: '100%' }}
          key={userProfile.uuid}
          noValidate
          data-testid='user-profile-form'
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                autoComplete='given-name'
                fullWidth
                id='firstName'
                label='First Name'
                {...register('first_name')}
                autoFocus
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id='last_name'
                label='Last Name'
                autoComplete='family-name'
                {...register('last_name')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                id='email'
                label='Email Address'
                autoComplete='email'
                required
                disabled={
                  userProfile.provider !== null &&
                  userProfile.provider !== undefined &&
                  userProfile.provider !== ''
                }
                error={!!errors.email}
                helperText={errors.email && 'Please provide an email address.'}
                {...register('email', { required: true })}
              />
            </Grid>

            {userProfile.provider && (
              <Grid size={12}>
                <TextField
                  fullWidth
                  label='Connected with'
                  id='provider'
                  disabled={true}
                  variant='standard'
                  InputProps={{
                    startAdornment: <GoogleIcon sx={{ mr: 1 }} />,
                  }}
                  {...register('provider')}
                />
              </Grid>
            )}

            {!userProfile.provider && (
              <Grid size={12}>
                <TextField
                  fullWidth
                  label='Password'
                  type='password'
                  id='password'
                  autoComplete='new-password'
                  {...register('password')}
                />
              </Grid>
            )}

            {/* Account Roles Management */}
            <Grid size={12}>
              <Paper
                variant='outlined'
                sx={{
                  p: 2,
                  bgcolor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: 2,
                }}
              >
                <Typography variant='subtitle2' fontWeight={700} sx={{ color: '#e2e8f0', mb: 1 }}>
                  Workspace Roles & Permissions
                </Typography>
                <Typography variant='caption' sx={{ color: '#94a3b8', display: 'block', mb: 1.5 }}>
                  Select the workspaces you want this account to access. Both workspaces operate
                  independently.
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={devRole}
                        onChange={(e) => setDevRole(e.target.checked)}
                        sx={{ color: '#60a5fa', '&.Mui-checked': { color: '#60a5fa' } }}
                      />
                    }
                    label={
                      <Stack direction='row' alignItems='center' spacing={1}>
                        <CodeIcon fontSize='small' sx={{ color: '#60a5fa' }} />
                        <Typography variant='body2' fontWeight={600} sx={{ color: '#f1f5f9' }}>
                          Developer Workspace Access
                        </Typography>
                      </Stack>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={ownerRole}
                        onChange={(e) => setOwnerRole(e.target.checked)}
                        sx={{ color: '#f59e0b', '&.Mui-checked': { color: '#f59e0b' } }}
                      />
                    }
                    label={
                      <Stack direction='row' alignItems='center' spacing={1}>
                        <StorefrontIcon fontSize='small' sx={{ color: '#f59e0b' }} />
                        <Typography variant='body2' fontWeight={600} sx={{ color: '#f1f5f9' }}>
                          Model Owner Workspace Access
                        </Typography>
                      </Stack>
                    }
                  />
                </FormGroup>
              </Paper>
            </Grid>

            {currentUser?.is_superuser && (
              <>
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={userProfile.is_active}
                        color='primary'
                        {...register('is_active')}
                      />
                    }
                    label='Is Active'
                    disabled={currentUser.uuid === userProfile.uuid}
                  />
                </Grid>
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={userProfile.is_superuser}
                        color='primary'
                        {...register('is_superuser')}
                      />
                    }
                    label='Is Super User'
                    disabled={currentUser.uuid === userProfile.uuid}
                  />
                </Grid>
              </>
            )}
          </Grid>
          <Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
            Update
          </Button>
          {props.allowDelete && (
            <Button
              fullWidth
              variant='outlined'
              sx={{ mb: 2 }}
              color='error'
              onClick={handleDeleteProfile}
            >
              Delete my account
            </Button>
          )}
        </Box>
      </Box>
      <Dialog
        open={open}
        onClose={handleCancel}
        aria-describedby='alert-profile-dialog-description'
      >
        <DialogContent>
          <DialogContentText id='alert-profile-dialog-description'>
            Are you sure you want to delete your account ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} autoFocus>
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant='contained' color='primary'>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
