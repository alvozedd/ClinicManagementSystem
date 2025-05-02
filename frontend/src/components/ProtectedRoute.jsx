import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { userInfo } = useContext(AuthContext);

  // If not logged in, redirect to login
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is provided and not empty, check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userInfo.role)) {
    // User doesn't have required role, redirect to homepage
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role (if specified)
  return children;
};

export default ProtectedRoute;
