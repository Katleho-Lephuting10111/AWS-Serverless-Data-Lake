import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Charts from './pages/Charts'
import ApiCharts from './pages/ApiCharts'
import Settings from './pages/Settings'
import QueryExecutor from './pages/QueryExecutor'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/api-charts" element={<ApiCharts />} />
          <Route path="/query" element={<QueryExecutor />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

