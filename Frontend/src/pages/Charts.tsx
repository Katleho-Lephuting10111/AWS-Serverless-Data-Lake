import { BarChart, PieChart, ScatterChart, LineChart } from '../components/ChartJsComponents'

// ============================================
// Sample JSON Data - Usage vs Academic Impact
// ============================================

const usageAcademicData = [
  { label: 'Instagram', value: 8.5, color: '#E1306C' },
  { label: 'TikTok', value: 9.2, color: '#000000' },
  { label: 'YouTube', value: 7.8, color: '#FF0000' },
  { label: 'Twitter', value: 6.3, color: '#1DA1F2' },
  { label: 'Facebook', value: 4.5, color: '#1877F2' },
  { label: 'LinkedIn', value: 5.1, color: '#0077B5' },
  { label: 'Reddit', value: 6.9, color: '#FF4500' },
]

// ============================================
// Sample JSON Data - Platform Popularity
// ============================================

const platformPopularityData = [
  { label: 'Instagram', value: 28, color: '#E1306C' },
  { label: 'TikTok', value: 25, color: '#000000' },
  { label: 'YouTube', value: 22, color: '#FF0000' },
  { label: 'Twitter', value: 12, color: '#1DA1F2' },
  { label: 'Facebook', value: 8, color: '#1877F2' },
  { label: 'Other', value: 5, color: '#9CA3AF' },
]

// ============================================
// Sample JSON Data - Sleep vs Mental Health
// ============================================

const sleepMentalHealthData = [
  { x: 4, y: 3.2 },
  { x: 4.5, y: 3.8 },
  { x: 5, y: 4.1 },
  { x: 5.5, y: 5.2 },
  { x: 6, y: 6.1 },
  { x: 6.5, y: 6.8 },
  { x: 7, y: 7.5 },
  { x: 7.5, y: 7.9 },
  { x: 8, y: 8.2 },
  { x: 8.5, y: 8.1 },
  { x: 9, y: 7.8 },
]

// ============================================
// Sample JSON Data - Weekly Trends (Line Chart)
// ============================================

const weeklyUsageData = [
  { label: 'Mon', value: 5.2 },
  { label: 'Tue', value: 6.1 },
  { label: 'Wed', value: 5.8 },
  { label: 'Thu', value: 7.2 },
  { label: 'Fri', value: 8.5 },
  { label: 'Sat', value: 9.1 },
  { label: 'Sun', value: 8.7 },
]

// ============================================
// Charts Page Component
// ============================================

export default function ChartsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Social Media Impact &amp; Wellness Metrics</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart - Usage vs Academic Impact */}
        <BarChart
          data={usageAcademicData}
          title="Usage vs Academic Impact"
          description="Hours per day vs GPA Impact (0-10 scale)"
          xAxisLabel="Platform"
          yAxisLabel="Score (0-10)"
          height={400}
        />

        {/* Pie Chart - Platform Popularity */}
        <PieChart
          data={platformPopularityData}
          title="Platform Popularity"
          description="Market share among students (%)"
          donut={true}
          height={400}
        />
      </div>

      {/* Full Width Chart - Scatter Plot */}
      <ScatterChart
        data={sleepMentalHealthData}
        title="Sleep vs Mental Health Correlation"
        description="Relationship between sleep hours and mental wellbeing score (0-10)"
        xAxisLabel="Hours of Sleep per Night"
        yAxisLabel="Mental Wellness (0-10)"
        pointColor="#0ea5e9"
        height={400}
      />

      {/* Bonus: Line Chart - Weekly Trends */}
      <LineChart
        data={weeklyUsageData}
        title="Weekly Social Media Usage"
        description="Average daily usage hours by day of week"
        xAxisLabel="Day"
        yAxisLabel="Hours"
        showFill={true}
        height={300}
      />

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

      {/* Data Tables */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Tables</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Usage Data Table */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Usage Data</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Platform</th>
                    <th className="px-4 py-2">Usage (hrs)</th>
                  </tr>
                </thead>
                <tbody>
                  {usageAcademicData.map((item, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-2">{item.label}</td>
                      <td className="px-4 py-2">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Popularity Data Table */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Popularity Data</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Platform</th>
                    <th className="px-4 py-2">Share (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {platformPopularityData.map((item, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-2">{item.label}</td>
                      <td className="px-4 py-2">{item.value}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

