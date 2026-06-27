import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { AppRouter } from '@/router'
import { AuthProvider } from '@/store/AuthContext'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  )
}
