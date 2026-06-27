import { Request, Response, NextFunction } from 'express'
import type { UserRole } from '../types'
import { errorResponse } from '../utils/apiResponse'

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role as UserRole | undefined

    if (!userRole || !roles.includes(userRole)) {
      errorResponse(res, 'Forbidden', 'INSUFFICIENT_ROLE', 403, req)
      return
    }

    next()
  }
}
