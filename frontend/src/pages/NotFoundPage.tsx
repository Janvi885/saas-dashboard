import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <p className="text-8xl font-bold tracking-tighter text-primary/20 sm:text-9xl">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
        The page you are looking for does not exist or may have been moved.
        Check the URL or return to your dashboard.
      </p>
      <Link to="/dashboard" className="mt-8">
        <Button size="lg">Back to Dashboard</Button>
      </Link>
    </div>
  )
}
