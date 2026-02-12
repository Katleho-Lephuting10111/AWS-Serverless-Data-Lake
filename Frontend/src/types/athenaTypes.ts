/**
 * TypeScript Types for AWS Athena API Responses
 * ==============================================
 * These types correspond to the SQL query results from Athena.
 */

import type { 
  BarChartDataPoint, 
  PieChartDataPoint,
  ScatterChartDataPoint, 
  LineChartDataPoint 
} from './chartTypes'


// ============================================
// Base API Types
// ============================================

export interface ApiResponse<T = any> {
  message?: string
  queryExecutionId?: string
  queryType?: string
  state?: string
  stateChangeReason?: string
  rows?: T[]
  columnMetadata?: ColumnMetadata[]
  rowCount?: number
  dataScannedInBytes?: number
  executionTimeInMillis?: number
  query?: string
  database?: string
  error?: string
}

export interface ColumnMetadata {
  name: string
  type: string
  caseSensitive?: boolean
  nullable?: string
  precision?: number
  scale?: number
}

export interface BatchQueryResult {
  message: string
  results: Array<{
    index: number
    success: boolean
    rows?: any[]
    error?: string
  }>
  totalQueries: number
  successfulQueries: number
}


// ============================================
// GPA vs Social Media Types
// ============================================

export interface GpaByPlatform {
  platform: string
  avg_gpa: string
  avg_hours: string
  student_count: string
}

export interface GpaVsHours {
  student_id: string
  social_media_hours: string
  gpa: string
}

export interface GpaDistribution {
  gpa_range: string
  student_count: number
  avg_social_media_hours: string
}

export interface GpaTrend {
  academic_year: string
  avg_gpa: string
  avg_social_media_hours: string
}


// ============================================
// Sleep vs Stress Types
// ============================================

export interface SleepVsStress {
  student_id: string
  sleep_hours: string
  stress_level: string
  mental_health: string
}

export interface SleepByDay {
  day_of_week: string
  avg_sleep: string
  avg_stress: string
}

export interface StressDistribution {
  stress_category: string
  student_count: number
  avg_sleep_hours: string
}

export interface SleepStressTrend {
  day_of_week: string
  avg_sleep: string
  avg_stress: string
  avg_screen_time: string
}


// ============================================
// Platform Usage Types
// ============================================

export interface PlatformUsage {
  platform: string
  avg_hours: string
  min_hours: string
  max_hours: string
  unique_users: string
}

export interface PlatformPopularity {
  platform: string
  user_count: number
  percentage?: string
}

export interface WeeklyPattern {
  day_of_week: string
  avg_daily_hours: string
  active_users: string
}

export interface UsageByTime {
  platform: string
  time_period: string
  avg_hours: string
}


// ============================================
// Mental Health Types
// ============================================

export interface MentalHealth {
  student_id: string
  social_media_hours: string
  mental_health_score: string
}

export interface MentalHealthByPlatform {
  platform: string
  avg_mental_health: string
  avg_hours: string
}

export interface MultiMetricComparison {
  platform: string
  academic_impact: string
  mental_health: string
  sleep_quality: string
  stress_level: string
  data_points: string
}


// ============================================
// Summary Statistics Types
// ============================================

export interface SummaryStats {
  total_students: number
  avg_gpa: string
  avg_social_media_hours: string
  avg_sleep_hours: string
  avg_stress_level: string
}

export interface DataQualityCheck {
  table_name: string
  total_rows: number
  unique_students: number
  gpa_records?: number
  hours_records?: number
  sleep_records?: number
  stress_records?: number
}


// ============================================
// Chart Data Transformation Types
// ============================================

export interface ChartDataConfig {
  labelKey: string
  valueKey: string
  colorKey?: string
  sortBy?: 'label' | 'value'
  sortOrder?: 'asc' | 'desc'
}

export interface ScatterChartConfig {
  xKey: string
  yKey: string
  labelKey?: string
  colorKey?: string
}

export interface MultiSeriesConfig {
  seriesKey: string
  xKey: string
  yKey: string
  labelKey?: string
}


// ============================================
// Chart Data Transform Functions
// ============================================

/**
 * Transform GPA by platform to BarChartDataPoint[]
 */
export function transformGpaByPlatform(
  data: GpaByPlatform[],
  options: { sortBy?: 'gpa' | 'hours' } = {}
): BarChartDataPoint[] {
  const sorted = [...data].sort((a, b) => {
    if (options.sortBy === 'hours') {
      return parseFloat(b.avg_hours) - parseFloat(a.avg_hours)
    }
    return parseFloat(b.avg_gpa) - parseFloat(a.avg_gpa)
  })

  return sorted.map(item => ({
    label: item.platform,
    value: parseFloat(item.avg_gpa),
    color: getPlatformColor(item.platform)
  }))
}

/**
 * Transform GPA vs Hours to ScatterChartDataPoint[]
 */
export function transformGpaVsHours(data: GpaVsHours[]): ScatterChartDataPoint[] {
  return data.map(item => ({
    x: parseFloat(item.social_media_hours) || 0,
    y: parseFloat(item.gpa) || 0,
    label: item.student_id
  }))
}

/**
 * Transform Sleep vs Stress to ScatterChartDataPoint[]
 */
export function transformSleepVsStress(data: SleepVsStress[]): ScatterChartDataPoint[] {
  return data.map(item => ({
    x: parseFloat(item.sleep_hours) || 0,
    y: parseFloat(item.stress_level) || 0,
    label: item.student_id
  }))
}

/**
 * Transform Platform Usage to BarChartDataPoint[]
 */
export function transformPlatformUsage(data: PlatformUsage[]): BarChartDataPoint[] {
  return [...data]
    .sort((a, b) => parseFloat(b.avg_hours) - parseFloat(a.avg_hours))
    .map(item => ({
      label: item.platform,
      value: parseFloat(item.avg_hours),
      color: getPlatformColor(item.platform)
    }))
}

/**
 * Transform Platform Popularity to PieChartDataPoint[]
 */
export function transformPlatformPopularity(data: PlatformPopularity[]): PieChartDataPoint[] {
  return data.map(item => ({
    label: item.platform,
    value: item.user_count,
    color: getPlatformColor(item.platform)
  }))
}

/**
 * Transform Weekly Pattern to LineChartDataPoint[]
 */
export function transformWeeklyPattern(data: WeeklyPattern[]): LineChartDataPoint[] {
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  return [...data]
    .sort((a, b) => dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week))
    .map(item => ({
      label: item.day_of_week,
      value: parseFloat(item.avg_daily_hours)
    }))
}

/**
 * Transform Mental Health to ScatterChartDataPoint[]
 */
export function transformMentalHealthCorrelation(data: MentalHealth[]): ScatterChartDataPoint[] {
  return data.map(item => ({
    x: parseFloat(item.social_media_hours) || 0,
    y: parseFloat(item.mental_health_score) || 0,
    label: item.student_id
  }))
}

/**
 * Transform Stress Distribution to PieChartDataPoint[]
 */
export function transformStressDistribution(data: StressDistribution[]): PieChartDataPoint[] {
  const categoryOrder = ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
  
  return [...data]
    .sort((a, b) => categoryOrder.indexOf(a.stress_category) - categoryOrder.indexOf(b.stress_category))
    .map(item => ({
      label: item.stress_category,
      value: item.student_count,
      color: getStressColor(item.stress_category)
    }))
}


// ============================================
// Utility Functions
// ============================================

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  TikTok: '#000000',
  YouTube: '#FF0000',
  Twitter: '#1DA1F2',
  Facebook: '#1877F2',
  LinkedIn: '#0077B5',
  Reddit: '#FF4500',
  Pinterest: '#BD081C',
  Snapchat: '#FFFC00',
  Discord: '#5865F2',
  Twitch: '#9146FF',
  default: '#6366f1'
}

const STRESS_COLORS: Record<string, string> = {
  'Very Low': '#10b981',
  'Low': '#22c55e',
  'Moderate': '#f59e0b',
  'High': '#f97316',
  'Very High': '#ef4444'
}

export function getPlatformColor(platform: string): string {
  return PLATFORM_COLORS[platform] || PLATFORM_COLORS.default
}

export function getStressColor(category: string): string {
  return STRESS_COLORS[category] || '#6366f1'
}

export function formatNumber(value: string | number, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(num) ? '0' : num.toFixed(decimals)
}


// ============================================
// Query Configuration Types
// ============================================

export interface QueryConfig {
  name: string
  type: string
  description: string
  chartType: 'bar' | 'pie' | 'scatter' | 'line' | 'area' | 'radar'
  transformation?: string
  example?: string
}

export const AVAILABLE_QUERIES: QueryConfig[] = [
  {
    name: 'GPA by Platform',
    type: 'gpa_by_platform',
    description: 'Average GPA by social media platform',
    chartType: 'bar',
    transformation: 'transformGpaByPlatform'
  },
  {
    name: 'GPA vs Hours',
    type: 'gpa_vs_hours',
    description: 'Correlation between social media hours and GPA',
    chartType: 'scatter',
    transformation: 'transformGpaVsHours'
  },
  {
    name: 'GPA Distribution',
    type: 'gpa_distribution',
    description: 'Student distribution by GPA range',
    chartType: 'pie'
  },
  {
    name: 'Sleep vs Stress',
    type: 'sleep_vs_stress',
    description: 'Correlation between sleep hours and stress level',
    chartType: 'scatter',
    transformation: 'transformSleepVsStress'
  },
  {
    name: 'Sleep by Day',
    type: 'sleep_by_day',
    description: 'Average sleep and stress by day of week',
    chartType: 'line'
  },
  {
    name: 'Stress Distribution',
    type: 'stress_distribution',
    description: 'Student distribution by stress level',
    chartType: 'pie',
    transformation: 'transformStressDistribution'
  },
  {
    name: 'Platform Usage',
    type: 'platform_usage',
    description: 'Average daily usage hours by platform',
    chartType: 'bar',
    transformation: 'transformPlatformUsage'
  },
  {
    name: 'Platform Popularity',
    type: 'platform_popularity',
    description: 'User count by platform',
    chartType: 'pie',
    transformation: 'transformPlatformPopularity'
  },
  {
    name: 'Weekly Pattern',
    type: 'weekly_pattern',
    description: 'Average daily usage by day of week',
    chartType: 'line',
    transformation: 'transformWeeklyPattern'
  },
  {
    name: 'Mental Health Correlation',
    type: 'mental_health_correlation',
    description: 'Correlation between social media and mental health',
    chartType: 'scatter',
    transformation: 'transformMentalHealthCorrelation'
  },
  {
    name: 'Mental Health by Platform',
    type: 'mental_health_by_platform',
    description: 'Average mental health score by platform',
    chartType: 'bar'
  },
  {
    name: 'Summary Stats',
    type: 'summary_stats',
    description: 'Overall statistics for all students',
    chartType: 'bar'
  }
]


// Re-export for convenience
export type {
  BarChartDataPoint,
  PieChartDataPoint,
  ScatterChartDataPoint,
  LineChartDataPoint
}

