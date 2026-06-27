import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { errorResponse } from '../utils/apiResponse'
import { AppError } from '../utils/AppError'
import { log } from '../utils/logger'

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const timestamp = new Date().toISOString()
  const { method, path } = req

  let statusCode = 500
  let code = 'INTERNAL_ERROR'
  let message = 'Internal server error'

  if (err instanceof AppError) {
    statusCode = err.statusCode
    code = err.code
    message = err.message
  } else if (err instanceof ZodError) {
    statusCode = 400
    code = 'VALIDATION_ERROR'
    message = 'Validation failed'
  } else if (err instanceof Error) {
    message = 'Internal server error'
  }

  log('error', 'Request failed', {
    requestId: req.id,
    timestamp,
    method,
    path,
    statusCode,
    code,
    error: err instanceof Error ? err.message : String(err),
  })

  errorResponse(res, message, code, statusCode, req)
}
