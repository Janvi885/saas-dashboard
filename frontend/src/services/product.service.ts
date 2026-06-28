import { API_ROUTES } from '@/constants/api.routes'
import type {
  PaginatedProducts,
  Product,
  ProductFilters,
  ProductInput,
} from '@/types'
import { apiClient, withApiErrorHandling } from './api.client'

function buildQueryParams(
  filters?: ProductFilters,
): Record<string, string | number> | undefined {
  if (!filters) {
    return undefined
  }

  const params: Record<string, string | number> = {}

  if (filters.category && filters.category !== 'all') {
    params.category = filters.category
  }
  if (filters.status && filters.status !== 'all') {
    params.status = filters.status
  }
  if (filters.search) {
    params.search = filters.search
  }
  if (filters.sortBy) {
    params.sortBy = filters.sortBy
  }
  if (filters.sortOrder) {
    params.sortOrder = filters.sortOrder
  }
  if (filters.page !== undefined) {
    params.page = filters.page
  }
  if (filters.pageSize !== undefined) {
    params.pageSize = filters.pageSize
  }

  return Object.keys(params).length > 0 ? params : undefined
}

export async function getProducts(
  filters?: ProductFilters,
): Promise<PaginatedProducts> {
  return withApiErrorHandling(
    () =>
      apiClient.get<PaginatedProducts>(API_ROUTES.products, {
        params: buildQueryParams(filters),
      }),
    'Failed to fetch products',
  )
}

export async function getProductById(id: string): Promise<Product> {
  return withApiErrorHandling(async () => {
    const data = await apiClient.get<{ product: Product }>(
      API_ROUTES.productById(id),
    )
    return data.product
  }, 'Failed to fetch product')
}

export async function createProduct(data: ProductInput): Promise<Product> {
  return withApiErrorHandling(async () => {
    const result = await apiClient.post<{ product: Product }>(
      API_ROUTES.products,
      data,
    )
    return result.product
  }, 'Failed to create product')
}

export async function updateProduct(
  id: string,
  data: Partial<ProductInput>,
): Promise<Product> {
  return withApiErrorHandling(async () => {
    const result = await apiClient.put<{ product: Product }>(
      API_ROUTES.productById(id),
      data,
    )
    return result.product
  }, 'Failed to update product')
}

export async function deleteProduct(id: string): Promise<void> {
  return withApiErrorHandling(
    () => apiClient.delete(API_ROUTES.productById(id)),
    'Failed to delete product',
  )
}

export async function generateProductDescription(params: {
  name: string
  category: string
  price: number
}): Promise<string> {
  return withApiErrorHandling(async () => {
    const result = await apiClient.post<{ description: string }>(
      API_ROUTES.aiDescription,
      params,
    )
    return result.description
  }, 'Failed to generate description')
}
