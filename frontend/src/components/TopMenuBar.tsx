import { Bolt, Code, Logout, Storefront } from '@mui/icons-material'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import * as React from 'react'
import { NavLink, useNavigate } from 'react-router'
import { useAuth } from '../contexts/auth'

export default function TopMenuBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    setAnchorEl(null)
    navigate('/')
  }

  const userRoles = user?.roles && user.roles.length > 0 ? user.roles : ['developer']
  const canAccessDev = Boolean(user && (user.is_superuser || userRoles.includes('developer')))
  const canAccessOwner = Boolean(user && (user.is_superuser || userRoles.includes('owner')))

  return (
    <AppBar
      position='fixed'
      elevation={0}
      sx={{
        bgcolor: 'rgba(9, 13, 22, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1e293b',
        zIndex: 1200,
      }}
      component='header'
    >
      <Toolbar sx={{ maxWidth: 1240, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <Typography
          component='div'
          variant='h6'
          color='inherit'
          noWrap
          sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: '-0.03em' }}
        >
          <Link
            component={NavLink}
            to='/'
            color='inherit'
            underline='none'
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.25,
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#f8fafc',
              '&:hover': { color: '#c084fc' },
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: 'rgba(192, 132, 252, 0.15)',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bolt sx={{ color: '#c084fc', fontSize: 20 }} />
            </Box>
            Synapse
          </Link>
        </Typography>

        {/* Dynamic Workspace Links based on user roles */}
        <Box
          aria-label='workspace links'
          component='nav'
          sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, mr: 2 }}
        >
          {canAccessDev && (
            <Button
              component={NavLink}
              to='/developer'
              startIcon={<Code fontSize='small' />}
              sx={{
                color: '#cbd5e1',
                fontWeight: 700,
                px: 2,
                py: 0.75,
                borderRadius: 2,
                border: '1px solid transparent',
                '&.active': {
                  color: '#38bdf8',
                  bgcolor: 'rgba(56, 189, 248, 0.12)',
                  borderColor: 'rgba(56, 189, 248, 0.3)',
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Developer
            </Button>
          )}

          {canAccessOwner && (
            <Button
              component={NavLink}
              to='/owner'
              startIcon={<Storefront fontSize='small' />}
              sx={{
                color: '#cbd5e1',
                fontWeight: 700,
                px: 2,
                py: 0.75,
                borderRadius: 2,
                border: '1px solid transparent',
                '&.active': {
                  color: '#fb7185',
                  bgcolor: 'rgba(251, 113, 133, 0.12)',
                  borderColor: 'rgba(251, 113, 133, 0.3)',
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Model Owner
            </Button>
          )}
        </Box>

        {user === undefined ? (
          <Stack direction='row' spacing={1.5} aria-label='button group'>
            <Button
              component={NavLink}
              to='/login'
              sx={{
                color: '#cbd5e1',
                fontWeight: 700,
                px: 2,
                '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Login
            </Button>
            <Button
              component={NavLink}
              to='/register'
              variant='contained'
              sx={{
                bgcolor: '#c084fc',
                color: '#0f172a',
                fontWeight: 800,
                px: 2.25,
                '&:hover': { bgcolor: '#d8b4fe' },
              }}
            >
              Register
            </Button>
          </Stack>
        ) : (
          <Stack direction='row' spacing={1.5} alignItems='center'>
            {user.is_superuser && (
              <Button
                component={NavLink}
                to='/users'
                sx={{
                  color: '#cbd5e1',
                  fontWeight: 700,
                  '&.active': { color: '#fde047' },
                }}
              >
                Users
              </Button>
            )}

            <Tooltip title='Account settings'>
              <IconButton
                onClick={handleClick}
                size='small'
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup='true'
                aria-expanded={open ? 'true' : undefined}
                sx={{
                  p: 0.5,
                  border: '1px solid #1e293b',
                  '&:focus-visible': { outline: '2px solid #38bdf8' },
                }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: 'rgba(192, 132, 252, 0.2)',
                    color: '#d8b4fe',
                    fontWeight: 700,
                    fontSize: 14,
                    border: '1px solid rgba(192, 132, 252, 0.4)',
                  }}
                  alt={user.first_name + ' ' + user.last_name}
                  src={user.picture && user.picture}
                >
                  {user && user.first_name ? user.first_name[0] : 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Toolbar>

      {/* Profile / Account Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        id='account-menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            bgcolor: '#111622',
            border: '1px solid #1e293b',
            color: '#f8fafc',
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            mt: 1.5,
            minWidth: 220,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant='subtitle2' fontWeight={800} color='#f8fafc' noWrap>
            {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : ''}
          </Typography>
          <Typography variant='caption' color='#94a3b8' display='block' noWrap>
            {user?.email}
          </Typography>
          <Stack direction='row' spacing={0.5} sx={{ mt: 1 }}>
            {userRoles.map((role) => (
              <Chip
                key={role}
                label={role === 'developer' ? 'Developer' : 'Model Owner'}
                size='small'
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 800,
                  bgcolor:
                    role === 'developer' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(251, 113, 133, 0.15)',
                  color: role === 'developer' ? '#38bdf8' : '#fb7185',
                  border: `1px solid ${
                    role === 'developer' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(251, 113, 133, 0.3)'
                  }`,
                }}
              />
            ))}
          </Stack>
        </Box>
        <Divider sx={{ borderColor: '#1e293b' }} />
        <Link component={NavLink} to='/profile' color='inherit' underline='none'>
          <MenuItem
            onClick={handleClose}
            sx={{
              py: 1.25,
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
            }}
          >
            <Avatar
              alt={user && user.first_name + ' ' + user.last_name}
              src={user && user.picture && user.picture}
              sx={{ bgcolor: 'rgba(192, 132, 252, 0.2)', color: '#d8b4fe' }}
            />
            Profile & Roles
          </MenuItem>
        </Link>

        <Divider sx={{ borderColor: '#1e293b' }} />
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.25,
            color: '#f87171',
            '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' },
          }}
        >
          <ListItemIcon sx={{ color: '#f87171' }}>
            <Logout fontSize='small' />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  )
}
