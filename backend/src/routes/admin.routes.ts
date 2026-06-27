import { Router } from 'express'
import { z } from 'zod'
import { adminAuth, adminDb } from '../config/firebase'
import { authenticate } from '../middleware/authenticate'
import { validate } from '../middleware/validate'
import { asyncHandler } from '../utils/asyncHandler'
import { success } from '../utils/apiResponse'
import { AppError } from '../utils/AppError'
import type { UserRole } from '../types'

const setRoleSchema = z.object({
  uid: z.string().min(1),
  role: z.enum(['admin', 'viewer']),
})

const router = Router()

router.post(
  '/set-role',
  authenticate,
  validate(setRoleSchema),
  asyncHandler(async (req, res) => {
    const { uid, role: requestedRole } = req.body as z.infer<typeof setRoleSchema>
    const callerUid = req.user!.uid
    const callerRole = req.user!.role as UserRole | undefined
    const isAdmin = callerRole === 'admin'
    const isSelf = callerUid === uid

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

    const role: UserRole =
      !isAdmin && isSelf ? 'viewer' : requestedRole

    if (!isAdmin && role === 'admin') {
      throw new AppError('Forbidden', 'INSUFFICIENT_ROLE', 403)
    }

    try {
      await adminAuth.setCustomUserClaims(uid, { role })
    } catch {
      throw new AppError('Failed to set user role', 'SET_ROLE_FAILED', 500)
    }

    let email: string | null = req.user?.email ?? null

    try {
      const userRecord = await adminAuth.getUser(uid)
      email = userRecord.email ?? email
    } catch {
      // Keep caller email for self-registration when target user is self
    }

    try {
      await adminDb
        .collection('users')
        .doc(uid)
        .set(
          {
            uid,
            email,
            role,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        )
    } catch {
      throw new AppError('Failed to update user profile', 'FIRESTORE_ERROR', 500)
    }

    success(res, { success: true, uid, role })
  }),
)

export default router
