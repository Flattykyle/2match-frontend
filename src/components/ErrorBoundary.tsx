import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // You can also log the error to an error reporting service here
    // e.g., Sentry.captureException(error)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleClearAndReload = async () => {
    // Unregister service workers and clear caches to fix stale chunk issues
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((r) => r.unregister()))
    }
    if ('caches' in window) {
      const names = await caches.keys()
      await Promise.all(names.map((n) => caches.delete(n)))
    }
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try reloading the page.
            </p>

            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <p className="font-mono text-sm text-red-800 break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.error.stack && (
                  <pre className="font-mono text-xs text-red-600 mt-2 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition font-semibold"
              >
                Reload Page
              </button>

              <button
                onClick={this.handleClearAndReload}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                Clear Cache & Reload
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
