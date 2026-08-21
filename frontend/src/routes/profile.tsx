import { Container, Paper } from '@mui/material'
import Grid from '@mui/material/Grid'
import UserProfile from '../components/UserProfile'
import { useAuth } from '../contexts/auth'

export function Profile() {
  const { user } = useAuth()
  return (
    <Container maxWidth='lg' sx={{ mt: { xs: 10, md: 13 }, mb: 6 }}>
      <Grid container spacing={2} justifyContent='center'>
        <Grid size={{ xs: 12, md: 8, lg: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#111622',
              border: '1px solid #1e293b',
              borderRadius: 3.5,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            {user && <UserProfile userProfile={user} allowDelete={true} />}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
