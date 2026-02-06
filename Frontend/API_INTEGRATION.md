# API Integration for Charts Documentation

This document describes how to fetch data from the AWS Athena backend API and visualize it using Chart.js components.

## Architecture Overview

```
React Frontend → API Gateway → Lambda → Athena → S3/Glue
                    ↓
              Chart.js Components
```

## Setup

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your API endpoint:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_BASE_URL=https://your-api-id.execute-api.eu-west-1.amazonaws.com/dev
VITE_API_ENDPOINT=https://your-api-id.execute-api.eu-west-1.amazonaws.com/dev/query
```

### 2. Start the Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000/api-charts` to see the API-integrated charts.

## API Integration Flow

### 1. Frontend Sends Query

```typescript
const response = await fetch(API_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'SELECT platform, AVG(hours) FROM student_data GROUP BY platform'
  })
})
```

### 2. Backend Processes Query

The Lambda function (`student-datalake/index.py`):
- Validates the query
- Starts Athena query execution
- Polls for completion
- Returns results as JSON

### 3. Frontend Renders Charts

```typescript
// Fetch data from API
const result = await executeQuery(query)

// Transform API response to chart format
const chartData = result.rows.map(row => ({
  label: row.platform,
  value: parseFloat(row.avg_hours)
}))

// Render Chart.js component
<BarChart data={chartData} />
```

## File Structure

```
Frontend/src/
├── components/
│   └── ChartJsComponents.tsx   # Chart.js wrapper components
├── hooks/
│   ├── useChartData.ts         # Data fetching hooks
│   └── useSqlQuery.ts          # SQL query hook
├── pages/
│   ├── Charts.tsx              # Static demo charts
│   └── ApiCharts.tsx          # API-integrated charts
├── App.tsx                     # Routes configuration
└── types/
    └── chartTypes.ts           # TypeScript interfaces
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/query` | Execute SQL query |

### Request Format

```json
{
  "query": "SELECT * FROM table_name LIMIT 10",
  "maxWaitTime": 60
}
```

### Response Format

```json
{
  "message": "Query executed successfully",
  "queryExecutionId": "abc123",
  "state": "SUCCEEDED",
  "rows": [
    { "platform": "Instagram", "avg_usage": "8.5" },
    { "platform": "TikTok", "avg_usage": "9.2" }
  ],
  "columnMetadata": [
    { "name": "platform", "type": "varchar" },
    { "name": "avg_usage", "type": "float" }
  ],
  "rowCount": 7,
  "dataScannedInBytes": 12345,
  "executionTimeInMillis": 500
}
```

## Sample SQL Queries

### Bar Chart: Platform Usage

```sql
SELECT 
  platform,
  AVG(hours_per_day) as avg_usage,
  AVG(gpa_impact) as academic_impact
FROM student_social_media_usage
GROUP BY platform
ORDER BY avg_usage DESC
```

### Pie Chart: Platform Popularity

```sql
SELECT 
  platform,
  COUNT(DISTINCT student_id) as user_count
FROM student_social_media_usage
GROUP BY platform
ORDER BY user_count DESC
```

### Scatter Chart: Sleep vs Mental Health

```sql
SELECT 
  AVG(sleep_hours) as sleep,
  AVG(mental_health_score) as mental_health
FROM student_sleep_mental_health
GROUP BY student_id
```

### Line Chart: Weekly Trends

```sql
SELECT 
  day_of_week,
  AVG(hours_spent) as avg_hours
FROM student_weekly_usage
GROUP BY day_of_week
ORDER BY CASE 
  WHEN day_of_week = 'Monday' THEN 1
  WHEN day_of_week = 'Tuesday' THEN 2
  ...
END
```

## Using Custom Hooks

### useChartData Hook

```typescript
import { useChartData } from '../hooks/useChartData'

function MyComponent() {
  const { data, loading, error, refetch } = useChartData<ChartDataPoint[]>({
    endpoint: '/api/usage-data',
    enabled: true
  })

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!data) return <NoDataMessage />

  return <BarChart data={data} />
}
```

### Specialized Hooks

```typescript
import { useBarChartData, usePieChartData, useScatterChartData } from '../hooks/useChartData'

// Bar chart data
const barData = useBarChartData('student_social_media_usage')

// Pie chart data
const pieData = usePieChartData('student_platform_popularity')

// Scatter chart data
const scatterData = useScatterChartData('student_sleep_mental_health')
```

## Error Handling

### API Errors

```typescript
try {
  const result = await executeQuery(query)
  if (result.state === 'FAILED') {
    throw new Error(result.StateChangeReason)
  }
  // Process results
} catch (error) {
  console.error('Query failed:', error)
  // Show error to user
}
```

### Loading States

```tsx
{loading && <LoadingState />}

{error && (
  <ErrorState 
    error={error} 
    onRetry={fetchData} 
  />
)}
```

## Performance Tips

1. **Use `maxWaitTime`**: Set appropriate timeout (max 900 seconds)
2. **Limit Results**: Use `LIMIT` clause for large datasets
3. **Cache Results**: Store frequently used data locally
4. **Parallel Fetching**: Load multiple charts simultaneously

```typescript
const results = await Promise.all([
  fetchBarChartData(),
  fetchPieChartData(),
  fetchScatterChartData(),
])
```

## Troubleshooting

### CORS Errors

Ensure API Gateway has CORS enabled:
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

### Query Timeout

Increase `maxWaitTime` in request body:
```json
{
  "query": "SELECT ...",
  "maxWaitTime": 300
}
```

### Empty Results

Check that your Glue tables have data:
```sql
SELECT COUNT(*) FROM student_social_media_usage
```

## Security

### Environment Variables

Never commit `.env.local` to version control:
```
# .gitignore
.env.local
.env.*.local
```

### API Keys

If using API keys, add to request headers:
```typescript
headers: {
  'Content-Type': 'application/json',
  'X-API-Key': import.meta.env.VITE_API_KEY
}
```

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables in Production

Set environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- AWS: Lambda Environment Variables

## Example: Complete Integration

```tsx
import { useState, useEffect } from 'react'
import { BarChart, PieChart, ScatterChart } from '../components/ChartJsComponents'
import { executeQuery, transformToBarChartData } from '../utils/api'

export default function AnalyticsDashboard() {
  const [usageData, setUsageData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const result = await executeQuery(`
          SELECT platform, AVG(hours) as hours
          FROM student_social_media_usage
          GROUP BY platform
        `)
        
        const chartData = transformToBarChartData(
          result.rows,
          'platform',
          'hours'
        )
        
        setUsageData(chartData)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <BarChart
      data={usageData}
      title="Platform Usage"
      xAxisLabel="Platform"
      yAxisLabel="Hours/Day"
    />
  )
}
```

