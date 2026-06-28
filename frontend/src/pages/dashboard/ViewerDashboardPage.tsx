import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/store/AuthContext'

export default function ViewerDashboardPage() {
  const { user } = useAuth()
  const displayName = user?.displayName?.trim() || user?.email || 'Viewer'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {displayName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Read-only access</p>
      </div>

      <Card className="max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Product Catalog</CardTitle>
            <CardDescription>
              Browse and search all available products
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/products">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
