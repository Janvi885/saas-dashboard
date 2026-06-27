import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProductForm } from '@/features/products/components/ProductForm'

export default function NewProductPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Product"
        description="Add a new product to your catalog"
      />

      <ProductForm onSuccess={() => navigate('/products')} />
    </div>
  )
}
