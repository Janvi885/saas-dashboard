import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { validate } from '../../middleware/validate'
import {
  createProduct,
  deleteProduct,
  generateDescription,
  getProductById,
  getProducts,
  updateProduct,
} from './product.controller'
import {
  aiDescriptionSchema,
  productCreateSchema,
  productUpdateSchema,
} from './product.validators'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize('admin', 'viewer'),
  getProducts,
)

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(productCreateSchema),
  createProduct,
)

router.post(
  '/ai-description',
  authenticate,
  authorize('admin'),
  validate(aiDescriptionSchema),
  generateDescription,
)

router.get(
  '/:id',
  authenticate,
  authorize('admin', 'viewer'),
  getProductById,
)

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(productUpdateSchema),
  updateProduct,
)

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteProduct,
)

export default router
