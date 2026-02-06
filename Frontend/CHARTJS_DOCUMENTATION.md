# Chart.js Components Documentation

A comprehensive React chart library using Chart.js for data visualization.

## Installation

```bash
npm install chart.js
```

## Components

### 1. BarChart

Renders a bar chart for comparing values across categories.

```tsx
import { BarChart } from '../components/ChartJsComponents'

const data = [
  { label: 'Instagram', value: 8.5, color: '#E1306C' },
  { label: 'TikTok', value: 9.2, color: '#000000' },
]

<BarChart
  data={data}
  title="Usage Comparison"
  description="Daily usage hours by platform"
  xAxisLabel="Platform"
  yAxisLabel="Hours"
  height={400}
/>
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `{ label: string; value: number; color?: string }[]` | Yes | - | Array of data points |
| `title` | `string` | No | - | Chart title |
| `description` | `string` | No | - | Chart description |
| `xAxisLabel` | `string` | No | - | X-axis label |
| `yAxisLabel` | `string` | No | - | Y-axis label |
| `colors` | `string[]` | No | `['#0ea5e9', '#10b981', ...]` | Custom color palette |
| `height` | `number` | No | `300` | Chart height in pixels |

---

### 2. PieChart

Renders a pie or doughnut chart for showing proportions.

```tsx
import { PieChart } from '../components/ChartJsComponents'

const data = [
  { label: 'Instagram', value: 28, color: '#E1306C' },
  { label: 'TikTok', value: 25, color: '#000000' },
]

<PieChart
  data={data}
  title="Market Share"
  description="Platform popularity distribution"
  donut={true}
  height={400}
/>
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `{ label: string; value: number; color: string }[]` | Yes | - | Array of data points (color required) |
| `title` | `string` | No | - | Chart title |
| `description` | `string` | No | - | Chart description |
| `donut` | `boolean` | No | `false` | Whether to render as doughnut chart |
| `height` | `number` | No | `300` | Chart height in pixels |

---

### 3. ScatterChart

Renders a scatter plot for showing correlations between two variables.

```tsx
import { ScatterChart } from '../components/ChartJsComponents'

const data = [
  { x: 4, y: 3.2 },
  { x: 5, y: 4.1 },
  { x: 6, y: 6.1 },
  { x: 7, y: 7.5 },
  { x: 8, y: 8.2 },
]

<ScatterChart
  data={data}
  title="Sleep vs Mental Health"
  description="Correlation analysis"
  xAxisLabel="Hours of Sleep"
  yAxisLabel="Mental Wellness Score"
  pointColor="#0ea5e9"
  height={400}
/>
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `{ x: number; y: number; label?: string }[]` | Yes | - | Array of data points |
| `title` | `string` | No | - | Chart title |
| `description` | `string` | No | - | Chart description |
| `xAxisLabel` | `string` | No | - | X-axis label |
| `yAxisLabel` | `string` | No | - | Y-axis label |
| `pointColor` | `string` | No | `#0ea5e9` | Color of scatter points |
| `height` | `number` | No | `300` | Chart height in pixels |

---

### 4. LineChart

Renders a line chart for showing trends over time.

```tsx
import { LineChart } from '../components/ChartJsComponents'

const data = [
  { label: 'Mon', value: 5.2 },
  { label: 'Tue', value: 6.1 },
  { label: 'Wed', value: 5.8 },
]

<LineChart
  data={data}
  title="Weekly Trends"
  description="Usage patterns throughout the week"
  xAxisLabel="Day"
  yAxisLabel="Hours"
  showFill={true}
  tension={0.4}
  height={300}
/>
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `{ label: string; value: number }[]` | Yes | - | Array of data points |
| `title` | `string` | No | - | Chart title |
| `description` | `string` | No | - | Chart description |
| `xAxisLabel` | `string` | No | - | X-axis label |
| `yAxisLabel` | `string` | No | - | Y-axis label |
| `showFill` | `boolean` | No | `false` | Whether to fill area under line |
| `tension` | `number` | No | `0.4` | Bezier curve tension (0-1) |
| `height` | `number` | No | `300` | Chart height in pixels |

---

## Data Types

### BarChartDataPoint
```typescript
interface BarChartDataPoint {
  label: string       // Category name
  value: number       // Bar height/value
  color?: string      // Optional custom color
}
```

### PieChartDataPoint
```typescript
interface PieChartDataPoint {
  label: string       // Slice name
  value: number       // Slice value (percentage)
  color: string       // Slice color (required)
}
```

### ScatterChartDataPoint
```typescript
interface ScatterChartDataPoint {
  x: number          // X-axis value
  y: number          // Y-axis value
  label?: string     // Optional tooltip label
}
```

### LineChartDataPoint
```typescript
interface LineChartDataPoint {
  label: string       // Point label (e.g., date)
  value: number       // Y-axis value
}
```

---

## Example Usage

### Complete Dashboard Example

```tsx
import { BarChart, PieChart, ScatterChart, LineChart } from '../components/ChartJsComponents'

// Usage data
const usageData = [
  { label: 'Instagram', value: 8.5, color: '#E1306C' },
  { label: 'TikTok', value: 9.2, color: '#000000' },
  { label: 'YouTube', value: 7.8, color: '#FF0000' },
]

// Popularity data
const popularityData = [
  { label: 'Instagram', value: 28, color: '#E1306C' },
  { label: 'TikTok', value: 25, color: '#000000' },
  { label: 'YouTube', value: 22, color: '#FF0000' },
]

// Sleep correlation data
const sleepData = [
  { x: 4, y: 3.2 },
  { x: 5, y: 4.1 },
  { x: 6, y: 6.1 },
  { x: 7, y: 7.5 },
  { x: 8, y: 8.2 },
]

// Weekly trends
const weeklyData = [
  { label: 'Mon', value: 5.2 },
  { label: 'Tue', value: 6.1 },
  { label: 'Wed', value: 5.8 },
  { label: 'Thu', value: 7.2 },
  { label: 'Fri', value: 8.5 },
  { label: 'Sat', value: 9.1 },
  { label: 'Sun', value: 8.7 },
]

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BarChart
          data={usageData}
          title="Platform Usage"
          xAxisLabel="Platform"
          yAxisLabel="Hours/Day"
        />
        <PieChart
          data={popularityData}
          title="Market Share"
          donut={true}
        />
      </div>
      <ScatterChart
        data={sleepData}
        title="Sleep vs Mental Health"
        xAxisLabel="Sleep (hrs)"
        yAxisLabel="Mental Wellness"
      />
      <LineChart
        data={weeklyData}
        title="Weekly Usage"
        showFill={true}
      />
    </div>
  )
}
```

---

## Styling

All components use Tailwind CSS classes:
- Container: `bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow`
- Responsive: Uses `maintainAspectRatio: false` for flexible sizing
- Custom height via props

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Dependencies

- `chart.js`: ^4.4.1
- `react`: ^18.2.0

---

## License

MIT License

