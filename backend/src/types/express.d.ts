import { DecodedIdToken } from 'firebase-admin/auth'
import type { ProductFiltersInput } from '../modules/products/product.validators'

declare global {
  namespace Express {
    interface Request {
      id?: string
      user?: DecodedIdToken
      validatedQuery?: ProductFiltersInput
    }
  }
}
