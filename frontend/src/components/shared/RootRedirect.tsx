import { Navigate } from 'react-router-dom'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAuth } from '@/store/AuthContext'

export function RootRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen size="lg" />
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}
