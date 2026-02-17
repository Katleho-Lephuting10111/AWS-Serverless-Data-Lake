import { Calendar } from 'lucide-react'
import WellnessCard from '../WellnessCard'

interface WeeklySummaryCardProps {
  weeklyData?: { day: string; score: number }[]
}

export default function WeellySummaryCard({ weeklyData }: WeeklySummaryCardProps) {
  // Mock data if not provided
  const data = weeklyData || [
    { day: 'Mon', score: 75 },
    { day: 'Tue', score: 85 },
    { day: 'Wed', score: 70 },
    { day: 'Thu', score: 90 },
    { day: 'Fri', score: 65 },
    { day: 'Sat', score: 80 },
    { day: 'Sun', score: 85 },
  ]

  const average = data.reduce((sum, d) => sum + d.score, 0) / data.length

  const getBarColor = (score: number) => {
    if (score >= 85) return '#3a6b1f' // Forest Green
    if (score >= 70) return '#9cb9a3' // Sage Green
    if (score >= 50) return '#d98f55' // Sunset Orange
    return '#8b5a3c' // Deep Clay
  }

  return (
    <WellnessCard
      title="Weekly Summary"
      icon={<Calendar size={24} className="text-nature-sage" />}
      gradient="bg-gradient-to-br from-nature-sage-light/20 to-nature-sky-light/20 dark:from-nature-sage-dark/30 dark:to-nature-sky-dark/30"
    >
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {average.toFixed(0)}%
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">average wellness</span>
        </div>

        {/* Mini bar chart */}
        <div className="flex items-end justify-between gap-2 h-24">
          {data.map((item) => (
            <div key={item.day} className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-t-lg transition-all duration-300"
                  style={{
                    height: `${item.score}%`,
                    backgroundColor: getBarColor(item.score),
                    marginTop: 'auto'
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{item.day}</span>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Based on sleep, activity, and mood tracking
        </div>
      </div>
    </WellnessCard>
  )
}
