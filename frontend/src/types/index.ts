export type UserRole = 'admin' | 'viewer'

export type AuthUser = {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  emailVerified: boolean
}

export type ProductCategory =
  | 'Electronics'
  | 'Clothing'
  | 'Food'
  | 'Software'
  | 'Home'
  | 'Books'
  | 'Other'

export type ProductStatus = 'active' | 'inactive'

export type Product = {
  id: string
  name: string
  category: ProductCategory
  price: number
  status: ProductStatus
  description?: string
  sku?: string
  stock?: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>

export type ProductFilters = {
  category?: ProductCategory | 'all'
  status?: ProductStatus | 'all'
  search?: string
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export type PaginatedProducts = {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type AnalyticsMetrics = {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  totalRevenue: number
  averagePrice: number
  productsByCategory: Record<ProductCategory, number>
}

export type ApiError = {
  message: string
  code: string
  statusCode: number
}
