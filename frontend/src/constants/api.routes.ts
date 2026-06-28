/** Relative API paths — base URL is configured only in api.client.ts */
export const API_ROUTES = {
  products: '/api/products',
  productById: (id: string) => `/api/products/${id}`,
  aiDescription: '/api/products/ai-description',
  analytics: '/api/analytics',
  setRole: '/api/admin/set-role',
} as const
