import { useAuth } from '@/store/AuthContext'
import type { UserRole } from '@/types'

type UseRoleResult = {
  isAdmin: boolean
  isViewer: boolean
  role: UserRole
}

export function useRole(): UseRoleResult {
  const { user } = useAuth()
  const role: UserRole = user?.role ?? 'viewer'

  return {
    isAdmin: role === 'admin',
    isViewer: role === 'viewer',
    role,
  }
}
