import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FormFieldLabel } from '@/components/form/FormFieldLabel'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
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
  type ProductFormValues,
} from '@/features/products/schemas/product.schema'
import { useProductForm } from '@/features/products/hooks/useProductForm'
import { useRole } from '@/hooks/useRole'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

const FIELD_TOOLTIPS = {
  name: 'Required. Product display name between 2 and 100 characters.',
  category: 'Required. Choose the catalog category for this product.',
  status: 'Required. Active products are visible in listings; inactive are hidden.',
  price: 'Required. Enter a price in USD greater than 0 (max 999,999.99).',
  sku: 'Optional. Alphanumeric characters and dashes only, up to 50 characters.',
  stock: 'Optional. Whole number for inventory count (0 or greater).',
  description:
    'Optional. Product description for the catalog, up to 500 characters.',
} as const

const textareaClassName = cn(
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/30',
)

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
  const { isAdmin } = useRole()
  const { isEdit, generatingDescription, saveProduct, generateDescription } =
    useProductForm({ product, onSuccess })
  const [aiGenerated, setAiGenerated] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toFormValues(product),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const submitting = form.formState.isSubmitting
  const name = form.watch('name')
  const category = form.watch('category')
  const price = form.watch('price')
  const canGenerateAi = Boolean(name?.trim() && category)

  async function onSubmit(values: ProductFormValues) {
    try {
      await saveProduct(values)
    } catch {
      // Toast handled in hook
    }
  }

  async function handleGenerateDescription() {
    if (!canGenerateAi) {
      return
    }

    try {
      const description = await generateDescription({
        name: name.trim(),
        category,
        price: typeof price === 'number' ? price : 0,
      })
      form.setValue('description', description, { shouldDirty: true })
      setAiGenerated(true)
    } catch {
      // Toast handled in hook
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <p className="text-xs text-muted-foreground">
          Fields marked with <span className="text-destructive">*</span> are required.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormFieldLabel
                  label="Name"
                  required
                  tooltip={FIELD_TOOLTIPS.name}
                />
                <FormControl>
                  <Input
                    placeholder="Product name"
                    required
                    {...field}
                  />
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
                <FormFieldLabel
                  label="Category"
                  required
                  tooltip={FIELD_TOOLTIPS.category}
                />
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
                <FormFieldLabel
                  label="Status"
                  required
                  tooltip={FIELD_TOOLTIPS.status}
                />
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
                <FormFieldLabel
                  label="Price"
                  required
                  tooltip={FIELD_TOOLTIPS.price}
                />
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
                      required
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
                <FormFieldLabel label="SKU" tooltip={FIELD_TOOLTIPS.sku} />
                <FormControl>
                  <Input placeholder="SKU-001" {...field} />
                </FormControl>
                <FormDescription>Optional product identifier.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormFieldLabel label="Stock" tooltip={FIELD_TOOLTIPS.stock} />
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
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>Leave empty if not tracked.</FormDescription>
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
                  <FormFieldLabel
                    label="Description"
                    tooltip={FIELD_TOOLTIPS.description}
                  />
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
                    className={textareaClassName}
                    {...field}
                    onChange={(event) => {
                      setAiGenerated(false)
                      field.onChange(event)
                    }}
                  />
                </FormControl>
                {aiGenerated && (
                  <FormDescription>
                    AI-generated — review before saving
                  </FormDescription>
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
