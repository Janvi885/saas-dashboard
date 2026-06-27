import { adminDb } from '../config/firebase'
import type { AnalyticsMetrics, ProductCategory } from '../types'
import { AppError } from '../utils/AppError'
import { log } from '../utils/logger'

const COLLECTION = 'products'

function emptyCategoryCounts(): Record<ProductCategory, number> {
  return {
    Electronics: 0,
    Clothing: 0,
    Food: 0,
    Software: 0,
    Home: 0,
    Books: 0,
    Other: 0,
  }
}

export async function getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION)
      .select('price', 'status', 'category')
      .get()

    const productsByCategory = emptyCategoryCounts()
    let activeProducts = 0
    let inactiveProducts = 0
    let totalRevenue = 0
    let priceSum = 0

    for (const doc of snapshot.docs) {
      const data = doc.data()
      const price = typeof data.price === 'number' ? data.price : 0
      const status = data.status as string | undefined
      const category = data.category as ProductCategory | undefined

      priceSum += price

      if (status === 'active') {
        activeProducts += 1
        totalRevenue += price
      } else if (status === 'inactive') {
        inactiveProducts += 1
      }

      if (category && category in productsByCategory) {
        productsByCategory[category] += 1
      }
    }

    const totalProducts = snapshot.size

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      totalRevenue,
      averagePrice: totalProducts > 0 ? priceSum / totalProducts : 0,
      productsByCategory,
    }
  } catch (err) {
    log('error', 'Analytics query failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    throw new AppError('Failed to fetch analytics', 'FIRESTORE_ERROR', 500)
  }
}
