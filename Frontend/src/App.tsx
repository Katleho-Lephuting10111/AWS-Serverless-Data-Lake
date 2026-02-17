import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { MetricsProvider } from './contexts/MetricsContext'
import { NotificationsProvider } from './contexts/NotificationsContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Charts from './pages/Charts'
import PerformancePredictor from './pages/PerformancePredictor'
import Settings from './pages/Settings'
import Login from './pages/Login'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MetricsProvider>
          <NotificationsProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/charts" element={<Charts />} />
                  <Route path="/performance-predictor" element={<PerformancePredictor />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </NotificationsProvider>
        </MetricsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

