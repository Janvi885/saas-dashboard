import { Navigate } from 'react-router-dom'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { useAuth } from '@/store/AuthContext'

export default function RegisterPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">SaaS Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your account
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
