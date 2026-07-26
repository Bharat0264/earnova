import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from './RouteStates'

export default function ProtectedRoute({ allowedAccountTypes, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading, user } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader label="Checking your account" />
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (adminOnly && !isAdmin) return <Navigate to="/forbidden" replace />
  if (allowedAccountTypes && !isAdmin && !allowedAccountTypes.includes(user?.accountType)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}

