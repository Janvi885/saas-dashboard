import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'
import type { UserRole } from '@/types'

type RoleGuardProps = {
  allowedRoles: UserRole[]
  fallback?: ReactNode
  children: ReactNode
}

export function RoleGuard({
  allowedRoles,
  fallback,
  children,
}: RoleGuardProps) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback !== undefined) {
      return fallback
    }

    return <Navigate to="/dashboard" replace />
  }

  return children
}
