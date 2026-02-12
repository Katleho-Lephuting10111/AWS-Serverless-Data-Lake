/**
 * AWS Athena API Service for Student Data Lake
 * =============================================
 * This service provides typed API calls for each chart visualization.
 * 
 * Usage:
 *   import { AthenaAPI } from './services/athenaApi'
 *   
 *   const api = new AthenaAPI(API_ENDPOINT)
 *   const gpaData = await api.getGpaByPlatform()
 */

import type { 
  ApiResponse, 
  GpaByPlatform, 
  GpaVsHours, 
  SleepVsStress, 
  PlatformUsage,
  MentalHealth,
  WeeklyPattern 
} from './athenaTypes'


// ============================================
// Configuration
// ============================================

const DEFAULT_TIMEOUT = 60000 // 60 seconds


// ============================================
// API Service Class
// ============================================

export class AthenaAPI {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(
    baseUrl: string = import.meta.env.VITE_API_BASE_URL || '',
    options: {
      apiKey?: string
      timeout?: number
    } = {}
  ) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...(options.apiKey && { 'X-API-Key': options.apiKey })
    }
  }

  /**
   * Generic query executor
   */
  private async executeQuery<T>(
    queryType: string,
    options: {
      customQuery?: string
      maxWaitTime?: number
      outputLocation?: string
    } = {}
  ): Promise<ApiResponse<T>> {
    const endpoint = `${this.baseUrl}/query/${queryType}`
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({
        ...(options.customQuery && { query: options.customQuery }),
        ...(options.maxWaitTime && { maxWaitTime: options.maxWaitTime }),
        ...(options.outputLocation && { outputLocation: options.outputLocation })
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(error.message || `API request failed: ${response.status}`)
    }

    return response.json()
  }

  /**
   * List available query types
   */
  async listQueryTypes(): Promise<{
    queryTypes: string[]
    categories: Record<string, string[]>
  }> {
    const response = await fetch(`${this.baseUrl}/queries`, {
      method: 'GET',
      headers: this.defaultHeaders
    })

    if (!response.ok) {
      throw new Error(`Failed to list queries: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Execute batch queries
   */
  async executeBatch(
    queries: Array<{ type?: string; query?: string }>,
    options: { maxWaitTime?: number } = {}
  ): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/batch`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({
        queries,
        ...(options.maxWaitTime && { maxWaitTime: options.maxWaitTime })
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(error.message || `Batch request failed: ${response.status}`)
    }

    return response.json()
  }

  // ========================================
  // GPA vs Social Media Queries
  // ========================================

  /**
   * Get average GPA by platform
   * Chart Type: Bar Chart
   */
  async getGpaByPlatform(): Promise<ApiResponse<GpaByPlatform[]>> {
    return this.executeQuery<GpaByPlatform>('gpa_by_platform')
  }

  /**
   * Get GPA vs Social Media Hours correlation
   * Chart Type: Scatter Chart
   */
  async getGpaVsHours(): Promise<ApiResponse<GpaVsHours[]>> {
    return this.executeQuery<GpaVsHours>('gpa_vs_hours')
  }

  /**
   * Get GPA distribution ranges
   * Chart Type: Bar Chart / Pie Chart
   */
  async getGpaDistribution(): Promise<ApiResponse<{
    gpa_range: string
    student_count: number
    avg_social_media_hours: string
  }[]>> {
    return this.executeQuery('gpa_distribution')
  }

  // ========================================
  // Sleep vs Stress Queries
  // ========================================

  /**
   * Get Sleep vs Stress correlation
   * Chart Type: Scatter Chart
   */
  async getSleepVsStress(): Promise<ApiResponse<SleepVsStress[]>> {
    return this.executeQuery<SleepVsStress>('sleep_vs_stress')
  }

  /**
   * Get sleep patterns by day of week
   * Chart Type: Line Chart
   */
  async getSleepByDay(): Promise<ApiResponse<{
    day_of_week: string
    avg_sleep: string
    avg_stress: string
  }[]>> {
    return this.executeQuery('sleep_by_day')
  }

  /**
   * Get stress level distribution
   * Chart Type: Pie Chart / Donut Chart
   */
  async getStressDistribution(): Promise<ApiResponse<{
    stress_category: string
    student_count: number
    avg_sleep_hours: string
  }[]>> {
    return this.executeQuery('stress_distribution')
  }

  // ========================================
  // Platform Usage Queries
  // ========================================

  /**
   * Get average usage hours by platform
   * Chart Type: Bar Chart
   */
  async getPlatformUsage(): Promise<ApiResponse<PlatformUsage[]>> {
    return this.executeQuery<PlatformUsage>('platform_usage')
  }

  /**
   * Get platform popularity (user count)
   * Chart Type: Pie Chart / Donut Chart
   */
  async getPlatformPopularity(): Promise<ApiResponse<{
    platform: string
    user_count: number
  }[]>> {
    return this.executeQuery('platform_popularity')
  }

  /**
   * Get weekly usage patterns
   * Chart Type: Line Chart / Area Chart
   */
  async getWeeklyPattern(): Promise<ApiResponse<WeeklyPattern[]>> {
    return this.executeQuery<WeeklyPattern>('weekly_pattern')
  }

  // ========================================
  // Mental Health Queries
  // ========================================

  /**
   * Get Social Media vs Mental Health correlation
   * Chart Type: Scatter Chart
   */
  async getMentalHealthCorrelation(): Promise<ApiResponse<MentalHealth[]>> {
    return this.executeQuery<MentalHealth>('mental_health_correlation')
  }

  /**
   * Get mental health scores by platform
   * Chart Type: Bar Chart
   */
  async getMentalHealthByPlatform(): Promise<ApiResponse<{
    platform: string
    avg_mental_health: string
    avg_hours: string
  }[]>> {
    return this.executeQuery('mental_health_by_platform')
  }

  // ========================================
  // Custom Queries
  // ========================================

  /**
   * Execute a custom SQL query
   */
  async executeCustomQuery<T>(
    query: string,
    options: { maxWaitTime?: number } = {}
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({
        query,
        ...(options.maxWaitTime && { maxWaitTime: options.maxWaitTime })
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(error.message || `Custom query failed: ${response.status}`)
    }

    return response.json()
  }

  // ========================================
  // Dashboard Summary
  // ========================================

  /**
   * Get summary statistics for dashboard
   */
  async getSummaryStats(): Promise<ApiResponse<{
    total_students: number
    avg_gpa: string
    avg_social_media_hours: string
    avg_sleep_hours: string
    avg_stress_level: string
  }>> {
    return this.executeQuery('summary_stats')
  }
}


// ============================================
// Factory Functions for Easy Use
// ============================================

/**
 * Create API instance with base URL from environment
 */
export function createAthenaAPI(): AthenaAPI {
  const baseUrl = import.meta.env.VITE_API_BASE_URL 
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL environment variable not set')
  }
  
  return new AthenaAPI(baseUrl, {
    apiKey: import.meta.env.VITE_API_KEY,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || DEFAULT_TIMEOUT
  })
}


// ============================================
// Pre-configured Query Functions
// ============================================

/**
 * Get data for GPA by Platform bar chart
 */
export async function fetchGpaByPlatform(): Promise<GpaByPlatform[]> {
  const api = createAthenaAPI()
  const result = await api.getGpaByPlatform()
  return result.rows || []
}

/**
 * Get data for GPA vs Hours scatter chart
 */
export async function fetchGpaVsHours(): Promise<GpaVsHours[]> {
  const api = createAthenaAPI()
  const result = await api.getGpaVsHours()
  return result.rows || []
}

/**
 * Get data for Sleep vs Stress scatter chart
 */
export async function fetchSleepVsStress(): Promise<SleepVsStress[]> {
  const api = createAthenaAPI()
  const result = await api.getSleepVsStress()
  return result.rows || []
}

/**
 * Get data for Platform Usage bar chart
 */
export async function fetchPlatformUsage(): Promise<PlatformUsage[]> {
  const api = createAthenaAPI()
  const result = await api.getPlatformUsage()
  return result.rows || []
}

/**
 * Get data for Weekly Pattern line chart
 */
export async function fetchWeeklyPattern(): Promise<WeeklyPattern[]> {
  const api = createAthenaAPI()
  const result = await api.getWeeklyPattern()
  return result.rows || []
}

/**
 * Get data for Mental Health correlation scatter chart
 */
export async function fetchMentalHealthCorrelation(): Promise<MentalHealth[]> {
  const api = createAthenaAPI()
  const result = await api.getMentalHealthCorrelation()
  return result.rows || []
}


/**
 * Get data for Stress Distribution pie chart
 */
export async function fetchStressDistribution(): Promise<{
  stress_category: string
  student_count: number
  avg_sleep_hours: string
}[]> {
  const api = createAthenaAPI()
  const result = await api.getStressDistribution()
  return result.rows || []
}


/**
 * Get data for Platform Popularity pie chart
 */
export async function fetchPlatformPopularity(): Promise<{
  platform: string
  user_count: number
}[]> {
  const api = createAthenaAPI()
  const result = await api.getPlatformPopularity()
  return result.rows || []
}


/**
 * Execute custom query and return results
 */
export async function executeCustomQuery<T = any>(
  query: string
): Promise<T[]> {
  const api = createAthenaAPI()
  const result = await api.executeCustomQuery<T>(query)
  return result.rows || []
}


/**
 * Batch execute multiple queries
 */
export async function executeQueryBatch(
  queries: Array<{ type?: string; query?: string }>
): Promise<Array<{ success: boolean; data?: any; error?: string }>> {
  const api = createAthenaAPI()
  const result = await api.executeBatch(queries)
  
  return result.results.map((r: any) => ({
    success: r.success,
    data: r.rows || [],
    error: r.error
  }))
}


export default {
  AthenaAPI,
  createAthenaAPI,
  // Pre-configured functions
  fetchGpaByPlatform,
  fetchGpaVsHours,
  fetchSleepVsStress,
  fetchPlatformUsage,
  fetchWeeklyPattern,
  fetchMentalHealthCorrelation,
  fetchStressDistribution,
  fetchPlatformPopularity,
  executeCustomQuery,
  executeQueryBatch
}

