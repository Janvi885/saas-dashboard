import { z } from 'zod'

const SCRIPT_TAG_PATTERN = /<script[\s\S]*?>[\s\S]*?<\/script>/i
const HTML_TAG_PATTERN = /<[^>]+>/
const SQL_INJECTION_PATTERN =
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)|(--)|(;)/i

export function sanitizeString(s: string): string {
  const trimmed = s.trim()

  if (
    SCRIPT_TAG_PATTERN.test(trimmed) ||
    HTML_TAG_PATTERN.test(trimmed) ||
    SQL_INJECTION_PATTERN.test(trimmed)
  ) {
    throw new Error('Input contains disallowed content')
  }

  return trimmed
}

function safeString(min: number, max: number, message?: string) {
  return z
    .string()
    .trim()
    .min(min, message)
    .max(max)
    .superRefine((value, ctx) => {
      try {
        sanitizeString(value)
      } catch {
        ctx.addIssue({
          code: 'custom',
          message: 'Input contains disallowed content',
        })
      }
    })
    .transform(sanitizeString)
}

function safeOptionalString(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .superRefine((value, ctx) => {
      if (!value) {
        return
      }

      try {
        sanitizeString(value)
      } catch {
        ctx.addIssue({
          code: 'custom',
          message: 'Input contains disallowed content',
        })
      }
    })
    .transform((value) => (value ? sanitizeString(value) : value))
    .optional()
}

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
  name: safeString(2, 100),
  category: productCategorySchema,
  price: z.number().positive().max(999_999.99),
  status: productStatusSchema,
  description: safeOptionalString(500),
  sku: z
    .string()
    .trim()
    .max(50)
    .regex(/^[a-zA-Z0-9-]*$/, 'SKU must be alphanumeric with dashes only')
    .superRefine((value, ctx) => {
      if (!value) {
        return
      }

      try {
        sanitizeString(value)
      } catch {
        ctx.addIssue({
          code: 'custom',
          message: 'Input contains disallowed content',
        })
      }
    })
    .transform((value) => (value ? sanitizeString(value) : undefined))
    .optional(),
  stock: z.number().int().min(0).optional(),
})

export const productUpdateSchema = productCreateSchema.partial()

const safeSearchString = z
  .string()
  .trim()
  .max(200)
  .superRefine((value, ctx) => {
    if (!value) {
      return
    }

    try {
      sanitizeString(value)
    } catch {
      ctx.addIssue({
        code: 'custom',
        message: 'Input contains disallowed content',
      })
    }
  })
  .transform((value) => (value ? sanitizeString(value) : value))
  .optional()

export const productFiltersSchema = z.object({
  category: z.union([productCategorySchema, z.literal('all')]).optional(),
  status: z.union([productStatusSchema, z.literal('all')]).optional(),
  search: safeSearchString,
  sortBy: z
    .enum(['name', 'price', 'createdAt', 'updatedAt'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
})

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>

export const aiDescriptionSchema = z.object({
  name: safeString(2, 100),
  category: productCategorySchema,
  price: z.number().positive().max(999_999.99),
})

export type AiDescriptionInput = z.infer<typeof aiDescriptionSchema>
