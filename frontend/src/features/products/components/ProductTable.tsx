import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteProductDialog } from '@/features/products/components/DeleteProductDialog'
import { useRole } from '@/hooks/useRole'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'
import { formatCurrency, formatDate } from '@/utils/formatters'

type ProductTableProps = {
  products: Product[]
  loading?: boolean
  onDelete?: (id: string) => Promise<void>
}

function TableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-4" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="ml-auto h-8 w-24" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function ProductTable({
  products,
  loading = false,
  onDelete,
}: ProductTableProps) {
  const { isAdmin } = useRole()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const allSelected =
    products.length > 0 && products.every((product) => selectedIds.has(product.id))

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set())
      return
    }

    setSelectedIds(new Set(products.map((product) => product.id)))
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || !onDelete) return

    setDeleting(true)
    try {
      await onDelete(deleteTarget.id)
      setDeleteTarget(null)
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(deleteTarget.id)
        return next
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && <TableHead className="w-10" />}
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="max-w-[240px]">Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableSkeletonRows />
          </TableBody>
        </Table>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Package className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No products found</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {isAdmin
            ? 'Try adjusting your filters or add a new product to get started.'
            : 'No products match your current filters.'}
        </p>
        {isAdmin && (
          <Link to="/products/new" className="mt-4">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && (
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all products"
                    className="h-4 w-4 rounded border-input"
                  />
                </TableHead>
              )}
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="max-w-[240px]">Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                {isAdmin && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleOne(product.id)}
                      aria-label={`Select ${product.name}`}
                      className="h-4 w-4 rounded border-input"
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell className="max-w-[240px] text-muted-foreground">
                  {product.description ? (
                    <span
                      className="line-clamp-2 text-sm"
                      title={product.description}
                    >
                      {product.description}
                    </span>
                  ) : (
                    <span className="text-sm italic text-muted-foreground/60">
                      —
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      product.status === 'active' &&
                        'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
                    )}
                  >
                    {product.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(product.createdAt)}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/products/${product.id}`}>
                          <Pencil className="mr-1 h-3 w-3" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(product)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteProductDialog
        product={deleteTarget}
        open={deleteTarget !== null}
        deleting={deleting}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </>
  )
}
