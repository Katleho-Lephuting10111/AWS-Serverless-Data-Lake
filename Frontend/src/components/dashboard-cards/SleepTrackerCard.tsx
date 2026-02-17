import { Moon } from 'lucide-react'
import WellnessCard from '../WellnessCard'
import ProgressBar from '../ProgressBar'

interface SleepTrackerCardProps {
  hours: number
  avgHours: number
}

export default function SleepTrackerCard({ hours, avgHours }: SleepTrackerCardProps) {
  const target = 8

  const getStatusColor = () => {
    if (hours < 6) return '#8b5a3c' // Deep Clay
    if (hours < 7) return '#d98f55' // Sunset Orange
    if (hours < 8) return '#9cb9a3' // Sage Green
    return '#3a6b1f' // Forest Green
  }

  const getQualityText = () => {
    if (hours < 6) return 'Insufficient sleep'
    if (hours < 7) return 'Acceptable'
    if (hours < 8) return 'Good sleep'
    return 'Excellent sleep'
  }

  return (
    <WellnessCard
      title="Sleep Tracker"
      icon={<Moon size={24} className="text-nature-sky" />}
      gradient="bg-gradient-to-br from-nature-sky-light/20 to-nature-sky/20 dark:from-nature-sky-dark/30 dark:to-nature-sky/30"
    >
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-gray-900 dark:text-white">
            {hours.toFixed(1)}
          </span>
          <span className="text-2xl text-gray-600 dark:text-gray-400">hrs</span>
        </div>

        <div className="text-sm font-medium" style={{ color: getStatusColor() }}>
          {getQualityText()}
        </div>

        <ProgressBar
          value={hours}
          max={target}
          color={getStatusColor()}
          label={`${hours.toFixed(1)}/${target} hrs`}
          target="Target"
          showPercentage={false}
        />

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Weekly avg: {avgHours.toFixed(1)} hrs
        </div>
      </div>
    </WellnessCard>
  )
}
