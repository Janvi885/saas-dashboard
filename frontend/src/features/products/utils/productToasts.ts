import { toast } from '@/hooks/use-toast'
import { ApiError } from '@/services/api.client'

export function showApiErrorToast(error: unknown, fallbackMessage: string): void {
  toast({
    variant: 'destructive',
    title:
      error instanceof ApiError ? error.message : fallbackMessage,
  })
}

export function showProductCreatedToast(): void {
  toast({ title: 'Product created successfully ✓' })
}

export function showProductUpdatedToast(): void {
  toast({ title: 'Product updated ✓' })
}

export function showProductDeletedToast(): void {
  toast({ title: 'Product deleted' })
}
