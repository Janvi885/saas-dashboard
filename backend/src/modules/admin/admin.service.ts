import { FieldValue } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from '../../config/firebase'
import { AppError } from '../../utils/AppError'
import type { UserRole } from '../../types'
import type { SetRoleInput } from './admin.validators'

type SetRoleParams = SetRoleInput & {
  callerUid: string
  callerRole: string | undefined
  callerEmail: string | null | undefined
}

type SetRoleResult = {
  success: true
  uid: string
  role: UserRole
}

function resolveAssignedRole(
  params: SetRoleParams,
  requestedRole: UserRole,
): UserRole {
  const isAdmin = params.callerRole === 'admin'
  const isSelf = params.callerUid === params.uid

  if (!isAdmin && (requestedRole !== 'viewer' || !isSelf)) {
    throw new AppError('Forbidden', 'INSUFFICIENT_ROLE', 403)
  }

  if (requestedRole === 'admin' && !isAdmin) {
    throw new AppError(
      'Only admins can assign the admin role',
      'INSUFFICIENT_ROLE',
      403,
    )
  }

  if (requestedRole === 'viewer' && !isAdmin && !isSelf) {
    throw new AppError(
      'You can only assign the viewer role to your own account',
      'INSUFFICIENT_ROLE',
      403,
    )
  }

  const role: UserRole = !isAdmin && isSelf ? 'viewer' : requestedRole

  if (!isAdmin && role === 'admin') {
    throw new AppError('Forbidden', 'INSUFFICIENT_ROLE', 403)
  }

  return role
}

async function persistUserRole(
  uid: string,
  role: UserRole,
  callerEmail: string | null | undefined,
): Promise<void> {
  try {
    await adminAuth.setCustomUserClaims(uid, { role })
  } catch {
    throw new AppError('Failed to set user role', 'SET_ROLE_FAILED', 500)
  }

  let email: string | null = callerEmail ?? null

  try {
    const userRecord = await adminAuth.getUser(uid)
    email = userRecord.email ?? email
  } catch {
    // Self-registration may not need a separate Auth lookup.
  }

  try {
    const userRef = adminDb.collection('users').doc(uid)
    const existing = await userRef.get()
    const profile = {
      uid,
      email,
      role,
      updatedAt: FieldValue.serverTimestamp(),
      ...(existing.exists
        ? {}
        : { createdAt: FieldValue.serverTimestamp() }),
    }

    await userRef.set(profile, { merge: true })
  } catch {
    throw new AppError('Failed to update user profile', 'FIRESTORE_ERROR', 500)
  }
}

export async function setUserRole(params: SetRoleParams): Promise<SetRoleResult> {
  const role = resolveAssignedRole(params, params.role)

  await persistUserRole(params.uid, role, params.callerEmail)

  return { success: true, uid: params.uid, role }
}
