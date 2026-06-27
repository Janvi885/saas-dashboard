import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner fullScreen size="lg" />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
