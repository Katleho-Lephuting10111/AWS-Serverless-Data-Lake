# useSqlQuery Hook Documentation

## Overview

`useSqlQuery` is a custom React hook that simplifies making SQL queries to an API Gateway endpoint. It handles fetching, loading states, error handling, and JSON parsing automatically.

## Installation

The hook is located at `src/hooks/useSqlQuery.ts` and is exported from `src/hooks/index.ts`.

## Basic Usage

```tsx
import { useSqlQuery } from '../hooks'

function MyComponent() {
  const { data, loading, error, execute } = useSqlQuery({
    endpoint: 'https://api.example.com/query'
  })

  const handleQueryClick = async () => {
    try {
      await execute('SELECT * FROM users WHERE id = 123')
    } catch (err) {
      console.error('Query failed:', err)
    }
  }

  return (
    <div>
      <button onClick={handleQueryClick} disabled={loading}>
        {loading ? 'Loading...' : 'Execute Query'}
      </button>
      
      {error && <p>Error: {error.message}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}
```

## API Reference

### Hook Signature

```typescript
useSqlQuery<T>(options: UseSqlQueryOptions): SqlQueryResult<T>
```

### Parameters

#### `UseSqlQueryOptions`

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `endpoint` | `string` | ✓ | - | The API Gateway endpoint URL |
| `method` | `'POST' \| 'GET'` | - | `'POST'` | HTTP method for the request |
| `headers` | `Record<string, string>` | - | `{}` | Additional headers to send with the request |

### Return Value

#### `SqlQueryResult<T>`

| Property | Type | Description |
|----------|------|-------------|
| `data` | `T \| null` | The JSON response from the API or null |
| `loading` | `boolean` | True while the query is executing |
| `error` | `Error \| null` | Error object if the request fails |
| `execute` | `(query: string) => Promise<T>` | Function to execute a SQL query |

## Features

### ✓ Type-Safe
Fully typed with TypeScript generics for custom response types:

```tsx
interface UserQueryResult {
  rows: Array<{ id: number; name: string }>
  count: number
}

const { data, execute } = useSqlQuery<UserQueryResult>({
  endpoint: 'https://api.example.com/query'
})

// data is typed as UserQueryResult | null
const count = data?.count // TypeScript knows this exists
```

### ✓ Error Handling
Automatic error handling for:
- Network failures
- Invalid JSON responses
- Empty or invalid queries
- HTTP error status codes

```tsx
const { error, execute } = useSqlQuery({
  endpoint: 'https://api.example.com/query'
})

try {
  await execute('SELECT * FROM users')
} catch (err) {
  // Error is caught and available in error state
  console.error(err.message)
}
```

### ✓ Loading State
Automatic loading state management:

```tsx
const { loading, execute } = useSqlQuery({
  endpoint: 'https://api.example.com/query'
})

// Shows loading state while executing
<button disabled={loading}>
  {loading ? 'Executing...' : 'Run Query'}
</button>
```

### ✓ Automatic Headers
Automatically includes:
- `Content-Type: application/json`
- Custom headers you provide

```tsx
const { execute } = useSqlQuery({
  endpoint: 'https://api.example.com/query',
  headers: {
    'Authorization': 'Bearer eyJhbGc...',
    'X-Custom-Header': 'value'
  }
})
```

### ✓ Request Body Format
SQL query is automatically formatted in the request body:

```json
{
  "query": "SELECT * FROM users LIMIT 10"
}
```

## Advanced Examples

### With Authentication

```tsx
function QueryWithAuth() {
  const { data, execute } = useSqlQuery({
    endpoint: 'https://api.example.com/query',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  })

  return <QueryForm execute={execute} data={data} />
}
```

### Custom Response Type

```tsx
interface QueryResponse {
  success: boolean
  data?: unknown[]
  error?: string
  duration: number
}

function TypedQuery() {
  const { data, error, execute } = useSqlQuery<QueryResponse>({
    endpoint: 'https://api.example.com/query'
  })

  if (data?.success) {
    // TypeScript knows data has these properties
    console.log(`Query took ${data.duration}ms`)
  }
}
```

### Batch Queries

```tsx
async function executeBatchQueries() {
  const { execute } = useSqlQuery({
    endpoint: 'https://api.example.com/query'
  })

  const results = await Promise.all([
    execute('SELECT COUNT(*) as user_count FROM users'),
    execute('SELECT COUNT(*) as post_count FROM posts'),
    execute('SELECT COUNT(*) as comment_count FROM comments'),
  ])

  return results
}
```

### Paginated Query

```tsx
function PaginatedResults() {
  const [page, setPage] = useState(1)
  const pageSize = 20
  const offset = (page - 1) * pageSize

  const { data, loading, execute } = useSqlQuery({
    endpoint: 'https://api.example.com/query'
  })

  const loadPage = async (pageNum: number) => {
    setPage(pageNum)
    await execute(
      `SELECT * FROM users LIMIT ${pageSize} OFFSET ${(pageNum - 1) * pageSize}`
    )
  }

  return (
    <div>
      {/* Render data */}
      <button onClick={() => loadPage(page - 1)}>Previous</button>
      <button onClick={() => loadPage(page + 1)}>Next</button>
    </div>
  )
}
```

## Hooks & Dependencies

The hook uses:
- `useState` - For managing data, loading, and error states
- `useCallback` - For memoized execute function

Dependencies of the `execute` function:
- `endpoint`
- `method`
- `headers`

This means the hook will recreate the execute function when any of these change.

## Error Handling

### Empty Query
```tsx
try {
  await execute('')
} catch (err) {
  // Error: "SQL query cannot be empty"
}
```

### API Errors
```tsx
try {
  await execute('INVALID SQL')
} catch (err) {
  // Error from server or network
}
```

### Network Failure
```tsx
try {
  await execute('SELECT 1')
} catch (err) {
  // Error: Network timeout or connection refused
}
```

## Best Practices

1. **Always handle errors**
   ```tsx
   try {
     await execute(query)
   } catch (err) {
     // Show user-friendly error message
   }
   ```

2. **Validate queries before execution**
   ```tsx
   const isValidQuery = query.trim().length > 0
   <button disabled={!isValidQuery}>Execute</button>
   ```

3. **Use TypeScript generics for type safety**
   ```tsx
   const { data } = useSqlQuery<MyResponseType>({...})
   ```

4. **Implement debouncing for frequent queries**
   ```tsx
   const debouncedExecute = useMemo(
     () => debounce(execute, 300),
     [execute]
   )
   ```

5. **Don't execute queries on every render**
   ```tsx
   useEffect(() => {
     // Execute once on component mount
     execute('SELECT * FROM users')
   }, [])
   ```

## Testing

### Example Test

```tsx
import { renderHook, act } from '@testing-library/react'
import { useSqlQuery } from '../hooks'

test('executes query successfully', async () => {
  const mockData = { rows: [{ id: 1 }] }
  
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockData)
    })
  )

  const { result } = renderHook(() =>
    useSqlQuery({ endpoint: 'https://api.example.com/query' })
  )

  let data
  await act(async () => {
    data = await result.current.execute('SELECT * FROM users')
  })

  expect(data).toEqual(mockData)
  expect(result.current.loading).toBe(false)
  expect(result.current.error).toBe(null)
})
```

## Migration from Fetch

### Before
```tsx
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

async function executeQuery(query) {
  setLoading(true)
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })
    const result = await response.json()
    setData(result)
  } catch (err) {
    setError(err)
  } finally {
    setLoading(false)
  }
}
```

### After
```tsx
const { data, loading, error, execute } = useSqlQuery({
  endpoint
})

await execute(query)
```

## Troubleshooting

### CORS Errors
Ensure your API Gateway has CORS enabled:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Auth Header Not Sent
Make sure to configure headers in the hook:
```tsx
useSqlQuery({
  endpoint,
  headers: {
    'Authorization': 'Bearer token'
  }
})
```

### Response Parsing Error
Ensure your API returns valid JSON:
```json
{
  "rows": [],
  "count": 0
}
```

## See Also

- [QueryExecutor Component](../pages/QueryExecutor.tsx) - Example usage
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
