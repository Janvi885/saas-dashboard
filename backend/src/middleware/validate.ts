import { Request, Response, NextFunction } from 'express'
import { ZodError, type ZodType } from 'zod'
import { errorResponse } from '../utils/apiResponse'
import { log } from '../utils/logger'

export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      logValidationFailure(req, result.error)
      errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, req)
      return
    }

    req.body = result.data
    next()
  }
}

function logValidationFailure(req: Request, error: ZodError): void {
  log('warn', 'Request body validation failed', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    details: error.issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
      message: issue.message,
    })),
  })
}
