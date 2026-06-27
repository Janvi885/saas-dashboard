import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { created, errorResponse, noContent, notFound, success } from '../../utils/apiResponse'
import { AppError } from '../../utils/AppError'
import { log } from '../../utils/logger'
import * as aiService from './ai.service'
import * as productService from './product.service'
import { productFiltersSchema } from './product.validators'

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const parsed = productFiltersSchema.safeParse(req.query)

  if (!parsed.success) {
    log('warn', 'Product filter validation failed', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      details: parsed.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'query',
        message: issue.message,
      })),
    })
    errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, req)
    return
  }

  const result = await productService.getProducts(parsed.data)
  success(res, result)
})

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id)

    if (!id.trim()) {
      throw new AppError('Invalid product id', 'VALIDATION_ERROR', 400)
    }

    const product = await productService.getProductById(id)

    if (!product) {
      notFound(res, 'Product not found', req)
      return
    }

    success(res, { product })
  },
)

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body, req.user!.uid)
    created(res, { product })
  },
)

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id)
    const product = await productService.updateProduct(id, req.body)
    success(res, { product })
  },
)

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id)
    await productService.deleteProduct(id)
    noContent(res)
  },
)

export const generateDescription = asyncHandler(
  async (req: Request, res: Response) => {
    const description = await aiService.generateDescription(
      req.body,
      req.user!.uid,
    )
    success(res, { description })
  },
)
