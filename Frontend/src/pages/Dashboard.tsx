import { useEffect, useState } from 'react'
import { Users, Activity, TrendingUp, Clock } from 'lucide-react'

interface DataLakeStats {
  totalDatasets: number
  storageUsed: string
  lastUpdated: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<DataLakeStats>({
    totalDatasets: 0,
    storageUsed: '0 GB',
    lastUpdated: new Date().toLocaleDateString()
  })

  useEffect(() => {
    // Simulate fetching data from API
    setStats({
      totalDatasets: 24,
      storageUsed: '156.5 GB',
      lastUpdated: new Date().toLocaleDateString()
    })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to DigiHealth. Here's your data overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Datasets</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDatasets}</p>
              <p className="text-green-600 text-xs mt-2">↑ 2 new this week</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <Users className="text-primary-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Storage Used</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.storageUsed}</p>
              <p className="text-yellow-600 text-xs mt-2">75% capacity</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Activity className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">99.2%</p>
              <p className="text-green-600 text-xs mt-2">↑ +0.5% vs. last week</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Last Updated</p>
              <p className="text-xl font-bold text-gray-900 mt-2">{stats.lastUpdated}</p>
              <p className="text-blue-600 text-xs mt-2">Synced today</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { time: '2 hours ago', desc: 'Dataset "Sales Q4" was updated', type: 'update' },
              { time: '5 hours ago', desc: 'New dataset "Customer Analytics" created', type: 'create' },
              { time: '1 day ago', desc: 'Data pipeline execution completed successfully', type: 'success' },
              { time: '2 days ago', desc: 'Report generated for Healthcare Department', type: 'report' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  activity.type === 'update' ? 'bg-blue-500' :
                  activity.type === 'create' ? 'bg-green-500' :
                  activity.type === 'success' ? 'bg-green-500' :
                  'bg-purple-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.desc}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            {[
              { label: 'Active Users', value: '1,234' },
              { label: 'Monthly Revenue', value: '$45,231' },
              { label: 'Avg Response Time', value: '250ms' },
              { label: 'Uptime', value: '99.99%' },
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-b-0">
                <span className="text-sm text-gray-600">{stat.label}</span>
                <span className="font-semibold text-gray-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
