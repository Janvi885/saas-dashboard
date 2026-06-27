import { z, type ZodType } from 'zod'

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

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  category: productCategorySchema,
  price: z.number().positive('Price must be greater than 0'),
  status: productStatusSchema,
  description: z.string().trim().max(2000).optional(),
  sku: z.string().trim().max(100).optional(),
  stock: z.number().int().min(0).optional(),
})

export const productUpdateSchema = productCreateSchema.partial()

type ValidationError = {
  message: string
  details: Array<{ field: string; message: string }>
}

type ValidateResult<T> =
  | { data: T; error: null }
  | { data: null; error: ValidationError }

export function validateRequest<T>(
  schema: ZodType<T>,
  data: unknown,
): ValidateResult<T> {
  const result = schema.safeParse(data)

  if (result.success) {
    return { data: result.data, error: null }
  }

  return {
    data: null,
    error: {
      message: 'Validation failed',
      details: result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      })),
    },
  }
}

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
