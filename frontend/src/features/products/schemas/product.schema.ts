import { z } from 'zod'

export const productCategorySchema = z.enum([
  'Electronics',
  'Clothing',
  'Food',
  'Software',
  'Home',
  'Books',
  'Other',
])

export const productStatusSchema = z.enum(['active', 'inactive'])

export const productFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  category: productCategorySchema,
  price: z
    .number({ message: 'Price is required' })
    .positive('Price must be greater than 0')
    .max(999_999.99, 'Price must be at most 999,999.99'),
  status: productStatusSchema,
  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  sku: z
    .string()
    .trim()
    .max(50, 'SKU must be at most 50 characters')
    .regex(/^[a-zA-Z0-9-]*$/, 'SKU must be alphanumeric with dashes only')
    .optional(),
  stock: z.number().int().min(0, 'Stock must be 0 or greater').optional(),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

export const PRODUCT_CATEGORIES = productCategorySchema.options

export function toProductInput(values: ProductFormValues) {
  return {
    name: values.name,
    category: values.category,
    price: values.price,
    status: values.status,
    description: values.description?.trim() || undefined,
    sku: values.sku?.trim() || undefined,
    stock: values.stock,
  }
}
