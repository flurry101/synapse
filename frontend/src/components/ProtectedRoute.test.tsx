import { render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { AuthProvider } from '../contexts/auth'
import { SnackBarProvider } from '../contexts/snackbar'
import ProtectedRoute from './ProtectedRoute'
import { User } from '../models/user'

const API_URL = import.meta.env.VITE_BACKEND_API_URL

const devUser: User = {
  uuid: 'dev-111',
  email: 'dev@synapse.ai',
  roles: ['developer'],
}

const ownerUser: User = {
  uuid: 'owner-222',
  email: 'owner@synapse.ai',
  roles: ['owner'],
}

const dualUser: User = {
  uuid: 'dual-333',
  email: 'dual@synapse.ai',
  roles: ['developer', 'owner'],
}

const server = setupServer(
  http.get(API_URL + 'users/me', () => {
    return HttpResponse.json(devUser)
  }),
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())

function renderWithAuth(initialPath: string, activeUser?: User) {
  if (activeUser) {
    localStorage.setItem('token', 'fake-token')
    server.use(
      http.get(API_URL + 'users/me', () => {
        return HttpResponse.json(activeUser)
      }),
    )
  } else {
    server.use(
      http.get(API_URL + 'users/me', () => {
        return new HttpResponse(null, { status: 401 })
      }),
    )
  }

  return render(
    <AuthProvider>
      <SnackBarProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path='/login' element={<div>Login Page</div>} />
            <Route
              path='/developer'
              element={
                <ProtectedRoute requiredRole='developer'>
                  <div>Developer Workspace Content</div>
                </ProtectedRoute>
              }
            />
            <Route
              path='/owner'
              element={
                <ProtectedRoute requiredRole='owner'>
                  <div>Model Owner Workspace Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </SnackBarProvider>
    </AuthProvider>,
  )
}

describe('ProtectedRoute Role Separation', () => {
  it('redirects unauthenticated users to login', async () => {
    renderWithAuth('/developer')
    expect(await screen.findByText('Login Page')).toBeInTheDocument()
  })

  it('allows Developer user into Developer workspace', async () => {
    renderWithAuth('/developer', devUser)
    expect(await screen.findByText('Developer Workspace Content')).toBeInTheDocument()
  })

  it('blocks Developer user from Model Owner workspace and shows Access Required', async () => {
    renderWithAuth('/owner', devUser)
    expect(await screen.findByText(/Model Owner Access Required/i)).toBeInTheDocument()
    expect(screen.queryByText('Model Owner Workspace Content')).not.toBeInTheDocument()
  })

  it('allows Model Owner user into Model Owner workspace', async () => {
    renderWithAuth('/owner', ownerUser)
    expect(await screen.findByText('Model Owner Workspace Content')).toBeInTheDocument()
  })

  it('blocks Model Owner user from Developer workspace and shows Access Required', async () => {
    renderWithAuth('/developer', ownerUser)
    expect(await screen.findByText(/Developer Access Required/i)).toBeInTheDocument()
    expect(screen.queryByText('Developer Workspace Content')).not.toBeInTheDocument()
  })

  it('allows dual-role user into both workspaces', async () => {
    const { unmount } = renderWithAuth('/developer', dualUser)
    expect(await screen.findByText('Developer Workspace Content')).toBeInTheDocument()
    unmount()

    renderWithAuth('/owner', dualUser)
    expect(await screen.findByText('Model Owner Workspace Content')).toBeInTheDocument()
  })
})
