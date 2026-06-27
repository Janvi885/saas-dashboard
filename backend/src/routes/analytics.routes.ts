import { Router } from 'express'
import { withAuth } from '../middleware/withAuth'
import { getAnalyticsMetrics } from '../services/analytics.service'
import { asyncHandler } from '../utils/asyncHandler'
import { success } from '../utils/apiResponse'
import {
  ANALYTICS_CACHE_KEY,
  ANALYTICS_CACHE_TTL_MS,
  getCached,
  setCache,
} from '../utils/cache'
import type { AnalyticsMetrics } from '../types'

const router = Router()

// GET /api/analytics — admin or viewer, cached for 60 seconds
router.get(
  '/',
  ...withAuth(),
  asyncHandler(async (_req, res) => {
    const cached = getCached<AnalyticsMetrics>(ANALYTICS_CACHE_KEY)

    if (cached) {
      res.set('Cache-Control', 'private, max-age=60')
      success(res, cached)
      return
    }

    const metrics = await getAnalyticsMetrics()
    setCache(ANALYTICS_CACHE_KEY, metrics, ANALYTICS_CACHE_TTL_MS)
    res.set('Cache-Control', 'private, max-age=60')
    success(res, metrics)
  }),
)

export default router
