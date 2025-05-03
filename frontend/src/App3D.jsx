import { useContext, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthContext from './context/AuthContext'
import ThreeDHomePage from './components/3D/ThreeDHomePage'
import LoginForm from './components/LoginForm'
import AdminDashboard from './components/dashboard/AdminDashboard'
import DoctorDashboard from './components/dashboard/DoctorDashboard'
import SecretaryDashboard from './components/dashboard/SecretaryDashboard'
import './components/GlassEffects.css'
import './components/dashboard/DashboardStyles.css'
import './styles/3DStyles.css'

function App3D() {
  const { userInfo, loading } = useContext(AuthContext)

  // Debug logging for authentication state
  useEffect(() => {
    console.log('App: Authentication state changed', { userInfo, loading });
  }, [userInfo, loading]);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    // If still loading, show nothing (or could add a loading spinner here)
    if (loading) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin text-blue-600 text-2xl mr-2">⟳</div>
        <div className="text-gray-700 font-medium">Loading...</div>
      </div>;
    }

    // If user is not logged in, redirect to login
    return userInfo ? children : <Navigate to="/login" replace />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ThreeDHomePage />} />
        <Route path="/login" element={<LoginForm />} />

        {/* Admin Dashboard */}
        <Route path="/dashboard/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Doctor Dashboard */}
        <Route path="/dashboard/doctor" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />

        {/* Secretary Dashboard */}
        <Route path="/dashboard/secretary" element={
          <ProtectedRoute allowedRoles={['secretary']}>
            <SecretaryDashboard />
          </ProtectedRoute>
        } />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App3D
