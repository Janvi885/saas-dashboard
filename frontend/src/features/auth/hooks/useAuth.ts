import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { assignViewerRole } from '@/lib/auth-api'
import { auth } from '@/lib/firebase'
import type { ApiError } from '@/types'

function createApiError(
  message: string,
  code: string,
  statusCode: number,
): ApiError {
  return { message, code, statusCode }
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error &&
    'statusCode' in error
  )
}

function mapFirebaseAuthError(error: unknown): ApiError {
  if (error instanceof FirebaseError) {
    const messages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/invalid-email': 'Please enter a valid email address',
      'auth/invalid-credential': 'Incorrect email or password',
    }

    return createApiError(
      messages[error.code] ?? 'Authentication failed. Please try again.',
      error.code,
      401,
    )
  }

  if (error instanceof Error) {
    return createApiError(error.message, 'auth/unknown', 500)
  }

  return createApiError('An unexpected error occurred', 'auth/unknown', 500)
}

export async function signIn(email: string, password: string): Promise<void> {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    await user.getIdToken(true)
    await user.getIdTokenResult()
  } catch (error) {
    throw mapFirebaseAuthError(error)
  }
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<void> {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName })

    // Always assign viewer — no role selection in the UI
    await assignViewerRole(user.uid)

    // Force token refresh so AuthContext picks up the new role claim immediately
    const currentUser = auth.currentUser
    if (currentUser) {
      await currentUser.getIdToken(true)
    }
  } catch (error) {
    if (isApiError(error)) {
      throw error
    }
    throw mapFirebaseAuthError(error)
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth)
    window.location.assign('/login')
  } catch (error) {
    throw mapFirebaseAuthError(error)
  }
}
