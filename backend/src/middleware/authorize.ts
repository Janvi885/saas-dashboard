import { Request, Response, NextFunction } from 'express'
import { isUserRole, type UserRole } from '../types'
import { errorResponse } from '../utils/apiResponse'

/** Enforces RBAC using custom claim `role` from the verified ID token. */
export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role

    if (!isUserRole(userRole)) {
      errorResponse(res, 'Forbidden', 'NO_ROLE_ASSIGNED', 403, req)
      return
    }

    if (!roles.includes(userRole)) {
      errorResponse(res, 'Forbidden', 'INSUFFICIENT_ROLE', 403, req)
      return
    }

    next()
  }
}
