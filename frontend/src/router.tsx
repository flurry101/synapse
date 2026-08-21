import { createBrowserRouter } from 'react-router'
import ErrorPage from './error-page'
import { HydrateFallback } from './fallback'
import Home from './routes/home'
import DeveloperCompare from './routes/developer/compare'
import DeveloperDashboard from './routes/developer/dashboard'
import DeveloperDeploy from './routes/developer/deploy'
import DeveloperModelDetails from './routes/developer/details'
import DeveloperLayout from './routes/developer/layout'
import DeveloperPlayground from './routes/developer/playground'
import DeveloperSearch from './routes/developer/search'
import Login from './routes/login'
import OwnerAddModel from './routes/owner/add-model'
import OwnerAnalytics from './routes/owner/analytics'
import OwnerBenchmarks from './routes/owner/benchmarks'
import OwnerDashboard from './routes/owner/dashboard'
import OwnerLayout from './routes/owner/layout'
import OwnerModelProfile from './routes/owner/model-profile'
import OwnerModels from './routes/owner/models'
import OwnerPricing from './routes/owner/pricing'
import { Profile } from './routes/profile'
import Register from './routes/register'
import Root from './routes/root'
import SSOLogin, { loader as ssoLoader } from './routes/sso.login'
import Users, { loader as usersLoader } from './routes/users'
import ProtectedRoute from './components/ProtectedRoute'

export const routes = [
  {
    path: '/',
    Component: Root,
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: Home, HydrateFallback: HydrateFallback },
      {
        path: 'sso-login-callback',
        Component: SSOLogin,
        loader: ssoLoader,
      },
      {
        path: 'api/v1/login/google/callback',
        Component: SSOLogin,
        loader: ssoLoader,
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        Component: Login,
      },
      {
        path: 'register',
        Component: Register,
      },
      {
        path: 'users',
        Component: Users,
        HydrateFallback: HydrateFallback,
        loader: usersLoader,
      },
      {
        path: 'developer',
        element: (
          <ProtectedRoute requiredRole='developer'>
            <DeveloperLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, Component: DeveloperDashboard },
          { path: 'search', Component: DeveloperSearch },
          { path: 'compare', Component: DeveloperCompare },
          { path: 'details/:modelId', Component: DeveloperModelDetails },
          { path: 'playground', Component: DeveloperPlayground },
          { path: 'deploy', Component: DeveloperDeploy },
        ],
      },
      {
        path: 'owner',
        element: (
          <ProtectedRoute requiredRole='owner'>
            <OwnerLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, Component: OwnerDashboard },
          { path: 'models', Component: OwnerModels },
          { path: 'add-model', Component: OwnerAddModel },
          { path: 'model-profile', Component: OwnerModelProfile },
          { path: 'benchmarks', Component: OwnerBenchmarks },
          { path: 'pricing', Component: OwnerPricing },
          { path: 'analytics', Component: OwnerAnalytics },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
