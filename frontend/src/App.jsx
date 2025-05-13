import { useContext, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthContext from './context/AuthContext'
import NewHomePage from './components/NewHomePage'
import LoginForm from './components/LoginForm'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './components/dashboard/AdminDashboard'
import DoctorDashboard from './components/dashboard/DoctorDashboard'
import SecretaryDashboard from './components/dashboard/SecretaryDashboard'
import TestComponent from './components/TestComponent'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './components/GlassEffects.css'
import './components/dashboard/DashboardStyles.css'

function App() {
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
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Routes>
        <Route path="/" element={<NewHomePage />} />
        <Route path="/test" element={<TestComponent />} />
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

        {/* Generic dashboard route that redirects based on role */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {userInfo && userInfo.role === 'admin' ? <Navigate to="/dashboard/admin" replace /> :
             userInfo && userInfo.role === 'doctor' ? <Navigate to="/dashboard/doctor" replace /> :
             userInfo && userInfo.role === 'secretary' ? <Navigate to="/dashboard/secretary" replace /> :
             <Navigate to="/login" replace />}
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
