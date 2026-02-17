import { Heart, TrendingUp, Minus, TrendingDown } from 'lucide-react'
import WellnessCard from '../WellnessCard'

interface MentalHealthCardProps {
  socialMediaHours: number
  sleepHours: number
  conflicts: number
}

export default function MentalHealthCard({ socialMediaHours, sleepHours, conflicts }: MentalHealthCardProps) {
  // Prediction logic from DashboardSummary
  const getMentalHealthPrediction = (): { status: string; color: string } => {
    if ((socialMediaHours > 6 && sleepHours < 6) || conflicts >= 4) {
      return { status: 'Critical risk', color: '#8b5a3c' } // Deep Clay
    }
    if ((socialMediaHours >= 4 && socialMediaHours <= 6) || (sleepHours >= 6 && sleepHours <= 6.5) || (conflicts >= 2 && conflicts <= 3)) {
      return { status: 'At risk', color: '#d98f55' } // Sunset Orange
    }
    if (socialMediaHours >= 2 && socialMediaHours <= 4 && sleepHours >= 7 && conflicts <= 1) {
      return { status: 'Stable', color: '#5ba3b5' } // Sky Blue
    }
    if (socialMediaHours < 2.5 && sleepHours >= 7.5 && conflicts === 0) {
      return { status: 'Healthy', color: '#3a6b1f' } // Forest Green
    }
    return { status: 'Stable', color: '#9cb9a3' } // Sage Green
  }

  const prediction = getMentalHealthPrediction()

  // Simple trend: Compare to ideal values
  const getTrend = () => {
    const idealSocial = 2.5
    const idealSleep = 7.5
    const improvements = (socialMediaHours < idealSocial ? 1 : 0) + (sleepHours > idealSleep ? 1 : 0) + (conflicts === 0 ? 1 : 0)

    if (improvements >= 2) return 'improving'
    if (improvements === 1) return 'stable'
    return 'needs attention'
  }

  const trend = getTrend()
  const TrendIcon = trend === 'improving' ? TrendingUp : trend === 'stable' ? Minus : TrendingDown

  return (
    <WellnessCard
      title="Mental Health"
      icon={<Heart size={24} className="text-nature-forest" />}
      gradient="bg-gradient-to-br from-nature-sage-light/20 to-nature-forest-light/20 dark:from-nature-sage-dark/30 dark:to-nature-forest-dark/30"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            {/* Circular progress */}
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={prediction.color}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(prediction.status === 'Healthy' ? 100 : prediction.status === 'Stable' ? 75 : prediction.status === 'At risk' ? 50 : 25) * 3.51} 351`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart size={32} style={{ color: prediction.color }} fill={prediction.color} />
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="text-lg font-bold text-gray-900 dark:text-white" style={{ color: prediction.color }}>
            {prediction.status}
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <TrendIcon size={16} />
            <span className="capitalize">{trend}</span>
          </div>
        </div>
      </div>
    </WellnessCard>
  )
}
