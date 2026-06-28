import { randomUUID } from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { adminAuth } from '../config/firebase'
import { errorResponse } from '../utils/apiResponse'
import { log } from '../utils/logger'
import { mapFirebaseError } from '../utils/mapFirebaseError'

/**
 * Verifies Firebase ID tokens from Authorization: Bearer headers.
 * The second argument to verifyIdToken enables revocation checks.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.id) {
    req.id = randomUUID()
  }

  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    errorResponse(res, 'Unauthorized', 'NO_TOKEN', 401, req)
    return
  }

  const token = header.slice('Bearer '.length).trim()

  if (!token) {
    errorResponse(res, 'Unauthorized', 'NO_TOKEN', 401, req)
    return
  }

  try {
    req.user = await adminAuth.verifyIdToken(token, true)

    log('info', 'Authenticated request', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      uid: req.user.uid,
      role: req.user.role ?? null,
      timestamp: new Date().toISOString(),
    })

    next()
  } catch (err) {
    const mapped = mapFirebaseError(err)
    errorResponse(res, mapped.message, mapped.code, mapped.statusCode, req)
  }
}
