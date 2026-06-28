import { Link, useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useBreadcrumbLabel } from '@/context/BreadcrumbContext'
import { DeleteProductDialog } from '@/features/products/components/DeleteProductDialog'
import { ProductForm } from '@/features/products/components/ProductForm'
import { useProduct } from '@/features/products/hooks/useProduct'
import { useRole } from '@/hooks/useRole'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useState } from 'react'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useRole()
  const { product, loading, error, deleting, deleteProduct } = useProduct(id)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useBreadcrumbLabel(product?.name ?? null)

  async function handleDelete() {
    try {
      await deleteProduct()
      navigate('/products')
    } catch {
      // Toast handled in hook
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-semibold text-destructive">
          {error ?? 'Product not found'}
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          We could not load this product. It may have been removed or you may not
          have access.
        </p>
        <Link to="/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Product"
          description={product.name}
          actions={
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          }
        />

        <ProductForm
          product={product}
          onSuccess={() => navigate('/products')}
        />

        <DeleteProductDialog
          product={product}
          open={deleteOpen}
          deleting={deleting}
          onOpenChange={setDeleteOpen}
          onConfirm={() => void handleDelete()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description="Product details (read only)"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {product.name}
            <Badge
              variant="secondary"
              className={
                product.status === 'active'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : undefined
              }
            >
              {product.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <DetailField label="Category" value={product.category} />
          <DetailField label="Price" value={formatCurrency(product.price)} />
          <DetailField label="SKU" value={product.sku ?? '—'} />
          <DetailField
            label="Stock"
            value={product.stock !== undefined ? String(product.stock) : '—'}
          />
          <DetailField label="Created" value={formatDate(product.createdAt)} />
          <DetailField label="Updated" value={formatDate(product.updatedAt)} />
          <div className="sm:col-span-2">
            <DetailField
              label="Description"
              value={product.description ?? 'No description provided.'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  )
}
