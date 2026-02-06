export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">View detailed analytics and reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Patients', value: '1,234', change: '+12%' },
          { label: 'Appointments', value: '156', change: '+8%' },
          { label: 'Revenue', value: '$45,231', change: '+23%' },
          { label: 'Satisfaction', value: '4.8/5', change: '+2%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-green-600 text-sm mt-2">{stat.change} from last month</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chart Placeholder</h2>
        <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-500">
          Charts will be displayed here
        </div>
      </div>
    </div>
  )
}
