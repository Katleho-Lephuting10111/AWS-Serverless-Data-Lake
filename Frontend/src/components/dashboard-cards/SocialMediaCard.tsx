import { Smartphone, TrendingDown, TrendingUp } from 'lucide-react'
import WellnessCard from '../WellnessCard'
import ProgressBar from '../ProgressBar'

interface SocialMediaCardProps {
  hours: number
  avgHours: number
}

export default function SocialMediaCard({ hours, avgHours }: SocialMediaCardProps) {
  const recommended = 3
  const percentage = (hours / recommended) * 100

  const getStatusColor = () => {
    if (hours < 2) return '#88a88f' // Sage Green
    if (hours <= 3) return '#5ba3b5' // Sky Blue
    if (hours <= 5) return '#d98f55' // Sunset Orange
    return '#8b5a3c' // Deep Clay
  }

  const getStatusText = () => {
    if (hours < 2) return 'Excellent usage'
    if (hours <= 3) return 'Good balance'
    if (hours <= 5) return 'Moderate usage'
    return 'High usage'
  }

  const trend = hours - avgHours
  const TrendIcon = trend > 0 ? TrendingUp : TrendingDown

  return (
    <WellnessCard
      title="Social Media Usage"
      icon={<Smartphone size={24} className="text-nature-sunset" />}
      gradient="bg-gradient-to-br from-nature-sunset-light/20 to-nature-earth-light/20 dark:from-nature-sunset-dark/20 dark:to-nature-earth-dark/20"
    >
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-gray-900 dark:text-white">
            {hours.toFixed(1)}
          </span>
          <span className="text-2xl text-gray-600 dark:text-gray-400">hrs</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span style={{ color: getStatusColor() }} className="font-medium">
            {getStatusText()}
          </span>
          <TrendIcon size={16} className={trend > 0 ? 'text-nature-clay' : 'text-nature-sage'} />
          <span>{Math.abs(trend).toFixed(1)}hrs vs avg</span>
        </div>

        <ProgressBar
          value={hours}
          max={recommended}
          color={getStatusColor()}
          label={`${hours.toFixed(1)}/${recommended} hrs`}
          target="Recommended limit"
          showPercentage={false}
        />
      </div>
    </WellnessCard>
  )
}
