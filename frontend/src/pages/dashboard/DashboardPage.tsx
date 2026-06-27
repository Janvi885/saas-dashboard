import { Link } from 'react-router-dom'
import {
  DollarSign,
  Package,
  PackageCheck,
  Plus,
  Tag,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MetricCard } from '@/features/dashboard/components/MetricCard'
import { ProductStatusPie } from '@/features/dashboard/components/ProductStatusPie'
import { RevenueChart } from '@/features/dashboard/components/RevenueChart'
import { useAnalytics } from '@/features/dashboard/hooks/useAnalytics'
import { useProducts } from '@/features/products/hooks/useProducts'
import { useRole } from '@/hooks/useRole'
import { formatCurrency, formatDate } from '@/utils/formatters'

export default function DashboardPage() {
  const { isAdmin, isViewer } = useRole()
  const { metrics, loading: metricsLoading, error: metricsError } = useAnalytics()
  const {
    products: recentProducts,
    loading: productsLoading,
    error: productsError,
  } = useProducts({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    pageSize: 5,
    page: 1,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          isAdmin ? 'Full business overview' : 'Read-only product overview'
        }
        actions={
          isAdmin ? (
            <Link to="/products/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
          ) : undefined
        }
      />

      {isViewer && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          You have viewer access. Contact an admin to make changes.
        </div>
      )}

      {metricsError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {metricsError.message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Products"
          value={metrics?.totalProducts ?? 0}
          icon={Package}
          trend={8.2}
          loading={metricsLoading}
          iconClassName="bg-blue-500/10 text-blue-600"
        />
        <MetricCard
          title="Active Products"
          value={metrics?.activeProducts ?? 0}
          icon={PackageCheck}
          trend={4.5}
          loading={metricsLoading}
          iconClassName="bg-emerald-500/10 text-emerald-600"
        />
        <MetricCard
          title="Total Revenue"
          value={
            metrics ? formatCurrency(metrics.totalRevenue) : formatCurrency(0)
          }
          icon={DollarSign}
          trend={12.3}
          loading={metricsLoading}
          iconClassName="bg-violet-500/10 text-violet-600"
        />
        <MetricCard
          title="Avg Price"
          value={metrics ? formatCurrency(metrics.averagePrice) : formatCurrency(0)}
          icon={Tag}
          trend={-2.1}
          loading={metricsLoading}
          iconClassName="bg-amber-500/10 text-amber-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <ProductStatusPie
          activeCount={metrics?.activeProducts ?? 0}
          inactiveCount={metrics?.inactiveProducts ?? 0}
          loading={metricsLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
          <CardDescription>Last 5 products added to the catalog</CardDescription>
        </CardHeader>
        <CardContent>
          {productsError ? (
            <p className="py-8 text-center text-sm text-destructive">
              {productsError.message}
            </p>
          ) : productsLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading products...
            </p>
          ) : recentProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No products yet. Add your first product to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(product.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
