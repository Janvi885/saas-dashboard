import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  productFormSchema,
  PRODUCT_CATEGORIES,
  toProductInput,
  type ProductFormValues,
} from '@/features/products/schemas/product.schema'
import {
  showApiErrorToast,
  showProductCreatedToast,
  showProductUpdatedToast,
} from '@/features/products/utils/productToasts'
import { useRole } from '@/hooks/useRole'
import {
  createProduct,
  generateProductDescription,
  updateProduct,
} from '@/services/product.service'
import type { Product } from '@/types'

type ProductFormProps = {
  product?: Product
  onSuccess: () => void
}

function toFormValues(product?: Product): ProductFormValues {
  return {
    name: product?.name ?? '',
    category: product?.category ?? 'Electronics',
    price: product?.price ?? 0,
    status: product?.status ?? 'active',
    description: product?.description ?? '',
    sku: product?.sku ?? '',
    stock: product?.stock ?? undefined,
  }
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const isEdit = Boolean(product)
  const { isAdmin } = useRole()
  const [generatingDescription, setGeneratingDescription] = useState(false)
  const [aiGenerated, setAiGenerated] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toFormValues(product),
  })

  const submitting = form.formState.isSubmitting
  const name = form.watch('name')
  const category = form.watch('category')
  const price = form.watch('price')
  const canGenerateAi = Boolean(name?.trim() && category)

  async function onSubmit(values: ProductFormValues) {
    const payload = toProductInput(values)

    try {
      if (isEdit && product) {
        await updateProduct(product.id, payload)
        showProductUpdatedToast()
      } else {
        await createProduct(payload)
        showProductCreatedToast()
      }
      onSuccess()
    } catch (err) {
      showApiErrorToast(
        err,
        isEdit
          ? 'Could not update the product. Please try again.'
          : 'Could not create the product. Please try again.',
      )
    }
  }

  async function handleGenerateDescription() {
    if (!canGenerateAi) {
      return
    }

    setGeneratingDescription(true)

    try {
      const description = await generateProductDescription({
        name: name.trim(),
        category,
        price: typeof price === 'number' ? price : 0,
      })
      form.setValue('description', description, { shouldDirty: true })
      setAiGenerated(true)
    } catch (err) {
      showApiErrorToast(err, 'Could not generate a description. Please try again.')
    } finally {
      setGeneratingDescription(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((categoryOption) => (
                      <SelectItem key={categoryOption} value={categoryOption}>
                        {categoryOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-7"
                      {...field}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ''
                            ? ''
                            : Number(event.target.value),
                        )
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="SKU-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={field.value ?? ''}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ''
                          ? undefined
                          : Number(event.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <FormLabel>Description</FormLabel>
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0"
                      disabled={!canGenerateAi || generatingDescription}
                      onClick={() => void handleGenerateDescription()}
                    >
                      {generatingDescription && (
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      )}
                      ✨ Generate with AI
                    </Button>
                  )}
                </div>
                <FormControl>
                  <textarea
                    rows={4}
                    placeholder="Product description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    onChange={(event) => {
                      setAiGenerated(false)
                      field.onChange(event)
                    }}
                  />
                </FormControl>
                {aiGenerated && (
                  <p className="text-xs text-muted-foreground">
                    AI-generated — review before saving
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Update Product' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
