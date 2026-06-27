import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

type ErrorResponseBody = {
  error?: string
  message?: string
  code?: string
  requestId?: string
}

type SuccessResponseBody<T> = {
  data: T
  meta?: Record<string, unknown>
}

function unwrapSuccessResponse(body: unknown): unknown {
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    !('error' in body)
  ) {
    return (body as SuccessResponseBody<unknown>).data
  }

  return body
}

export class ApiError extends Error {
  readonly code: string
  readonly statusCode: number

  constructor(message: string, code: string, statusCode: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
  }
}

type ApiClient = Omit<
  AxiosInstance,
  'get' | 'post' | 'put' | 'patch' | 'delete'
> & {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const user = auth.currentUser

    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
)

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) =>
    unwrapSuccessResponse(response.data) as AxiosResponse,
  async (error: AxiosError<ErrorResponseBody>) => {
    const statusCode = error.response?.status ?? 500

    if (statusCode === 401) {
      await signOut(auth)
      window.location.href = '/login'
    }

    const data = error.response?.data
    const message =
      data?.error ?? data?.message ?? error.message ?? 'Request failed'
    const code = data?.code ?? 'API_ERROR'

    throw new ApiError(message, code, statusCode)
  },
)

export const apiClient = axiosInstance as ApiClient
