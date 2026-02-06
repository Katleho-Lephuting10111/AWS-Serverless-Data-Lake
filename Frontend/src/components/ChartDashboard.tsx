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

// Sample data for Usage vs Academic Impact
const usageAcademicData = [
  { platform: 'Instagram', usage: 8.5, academicImpact: 3.2 },
  { platform: 'TikTok', usage: 9.2, academicImpact: 2.5 },
  { platform: 'YouTube', usage: 7.8, academicImpact: 5.5 },
  { platform: 'Twitter', usage: 6.3, academicImpact: 4.2 },
  { platform: 'Facebook', usage: 4.5, academicImpact: 6.1 },
  { platform: 'LinkedIn', usage: 5.1, academicImpact: 7.8 },
  { platform: 'Reddit', usage: 6.9, academicImpact: 6.5 },
]

// Sample data for Platform Popularity
const platformPopularityData = [
  { name: 'Instagram', value: 28, color: '#E1306C' },
  { name: 'TikTok', value: 25, color: '#000000' },
  { name: 'YouTube', value: 22, color: '#FF0000' },
  { name: 'Twitter', value: 12, color: '#1DA1F2' },
  { name: 'Facebook', value: 8, color: '#1877F2' },
  { name: 'Other', value: 5, color: '#9CA3AF' },
]

// Sample data for Sleep vs Mental Health
const sleepMentalHealthData = [
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

export default function ChartDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Social Media Impact & Wellness Metrics</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Usage vs Academic Impact - Bar Chart */}
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

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={usageAcademicData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="platform"
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
              <Bar dataKey="usage" fill="#0ea5e9" name="Usage Hours/Day" radius={[8, 8, 0, 0]} />
              <Bar
                dataKey="academicImpact"
                fill="#10b981"
                name="Academic Impact (GPA)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Highest Usage</p>
              <p className="text-lg font-bold text-blue-900">TikTok (9.2h)</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Best Academic Impact</p>
              <p className="text-lg font-bold text-green-900">LinkedIn (+7.8)</p>
            </div>
          </div>
        </div>

        {/* Chart 2: Platform Popularity - Pie Chart */}
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

          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={platformPopularityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {platformPopularityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {platformPopularityData.slice(0, 3).map((platform) => (
              <div key={platform.name} className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-600">{platform.name}</p>
                <p className="text-lg font-bold text-gray-900">{platform.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Width Chart: Sleep vs Mental Health - Scatter Plot */}
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

        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="sleep"
              name="Hours of Sleep"
              type="number"
              label={{ value: 'Hours of Sleep per Night', position: 'insideBottomRight', offset: -10 }}
            />
            <YAxis
              dataKey="mentalHealth"
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
              formatter={(value) => value.toFixed(1)}
              labelFormatter={(value) => `Sleep: ${value}h`}
            />
            <Scatter
              name="Mental Health vs Sleep"
              data={sleepMentalHealthData}
              fill="#0ea5e9"
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium mb-2">Optimal Sleep Duration</p>
            <p className="text-3xl font-bold text-blue-900">7-8 Hours</p>
            <p className="text-sm text-blue-700 mt-2">Associated with highest mental wellness</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium mb-2">Correlation Strength</p>
            <p className="text-3xl font-bold text-green-900">0.89</p>
            <p className="text-sm text-green-700 mt-2">Strong positive correlation detected</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-medium mb-2">Recommended Action</p>
            <p className="text-lg font-bold text-purple-900">Prioritize Sleep</p>
            <p className="text-sm text-purple-700 mt-2">Improving sleep quality improves wellness</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-6">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-primary-100 text-sm mb-2">Most Used Platform</p>
            <p className="text-2xl font-bold">TikTok</p>
            <p className="text-primary-200 text-xs mt-1">9.2 hours daily average</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm mb-2">Best for Academics</p>
            <p className="text-2xl font-bold">LinkedIn</p>
            <p className="text-primary-200 text-xs mt-1">+7.8 GPA impact score</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm mb-2">Mental Health Factor</p>
            <p className="text-2xl font-bold">8 hrs Sleep</p>
            <p className="text-primary-200 text-xs mt-1">Optimal for wellbeing</p>
          </div>
        </div>
      </div>
    </div>
  )
}
