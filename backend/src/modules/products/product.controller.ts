import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { created, noContent, notFound, success } from '../../utils/apiResponse'
import { AppError } from '../../utils/AppError'
import * as aiService from './ai.service'
import * as productService from './product.service'

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const filters = req.validatedQuery!
  const result = await productService.getProducts(filters)
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
