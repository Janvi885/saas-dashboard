import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { getAnalytics } from './analytics.controller'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize('admin', 'viewer'),
  getAnalytics,
)

export default router