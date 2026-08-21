import DeleteIcon from '@mui/icons-material/Delete'
import {
  Avatar,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { useState } from 'react'
import { redirect, useLoaderData } from 'react-router'
import UserProfile from '../components/UserProfile'
import { useAuth } from '../contexts/auth'
import { useSnackBar } from '../contexts/snackbar'
import { User } from '../models/user'
import userService from '../services/user.service'

export async function loader() {
  try {
    const users = await userService.getUsers()
    return { users }
  } catch {
    return redirect('/')
  }
}

export default function Users() {
  const { users: initialUsers } = useLoaderData() as { users: User[] }
  const { user: currentUser } = useAuth()
  const { showSnackBar } = useSnackBar()
  const [users, setUsers] = useState<Array<User>>(initialUsers)
  const [selectedUser, setSelectedUser] = useState<User>()
  const [toDeleteUser, setToDeleteUser] = useState<User>()
  const [open, setOpen] = useState(false)

  const handleSelect = (user: User) => () => {
    setSelectedUser(user)
  }

  const handleUserUpdate = (update: User) => {
    setUsers(users.map((user) => (user.uuid == update.uuid ? update : user)))
  }

  const handleUserDelete = (user: User) => () => {
    setToDeleteUser(user)
    setOpen(true)
  }

  const handleCancel = () => setOpen(false)

  const handleConfirm = async () => {
    if (toDeleteUser) {
      setOpen(false)
      await userService.deleteUser(toDeleteUser.uuid)
      showSnackBar('User deleted successfully.', 'success')
      setUsers(users.filter((user) => user.uuid !== toDeleteUser.uuid))
      if (selectedUser && selectedUser.uuid === toDeleteUser.uuid) {
        setSelectedUser(undefined)
      }
    }
    setToDeleteUser(undefined)
  }

  return (
    <Container maxWidth='lg' sx={{ mt: { xs: 10, md: 13 }, mb: 6 }}>
      <Grid container spacing={3} justifyContent='center'>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: '#111622',
              border: '1px solid #1e293b',
              borderRadius: 3.5,
              overflow: 'hidden',
            }}
          >
            <List
              sx={{ maxHeight: 480, overflow: 'auto', '::-webkit-scrollbar': { display: 'none' } }}
            >
              {users.map((user) => {
                const isSelected = selectedUser?.uuid == user.uuid
                return (
                  <ListItem
                    key={user.uuid}
                    secondaryAction={
                      currentUser?.uuid !== user.uuid && (
                        <IconButton
                          edge='end'
                          aria-label='delete'
                          onClick={handleUserDelete(user)}
                          sx={{
                            color: '#f87171',
                            mr: 0.5,
                            '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' },
                          }}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      )
                    }
                    disablePadding
                  >
                    <ListItemButton
                      onClick={handleSelect(user)}
                      selected={isSelected}
                      data-testid={user.uuid}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderLeft: '3px solid',
                        borderLeftColor: isSelected ? '#38bdf8' : 'transparent',
                        bgcolor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                        '&:hover': {
                          bgcolor: isSelected
                            ? 'rgba(56, 189, 248, 0.16)'
                            : 'rgba(255, 255, 255, 0.04)',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          alt={user.first_name + ' ' + user.last_name}
                          src={user.picture && user.picture}
                          sx={{ bgcolor: 'rgba(192, 132, 252, 0.2)', color: '#d8b4fe' }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.email}
                        secondary={
                          (user.first_name || user.last_name) &&
                          user.first_name + ' ' + user.last_name
                        }
                        primaryTypographyProps={{
                          color: '#f8fafc',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: 14,
                        }}
                        secondaryTypographyProps={{ color: '#94a3b8', fontSize: 12.5 }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7, lg: 5 }}>
          {selectedUser && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#111622',
                border: '1px solid #1e293b',
                borderRadius: 3.5,
              }}
            >
              <UserProfile
                userProfile={selectedUser}
                onUserUpdated={handleUserUpdate}
                allowDelete={false}
              />
            </Paper>
          )}
        </Grid>
      </Grid>
      <Dialog
        open={open}
        onClose={handleCancel}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        PaperProps={{
          sx: {
            bgcolor: '#111622',
            border: '1px solid #1e293b',
            borderRadius: 3,
            color: '#f8fafc',
          },
        }}
      >
        <DialogContent>
          <DialogContentText id='alert-dialog-description' sx={{ color: '#cbd5e1' }}>
            Are you sure you want to delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancel} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant='contained'
            sx={{ bgcolor: '#f87171', color: '#ffffff', '&:hover': { bgcolor: '#ef4444' } }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
