import { Bolt, Logout, Code, Storefront } from '@mui/icons-material'
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
      position='absolute'
      elevation={0}
      sx={{ bgcolor: '#0a0b0d', borderBottom: '1px solid #30343b' }}
    >
      <Toolbar sx={{ maxWidth: 1180, width: '100%', mx: 'auto', px: { xs: 2, sm: 4 } }}>
        <Typography
          component='h1'
          variant='h6'
          color='inherit'
          noWrap
          sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: '-.04em' }}
        >
          <Link
            component={NavLink}
            to='/'
            color='inherit'
            underline='none'
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
          >
            <Bolt sx={{ color: '#d8b4fe' }} /> Synapse
          </Link>
        </Typography>

        {/* Dynamic Workspace Links based on user roles */}
        <Box
          aria-label='workspace links'
          sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, mr: 1 }}
        >
          {canAccessDev && (
            <Button
              component={NavLink}
              to='/developer'
              startIcon={<Code fontSize='small' />}
              sx={{
                color: '#d1d5db',
                fontWeight: 700,
                '&.active': { color: '#93c5fd', bgcolor: 'rgba(147, 197, 253, 0.1)' },
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
                color: '#d1d5db',
                fontWeight: 700,
                '&.active': { color: '#fca5a5', bgcolor: 'rgba(252, 165, 165, 0.1)' },
              }}
            >
              Model Owner
            </Button>
          )}
        </Box>

        {user === undefined && (
          <Box aria-label='button group'>
            <Button component={NavLink} to='/login' sx={{ color: '#d1d5db', fontWeight: 700 }}>
              Login
            </Button>
            <Button component={NavLink} to='/register' sx={{ color: '#d8b4fe', fontWeight: 700 }}>
              Register
            </Button>
          </Box>
        )}

        {user !== undefined && user.is_superuser && (
          <Button component={NavLink} to='/users' sx={{ color: '#d1d5db', fontWeight: 700 }}>
            Users
          </Button>
        )}

        {user !== undefined && (
          <Tooltip title='Account settings'>
            <IconButton
              onClick={handleClick}
              size='small'
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup='true'
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar
                sx={{ width: 32, height: 32 }}
                alt={user.first_name + ' ' + user.last_name}
                src={user.picture && user.picture}
              >
                {user && user.first_name ? user.first_name[0] : 'P'}
              </Avatar>
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
      <Menu
        anchorEl={anchorEl}
        id='account-menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant='subtitle2' fontWeight={800} noWrap>
            {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : ''}
          </Typography>
          <Typography variant='caption' color='text.secondary' display='block' noWrap>
            {user?.email}
          </Typography>
          <Stack direction='row' spacing={0.5} sx={{ mt: 1 }}>
            {userRoles.map((role) => (
              <Chip
                key={role}
                label={role === 'developer' ? 'Developer' : 'Model Owner'}
                size='small'
                sx={{
                  height: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: role === 'developer' ? '#1e3a8a' : '#78350f',
                  color: '#fff',
                }}
              />
            ))}
          </Stack>
        </Box>
        <Divider />
        <Link component={NavLink} to='/profile' color='inherit' underline='none'>
          <MenuItem onClick={handleClose}>
            <Avatar
              alt={user && user.first_name + ' ' + user.last_name}
              src={user && user.picture && user.picture}
            />{' '}
            Profile & Roles
          </MenuItem>
        </Link>

        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize='small' />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  )
}
