import { render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { AuthProvider } from '../contexts/auth'
import { SnackBarProvider } from '../contexts/snackbar'
import SSOLogin from './sso.login'
import { User } from '../models/user'

const API_URL = import.meta.env.VITE_BACKEND_API_URL

const devUser: User = {
  uuid: 'dev-google-1',
  email: 'googledev@example.com',
  roles: ['developer'],
  first_name: 'Google',
  last_name: 'Dev',
}

const ownerUser: User = {
  uuid: 'owner-google-2',
  email: 'googleowner@example.com',
  roles: ['owner'],
  first_name: 'Google',
  last_name: 'Owner',
}

const server = setupServer(
  http.get(API_URL + 'users/me', () => {
    return HttpResponse.json(devUser)
  }),
  http.get(API_URL + 'login/refresh-token', () => {
    return HttpResponse.json({ access_token: 'cookie-refreshed-token' })
  }),
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())

function renderSSO(initialEntry: string) {
  return render(
    <AuthProvider>
      <SnackBarProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path='/sso-login-callback' element={<SSOLogin />} />
            <Route path='/api/v1/login/google/callback' element={<SSOLogin />} />
            <Route path='/developer' element={<div>Developer Workspace Landing</div>} />
            <Route path='/owner' element={<div>Owner Workspace Landing</div>} />
            <Route path='/login' element={<div>Login Page Landing</div>} />
          </Routes>
        </MemoryRouter>
      </SnackBarProvider>
    </AuthProvider>,
  )
}

describe('SSOLogin Route Component', () => {
  it('processes SSO login with ?token= query parameter and routes developer', async () => {
    localStorage.setItem('token', 'query-token-abc')
    server.use(
      http.get(API_URL + 'users/me', () => {
        return HttpResponse.json(devUser)
      }),
    )

    renderSSO('/api/v1/login/google/callback?token=query-token-abc')

    expect(await screen.findByText('Developer Workspace Landing')).toBeInTheDocument()
  })

  it('processes SSO login and routes owner to owner workspace', async () => {
    localStorage.setItem('token', 'query-token-owner')
    server.use(
      http.get(API_URL + 'users/me', () => {
        return HttpResponse.json(ownerUser)
      }),
    )

    renderSSO('/sso-login-callback?token=query-token-owner')

    expect(await screen.findByText('Owner Workspace Landing')).toBeInTheDocument()
  })

  it('handles failed SSO login and redirects to /login', async () => {
    server.use(
      http.get(API_URL + 'login/refresh-token', () => {
        return new HttpResponse(null, { status: 401 })
      }),
      http.get(API_URL + 'users/me', () => {
        return new HttpResponse(null, { status: 401 })
      }),
    )

    renderSSO('/sso-login-callback')

    expect(await screen.findByText('Login Page Landing')).toBeInTheDocument()
  })
})
