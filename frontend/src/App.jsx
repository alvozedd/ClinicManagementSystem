import { useContext, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthContext from './context/AuthContext'
import Dashboard from './Dashboard'
import HomePage from './components/HomePage'
import LoginForm from './components/LoginForm'

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

    // Check if user is logged out flag is set
    const userLoggedOut = localStorage.getItem('user_logged_out') === 'true';

    // If user is not logged in or explicitly logged out, redirect to login
    return userInfo && !userLoggedOut ? children : <Navigate to="/login" replace />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
