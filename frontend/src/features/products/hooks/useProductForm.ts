import { useCallback, useState } from 'react'
import {
  toProductInput,
  type ProductFormValues,
} from '@/features/products/schemas/product.schema'
import {
  showApiErrorToast,
  showProductCreatedToast,
  showProductUpdatedToast,
} from '@/features/products/utils/productToasts'
import {
  createProduct,
  generateProductDescription,
  updateProduct,
} from '@/services/product.service'
import type { Product, ProductCategory } from '@/types'

type UseProductFormOptions = {
  product?: Product
  onSuccess: () => void
}

type GenerateDescriptionParams = {
  name: string
  category: ProductCategory
  price: number
}

export function useProductForm({ product, onSuccess }: UseProductFormOptions) {
  const isEdit = Boolean(product)
  const [generatingDescription, setGeneratingDescription] = useState(false)

  const saveProduct = useCallback(
    async (values: ProductFormValues) => {
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
        throw err
      }
    },
    [isEdit, onSuccess, product],
  )

  const generateDescription = useCallback(
    async (params: GenerateDescriptionParams) => {
      setGeneratingDescription(true)

      try {
        return await generateProductDescription(params)
      } catch (err) {
        showApiErrorToast(
          err,
          'Could not generate a description. Please try again.',
        )
        throw err
      } finally {
        setGeneratingDescription(false)
      }
    },
    [],
  )

  return {
    isEdit,
    generatingDescription,
    saveProduct,
    generateDescription,
  }
}
