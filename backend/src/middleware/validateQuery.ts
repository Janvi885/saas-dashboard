import { Request, Response, NextFunction } from 'express'
import { ZodError, type ZodType } from 'zod'
import type { ProductFiltersInput } from '../modules/products/product.validators'
import { errorResponse } from '../utils/apiResponse'
import { log } from '../utils/logger'

/** Validates URL query params with Zod; attaches parsed result to req.validatedQuery. */
export function validateQuery(schema: ZodType<ProductFiltersInput>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      logValidationFailure(req, result.error)
      errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, req)
      return
    }

    req.validatedQuery = result.data
    next()
  }
}

function logValidationFailure(req: Request, error: ZodError): void {
  log('warn', 'Request query validation failed', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    details: error.issues.map((issue) => ({
      field: issue.path.join('.') || 'query',
      message: issue.message,
    })),
  })
}
