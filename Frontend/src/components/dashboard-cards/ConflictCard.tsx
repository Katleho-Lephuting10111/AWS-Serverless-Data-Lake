import { AlertCircle } from 'lucide-react'
import WellnessCard from '../WellnessCard'

interface ConflictCardProps {
  count: number
  avgCount: number
}

export default function ConflictCard({ count, avgCount }: ConflictCardProps) {
  const getStatusColor = () => {
    if (count === 0) return '#3a6b1f' // Forest Green
    if (count === 1) return '#9cb9a3' // Sage Green
    if (count <= 3) return '#d98f55' // Sunset Orange
    return '#8b5a3c' // Deep Clay
  }

  const getStatusText = () => {
    if (count === 0) return 'Peaceful day'
    if (count === 1) return 'Minor conflict'
    if (count <= 3) return 'Multiple conflicts'
    return 'High stress'
  }

  return (
    <WellnessCard
      title="Conflict Tracker"
      icon={<AlertCircle size={24} className="text-nature-earth" />}
      gradient="bg-gradient-to-br from-nature-earth-light/20 to-nature-sage-light/20 dark:from-nature-earth-dark/30 dark:to-nature-sage-dark/30"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="text-6xl font-bold text-gray-900 dark:text-white" style={{ color: getStatusColor() }}>
              {count}
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="text-sm font-medium" style={{ color: getStatusColor() }}>
            {getStatusText()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Weekly avg: {avgCount.toFixed(1)} conflicts
          </div>
        </div>

        {count === 0 && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-nature-forest/10">
              <span className="text-2xl">✨</span>
            </div>
          </div>
        )}
      </div>
    </WellnessCard>
  )
}
