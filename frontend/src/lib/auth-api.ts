import { auth } from './firebase'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

type SetRoleResponse = {
  success: boolean
  uid: string
  role: 'viewer'
}

type ApiErrorBody = {
  message?: string
  error?: string
  code?: string
}

type ApiSuccessBody<T> = {
  data: T
}

/**
 * Assigns the default viewer role after sign-up.
 * Called automatically — users never choose their role.
 * Token is sent in Authorization header only (never in URL).
 */
export async function assignViewerRole(uid: string): Promise<SetRoleResponse> {
  const user = auth.currentUser
  if (!user || user.uid !== uid) {
    throw new Error('No authenticated user available to assign role')
  }

  const idToken = await user.getIdToken()
  const res = await fetch(`${API_BASE_URL}/api/admin/set-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ uid, role: 'viewer' }),
  })

  const body = (await res.json().catch(() => ({}))) as
    | ApiSuccessBody<SetRoleResponse>
    | ApiErrorBody

  if (!res.ok) {
    const errorBody = body as ApiErrorBody
    throw new Error(errorBody.error ?? errorBody.message ?? 'Failed to assign viewer role')
  }

  const successBody = body as ApiSuccessBody<SetRoleResponse>
  return successBody.data ?? (body as SetRoleResponse)
}
