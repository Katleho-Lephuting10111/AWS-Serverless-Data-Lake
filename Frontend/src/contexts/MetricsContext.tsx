import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface MetricsState {
  socialMediaHours: number
  sleepHours: number
  conflicts: number
}

interface WeeklyAverages {
  avgSocialMediaHours: number
  avgSleepHours: number
  avgConflicts: number
}

interface MetricsContextType {
  metrics: MetricsState
  weeklyAverages: WeeklyAverages
  updateMetrics: (updates: Partial<MetricsState>) => void
  updateWeeklyAverages: (updates: Partial<WeeklyAverages>) => void
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined)

const DEFAULT_METRICS: MetricsState = {
  socialMediaHours: 4.5,
  sleepHours: 6.5,
  conflicts: 2,
}

const DEFAULT_WEEKLY_AVERAGES: WeeklyAverages = {
  avgSocialMediaHours: 5.2,
  avgSleepHours: 6.8,
  avgConflicts: 1.5,
}

export function MetricsProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<MetricsState>(() => {
    const saved = localStorage.getItem('wellness_metrics')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          socialMediaHours: parsed.socialMediaHours ?? DEFAULT_METRICS.socialMediaHours,
          sleepHours: parsed.sleepHours ?? DEFAULT_METRICS.sleepHours,
          conflicts: parsed.conflicts ?? DEFAULT_METRICS.conflicts,
        }
      } catch (e) {
        console.error('Failed to parse saved metrics:', e)
        return DEFAULT_METRICS
      }
    }
    return DEFAULT_METRICS
  })

  const [weeklyAverages, setWeeklyAverages] = useState<WeeklyAverages>(() => {
    const saved = localStorage.getItem('wellness_metrics')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          avgSocialMediaHours: parsed.avgSocialMediaHours ?? DEFAULT_WEEKLY_AVERAGES.avgSocialMediaHours,
          avgSleepHours: parsed.avgSleepHours ?? DEFAULT_WEEKLY_AVERAGES.avgSleepHours,
          avgConflicts: parsed.avgConflicts ?? DEFAULT_WEEKLY_AVERAGES.avgConflicts,
        }
      } catch (e) {
        console.error('Failed to parse saved weekly averages:', e)
        return DEFAULT_WEEKLY_AVERAGES
      }
    }
    return DEFAULT_WEEKLY_AVERAGES
  })

  // Persist to localStorage whenever metrics or weeklyAverages change
  useEffect(() => {
    const dataToSave = {
      ...metrics,
      ...weeklyAverages,
    }
    localStorage.setItem('wellness_metrics', JSON.stringify(dataToSave))
  }, [metrics, weeklyAverages])

  const updateMetrics = (updates: Partial<MetricsState>) => {
    setMetrics(prev => ({
      ...prev,
      ...updates,
    }))
  }

  const updateWeeklyAverages = (updates: Partial<WeeklyAverages>) => {
    setWeeklyAverages(prev => ({
      ...prev,
      ...updates,
    }))
  }

  return (
    <MetricsContext.Provider
      value={{
        metrics,
        weeklyAverages,
        updateMetrics,
        updateWeeklyAverages
      }}
    >
      {children}
    </MetricsContext.Provider>
  )
}

export function useMetrics() {
  const context = useContext(MetricsContext)
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider')
  }
  return context
}
