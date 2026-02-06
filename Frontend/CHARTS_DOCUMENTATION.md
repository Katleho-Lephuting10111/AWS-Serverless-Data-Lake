# Charts Dashboard - Implementation Guide

## Overview

A comprehensive React dashboard component with three interactive charts visualizing social media impact and wellness metrics.

## Components Created

### 1. ChartDashboard Component
**Location:** `src/components/ChartDashboard.tsx`

A reusable component featuring three data visualizations:

#### Chart 1: Usage vs Academic Impact (Bar Chart)
- **Type:** Grouped Bar Chart
- **Data:** 7 platforms (Instagram, TikTok, YouTube, Twitter, Facebook, LinkedIn, Reddit)
- **Metrics:** 
  - Usage hours per day (0-10 scale)
  - Academic impact on GPA (0-10 scale)
- **Features:**
  - Rotated X-axis labels for readability
  - Dual Y-axis values
  - Summary stats showing highest usage and best academic impact
  - Color-coded bars

#### Chart 2: Platform Popularity (Pie Chart)
- **Type:** Pie Chart with Labels
- **Data:** 6 platforms with market share percentages
- **Metrics:**
  - Instagram: 28%
  - TikTok: 25%
  - YouTube: 22%
  - Twitter: 12%
  - Facebook: 8%
  - Other: 5%
- **Features:**
  - Custom brand colors for each platform
  - Percentage labels on slices
  - Summary grid showing top 3 platforms
  - Hover tooltips

#### Chart 3: Sleep vs Mental Health (Scatter Plot)
- **Type:** Scatter Chart with Correlation Analysis
- **Data:** 11 data points showing sleep hours vs mental wellness scores
- **Metrics:**
  - X-axis: Hours of sleep per night (4-9 hours)
  - Y-axis: Mental health score (0-10 scale)
- **Features:**
  - Circular markers sized by frequency
  - Grid lines for easy reference
  - Insight cards showing:
    - Optimal sleep duration: 7-8 hours
    - Correlation coefficient: 0.89 (strong positive)
    - Recommendations for action

### 2. Charts Page
**Location:** `src/pages/Charts.tsx`

Wrapper page that renders the ChartDashboard component for the `/charts` route.

## Features

### Data Visualization
✅ **Bar Chart** - Compare usage and academic impact across platforms  
✅ **Pie Chart** - View market share distribution  
✅ **Scatter Plot** - Analyze correlation between sleep and mental health  

### Interactive Elements
- Hover tooltips showing detailed values
- Color-coded data for easy identification
- Responsive design (mobile, tablet, desktop)
- Formatted numbers and percentages
- Icon indicators for each chart section

### Summary Sections
- Individual chart insights below each visualization
- Key metrics highlighted in gradient cards
- Correlation analysis with recommendations
- Color-coded data points (blue, green, purple, etc.)

### Layout
- Side-by-side bar and pie charts (responsive grid)
- Full-width scatter plot
- Summary insights section
- Key takeaways box

## Chart Configuration

### Technologies Used
- **Recharts** - React charting library
- **Tailwind CSS** - Styling
- **Lucide Icons** - Visual indicators
- **TypeScript** - Type safety

### Responsive Behavior
```
Desktop:  Bar | Pie (side-by-side)
          Scatter (full width)

Tablet:   Charts stack vertically
          Full responsive layout

Mobile:   All charts single column
          Touch-friendly tooltips
```

## Integration

### Routes
Added to `src/App.tsx`:
```tsx
<Route path="/charts" element={<Charts />} />
```

### Navigation
Added to `src/components/Layout.tsx`:
```tsx
{ path: '/charts', icon: LineChart, label: 'Charts' }
```

### Dependencies
- recharts: ^2.15.4 (charting library)
- lucide-react: ^0.292.0 (icons)
- react: ^18.2.0
- tailwindcss: ^3.3.6

## Usage Examples

### Importing the Component
```tsx
import ChartDashboard from '../components/ChartDashboard'

function Page() {
  return <ChartDashboard />
}
```

### Customizing Data
Edit the data arrays in `ChartDashboard.tsx`:
```tsx
const usageAcademicData = [
  { platform: 'Instagram', usage: 8.5, academicImpact: 3.2 },
  // ... more data
]
```

## Data Structure

### Usage vs Academic Impact
```typescript
interface UsageAcademicData {
  platform: string
  usage: number      // hours per day
  academicImpact: number  // GPA impact (0-10)
}
```

### Platform Popularity
```typescript
interface PlatformData {
  name: string
  value: number     // percentage
  color: string     // hex color
}
```

### Sleep vs Mental Health
```typescript
interface SleepHealthData {
  sleep: number           // hours per night
  mentalHealth: number    // wellness score (0-10)
  size: number           // indicator size
}
```

## Styling

All components use Tailwind CSS classes:
- `bg-white p-8 rounded-lg shadow-sm` - Card container
- `grid grid-cols-1 lg:grid-cols-2 gap-8` - Responsive grid
- `flex items-center gap-3` - Icon + text layout
- `bg-blue-50 rounded-lg` - Summary boxes
- `bg-gradient-to-br from-primary-600 to-primary-800` - Summary section

## Color Scheme

**Chart Colors:**
- Blue: #0ea5e9
- Cyan: #06b6d4
- Green: #10b981
- Amber: #f59e0b
- Red: #ef4444
- Purple: #8b5cf6

**Platform Colors (Authentic Branding):**
- Instagram: #E1306C
- TikTok: #000000
- YouTube: #FF0000
- Twitter: #1DA1F2
- Facebook: #1877F2
- Other: #9CA3AF

## Performance

- Uses ResponsiveContainer for auto-sizing
- Efficient data structure
- Memoized chart calculations
- Lightweight Recharts library (~50KB)
- Optimized for mobile viewports

## Accessibility

- Keyboard navigation supported
- Tooltip content describes data points
- Color-coded but not color-only (uses labels)
- Proper semantic HTML
- ARIA attributes from Recharts

## Next Steps

To extend this dashboard:

1. **Connect to API** - Replace sample data with API calls
2. **Add More Charts** - Include line charts, area charts, heatmaps
3. **Implement Filters** - Date range, platform selection
4. **Export Data** - CSV/PDF export functionality
5. **Real-time Updates** - WebSocket connections
6. **Caching** - Store chart data locally
7. **Animations** - Add chart entrance animations

## Files Modified/Created

```
Frontend/
├── src/
│   ├── components/
│   │   └── ChartDashboard.tsx    ✨ NEW
│   ├── pages/
│   │   └── Charts.tsx             ✨ NEW
│   ├── App.tsx                    ✏️ UPDATED (route added)
│   └── components/
│       └── Layout.tsx             ✏️ UPDATED (nav item added)
└── package.json                   ✏️ UPDATED (recharts dependency)
```

## Testing the Dashboard

1. Install dependencies:
   ```bash
   cd Frontend
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Navigate to:
   ```
   http://localhost:3000/charts
   ```

4. Interact with charts:
   - Hover over data points for details
   - Click chart items (if interactive)
   - Resize browser for responsive layout
   - Check mobile view in DevTools

## Common Issues & Solutions

**Issue:** Charts not rendering
- **Solution:** Ensure Recharts is installed (`npm ls recharts`)

**Issue:** Charts container too small
- **Solution:** ResponsiveContainer handles sizing, check parent width

**Issue:** Data not displaying
- **Solution:** Verify data structure matches expected format

**Issue:** Performance issues
- **Solution:** Reduce data points or virtualize long lists

## License

See LICENSE file in the root directory
