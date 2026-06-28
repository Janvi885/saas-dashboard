import { Request, Response } from 'express'

type ErrorBody = {
  error: string
  code: string
  requestId?: string
}

type SuccessBody<T> = {
  data: T
  meta?: Record<string, unknown>
}

function withRequestId(
  body: ErrorBody,
  req?: Request,
): ErrorBody {
  if (req?.id) {
    return { ...body, requestId: req.id }
  }

  return body
}

export function healthResponse(res: Response): Response {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}

export function errorResponse(
  res: Response,
  message: string,
  code: string,
  statusCode: number,
  req?: Request,
): Response {
  return res
    .status(statusCode)
    .json(withRequestId({ error: message, code }, req))
}

export function success<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>,
): Response {
  const body: SuccessBody<T> = { data }

  if (meta) {
    body.meta = meta
  }

  return res.status(statusCode).json(body)
}

export function created<T>(res: Response, data: T): Response {
  return success(res, data, 201)
}

export function noContent(res: Response): Response {
  return res.status(204).send()
}

export function notFound(
  res: Response,
  message: string,
  req?: Request,
): Response {
  return errorResponse(res, message, 'NOT_FOUND', 404, req)
}

export function badRequest(
  res: Response,
  message: string,
  req?: Request,
): Response {
  return errorResponse(res, message, 'BAD_REQUEST', 400, req)
}
