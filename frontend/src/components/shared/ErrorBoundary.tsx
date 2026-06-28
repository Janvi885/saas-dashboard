import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { logClientError } from '@/utils/logger'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logClientError('Uncaught render error:', error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            An unexpected error occurred. Please try again or refresh the page.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre className="max-w-xl overflow-auto rounded-md border bg-muted p-4 text-left text-xs text-destructive">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          )}

          <Button onClick={this.handleRetry}>Try again</Button>
        </div>
      )
    }

    return this.props.children
  }
}
