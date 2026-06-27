import { useCallback, useEffect, useState } from 'react'
import {
  showApiErrorToast,
  showProductDeletedToast,
} from '@/features/products/utils/productToasts'
import { ApiError } from '@/services/api.client'
import {
  deleteProduct as deleteProductService,
  getProducts,
} from '@/services/product.service'
import { useAuth } from '@/store/AuthContext'
import type { Product, ProductFilters } from '@/types'

const DEFAULT_FILTERS: ProductFilters = {
  category: 'all',
  status: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: 20,
}

type UseProductsResult = {
  products: Product[]
  loading: boolean
  error: ApiError | null
  total: number
  totalPages: number
  filters: ProductFilters
  setFilters: (filters: ProductFilters) => void
  deleteProduct: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useProducts(
  initialFilters: ProductFilters = {},
): UseProductsResult {
  const { user, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFiltersState] = useState<ProductFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  })

  const fetchProducts = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getProducts(filters)
      setProducts(result.products)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError('Failed to load products', 'FETCH_FAILED', 500)
      setError(apiError)
      showApiErrorToast(apiError, 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [filters, user])

  const setFilters = useCallback((updates: ProductFilters) => {
    setFiltersState((prev) => {
      const next = { ...prev, ...updates }
      const isPaginationOnly = Object.keys(updates).every(
        (key) => key === 'page' || key === 'pageSize',
      )

      if (!isPaginationOnly && updates.page === undefined) {
        next.page = 1
      }

      return next
    })
  }, [])

  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        await deleteProductService(id)
        showProductDeletedToast()
        await fetchProducts()
      } catch (err) {
        showApiErrorToast(err, 'Could not delete the product. Please try again.')
        throw err
      }
    },
    [fetchProducts],
  )

  useEffect(() => {
    if (!authLoading) {
      void fetchProducts()
    }
  }, [fetchProducts, authLoading])

  return {
    products,
    loading: authLoading || loading,
    error,
    total,
    totalPages,
    filters,
    setFilters,
    deleteProduct,
    refetch: fetchProducts,
  }
}
