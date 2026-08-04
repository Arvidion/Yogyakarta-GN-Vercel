import { Navigate, useLocation } from 'react-router-dom'

/**
 * ProtectedRoute — bungkus halaman admin.
 * Jika adminUser tidak ada di localStorage, redirect ke /admin/login
 * dan simpan halaman yang ingin dituju (state.from) agar bisa redirect balik setelah login.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const adminUser = localStorage.getItem('adminUser')

  if (!adminUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
