import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { success } from '../../utils/apiResponse'
import {
  ANALYTICS_CACHE_KEY,
  ANALYTICS_CACHE_TTL_MS,
  getCached,
  setCache,
} from '../../utils/cache'
import type { AnalyticsMetrics } from '../../types'
import * as analyticsService from './analytics.service'

export const getAnalytics = asyncHandler(
  async (_req: Request, res: Response) => {
    const cached = getCached<AnalyticsMetrics>(ANALYTICS_CACHE_KEY)

    if (cached) {
      res.set('Cache-Control', 'private, max-age=60')
      success(res, cached)
      return
    }

    const metrics = await analyticsService.getAnalyticsMetrics()
    setCache(ANALYTICS_CACHE_KEY, metrics, ANALYTICS_CACHE_TTL_MS)
    res.set('Cache-Control', 'private, max-age=60')
    success(res, metrics)
  },
)
