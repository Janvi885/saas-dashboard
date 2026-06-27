import type {
  PaginatedProducts,
  Product,
  ProductFilters,
  ProductInput,
} from '@/types'
import { apiClient } from './api.client'

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
  return apiClient.get<PaginatedProducts>('/api/products', {
    params: buildQueryParams(filters),
  })
}

export async function getProductById(id: string): Promise<Product> {
  const data = await apiClient.get<{ product: Product }>(`/api/products/${id}`)
  return data.product
}

export async function createProduct(data: ProductInput): Promise<Product> {
  const result = await apiClient.post<{ product: Product }>('/api/products', data)
  return result.product
}

export async function updateProduct(
  id: string,
  data: Partial<ProductInput>,
): Promise<Product> {
  const result = await apiClient.put<{ product: Product }>(
    `/api/products/${id}`,
    data,
  )
  return result.product
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/api/products/${id}`)
}

export async function generateProductDescription(params: {
  name: string
  category: string
  price: number
}): Promise<string> {
  const result = await apiClient.post<{ description: string }>(
    '/api/products/ai-description',
    params,
  )
  return result.description
}
