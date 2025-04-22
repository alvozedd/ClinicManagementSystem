import { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthContext from './context/AuthContext'
import Dashboard from './Dashboard'
import HomePage from './components/HomePage'
import LoginForm from './components/LoginForm'

function App() {
  const { userInfo } = useContext(AuthContext)

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    return userInfo ? children : <Navigate to="/login" replace />
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
