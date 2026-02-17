import { useMetrics } from '../contexts/MetricsContext'
import SocialMediaCard from '../components/dashboard-cards/SocialMediaCard'
import SleepTrackerCard from '../components/dashboard-cards/SleepTrackerCard'
import MentalHealthCard from '../components/dashboard-cards/MentalHealthCard'
import ConflictCard from '../components/dashboard-cards/ConflictCard'
import WeeklySummaryCard from '../components/dashboard-cards/WeeklySummaryCard'
import WellnessGoalsCard from '../components/dashboard-cards/WellnessGoalsCard'

export default function Dashboard() {
  const { metrics, weeklyAverages } = useMetrics()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
        Your wellness, your data, your power
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SocialMediaCard
        hours={metrics.socialMediaHours}
        avgHours={weeklyAverages.avgSocialMediaHours}
      />
      <SleepTrackerCard
        hours={metrics.sleepHours}
        avgHours={weeklyAverages.avgSleepHours}
      />
      <MentalHealthCard
        socialMediaHours={metrics.socialMediaHours}
        sleepHours={metrics.sleepHours}
        conflicts={metrics.conflicts}
      />
      <ConflictCard
        count={metrics.conflicts}
        avgCount={weeklyAverages.avgConflicts}
      />
      <WeeklySummaryCard />
      <WellnessGoalsCard
        socialMediaHours={metrics.socialMediaHours}
        sleepHours={metrics.sleepHours}
        conflicts={metrics.conflicts}
      />
      </div>
    </div>
  )
}
