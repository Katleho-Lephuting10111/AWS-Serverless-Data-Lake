import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
} from 'chart.js'
import { useRef, useEffect } from 'react'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// ============================================
// Bar Chart Component
// ============================================

export interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  title?: string
  description?: string
  xAxisLabel?: string
  yAxisLabel?: string
  colors?: string[]
  height?: number
}

export function BarChart({
  data,
  title,
  description,
  xAxisLabel,
  yAxisLabel,
  colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'],
  height = 300,
}: BarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<ChartJS | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    const chartData: ChartData<'bar'> = {
      labels: data.map(d => d.label),
      datasets: [
        {
          label: yAxisLabel || 'Value',
          data: data.map(d => d.value),
          backgroundColor: data.map((d, i) => d.color || colors[i % colors.length]),
          borderColor: data.map((d, i) => d.color || colors[i % colors.length]),
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    }

    const options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: !!title,
          text: title || '',
          font: { size: 16, weight: 'bold' },
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.y}`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: !!xAxisLabel,
            text: xAxisLabel || '',
          },
          grid: { display: false },
        },
        y: {
          title: {
            display: !!yAxisLabel,
            text: yAxisLabel || '',
          },
          beginAtZero: true,
        },
      },
    }

    chartInstance.current = new ChartJS(ctx, {
      type: 'bar',
      data: chartData,
      options,
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, title, xAxisLabel, yAxisLabel, colors])

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      )}
      <div style={{ height: `${height}px` }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}

// ============================================
// Pie Chart Component
// ============================================

export interface PieChartProps {
  data: { label: string; value: number; color: string }[]
  title?: string
  description?: string
  donut?: boolean
  height?: number
}

export function PieChart({
  data,
  title,
  description,
  donut = false,
  height = 300,
}: PieChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<ChartJS | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    const chartData: ChartData<'pie'> = {
      labels: data.map(d => d.label),
      datasets: [
        {
          data: data.map(d => d.value),
          backgroundColor: data.map(d => d.color),
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    }

    const options: ChartOptions<'pie'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
          },
        },
        title: {
          display: !!title,
          text: title || '',
          font: { size: 16, weight: 'bold' },
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.parsed}%`,
          },
        },
      },
      cutout: donut ? '60%' : '0%',
    }

    chartInstance.current = new ChartJS(ctx, {
      type: 'pie',
      data: chartData,
      options,
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, title, donut])

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      )}
      <div style={{ height: `${height}px` }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}

// ============================================
// Scatter Chart Component
// ============================================

export interface ScatterChartProps {
  data: { x: number; y: number; label?: string }[]
  title?: string
  description?: string
  xAxisLabel?: string
  yAxisLabel?: string
  pointColor?: string
  height?: number
}

export function ScatterChart({
  data,
  title,
  description,
  xAxisLabel,
  yAxisLabel,
  pointColor = '#0ea5e9',
  height = 300,
}: ScatterChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<ChartJS | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    const chartData: ChartData<'scatter'> = {
      datasets: [
        {
          label: 'Data Points',
          data: data.map(d => ({ x: d.x, y: d.y })),
          backgroundColor: pointColor,
          borderColor: pointColor,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    }

    const options: ChartOptions<'scatter'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: !!title,
          text: title || '',
          font: { size: 16, weight: 'bold' },
        },
        tooltip: {
          callbacks: {
            label: (context) => `(${context.parsed.x}, ${context.parsed.y})`,
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: !!xAxisLabel,
            text: xAxisLabel || '',
          },
          min: 0,
        },
        y: {
          title: {
            display: !!yAxisLabel,
            text: yAxisLabel || '',
          },
          min: 0,
        },
      },
    }

    chartInstance.current = new ChartJS(ctx, {
      type: 'scatter',
      data: chartData,
      options,
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, title, xAxisLabel, yAxisLabel, pointColor])

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      )}
      <div style={{ height: `${height}px` }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}

// ============================================
// Line Chart Component
// ============================================

export interface LineChartProps {
  data: { label: string; value: number }[]
  title?: string
  description?: string
  xAxisLabel?: string
  yAxisLabel?: string
  showFill?: boolean
  tension?: number
  height?: number
}

export function LineChart({
  data,
  title,
  description,
  xAxisLabel,
  yAxisLabel,
  showFill = false,
  tension = 0.4,
  height = 300,
}: LineChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<ChartJS | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    const chartData: ChartData<'line'> = {
      labels: data.map(d => d.label),
      datasets: [
        {
          label: yAxisLabel || 'Value',
          data: data.map(d => d.value),
          borderColor: '#0ea5e9',
          backgroundColor: showFill ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
          fill: showFill,
          tension,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }

    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: !!title,
          text: title || '',
          font: { size: 16, weight: 'bold' },
        },
      },
      scales: {
        x: {
          title: {
            display: !!xAxisLabel,
            text: xAxisLabel || '',
          },
        },
        y: {
          title: {
            display: !!yAxisLabel,
            text: yAxisLabel || '',
          },
          beginAtZero: true,
        },
      },
    }

    chartInstance.current = new ChartJS(ctx, {
      type: 'line',
      data: chartData,
      options,
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, title, xAxisLabel, yAxisLabel, showFill, tension])

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      )}
      <div style={{ height: `${height}px` }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}

// Export individual components
export { ChartJS }

