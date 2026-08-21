import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { NavItem, RoleType } from '../../mocks/synapse'

type WorkspaceLayoutProps = {
  role: RoleType
  title: string
  subtitle: string
  items: NavItem[]
  children: React.ReactNode
}

const drawerWidth = 280

export default function WorkspaceLayout({
  role,
  title,
  subtitle,
  items,
  children,
}: WorkspaceLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const isDev = role === 'developer'
  const roleBg = isDev ? 'rgba(56, 189, 248, 0.15)' : 'rgba(251, 113, 133, 0.15)'
  const roleBorder = isDev ? 'rgba(56, 189, 248, 0.4)' : 'rgba(251, 113, 133, 0.4)'
  const roleColor = isDev ? '#38bdf8' : '#fb7185'
  const roleLabel = isDev ? 'Developer Workspace' : 'Model Owner Workspace'

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: 'calc(100vh - 64px)',
        bgcolor: '#090d16',
        color: '#f8fafc',
      }}
    >
      <AppBar
        position='fixed'
        color='transparent'
        elevation={0}
        sx={{
          top: 64,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          borderBottom: '1px solid #1e293b',
          bgcolor: 'rgba(9, 13, 22, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ minHeight: '76px !important', px: { xs: 2, sm: 3 } }}>
          <IconButton
            color='inherit'
            edge='start'
            aria-label='Open workspace menu'
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Stack spacing={0.25} sx={{ flexGrow: 1 }}>
            <Typography
              variant='h5'
              sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}
            >
              {title}
            </Typography>
            <Typography variant='body2' sx={{ color: '#94a3b8', maxWidth: 860 }}>
              {subtitle}
            </Typography>
          </Stack>
          <Chip
            label={roleLabel}
            sx={{
              fontWeight: 800,
              color: roleColor,
              backgroundColor: roleBg,
              border: `1px solid ${roleBorder}`,
              borderRadius: 2,
              px: 0.5,
            }}
          />
        </Toolbar>
      </AppBar>

      <Box
        component='nav'
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label='workspace sections'
      >
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#0e1422',
              borderRight: '1px solid #1e293b',
              color: '#f8fafc',
            },
          }}
        >
          <SidebarContent
            items={items}
            pathname={pathname}
            isDev={isDev}
            onClickItem={() => setMobileOpen(false)}
          />
        </Drawer>
        <Drawer
          variant='permanent'
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid #1e293b',
              bgcolor: '#0e1422',
              color: '#f8fafc',
            },
          }}
        >
          <SidebarContent items={items} pathname={pathname} isDev={isDev} />
        </Drawer>
      </Box>

      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3.5 },
          mt: '76px',
          bgcolor: '#090d16',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

function SidebarContent({
  items,
  pathname,
  isDev,
  onClickItem,
}: {
  items: NavItem[]
  pathname: string
  isDev: boolean
  onClickItem?: () => void
}) {
  const activeAccent = isDev ? '#38bdf8' : '#fb7185'
  const activeBg = isDev ? 'rgba(56, 189, 248, 0.12)' : 'rgba(251, 113, 133, 0.12)'
  const activeBorder = isDev ? 'rgba(56, 189, 248, 0.4)' : 'rgba(251, 113, 133, 0.4)'

  return (
    <Box sx={{ mt: 0.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <Box sx={{ px: 2.25, pb: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            border: '1px solid #1e293b',
            bgcolor: '#121826',
          }}
        >
          <Typography
            variant='overline'
            sx={{ color: activeAccent, fontWeight: 800, letterSpacing: 1.2 }}
          >
            {isDev ? 'DEVELOPER HUB' : 'OWNER STUDIO'}
          </Typography>
          <Typography variant='body2' sx={{ color: '#94a3b8', mt: 0.25, fontSize: 13 }}>
            Navigate through your workspace features and live tools.
          </Typography>
        </Paper>
      </Box>
      <Divider sx={{ borderColor: '#1e293b' }} />
      <List sx={{ px: 1.5, py: 1.5, flexGrow: 1 }} component='nav'>
        {items.map((item) => {
          const active = pathname === item.path
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={onClickItem}
              sx={{
                mb: 1,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: active ? activeBorder : 'transparent',
                backgroundColor: active ? activeBg : 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: active ? activeBg : 'rgba(255, 255, 255, 0.05)',
                  borderColor: active ? activeBorder : '#2a3b54',
                },
                '&:focus-visible': {
                  outline: `2px solid ${activeAccent}`,
                  outlineOffset: 2,
                },
              }}
            >
              <ListItemText
                primary={item.label}
                secondary={item.hint}
                primaryTypographyProps={{
                  fontWeight: active ? 800 : 600,
                  color: active ? activeAccent : '#f1f5f9',
                  fontSize: 14,
                }}
                secondaryTypographyProps={{
                  fontSize: 12,
                  sx: { color: active ? '#cbd5e1' : '#64748b' },
                }}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}
