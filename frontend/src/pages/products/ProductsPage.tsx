import { Link } from 'react-router-dom'
import { Plus, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductFilters } from '@/features/products/components/ProductFilters'
import { ProductTable } from '@/features/products/components/ProductTable'
import { useProducts } from '@/features/products/hooks/useProducts'
import { useRole } from '@/hooks/useRole'

export default function ProductsPage() {
  const { isAdmin, isViewer } = useRole()
  const {
    products,
    loading,
    error,
    total,
    totalPages,
    filters,
    setFilters,
    deleteProduct,
    refetch,
  } = useProducts()

  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 20
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={
          isViewer
            ? 'Browse products (read only)'
            : 'Manage your product catalog'
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

      {error && (
        <div className="flex flex-col gap-3 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">{error.message}</p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => void refetch()}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      )}

      {loading && products.length === 0 && !error ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
      <ProductFilters filters={filters} onFiltersChange={setFilters} />

      <ProductTable
        products={products}
        loading={loading}
        onDelete={isAdmin ? deleteProduct : undefined}
      />
        </>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total === 0
            ? 'Showing 0 products'
            : `Showing ${start}-${end} of ${total}`}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) =>
                setFilters({ pageSize: Number(value), page: 1 })
              }
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setFilters({ page: page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading || totalPages === 0}
              onClick={() => setFilters({ page: page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
