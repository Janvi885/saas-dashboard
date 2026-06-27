import { z } from 'zod'
import { productCategorySchema, productStatusSchema } from '../lib/utils/validators'

export {
  productCategorySchema,
  productCreateSchema,
  productCreateSchema as createProductSchema,
  productStatusSchema,
  productUpdateSchema,
  productUpdateSchema as updateProductSchema,
} from '../lib/utils/validators'

export const productFiltersSchema = z.object({
  category: z.union([productCategorySchema, z.literal('all')]).optional(),
  status: z.union([productStatusSchema, z.literal('all')]).optional(),
  search: z.string().trim().max(200).optional(),
  sortBy: z
    .enum(['name', 'price', 'createdAt', 'updatedAt'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
})

export type { ProductCreateInput as CreateProductInput, ProductUpdateInput as UpdateProductInput } from '../lib/utils/validators'
export type ProductFiltersQuery = z.infer<typeof productFiltersSchema>
