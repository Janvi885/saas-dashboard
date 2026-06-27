import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { RoleGuard } from '@/components/shared/RoleGuard'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import NewProductPage from '@/pages/products/NewProductPage'
import ProductDetailPage from '@/pages/products/ProductDetailPage'
import ProductsPage from '@/pages/products/ProductsPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/products',
            element: <ProductsPage />,
          },
          {
            path: '/products/new',
            element: (
              <RoleGuard
                allowedRoles={['admin']}
                fallback={<Navigate to="/products" replace />}
              >
                <NewProductPage />
              </RoleGuard>
            ),
          },
          {
            path: '/products/:id',
            element: <ProductDetailPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
