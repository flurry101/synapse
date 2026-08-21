import { Container, Paper } from '@mui/material'
import Grid from '@mui/material/Grid'
import RegisterForm from '../components/RegisterForm'

export default function Register() {
  return (
    <Container maxWidth='lg' sx={{ mt: { xs: 10, md: 13 }, mb: 6 }}>
      <Grid container spacing={2} justifyContent='center'>
        <Grid size={{ xs: 12, md: 7, lg: 5 }}>
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
            <RegisterForm />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
