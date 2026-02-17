// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://mbx9hm69ye.execute-api.eu-west-1.amazonaws.com/dev',
  ENDPOINTS: {
    QUERY: '/query'
  },
  DATABASE: 'student_db',
  TABLE: 'student_social_media_usage'
}

// Athena Query Response Interface
export interface AthenaQueryResponse {
  message: string
  queryExecutionId: string
  state: string
  rows: Record<string, any>[]
  columnMetadata: Array<{ name: string; type: string }>
  rowCount: number
  dataScannedInBytes?: number
  executionTimeInMillis?: number
}

// Error Response Interface
export interface ApiError {
  error: string
  message: string
  code?: string
}

/**
 * Execute an Athena SQL query via the Lambda function
 */
export async function executeQuery(
  query: string,
  maxWaitTime: number = 60
): Promise<AthenaQueryResponse> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUERY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        maxWaitTime
      })
    })

    const data = await response.json()

    if (!response.ok) {
      const error = data as ApiError
      throw new Error(error.message || `Query failed with status ${response.status}`)
    }

    return data as AthenaQueryResponse
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`API request failed: ${error.message}`)
    }
    throw new Error('An unexpected error occurred')
  }
}

/**
 * Fetch all student wellness data
 */
export async function fetchStudentData() {
  const query = `SELECT * FROM ${API_CONFIG.TABLE} LIMIT 1000`
  return executeQuery(query)
}

/**
 * Fetch student data by ID
 */
export async function fetchStudentById(studentId: string) {
  const query = `
    SELECT * FROM ${API_CONFIG.TABLE}
    WHERE student_id = '${studentId}'
    ORDER BY timestamp DESC
    LIMIT 100
  `
  return executeQuery(query)
}

/**
 * Fetch aggregated platform usage statistics
 */
export async function fetchPlatformUsageStats() {
  const query = `
    SELECT
      platform,
      AVG(daily_usage_hours) as avg_usage,
      AVG(academic_impact_score) as avg_academic_impact,
      COUNT(*) as user_count
    FROM ${API_CONFIG.TABLE}
    GROUP BY platform
    ORDER BY avg_usage DESC
  `
  return executeQuery(query)
}

/**
 * Fetch sleep vs mental health correlation data
 */
export async function fetchSleepMentalHealthData() {
  const query = `
    SELECT
      sleep_hours,
      AVG(mental_health_score) as avg_mental_health
    FROM ${API_CONFIG.TABLE}
    GROUP BY sleep_hours
    ORDER BY sleep_hours ASC
  `
  return executeQuery(query)
}

/**
 * Fetch weekly usage trends
 */
export async function fetchWeeklyUsageTrends() {
  const query = `
    SELECT
      day_of_week,
      AVG(daily_usage_hours) as avg_usage
    FROM ${API_CONFIG.TABLE}
    GROUP BY day_of_week
    ORDER BY
      CASE day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
      END
  `
  return executeQuery(query)
}

/**
 * Save user metrics to the datalake (INSERT)
 */
export async function saveUserMetrics(metrics: {
  studentId: string
  socialMediaHours: number
  sleepHours: number
  conflicts: number
  platform?: string
  timestamp?: string
}) {
  const timestamp = metrics.timestamp || new Date().toISOString()

  // Note: Athena doesn't support INSERT directly on S3 tables
  // This would need to write to S3 directly or use a different approach
  // For now, return a mock success response
  console.warn('Direct INSERT not supported via Athena. Consider using S3 PUT or a different Lambda function.')

  return {
    message: 'Metrics saved (mock)',
    success: false,
    note: 'Direct database writes not yet implemented'
  }
}

/**
 * Test the API connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await executeQuery('SELECT 1 as test')
    return result.state === 'SUCCEEDED' && result.rowCount > 0
  } catch (error) {
    console.error('API connection test failed:', error)
    return false
  }
}
