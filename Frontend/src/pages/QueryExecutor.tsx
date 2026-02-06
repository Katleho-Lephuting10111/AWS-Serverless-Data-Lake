import { useState } from 'react'
import { useSqlQuery } from '../hooks'
import { Play, Loader, AlertCircle, CheckCircle } from 'lucide-react'

interface QueryResult {
  rows?: unknown[]
  count?: number
  message?: string
}

/**
 * Example component demonstrating the useSqlQuery hook
 * Shows how to execute SQL queries against an API Gateway endpoint
 */
export default function QueryExecutor() {
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10')
  const [customEndpoint, setCustomEndpoint] = useState(
    'https://api.example.com/query'
  )

  const { data, loading, error, execute } = useSqlQuery<QueryResult>({
    endpoint: customEndpoint,
  })

  const handleExecute = async () => {
    try {
      await execute(query)
    } catch (err) {
      // Error is already handled by the hook
      console.error('Query failed:', err)
    }
  }

  const handleClear = () => {
    setQuery('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Query Executor</h1>
        <p className="text-gray-600 mt-2">Execute SQL queries against the API Gateway</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Endpoint Configuration */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              API Gateway Endpoint
            </label>
            <input
              type="url"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              placeholder="https://api.example.com/query"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              Configure your API Gateway endpoint URL
            </p>
          </div>

          {/* SQL Query Editor */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-900">
                SQL Query
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT * FROM table_name WHERE condition = true"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition font-mono text-sm resize-none"
              rows={8}
            />
          </div>

          {/* Execute Button */}
          <div className="flex gap-3">
            <button
              onClick={handleExecute}
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Execute Query
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Results</h2>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center gap-2 text-primary-600">
                <Loader size={18} className="animate-spin" />
                <span className="text-sm">Executing query...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-red-900">Error</p>
                    <p className="text-xs text-red-700 mt-1">{error.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success State */}
            {data && !loading && !error && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">Query executed successfully</span>
                </div>

                <div className="space-y-2 text-xs">
                  {data.count !== undefined && (
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">
                        <span className="font-semibold">{data.count}</span> rows returned
                      </p>
                    </div>
                  )}

                  {data.rows && (
                    <div className="p-2 bg-gray-50 rounded max-h-64 overflow-auto">
                      <p className="text-gray-600 font-semibold mb-2">Sample Results:</p>
                      <pre className="text-gray-700 whitespace-pre-wrap break-words">
                        {JSON.stringify(data.rows.slice(0, 3), null, 2)}
                      </pre>
                    </div>
                  )}

                  {data.message && (
                    <div className="p-2 bg-blue-50 text-blue-700 rounded">
                      {data.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && !data && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Execute a query to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Documentation */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hook Documentation</h2>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Hook Usage:</h3>
            <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-xs">
{`const { data, loading, error, execute } = useSqlQuery({
  endpoint: 'https://api.example.com/query',
  headers: {
    'Authorization': 'Bearer token'
  }
})

// Execute a query
await execute('SELECT * FROM users')`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Expected API Response:</h3>
            <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-xs">
{`{
  "rows": [
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Jane" }
  ],
  "count": 2
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Request Payload:</h3>
            <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-xs">
{`{
  "query": "SELECT * FROM users LIMIT 10"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
