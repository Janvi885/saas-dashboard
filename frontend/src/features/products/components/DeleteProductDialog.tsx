import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Product } from '@/types'

type DeleteProductDialogProps = {
  product: Product | null
  open: boolean
  deleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteProductDialog({
  product,
  open,
  deleting,
  onOpenChange,
  onConfirm,
}: DeleteProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete{' '}
            <span className="font-medium text-foreground">
              {product?.name ?? 'this product'}
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
