import { randomUUID } from 'crypto'
import { Request, Response, NextFunction } from 'express'

export function assignRequestId(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  req.id = randomUUID()
  next()
}
