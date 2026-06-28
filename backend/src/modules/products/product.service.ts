import {
  FieldValue,
  type DocumentData,
  type Query,
  Timestamp,
} from 'firebase-admin/firestore'
import { adminDb } from '../../config/firebase'
import type {
  PaginatedProducts,
  Product,
  ProductFilters,
  ProductInput,
} from '../../types'
import { AppError } from '../../utils/AppError'
import { ANALYTICS_CACHE_KEY, invalidateCache } from '../../utils/cache'

const COLLECTION = 'products'

type SortField = NonNullable<ProductFilters['sortBy']>
type SortDirection = NonNullable<ProductFilters['sortOrder']>

function toIsoString(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (typeof value === 'string') {
    return value
  }
  return new Date().toISOString()
}

function toNumber(value: unknown): number {
  return typeof value === 'number' ? value : Number(value)
}

function mapDocToProduct(id: string, data: DocumentData): Product {
  return {
    id,
    name: data.name,
    category: data.category,
    price: toNumber(data.price),
    status: data.status,
    description: data.description,
    sku: data.sku,
    stock: data.stock,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
    createdBy: data.createdBy,
  }
}

function normalizeFilters(filters: ProductFilters): Required<
  Pick<ProductFilters, 'page' | 'pageSize' | 'sortBy' | 'sortOrder'>
> &
  ProductFilters {
  return {
    ...filters,
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 20,
    sortBy: filters.sortBy ?? 'createdAt',
    sortOrder: filters.sortOrder ?? 'desc',
  }
}

function matchesSearch(product: Product, search?: string): boolean {
  if (!search?.trim()) {
    return true
  }

  const query = search.trim().toLowerCase()

  return (
    product.name.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query) ||
    Boolean(product.description?.toLowerCase().includes(query)) ||
    Boolean(product.sku?.toLowerCase().includes(query))
  )
}

function sortProducts(
  products: Product[],
  sortBy: SortField,
  sortOrder: SortDirection,
): Product[] {
  const direction = sortOrder === 'asc' ? 1 : -1

  return [...products].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * direction
    }

    return String(aValue).localeCompare(String(bValue)) * direction
  })
}

function hasEqualityFilters(filters: ProductFilters): boolean {
  return (
    Boolean(filters.category && filters.category !== 'all') ||
    Boolean(filters.status && filters.status !== 'all')
  )
}

/** Builds a Firestore query with optional equality filters and server-side ordering. */
function buildFilteredQuery(
  filters: ProductFilters,
  sortBy: SortField,
  sortOrder: SortDirection,
  withServerSort = true,
): Query {
  let query: Query = adminDb.collection(COLLECTION)

  if (filters.category && filters.category !== 'all') {
    query = query.where('category', '==', filters.category)
  }

  if (filters.status && filters.status !== 'all') {
    query = query.where('status', '==', filters.status)
  }

  if (withServerSort) {
    return query.orderBy(sortBy, sortOrder)
  }

  return query
}

async function paginateWithFirestoreQuery(
  filters: ProductFilters,
  page: number,
  pageSize: number,
  sortBy: SortField,
  sortOrder: SortDirection,
): Promise<PaginatedProducts> {
  const query = buildFilteredQuery(filters, sortBy, sortOrder)
  const countSnapshot = await query.count().get()
  const total = countSnapshot.data().count
  const totalPages = Math.ceil(total / pageSize) || 0
  const offset = (page - 1) * pageSize

  const snapshot = await query.offset(offset).limit(pageSize).get()
  const products = snapshot.docs.map((doc) =>
    mapDocToProduct(doc.id, doc.data()),
  )

  return { products, total, page, pageSize, totalPages }
}

async function paginateInMemory(
  filters: ProductFilters,
  page: number,
  pageSize: number,
  sortBy: SortField,
  sortOrder: SortDirection,
  search?: string,
): Promise<PaginatedProducts> {
  // Avoid composite indexes (e.g. status + createdAt) by sorting in memory.
  const query = buildFilteredQuery(filters, sortBy, sortOrder, false)
  const snapshot = await query.get()

  let products = snapshot.docs.map((doc) =>
    mapDocToProduct(doc.id, doc.data()),
  )

  if (search?.trim()) {
    products = products.filter((product) => matchesSearch(product, search))
  }

  products = sortProducts(products, sortBy, sortOrder)

  const total = products.length
  const totalPages = Math.ceil(total / pageSize) || 0
  const start = (page - 1) * pageSize

  return {
    products: products.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function getProducts(
  filters: ProductFilters,
): Promise<PaginatedProducts> {
  try {
    const normalized = normalizeFilters(filters)
    const { page, pageSize, sortBy, sortOrder, search } = normalized

    if (search?.trim() || hasEqualityFilters(normalized)) {
      return paginateInMemory(
        normalized,
        page,
        pageSize,
        sortBy,
        sortOrder,
        search,
      )
    }

    return paginateWithFirestoreQuery(
      normalized,
      page,
      pageSize,
      sortBy,
      sortOrder,
    )
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError('Failed to fetch products', 'FIRESTORE_ERROR', 500)
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const doc = await adminDb.collection(COLLECTION).doc(id).get()

    if (!doc.exists) {
      return null
    }

    return mapDocToProduct(doc.id, doc.data()!)
  } catch {
    throw new AppError('Failed to fetch product', 'FIRESTORE_ERROR', 500)
  }
}

export async function createProduct(
  data: ProductInput,
  createdBy: string,
): Promise<Product> {
  try {
    const docRef = adminDb.collection(COLLECTION).doc()

    const payload = {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy,
    }

    await docRef.set(payload)
    const created = await docRef.get()

    invalidateCache(ANALYTICS_CACHE_KEY)
    return mapDocToProduct(created.id, created.data()!)
  } catch {
    throw new AppError('Failed to create product', 'FIRESTORE_ERROR', 500)
  }
}

export async function updateProduct(
  id: string,
  data: Partial<ProductInput>,
): Promise<Product> {
  try {
    const docRef = adminDb.collection(COLLECTION).doc(id)
    const existing = await docRef.get()

    if (!existing.exists) {
      throw new AppError('Product not found', 'NOT_FOUND', 404)
    }

    await docRef.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    })

    const updated = await docRef.get()
    invalidateCache(ANALYTICS_CACHE_KEY)
    return mapDocToProduct(updated.id, updated.data()!)
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError('Failed to update product', 'FIRESTORE_ERROR', 500)
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const docRef = adminDb.collection(COLLECTION).doc(id)
    const existing = await docRef.get()

    if (!existing.exists) {
      throw new AppError('Product not found', 'NOT_FOUND', 404)
    }

    await docRef.delete()
    invalidateCache(ANALYTICS_CACHE_KEY)
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError('Failed to delete product', 'FIRESTORE_ERROR', 500)
  }
}
