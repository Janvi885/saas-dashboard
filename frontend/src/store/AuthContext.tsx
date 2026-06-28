import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { isUserRole, type AuthUser } from '@/types'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function buildAuthUser(firebaseUser: User): Promise<AuthUser> {
  try {
    const tokenResult = await firebaseUser.getIdTokenResult()
    const role = isUserRole(tokenResult.claims.role)
      ? tokenResult.claims.role
      : null

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      role,
      emailVerified: firebaseUser.emailVerified,
    }
  } catch {
    throw new Error('Failed to read auth token claims')
  }
}

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null)
          setError(null)
          return
        }

        setUser(await buildAuthUser(firebaseUser))
        setError(null)
      } catch {
        setUser(null)
        setError('Failed to resolve auth state. Please sign in again.')
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
