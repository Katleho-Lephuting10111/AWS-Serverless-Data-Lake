import { useState } from 'react'
import { useMetrics } from '../contexts/MetricsContext'

export default function PerformancePredictor() {
  const { metrics, updateMetrics } = useMetrics()
  const [showPredictions, setShowPredictions] = useState(false)
  const [predictions, setPredictions] = useState({
    academic: '',
    mentalHealth: ''
  })

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
      return "Mental health status: Critical risk, urgent attention needed"
    }
    if ((social >= 4 && social <= 6) || (sleep >= 6 && sleep <= 6.5) || (conflicts >= 2 && conflicts <= 3)) {
      return "Mental health status: At risk, monitor closely"
    }
    if (social >= 2 && social <= 4 && sleep >= 7 && conflicts <= 1) {
      return "Mental health status: Stable, but habits could shift"
    }
    if (social < 2.5 && sleep >= 7.5 && conflicts === 0) {
      return "Mental health status: Healthy, strong resilience"
    }
    return "Mental health status: Unable to determine"
  }

  const handleInputChange = (field: string, value: string) => {
    updateMetrics({
      [field]: parseFloat(value) || 0
    })
  }

  const handlePredict = () => {
    const academicPrediction = getAcademicPrediction(metrics.socialMediaHours, metrics.sleepHours)
    const mentalHealthPrediction = getMentalHealthPrediction(metrics.socialMediaHours, metrics.sleepHours, metrics.conflicts)

    setPredictions({
      academic: academicPrediction,
      mentalHealth: mentalHealthPrediction
    })
    setShowPredictions(true)
  }

  const getAcademicExplanation = (prediction: string): string => {
    if (prediction.includes('High risk')) {
      return "Your current sleep and social media habits are creating significant barriers to academic success. Excessive screen time (>5 hours) and/or insufficient sleep (<6 hours) impair cognitive function, memory consolidation, and concentration—all critical for learning."
    }
    if (prediction.includes('Moderate risk')) {
      return "Your habits show some concerning patterns. While not critical, moderate social media use (3-5 hours) combined with borderline sleep (6-7 hours) may reduce your academic potential. Small adjustments could yield significant improvements."
    }
    if (prediction.includes('Likely to perform well')) {
      return "Your balanced approach to social media (≤3 hours) and adequate sleep (≥7 hours) creates optimal conditions for learning. These habits support strong cognitive performance, focus, and information retention."
    }
    return "Unable to provide a detailed analysis based on the current inputs."
  }

  const getMentalHealthExplanation = (prediction: string): string => {
    if (prediction.includes('Critical risk')) {
      return "Your current patterns indicate serious concern. High social media use with poor sleep or frequent conflicts can lead to anxiety, depression, and emotional exhaustion. Immediate intervention is recommended—consider talking to a counselor or mental health professional."
    }
    if (prediction.includes('At risk')) {
      return "You're showing warning signs that shouldn't be ignored. Moderate social media consumption, borderline sleep, or occasional conflicts can accumulate stress and affect emotional well-being. Proactive changes now can prevent escalation."
    }
    if (prediction.includes('Stable')) {
      return "You're maintaining reasonable balance, but mental health is dynamic. Current habits are sustainable, though remaining vigilant about changes in social media use, sleep quality, or conflict frequency is important for long-term wellness."
    }
    if (prediction.includes('Healthy')) {
      return "Excellent! Your low social media use, quality sleep, and conflict-free environment create a strong foundation for mental resilience. These habits protect against stress and support emotional well-being. Continue maintaining these positive patterns."
    }
    return "Unable to provide a detailed analysis based on the current inputs."
  }

  const getRecommendations = (academic: string, mentalHealth: string): string[] => {
    const recommendations: string[] = []

    if (metrics.socialMediaHours > 5) {
      recommendations.push("Limit social media to 3 hours or less daily through app timers or scheduled breaks")
    }
    if (metrics.sleepHours < 7) {
      recommendations.push("Aim for 7-9 hours of sleep by establishing a consistent bedtime routine")
    }
    if (metrics.conflicts >= 2) {
      recommendations.push("Reduce social media conflicts by unfollowing triggering accounts or using curated feeds")
    }
    if (metrics.socialMediaHours > 3 && metrics.sleepHours < 8) {
      recommendations.push("Replace evening screen time with relaxing activities to improve sleep quality")
    }
    if (academic.includes('High risk') || mentalHealth.includes('Critical')) {
      recommendations.push("Consider speaking with a counselor, advisor, or healthcare provider for personalized support")
    }

    if (recommendations.length === 0) {
      recommendations.push("Keep up your healthy habits and stay mindful of any changes")
    }

    return recommendations
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Performance Predictor</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Input Parameters</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Media Hours
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={metrics.socialMediaHours}
              onChange={(e) => handleInputChange('socialMediaHours', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sleep Hours
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={metrics.sleepHours}
              onChange={(e) => handleInputChange('sleepHours', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Media Conflicts
            </label>
            <input
              type="number"
              min="0"
              value={metrics.conflicts}
              onChange={(e) => handleInputChange('conflicts', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handlePredict}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Predict Performance
          </button>
        </div>
      </div>

      {showPredictions && (
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg shadow-lg p-8 border-l-4 border-primary-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Predictions</h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                Academic Performance
              </h3>
              <p
                className={`text-base font-medium mb-3 ${
                  predictions.academic.includes('High risk')
                    ? 'text-red-600'
                    : predictions.academic.includes('Moderate')
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
              >
                {predictions.academic}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {getAcademicExplanation(predictions.academic)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                Mental Health Status
              </h3>
              <p
                className={`text-base font-medium mb-3 ${
                  predictions.mentalHealth.includes('Critical')
                    ? 'text-red-600'
                    : predictions.mentalHealth.includes('At risk')
                    ? 'text-orange-600'
                    : predictions.mentalHealth.includes('Stable')
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
              >
                {predictions.mentalHealth}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {getMentalHealthExplanation(predictions.mentalHealth)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                Personalized Recommendations
              </h3>
              <ul className="space-y-2">
                {getRecommendations(predictions.academic, predictions.mentalHealth).map((rec, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Enter daily social media usage hours</li>
          <li>Enter average sleep hours per night</li>
          <li>Enter number of conflicts over social media</li>
          <li>Click 'Predict Performance' button to see results</li>
        </ul>
      </div>
    </div>
  )
}
