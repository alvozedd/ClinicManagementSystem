import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import './App.css'
import AuthContext from './context/AuthContext'
import Header from './components/Header'

// Screens
import HomeScreen from './screens/HomeScreen'
import LoginScreen from './screens/LoginScreen'
import DashboardScreen from './screens/DashboardScreen'
import PatientListScreen from './screens/PatientListScreen'
import PatientDetailScreen from './screens/PatientDetailScreen'
import AppointmentListScreen from './screens/AppointmentListScreen'
import AppointmentFormScreen from './screens/AppointmentFormScreen'
import DiagnosisFormScreen from './screens/DiagnosisFormScreen'
import UserListScreen from './screens/UserListScreen'
import UserFormScreen from './screens/UserFormScreen'
import BookingFormScreen from './screens/BookingFormScreen'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { userInfo } = useContext(AuthContext);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Header />
      <main className="min-h-screen bg-gray-100 pt-4 pb-8 overflow-hidden max-w-full relative">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/booking" element={<BookingFormScreen />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardScreen />
            </ProtectedRoute>
          } />

          <Route path="/patients" element={
            <ProtectedRoute>
              <PatientListScreen />
            </ProtectedRoute>
          } />

          <Route path="/patients/:id" element={
            <ProtectedRoute>
              <PatientDetailScreen />
            </ProtectedRoute>
          } />

          <Route path="/appointments" element={
            <ProtectedRoute>
              <AppointmentListScreen />
            </ProtectedRoute>
          } />

          <Route path="/appointments/new" element={
            <ProtectedRoute allowedRoles={['admin', 'secretary']}>
              <AppointmentFormScreen />
            </ProtectedRoute>
          } />

          <Route path="/appointments/:id/edit" element={
            <ProtectedRoute allowedRoles={['admin', 'secretary']}>
              <AppointmentFormScreen />
            </ProtectedRoute>
          } />

          <Route path="/appointments/:id/diagnosis" element={
            <ProtectedRoute allowedRoles={['admin', 'doctor']}>
              <DiagnosisFormScreen />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserListScreen />
            </ProtectedRoute>
          } />

          <Route path="/users/new" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserFormScreen />
            </ProtectedRoute>
          } />

          <Route path="/users/:id/edit" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserFormScreen />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </Router>
  )
}

export default App
