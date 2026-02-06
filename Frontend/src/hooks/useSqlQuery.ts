import { useState, useCallback } from 'react'

export interface UseSqlQueryOptions {
  endpoint: string
  method?: 'POST' | 'GET'
  headers?: Record<string, string>
}

export interface SqlQueryResult<T = unknown> {
  data: T | null
  loading: boolean
  error: Error | null
  execute: (query: string) => Promise<T>
}

/**
 * Custom hook for executing SQL queries against an API Gateway endpoint
 * 
 * @param options - Configuration object containing endpoint URL and optional headers
 * @returns Object containing data, loading state, error, and execute function
 * 
 * @example
 * const { data, loading, error, execute } = useSqlQuery({
 *   endpoint: 'https://api.example.com/query'
 * })
 * 
 * // Execute a query
 * await execute('SELECT * FROM users WHERE id = 123')
 */
export const useSqlQuery = <T = unknown>({
  endpoint,
  method = 'POST',
  headers = {},
}: UseSqlQueryOptions): SqlQueryResult<T> => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (query: string): Promise<T> => {
      setLoading(true)
      setError(null)
      setData(null)

      try {
        // Validate query
        if (!query || query.trim().length === 0) {
          throw new Error('SQL query cannot be empty')
        }

        // Prepare request options
        const requestOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }

        // Add body for POST/PUT requests
        if (method === 'POST' || method === 'GET') {
          requestOptions.body = JSON.stringify({
            query: query.trim(),
          })
        }

        // Make the API call
        const response = await fetch(endpoint, requestOptions)

        // Handle network errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }))
          throw new Error(
            errorData.message || `API request failed with status ${response.status}`
          )
        }

        // Parse response
        const result: T = await response.json()
        setData(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [endpoint, method, headers]
  )

  return {
    data,
    loading,
    error,
    execute,
  }
}

export default useSqlQuery
