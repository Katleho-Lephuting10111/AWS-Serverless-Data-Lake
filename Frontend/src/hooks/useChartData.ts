import { useState, useEffect, useCallback } from 'react'

// ============================================
// API Configuration
// ============================================

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'https://mbx9hm69ye.execute-api.eu-west-1.amazonaws.com/dev/query'

// ============================================
// Type Definitions for API Responses
// ============================================

export interface ApiResponse<T> {
  message?: string
  queryExecutionId?: string
  state?: string
  rows?: T[]
  columnMetadata?: { name: string; type: string }[]
  rowCount?: number
  dataScannedInBytes?: number
  executionTimeInMillis?: number
  error?: string
}

export interface StudentDataRow {
  [key: string]: string
}

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface ScatterDataPoint {
  x: number
  y: number
  label?: string
}

// ============================================
// Use Chart Data Hook
// ============================================

export interface UseChartDataOptions {
  endpoint: string
  enabled?: boolean
}

export interface UseChartDataResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Custom hook for fetching chart data from the API
 * 
 * @param options - Configuration object with endpoint URL
 * @returns Object containing data, loading state, error, and refetch function
 * 
 * @example
 * const { data, loading, error, refetch } = useChartData<ChartDataPoint[]>({
 *   endpoint: '/api/usage-data'
 * })
 */
export function useChartData<T>({
  endpoint,
  enabled = true,
}: UseChartDataOptions): UseChartDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_ENDPOINT}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `SELECT * FROM ${endpoint.replace('/api/', '')}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(errorData.message || `API request failed with status ${response.status}`)
      }

      const result: ApiResponse<T> = await response.json()
      setData(result.rows || null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [endpoint, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

// ============================================
// Specialized Hooks for Specific Chart Types
// ============================================

/**
 * Hook for fetching bar chart data (usage metrics)
 */
export function useBarChartData(tableName: string = 'student_social_media_usage') {
  return useChartData<ChartDataPoint[]>({
    endpoint: `/api/${tableName}`,
    enabled: true,
  })
}

/**
 * Hook for fetching pie chart data (popularity/distribution)
 */
export function usePieChartData(tableName: string = 'student_platform_popularity') {
  return useChartData<ChartDataPoint[]>({
    endpoint: `/api/${tableName}`,
    enabled: true,
  })
}

/**
 * Hook for fetching scatter chart data (correlations)
 */
export function useScatterChartData(tableName: string = 'student_sleep_mental_health') {
  return useChartData<ScatterDataPoint[]>({
    endpoint: `/api/${tableName}`,
    enabled: true,
  })
}

/**
 * Hook for fetching line chart data (trends over time)
 */
export function useLineChartData(tableName: string = 'student_weekly_usage') {
  return useChartData<ChartDataPoint[]>({
    endpoint: `/api/${tableName}`,
    enabled: true,
  })
}

// ============================================
// Data Transformation Utilities
// ============================================

/**
 * Transform API rows to bar chart format
 */
export function transformToBarChartData(
  rows: StudentDataRow[],
  labelColumn: string,
  valueColumn: string,
  colorColumn?: string
): ChartDataPoint[] {
  return rows.map((row) => ({
    label: row[labelColumn] || '',
    value: parseFloat(row[valueColumn]) || 0,
    color: colorColumn ? row[colorColumn] : undefined,
  }))
}

/**
 * Transform API rows to scatter chart format
 */
export function transformToScatterData(
  rows: StudentDataRow[],
  xColumn: string,
  yColumn: string,
  labelColumn?: string
): ScatterDataPoint[] {
  return rows.map((row) => ({
    x: parseFloat(row[xColumn]) || 0,
    y: parseFloat(row[yColumn]) || 0,
    label: labelColumn ? row[labelColumn] : undefined,
  }))
}

/**
 * Default color palette for charts
 */
export const CHART_COLORS = [
  '#0ea5e9', // sky blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
]

/**
 * Platform brand colors
 */
export const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  TikTok: '#000000',
  YouTube: '#FF0000',
  Twitter: '#1DA1F2',
  Facebook: '#1877F2',
  LinkedIn: '#0077B5',
  Reddit: '#FF4500',
  Pinterest: '#BD081C',
  Snapchat: '#FFFC00',
}

export default {
  useChartData,
  useBarChartData,
  usePieChartData,
  useScatterChartData,
  useLineChartData,
  transformToBarChartData,
  transformToScatterData,
  CHART_COLORS,
  PLATFORM_COLORS,
}

