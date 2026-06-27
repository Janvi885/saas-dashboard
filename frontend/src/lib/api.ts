import { auth } from './firebase'

export async function fetchMe() {
  const idToken = await auth.currentUser?.getIdToken()
  if (!idToken) {
    throw new Error('Not authenticated')
  }

  const res = await fetch('/api/me', {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch profile')
  }

  return data as { uid: string; email?: string; role?: string | null }
}
