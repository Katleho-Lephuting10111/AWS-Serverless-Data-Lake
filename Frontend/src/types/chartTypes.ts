// ============================================
// Chart.js Data Types
// ============================================

export interface BarChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface PieChartDataPoint {
  label: string
  value: number
  color: string
}

export interface ScatterChartDataPoint {
  x: number
  y: number
  label?: string
}

export interface LineChartDataPoint {
  label: string
  value: number
}

// ============================================
// Base Chart Props
// ============================================

export interface BaseChartProps {
  title?: string
  description?: string
  height?: number
}

// ============================================
// Bar Chart Props
// ============================================

export interface BarChartProps extends BaseChartProps {
  data: BarChartDataPoint[]
  xAxisLabel?: string
  yAxisLabel?: string
  showLegend?: boolean
  colors?: string[]
}

// ============================================
// Pie Chart Props
// ============================================

export interface PieChartProps extends BaseChartProps {
  data: PieChartDataPoint[]
  showLabels?: boolean
  donut?: boolean
}

// ============================================
// Scatter Chart Props
// ============================================

export interface ScatterChartProps extends BaseChartProps {
  data: ScatterChartDataPoint[]
  xAxisLabel?: string
  yAxisLabel?: string
  pointColor?: string
}

// ============================================
// Line Chart Props
// ============================================

export interface LineChartProps extends BaseChartProps {
  data: LineChartDataPoint[]
  xAxisLabel?: string
  yAxisLabel?: string
  showFill?: boolean
  tension?: number
}

