import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '@/services/api.client'
import { getAnalytics } from '@/services/analytics.service'
import { useAuth } from '@/store/AuthContext'
import type { AnalyticsMetrics } from '@/types'

type UseAnalyticsResult = {
  metrics: AnalyticsMetrics | null
  loading: boolean
  error: ApiError | null
  refetch: () => Promise<void>
}

export function useAnalytics(): UseAnalyticsResult {
  const { user, loading: authLoading } = useAuth()
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const refetch = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getAnalytics()
      setMetrics(data)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError('Failed to load analytics', 'FETCH_FAILED', 500),
      )
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading) {
      void refetch()
    }
  }, [authLoading, refetch])

  return {
    metrics,
    loading: authLoading || loading,
    error,
    refetch,
  }
}
