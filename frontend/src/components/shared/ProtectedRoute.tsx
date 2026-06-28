import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { useSignOut } from '@/features/auth/hooks/authActions'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const signOut = useSignOut()

  if (loading) {
    return <LoadingSpinner fullScreen size="lg" />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user.role) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-semibold">Account setup incomplete</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Your account does not have an assigned role yet. Sign out and try
          again, or contact an administrator.
        </p>
        <Button variant="outline" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    )
  }

  return <Outlet />
}
