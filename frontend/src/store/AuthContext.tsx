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
import type { AuthUser, UserRole } from '@/types'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function buildAuthUser(firebaseUser: User): Promise<AuthUser> {
  // Read custom claim from ID token; default to viewer for new sign-ups
  const tokenResult = await firebaseUser.getIdTokenResult()
  const role = (tokenResult.claims.role as UserRole | undefined) ?? 'viewer'

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    role,
    emailVerified: firebaseUser.emailVerified,
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
      } catch (err) {
        setUser(null)
        setError(
          err instanceof Error ? err.message : 'Failed to resolve auth state',
        )
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
