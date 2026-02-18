import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Activity, Brain } from 'lucide-react'
import React, { useState } from 'react'
import { useBarChartData, usePieChartData, useScatterChartData } from '../hooks/useChartData'

// Usage vs Academic Impact chart now uses backend data

// Sample data for Platform Popularity
const PLATFORM_POPULARITY_DATA = [
  { name: 'Instagram', value: 28, color: '#E1306C' },
  { name: 'TikTok', value: 25, color: '#000000' },
  { name: 'YouTube', value: 22, color: '#FF0000' },
  { name: 'Twitter', value: 12, color: '#1DA1F2' },
  { name: 'Facebook', value: 8, color: '#1877F2' },
  { name: 'Other', value: 5, color: '#9CA3AF' },
]

// Sample data for Sleep vs Mental Health
const SLEEP_MENTAL_HEALTH_DATA = [
  { sleep: 4, mentalHealth: 3.2, size: 100 },
  { sleep: 4.5, mentalHealth: 3.8, size: 120 },
  { sleep: 5, mentalHealth: 4.1, size: 110 },
  { sleep: 5.5, mentalHealth: 5.2, size: 130 },
  { sleep: 6, mentalHealth: 6.1, size: 140 },
  { sleep: 6.5, mentalHealth: 6.8, size: 150 },
  { sleep: 7, mentalHealth: 7.5, size: 160 },
  { sleep: 7.5, mentalHealth: 7.9, size: 170 },
  { sleep: 8, mentalHealth: 8.2, size: 180 },
  { sleep: 8.5, mentalHealth: 8.1, size: 175 },
  { sleep: 9, mentalHealth: 7.8, size: 160 },
]


const COLORS = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  // Fetch chart data from backend
  const { data: usageAcademicData, loading: loadingBar, error: errorBar } = useBarChartData('student_social_media_usage')
  const { data: platformPopularityData, loading: loadingPie, error: errorPie } = usePieChartData('student_platform_popularity')
  const { data: sleepMentalHealthData, loading: loadingScatter, error: errorScatter } = useScatterChartData('student_sleep_mental_health')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [usageRange, setUsageRange] = useState<[number, number]>([0, 10])
  const [impactRange, setImpactRange] = useState<[number, number]>([0, 10])
  const [sleepRange, setSleepRange] = useState<[number, number]>([4, 9])

  // Filtered data
  const filteredUsageAcademic = (usageAcademicData || []).filter(d =>
    (!selectedPlatforms.length || selectedPlatforms.includes(d.label)) &&
    d.value >= usageRange[0] && d.value <= usageRange[1]
    // If academicImpact exists, filter as well
    // d.academicImpact >= impactRange[0] && d.academicImpact <= impactRange[1]
  )
  const filteredPlatformPopularity = (platformPopularityData || []).filter(d =>
    (!selectedPlatforms.length || selectedPlatforms.includes(d.label))
  )
  const filteredSleepMental = (sleepMentalHealthData || []).filter(d =>
    d.x >= sleepRange[0] && d.x <= sleepRange[1]
  )

  // Unique platforms for dropdown
  const allPlatforms = (usageAcademicData || []).map(d => d.label)

  // Handlers
  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions, option => option.value)
    setSelectedPlatforms(options)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Social Media Impact & Wellness Metrics</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 items-end bg-gray-50 p-4 rounded-lg mb-4">
        {/* Platform Multi-select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platforms</label>
          <select multiple value={selectedPlatforms} onChange={handlePlatformChange} className="border rounded px-2 py-1 min-w-[120px]">
            {allPlatforms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        {/* Usage Range Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usage (hours/day)</label>
          <input type="range" min={0} max={10} step={0.1} value={usageRange[0]} onChange={e => setUsageRange([+e.target.value, usageRange[1]])} />
          <input type="range" min={0} max={10} step={0.1} value={usageRange[1]} onChange={e => setUsageRange([usageRange[0], +e.target.value])} />
          <div className="text-xs text-gray-500">{usageRange[0]} - {usageRange[1]}</div>
        </div>
        {/* Academic Impact Range Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Impact</label>
          <input type="range" min={0} max={10} step={0.1} value={impactRange[0]} onChange={e => setImpactRange([+e.target.value, impactRange[1]])} />
          <input type="range" min={0} max={10} step={0.1} value={impactRange[1]} onChange={e => setImpactRange([impactRange[0], +e.target.value])} />
          <div className="text-xs text-gray-500">{impactRange[0]} - {impactRange[1]}</div>
        </div>
        {/* Sleep Range Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sleep (hours/night)</label>
          <input type="range" min={4} max={9} step={0.1} value={sleepRange[0]} onChange={e => setSleepRange([+e.target.value, sleepRange[1]])} />
          <input type="range" min={4} max={9} step={0.1} value={sleepRange[1]} onChange={e => setSleepRange([sleepRange[0], +e.target.value])} />
          <div className="text-xs text-gray-500">{sleepRange[0]} - {sleepRange[1]}</div>
        </div>
      </div>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Social Media Impact & Wellness Metrics</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Usage vs Academic Impact - Bar Chart (connected to backend) */}
        <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Usage vs Academic Impact</h2>
              <p className="text-sm text-gray-600">Hours per day vs GPA Impact (0-10 scale)</p>
            </div>
          </div>

          {loadingBar && <div className="text-blue-600">Loading chart data...</div>}
          {errorBar && <div className="text-red-600">Error loading chart: {errorBar.message}</div>}

          {!loadingBar && !errorBar && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredUsageAcademic} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis label={{ value: 'Score (0-10)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill="#0ea5e9" name="Usage Hours/Day" radius={[8, 8, 0, 0]} />
                {/* If academicImpact is available, add another Bar */}
              </BarChart>
            </ResponsiveContainer>
          )}

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Highest Usage</p>
              <p className="text-lg font-bold text-blue-900">{filteredUsageAcademic.length ? filteredUsageAcademic.reduce((a, b) => a.value > b.value ? a : b).label + ` (${filteredUsageAcademic.length ? filteredUsageAcademic.reduce((a, b) => a.value > b.value ? a : b).value : ''}h)` : 'N/A'}</p>
            </div>
            {/* Academic Impact summary can be added if backend provides it */}
          </div>
        </div>

        {/* Chart 2: Platform Popularity - Pie Chart (connected to backend) */}
        <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Activity className="text-purple-600" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Platform Popularity</h2>
              <p className="text-sm text-gray-600">Market share among students (%)</p>
            </div>
          </div>

          {loadingPie && <div className="text-purple-600">Loading chart data...</div>}
          {errorPie && <div className="text-red-600">Error loading chart: {errorPie.message}</div>}
          {!loadingPie && !errorPie && (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={filteredPlatformPopularity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, value }) => `${label}: ${value}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {filteredPlatformPopularity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3">
            {filteredPlatformPopularity.slice(0, 3).map((platform) => (
              <div key={platform.label} className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-600">{platform.label}</p>
                <p className="text-lg font-bold text-gray-900">{platform.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Width Chart: Sleep vs Mental Health - Scatter Plot (connected to backend) */}
      <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-2 rounded-lg">
            <Brain className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Sleep vs Mental Health Correlation</h2>
            <p className="text-sm text-gray-600">
              Relationship between sleep hours and mental wellbeing score (0-10)
            </p>
          </div>
        </div>

        {loadingScatter && <div className="text-green-600">Loading chart data...</div>}
        {errorScatter && <div className="text-red-600">Error loading chart: {errorScatter.message}</div>}
        {!loadingScatter && !errorScatter && (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="x"
                name="Hours of Sleep"
                type="number"
                label={{ value: 'Hours of Sleep per Night', position: 'insideBottomRight', offset: -10 }}
              />
              <YAxis
                dataKey="y"
                name="Mental Health Score"
                label={{ value: 'Mental Wellness (0-10)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '8px',
                }}
                formatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
                labelFormatter={(value) => `Sleep: ${value}h`}
              />
              <Scatter
                name="Mental Health vs Sleep"
                data={filteredSleepMental}
                fill="#0ea5e9"
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Stats (live data) */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-6">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-primary-100 text-sm mb-2">Most Used Platform</p>
            <p className="text-2xl font-bold">{filteredUsageAcademic.length ? filteredUsageAcademic.reduce((a, b) => a.value > b.value ? a : b).label : 'N/A'}</p>
            <p className="text-primary-200 text-xs mt-1">{filteredUsageAcademic.length ? filteredUsageAcademic.reduce((a, b) => a.value > b.value ? a : b).value + ' hours daily average' : ''}</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm mb-2">Best for Academics</p>
            <p className="text-2xl font-bold">{filteredUsageAcademic.length ? filteredUsageAcademic.reduce((a, b) => (a.academicImpact || 0) > (b.academicImpact || 0) ? a : b).label : 'N/A'}</p>
            <p className="text-primary-200 text-xs mt-1">{filteredUsageAcademic.length && filteredUsageAcademic.some(d => d.academicImpact) ? '+' + filteredUsageAcademic.reduce((a, b) => (a.academicImpact || 0) > (b.academicImpact || 0) ? a : b).academicImpact + ' GPA impact score' : ''}</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm mb-2">Mental Health Factor</p>
            <p className="text-2xl font-bold">{filteredSleepMental.length ? filteredSleepMental.reduce((a, b) => (a.y || 0) > (b.y || 0) ? a : b).x + ' hrs Sleep' : 'N/A'}</p>
            <p className="text-primary-200 text-xs mt-1">Optimal for wellbeing</p>
          </div>
        </div>
      </div>
    </div>
  )
}
