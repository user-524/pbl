import { Navigate } from 'react-router-dom'
import { useAuthToken } from '../../hooks/useAuth.js'

function ProtectedRoute({ children }) {
  const token = useAuthToken()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default ProtectedRoute
