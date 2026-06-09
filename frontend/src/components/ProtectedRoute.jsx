import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, ownerOnly }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-spinner"><div className="spinner"/></div>
  if (!user) return <Navigate to="/login" replace />
  if (ownerOnly && user.role !== 'store_owner' && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}
