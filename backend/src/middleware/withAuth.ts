import { RequestHandler } from 'express'
import { authenticate } from './authenticate'
import { authorize } from './authorize'
import type { UserRole } from '../types'

/**
 * Combines authentication with optional role checks.
 * No roles = any authenticated user (admin or viewer).
 */
export function withAuth(...roles: UserRole[]): RequestHandler[] {
  if (roles.length === 0) {
    return [authenticate]
  }

  return [authenticate, authorize(...roles)]
}
