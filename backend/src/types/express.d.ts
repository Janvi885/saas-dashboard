import { DecodedIdToken } from 'firebase-admin/auth'
import type { ProductFiltersQuery } from '../schemas/product.schema'

declare global {
  namespace Express {
    interface Request {
      id?: string
      user?: DecodedIdToken
      validatedQuery?: ProductFiltersQuery
    }
  }
}
