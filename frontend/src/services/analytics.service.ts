import type { AnalyticsMetrics } from '@/types'
import { apiClient } from './api.client'

export async function getAnalytics(): Promise<AnalyticsMetrics> {
  return apiClient.get<AnalyticsMetrics>('/api/analytics')
}
