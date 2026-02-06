import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, LayoutDashboard, BarChart3, LineChart, Database, Settings, LogOut, Zap } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/charts', icon: LineChart, label: 'Charts' },
  { path: '/api-charts', icon: Zap, label: 'API Charts' },
  { path: '/query', icon: Database, label: 'Query' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-primary-900 to-primary-700 text-white transition-all duration-300 ease-in-out fixed h-screen left-0 top-0 z-50 overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className={`font-bold text-xl transition-all ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
            DigiHealth
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-primary-600 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path, item.exact)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-primary-100 hover:bg-primary-600'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className={`${sidebarOpen ? 'block' : 'hidden'}`}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-primary-600">
          <button
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-primary-100 hover:bg-primary-600 transition-all"
            title="Logout"
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className={`${sidebarOpen ? 'block' : 'hidden'}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">DigiHealth</h1>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                U
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
