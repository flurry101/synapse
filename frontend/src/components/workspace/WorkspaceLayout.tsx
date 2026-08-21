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

const drawerWidth = 272

export default function WorkspaceLayout({
  role,
  title,
  subtitle,
  items,
  children,
}: WorkspaceLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const roleColor = role === 'developer' ? '#154c79' : '#7a3e00'
  const roleLabel = role === 'developer' ? 'Developer Workspace' : 'Model Owner Workspace'

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(180deg, #f7f8fb 0%, #eef2f7 100%)',
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
          borderBottom: '1px solid #d7dee9',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar sx={{ minHeight: '76px !important', px: { xs: 2, sm: 3 } }}>
          <IconButton
            color='inherit'
            edge='start'
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Stack spacing={0.25} sx={{ flexGrow: 1 }}>
            <Typography
              variant='h5'
              sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#10243e' }}
            >
              {title}
            </Typography>
            <Typography variant='body2' sx={{ color: '#4f637e', maxWidth: 860 }}>
              {subtitle}
            </Typography>
          </Stack>
          <Chip
            label={roleLabel}
            sx={{
              fontWeight: 700,
              color: 'white',
              backgroundColor: roleColor,
              borderRadius: 1.5,
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          <SidebarContent
            items={items}
            pathname={pathname}
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
              borderRight: '1px solid #d7dee9',
              backgroundColor: '#f4f7fc',
            },
          }}
        >
          <SidebarContent items={items} pathname={pathname} />
        </Drawer>
      </Box>

      <Box component='main' sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, mt: '76px' }}>
        {children}
      </Box>
    </Box>
  )
}

function SidebarContent({
  items,
  pathname,
  onClickItem,
}: {
  items: NavItem[]
  pathname: string
  onClickItem?: () => void
}) {
  return (
    <Box sx={{ mt: 0.5 }}>
      <Toolbar />
      <Box sx={{ px: 2.25, pb: 1.5 }}>
        <Paper
          elevation={0}
          sx={{ p: 2, borderRadius: 3, border: '1px solid #d7dee9', bgcolor: '#ffffff' }}
        >
          <Typography variant='overline' sx={{ color: '#5d6e85', fontWeight: 700 }}>
            Synapse Navigation
          </Typography>
          <Typography variant='body2' sx={{ color: '#3c4f6d' }}>
            Move through each step of your role-specific workflow.
          </Typography>
        </Paper>
      </Box>
      <Divider />
      <List sx={{ px: 1.25, py: 1.5 }}>
        {items.map((item) => {
          const active = pathname === item.path
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={onClickItem}
              sx={{
                mb: 0.75,
                borderRadius: 2,
                border: '1px solid',
                borderColor: active ? '#8fa7c7' : 'transparent',
                backgroundColor: active ? '#eaf1fb' : 'transparent',
                '&:hover': { backgroundColor: '#edf2f9' },
              }}
            >
              <ListItemText
                primary={item.label}
                secondary={item.hint}
                primaryTypographyProps={{ fontWeight: active ? 700 : 600 }}
                secondaryTypographyProps={{ fontSize: 12, sx: { color: '#61758f' } }}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}
