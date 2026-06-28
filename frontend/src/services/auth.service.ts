import { API_ROUTES } from '@/constants/api.routes'
import { auth } from '@/lib/firebase'
import { apiClient, ApiError, withApiErrorHandling } from './api.client'

type SetRoleResponse = {
  success: boolean
  uid: string
  role: 'viewer'
}

/**
 * Assigns the default viewer role after sign-up.
 * Token is attached by api.client interceptor (Authorization header only).
 */
export async function assignViewerRole(uid: string): Promise<SetRoleResponse> {
  try {
    const user = auth.currentUser
    if (!user || user.uid !== uid) {
      throw new ApiError(
        'No authenticated user available to assign role',
        'AUTH_REQUIRED',
        401,
      )
    }

    return await withApiErrorHandling(
      () =>
        apiClient.post<SetRoleResponse>(API_ROUTES.setRole, {
          uid,
          role: 'viewer',
        }),
      'Failed to assign viewer role',
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('Failed to assign viewer role', 'SET_ROLE_FAILED', 500)
  }
}
