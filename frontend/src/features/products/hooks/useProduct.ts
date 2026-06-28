import { useCallback, useEffect, useState } from 'react'
import {
  showApiErrorToast,
  showProductDeletedToast,
} from '@/features/products/utils/productToasts'
import { ApiError } from '@/services/api.client'
import {
  deleteProduct as deleteProductService,
  getProductById,
} from '@/services/product.service'
import type { Product } from '@/types'

type UseProductResult = {
  product: Product | null
  loading: boolean
  error: string | null
  deleting: boolean
  deleteProduct: () => Promise<void>
}

export function useProduct(id: string | undefined): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError('Product not found')
      setProduct(null)
      return
    }

    let cancelled = false

    const productId = id

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await getProductById(productId)
        if (!cancelled) {
          setProduct(data)
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiError ? err.message : 'Failed to load product'
          setError(message)
          showApiErrorToast(err, 'Failed to load product')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [id])

  const deleteProduct = useCallback(async () => {
    if (!product) {
      return
    }

    setDeleting(true)
    try {
      await deleteProductService(product.id)
      showProductDeletedToast()
    } catch (err) {
      showApiErrorToast(err, 'Could not delete the product.')
      throw err
    } finally {
      setDeleting(false)
    }
  }, [product])

  return {
    product,
    loading,
    error,
    deleting,
    deleteProduct,
  }
}
