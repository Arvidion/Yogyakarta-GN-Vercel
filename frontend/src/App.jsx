import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MapDetailPage from './pages/MapDetailPage'
import ProgramListPage from './pages/ProgramListPage'
import ProgramDetailPage from './pages/ProgramDetailPage'
import PartnerListPage from './pages/PartnerListPage'
import PartnerDetailPage from './pages/PartnerDetailPage'
import ReadingPage from './pages/ReadingPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminDashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/programs" element={<ProgramListPage />} />
        <Route path="/programs/:slug" element={<ProgramDetailPage />} />
        <Route path="/partners" element={<PartnerListPage />} />
        <Route path="/partners/:slug" element={<PartnerDetailPage />} />
        <Route path="/network-map" element={<MapDetailPage />} />
        <Route path="/bacaan" element={<ReadingPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
