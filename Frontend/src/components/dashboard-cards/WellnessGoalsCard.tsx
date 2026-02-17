import { Target, CheckCircle, Circle } from 'lucide-react'
import WellnessCard from '../WellnessCard'
import ProgressBar from '../ProgressBar'

interface WellnessGoalsCardProps {
  socialMediaHours: number
  sleepHours: number
  conflicts: number
}

export default function WellnessGoalsCard({ socialMediaHours, sleepHours, conflicts }: WellnessGoalsCardProps) {
  const goals = [
    {
      label: 'Screen time limit',
      achieved: socialMediaHours < 3,
      progress: Math.min(100, (3 - socialMediaHours) / 3 * 100),
      color: '#3a6b1f'
    },
    {
      label: 'Sleep target',
      achieved: sleepHours >= 7,
      progress: Math.min(100, (sleepHours / 7) * 100),
      color: '#5ba3b5'
    },
    {
      label: 'Conflict-free day',
      achieved: conflicts === 0,
      progress: conflicts === 0 ? 100 : Math.max(0, 100 - conflicts * 25),
      color: '#9cb9a3'
    },
  ]

  const completedGoals = goals.filter(g => g.achieved).length
  const completionPercentage = (completedGoals / goals.length) * 100

  return (
    <WellnessCard
      title="Daily Wellness Goals"
      icon={<Target size={24} className="text-nature-forest" />}
      gradient="bg-gradient-to-br from-nature-forest-light/20 to-nature-sage-light/20 dark:from-nature-forest-dark/30 dark:to-nature-sage-dark/30"
    >
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-gray-900 dark:text-white">
            {completedGoals}
          </span>
          <span className="text-2xl text-gray-600 dark:text-gray-400">/ {goals.length}</span>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {completionPercentage.toFixed(0)}% of daily goals achieved
        </div>

        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {goal.achieved ? (
                    <CheckCircle size={16} className="text-nature-forest" />
                  ) : (
                    <Circle size={16} className="text-gray-400" />
                  )}
                  <span className={`text-sm ${goal.achieved ? 'text-nature-forest font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                    {goal.label}
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${goal.progress}%`,
                    backgroundColor: goal.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </WellnessCard>
  )
}
