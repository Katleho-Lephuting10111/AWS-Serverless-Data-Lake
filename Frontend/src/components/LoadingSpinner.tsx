import { Loader2 } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Loader2 className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin" />
    </div>
  )
}
