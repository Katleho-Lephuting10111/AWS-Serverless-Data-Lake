import { useState } from 'react'
import DashboardSummary from '../components/DashboardSummary'

export default function Dashboard() {
  // Example data - in a real app, this would come from your backend/state management
  const [todayMetrics] = useState({
    socialMediaHours: 4.5,
    sleepHours: 6.5,
    conflicts: 2
  })

  const [weeklyAverages] = useState({
    avgSocialMediaHours: 5.2,
    avgSleepHours: 6.8,
    avgConflicts: 1.5
  })

  const handleEngagementAction = () => {
    // This would open a modal or navigate to a logging page
    alert('Engagement feature coming soon! This would open a mood tracker or goal-setting interface.')
  }

  return (
    <DashboardSummary
      socialMediaHours={todayMetrics.socialMediaHours}
      sleepHours={todayMetrics.sleepHours}
      conflicts={todayMetrics.conflicts}
      avgSocialMediaHours={weeklyAverages.avgSocialMediaHours}
      avgSleepHours={weeklyAverages.avgSleepHours}
      avgConflicts={weeklyAverages.avgConflicts}
      onEngagementAction={handleEngagementAction}
    />
  )
}
