import { useState, useEffect, useCallback } from 'react'
import { BarChart, PieChart, ScatterChart, LineChart } from '../components/ChartJsComponents'
import { 
  // useChartData, // unused
  // transformToBarChartData, // unused
  // transformToScatterData, // unused
  CHART_COLORS,
  PLATFORM_COLORS 
} from '../hooks/useChartData'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

// ============================================
// API Configuration
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mbx9hm69ye.execute-api.eu-west-1.amazonaws.com/dev'
const API_ENDPOINT = `${API_BASE_URL}/query`

// ============================================
// Type Definitions
// ============================================

interface ApiResponse<T> {
  message?: string
  queryExecutionId?: string
  state?: string
  rows?: T[]
  columnMetadata?: { name: string; type: string }[]
  rowCount?: number
}

interface StudentDataRow {
  [key: string]: string
}

interface ChartDataPoint {
  label: string
  value: number
  color: string
}

interface ScatterDataPoint {
  x: number
  y: number
  label?: string
}

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Execute SQL query via API and return results
 */
async function executeQuery(query: string): Promise<ApiResponse<StudentDataRow>> {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(errorData.message || `API request failed with status ${response.status}`)
  }

  return response.json()
}

/**
 * Fetch and transform bar chart data
 */
async function fetchBarChartData(): Promise<ChartDataPoint[]> {
  const query = `
    SELECT platform, AVG(hours_per_day) as avg_usage, AVG(gpa_impact) as academic_impact
    FROM student_social_media_usage
    GROUP BY platform
    ORDER BY avg_usage DESC
  `
  
  const result = await executeQuery(query)
  
  if (!result.rows || result.rows.length === 0) {
    return getDefaultUsageData()
  }

  return result.rows.map((row: StudentDataRow) => ({
    label: row.platform || row.Platform || '',
    value: parseFloat(row.avg_usage || row.avg_hours || row.hours || row.value || '0'),
    color: PLATFORM_COLORS[row.platform || row.Platform] || undefined,
  }))
}

/**
 * Fetch and transform pie chart data
 */
async function fetchPieChartData(): Promise<ChartDataPoint[]> {
  const query = `
    SELECT platform, COUNT(*) as user_count
    FROM student_social_media_usage
    GROUP BY platform
    ORDER BY user_count DESC
  `
  
  const result = await executeQuery(query)
  
  if (!result.rows || result.rows.length === 0) {
    return getDefaultPopularityData()
  }

  return result.rows.map((row: StudentDataRow, index: number) => {
    const platform = row.platform || row.Platform || `Platform ${index}`
    return {
      label: platform,
      value: parseFloat(row.user_count || row.count || row.value || '0'),
      color: PLATFORM_COLORS[platform] || CHART_COLORS[index % CHART_COLORS.length],
    }
  })
}

/**
 * Fetch and transform scatter chart data
 */
async function fetchScatterChartData(): Promise<ScatterDataPoint[]> {
  const query = `
    SELECT AVG(sleep_hours) as sleep, AVG(mental_health_score) as mental_health
    FROM student_sleep_mental_health
    GROUP BY student_id
  `
  
  const result = await executeQuery(query)
  
  if (!result.rows || result.rows.length === 0) {
    return getDefaultSleepData()
  }

  return result.rows.map((row: StudentDataRow) => ({
    x: parseFloat(row.sleep || row.sleep_hours || row.hours || '0'),
    y: parseFloat(row.mental_health || row.mental_health_score || row.score || row.wellness || '0'),
  }))
}

/**
 * Fetch and transform line chart data
 */
async function fetchLineChartData(): Promise<ChartDataPoint[]> {
  const query = `
    SELECT day_of_week, AVG(hours_spent) as avg_hours
    FROM student_weekly_usage
    GROUP BY day_of_week
    ORDER BY CASE 
      WHEN day_of_week = 'Monday' THEN 1
      WHEN day_of_week = 'Tuesday' THEN 2
      WHEN day_of_week = 'Wednesday' THEN 3
      WHEN day_of_week = 'Thursday' THEN 4
      WHEN day_of_week = 'Friday' THEN 5
      WHEN day_of_week = 'Saturday' THEN 6
      WHEN day_of_week = 'Sunday' THEN 7
    END
  `
  
  const result = await executeQuery(query)
  
  if (!result.rows || result.rows.length === 0) {
    return getDefaultWeeklyData()
  }

  return result.rows.map((row: StudentDataRow) => ({
    label: row.day_of_week || row.day || row.date || '',
    value: parseFloat(row.avg_hours || row.hours || row.value || '0'),
  }))
}

// ============================================
// Default Sample Data (when API is unavailable)
// ============================================

function getDefaultUsageData(): ChartDataPoint[] {
  return [
    { label: 'Instagram', value: 8.5, color: '#E1306C' },
    { label: 'TikTok', value: 9.2, color: '#000000' },
    { label: 'YouTube', value: 7.8, color: '#FF0000' },
    { label: 'Twitter', value: 6.3, color: '#1DA1F2' },
    { label: 'Facebook', value: 4.5, color: '#1877F2' },
    { label: 'LinkedIn', value: 5.1, color: '#0077B5' },
    { label: 'Reddit', value: 6.9, color: '#FF4500' },
  ]
}

function getDefaultPopularityData(): ChartDataPoint[] {
  return [
    { label: 'Instagram', value: 28, color: '#E1306C' },
    { label: 'TikTok', value: 25, color: '#000000' },
    { label: 'YouTube', value: 22, color: '#FF0000' },
    { label: 'Twitter', value: 12, color: '#1DA1F2' },
    { label: 'Facebook', value: 8, color: '#1877F2' },
    { label: 'Other', value: 5, color: '#9CA3AF' },
  ]
}

function getDefaultSleepData(): ScatterDataPoint[] {
  return [
    { x: 4, y: 3.2 },
    { x: 4.5, y: 3.8 },
    { x: 5, y: 4.1 },
    { x: 5.5, y: 5.2 },
    { x: 6, y: 6.1 },
    { x: 6.5, y: 6.8 },
    { x: 7, y: 7.5 },
    { x: 7.5, y: 7.9 },
    { x: 8, y: 8.2 },
    { x: 8.5, y: 8.1 },
    { x: 9, y: 7.8 },
  ]
}

function getDefaultWeeklyData(): ChartDataPoint[] {
  return [
    { label: 'Mon', value: 5.2 },
    { label: 'Tue', value: 6.1 },
    { label: 'Wed', value: 5.8 },
    { label: 'Thu', value: 7.2 },
    { label: 'Fri', value: 8.5 },
    { label: 'Sat', value: 9.1 },
    { label: 'Sun', value: 8.7 },
  ]
}

// ============================================
// Loading State Component
// ============================================

function LoadingState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      <p className="text-gray-600">{message || 'Loading data...'}</p>
    </div>
  )
}

// ============================================
// Error State Component
// ============================================

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <AlertCircle className="w-8 h-8 text-red-500" />
      <p className="text-red-600">{error.message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  )
}

// ============================================
// API Charts Page Component
// ============================================

export default function ApiChartsPage() {
  const [usageData, setUsageData] = useState<ChartDataPoint[]>([])
  const [popularityData, setPopularityData] = useState<ChartDataPoint[]>([])
  const [sleepData, setSleepData] = useState<ScatterDataPoint[]>([])
  const [weeklyData, setWeeklyData] = useState<ChartDataPoint[]>([])
  
  const [loading, setLoading] = useState<Record<string, boolean>>({
    usage: true,
    popularity: true,
    sleep: true,
    weekly: true,
  })
  
  const [errors, setErrors] = useState<Record<string, Error | null>>({
    usage: null,
    popularity: null,
    sleep: null,
    weekly: null,
  })

  const fetchAllData = useCallback(async () => {
    // Reset loading states
    setLoading({ usage: true, popularity: true, sleep: true, weekly: true })
    setErrors({ usage: null, popularity: null, sleep: null, weekly: null })

    // Fetch all chart data in parallel
    const results = await Promise.allSettled([
      fetchBarChartData(),
      fetchPieChartData(),
      fetchScatterChartData(),
      fetchLineChartData(),
    ])

    // Update states based on results
    setUsageData(
      results[0].status === 'fulfilled' 
        ? results[0].value 
        : getDefaultUsageData()
    )
    setPopularityData(
      results[1].status === 'fulfilled' 
        ? results[1].value 
        : getDefaultPopularityData()
    )
    setSleepData(
      results[2].status === 'fulfilled' 
        ? results[2].value 
        : getDefaultSleepData()
    )
    setWeeklyData(
      results[3].status === 'fulfilled' 
        ? results[3].value 
        : getDefaultWeeklyData()
    )

    // Update loading and error states
    setLoading({
      usage: false,
      popularity: false,
      sleep: false,
      weekly: false,
    })
    
    setErrors({
      usage: results[0].status === 'rejected' ? (results[0].reason as Error) : null,
      popularity: results[1].status === 'rejected' ? (results[1].reason as Error) : null,
      sleep: results[2].status === 'rejected' ? (results[2].reason as Error) : null,
      weekly: results[3].status === 'rejected' ? (results[3].reason as Error) : null,
    })
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Data visualization powered by AWS Athena</p>
        </div>
        <button
          onClick={fetchAllData}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart - Usage Data */}
        <div className="col-span-2">
          {loading.usage ? (
            <LoadingState message="Loading usage data..." />
          ) : errors.usage ? (
            <ErrorState error={errors.usage} onRetry={fetchAllData} />
          ) : (
            <BarChart
              data={usageData}
              title="Platform Usage (from API)"
              description="Average daily hours per platform (queried from Athena)"
              xAxisLabel="Platform"
              yAxisLabel="Hours/Day"
              height={400}
            />
          )}
        </div>

        {/* Pie Chart - Popularity Data */}
        <div>
          {loading.popularity ? (
            <LoadingState message="Loading popularity data..." />
          ) : errors.popularity ? (
            <ErrorState error={errors.popularity} onRetry={fetchAllData} />
          ) : (
            <PieChart
              data={popularityData}
              title="Platform Popularity (from API)"
              description="User distribution by platform (queried from Athena)"
              donut={true}
              height={400}
            />
          )}
        </div>

        {/* Scatter Chart - Sleep vs Mental Health */}
        <div>
          {loading.sleep ? (
            <LoadingState message="Loading correlation data..." />
          ) : errors.sleep ? (
            <ErrorState error={errors.sleep} onRetry={fetchAllData} />
          ) : (
            <ScatterChart
              data={sleepData}
              title="Sleep vs Mental Health (from API)"
              description="Correlation analysis (queried from Athena)"
              xAxisLabel="Hours of Sleep per Night"
              yAxisLabel="Mental Wellness Score"
              pointColor="#0ea5e9"
              height={400}
            />
          )}
        </div>
      </div>

      {/* Full Width Chart - Weekly Trends */}
      {loading.weekly ? (
        <LoadingState message="Loading weekly trends..." />
      ) : errors.weekly ? (
        <ErrorState error={errors.weekly} onRetry={fetchAllData} />
      ) : (
        <LineChart
          data={weeklyData}
          title="Weekly Usage Trends (from API)"
          description="Average daily usage by day of week (queried from Athena)"
          xAxisLabel="Day of Week"
          yAxisLabel="Hours"
          showFill={true}
          height={300}
        />
      )}

      {/* Query Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">API Integration Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Bar Chart Query</h4>
            <code className="block bg-gray-100 p-2 rounded text-xs">
              SELECT platform, AVG(hours_per_day)<br/>
              FROM student_social_media_usage<br/>
              GROUP BY platform
            </code>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Scatter Chart Query</h4>
            <code className="block bg-gray-100 p-2 rounded text-xs">
              SELECT AVG(sleep_hours), AVG(mental_health)<br/>
              FROM student_sleep_mental_health<br/>
              GROUP BY student_id
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

