import { useAuth } from '@/store/AuthContext'
import type { UserRole } from '@/types'

type UseRoleResult = {
  isAdmin: boolean
  isViewer: boolean
  role: UserRole | null
}

export function useRole(): UseRoleResult {
  const { user } = useAuth()
  const role = user?.role ?? null

  return {
    isAdmin: role === 'admin',
    isViewer: role === 'viewer',
    role,
  }
}
