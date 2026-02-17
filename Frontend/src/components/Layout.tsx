import { useState, useRef } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { Menu, X, LayoutDashboard, LineChart, Activity, Settings, LogOut, Bell, Info } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationsContext'
import NotificationsDropdown from './NotificationsDropdown'
import AboutModal from './AboutModal'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/charts', icon: LineChart, label: 'Charts' },
  { path: '/performance-predictor', icon: Activity, label: 'Performance Predictor' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const notificationButtonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-primary-900 to-primary-700 dark:from-gray-800 dark:to-gray-900 text-white transition-all duration-300 ease-in-out fixed h-screen left-0 top-0 z-50 overflow-hidden`}
      >
        {/* Header */}
        <div className={`flex items-center p-4 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen && (
            <div className="font-bold text-xl">
              DigiHealth
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-primary-600 rounded-lg transition-colors flex-shrink-0"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
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
            onClick={handleLogout}
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
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DigiHealth</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAboutOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="About DigiHealth"
              >
                <Info className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="relative">
                <button
                  ref={notificationButtonRef}
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationsDropdown
                  isOpen={notificationsOpen}
                  onClose={() => setNotificationsOpen(false)}
                  anchorRef={notificationButtonRef}
                />
              </div>
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
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

      {/* About Modal */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  )
}
