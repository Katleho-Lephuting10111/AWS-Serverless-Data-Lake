import { useState, useEffect } from 'react'
import { TrendingUp, Moon, Users, Lightbulb, Target } from 'lucide-react'

interface DashboardSummaryProps {
  // Today's metrics
  socialMediaHours?: number
  sleepHours?: number
  conflicts?: number

  // Weekly averages
  avgSocialMediaHours?: number
  avgSleepHours?: number
  avgConflicts?: number

  // Callbacks
  onEngagementAction?: () => void
}

export default function DashboardSummary({
  socialMediaHours = 0,
  sleepHours = 0,
  conflicts = 0,
  avgSocialMediaHours,
  avgSleepHours,
  avgConflicts,
  onEngagementAction,
}: DashboardSummaryProps) {
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0)

  const insights = [
    "Students with >7 hrs sleep consistently report higher mental health scores.",
    "Limiting social media to 3 hours daily can improve focus by up to 40%.",
    "Taking breaks from social media every 2 hours reduces stress levels significantly.",
    "Quality sleep is more important than quantity—aim for uninterrupted rest.",
    "Students who manage conflicts early show better academic outcomes.",
    "Regular exercise combined with good sleep habits boosts cognitive performance.",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsightIndex((prev) => (prev + 1) % insights.length)
    }, 8000) // Rotate every 8 seconds

    return () => clearInterval(interval)
  }, [insights.length])

  // Reuse prediction logic from PerformancePredictor
  const getAcademicPrediction = (social: number, sleep: number): string => {
    if (social > 5 || sleep < 6) {
      return "High risk of lower academic performance"
    }
    if (social >= 3 && social <= 5 && sleep >= 6 && sleep <= 7) {
      return "Moderate risk, needs balance"
    }
    if (social <= 3 && sleep >= 7) {
      return "Likely to perform well"
    }
    return "Unable to determine"
  }

  const getMentalHealthPrediction = (social: number, sleep: number, conflicts: number): string => {
    if ((social > 6 && sleep < 6) || conflicts >= 4) {
      return "Critical risk, urgent attention needed"
    }
    if ((social >= 4 && social <= 6) || (sleep >= 6 && sleep <= 6.5) || (conflicts >= 2 && conflicts <= 3)) {
      return "At risk, monitor closely"
    }
    if (social >= 2 && social <= 4 && sleep >= 7 && conflicts <= 1) {
      return "Stable, but habits could shift"
    }
    if (social < 2.5 && sleep >= 7.5 && conflicts === 0) {
      return "Healthy, strong resilience"
    }
    return "Unable to determine"
  }

  const academicPrediction = getAcademicPrediction(socialMediaHours, sleepHours)
  const mentalHealthPrediction = getMentalHealthPrediction(socialMediaHours, sleepHours, conflicts)

  const getStatusColor = (prediction: string): string => {
    if (prediction.includes('High risk') || prediction.includes('Critical')) {
      return 'text-red-600'
    }
    if (prediction.includes('Moderate') || prediction.includes('At risk')) {
      return 'text-orange-600'
    }
    if (prediction.includes('Stable')) {
      return 'text-yellow-600'
    }
    if (prediction.includes('Likely') || prediction.includes('Healthy')) {
      return 'text-green-600'
    }
    return 'text-gray-600'
  }

  const getWeeklySummary = (): string | null => {
    if (avgSocialMediaHours === undefined || avgSleepHours === undefined || avgConflicts === undefined) {
      return null
    }

    const mentalHealthTrend = getMentalHealthPrediction(avgSocialMediaHours, avgSleepHours, avgConflicts)
    return `This week your average usage was ${avgSocialMediaHours.toFixed(1)} hrs/day, sleep averaged ${avgSleepHours.toFixed(1)} hrs/night, conflicts were ${avgConflicts}. Mental health trended ${mentalHealthTrend.toLowerCase()}.`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Your wellness overview</p>
      </div>

      {/* Snapshot Card */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg shadow-lg p-6 border-l-4 border-primary-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="mr-2" size={24} />
          Today's Snapshot
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Users className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Social Media</p>
                <p className="text-2xl font-bold text-gray-900">{socialMediaHours} hrs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <Moon className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Sleep Hours</p>
                <p className="text-2xl font-bold text-gray-900">{sleepHours} hrs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-600 font-bold text-lg">!</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Conflicts</p>
                <p className="text-2xl font-bold text-gray-900">{conflicts}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Academic Performance</h3>
            <p className={`font-medium ${getStatusColor(academicPrediction)}`}>
              {academicPrediction}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Mental Health Status</h3>
            <p className={`font-medium ${getStatusColor(mentalHealthPrediction)}`}>
              {mentalHealthPrediction}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Digest */}
      {getWeeklySummary() && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <svg className="mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Weekly Digest
          </h2>
          <p className="text-gray-700 leading-relaxed">{getWeeklySummary()}</p>
        </div>
      )}

      {/* Highlight Insight */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
          <Lightbulb className="mr-2 text-yellow-600" size={24} />
          Insight
        </h2>
        <p className="text-gray-800 italic text-lg leading-relaxed">
          "{insights[currentInsightIndex]}"
        </p>
        <div className="mt-4 flex space-x-1">
          {insights.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentInsightIndex ? 'w-8 bg-yellow-600' : 'w-1.5 bg-yellow-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Engagement Prompt */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
          <Target className="mr-2 text-green-600" size={24} />
          Engagement
        </h2>
        <p className="text-gray-700 mb-4">
          Take action to improve your wellness and track your progress.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onEngagementAction}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Log today's mood
          </button>
          <button
            onClick={onEngagementAction}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Set a goal for tomorrow
          </button>
        </div>
      </div>
    </div>
  )
}
