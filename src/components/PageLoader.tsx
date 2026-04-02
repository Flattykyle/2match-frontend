import { Loader2 } from 'lucide-react'

/**
 * Loading component shown while lazy-loading page components
 */
export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 mx-auto mb-4 text-pink-500 animate-spin" />
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  )
}
