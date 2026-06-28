import { API_ROUTES } from '@/constants/api.routes'
import type { AnalyticsMetrics } from '@/types'
import { apiClient, withApiErrorHandling } from './api.client'

export async function getAnalytics(): Promise<AnalyticsMetrics> {
  return withApiErrorHandling(
    () => apiClient.get<AnalyticsMetrics>(API_ROUTES.analytics),
    'Failed to fetch analytics',
  )
}
