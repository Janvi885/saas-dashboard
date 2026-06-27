import { auth } from './firebase'

type SetRoleResponse = {
  uid: string
  role: 'viewer'
}

type ApiErrorBody = {
  message?: string
  error?: string
  code?: string
}

/**
 * Assigns the default viewer role after sign-up.
 * Called automatically — users never choose their role.
 */
export async function assignViewerRole(uid: string): Promise<SetRoleResponse> {
  const user = auth.currentUser
  if (!user || user.uid !== uid) {
    throw new Error('No authenticated user available to assign role')
  }

  const idToken = await user.getIdToken()
  const res = await fetch('/api/admin/set-role', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ uid, role: 'viewer' }),
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as ApiErrorBody
    throw new Error(data.error ?? data.message ?? 'Failed to assign viewer role')
  }

  return res.json() as Promise<SetRoleResponse>
}
