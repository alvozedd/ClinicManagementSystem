import { useState, useContext, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import authUtils from '../utils/authUtils';
import { testDatabaseConnection } from '../utils/dbConnectionTest';
import './GlassEffects.css';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState({ connected: null, checking: true });

  const { userInfo, login } = useContext(AuthContext);

  useEffect(() => {
    // Test database connection on component mount
    const checkConnection = async () => {
      try {
        setDbStatus({ connected: null, checking: true });
        const result = await testDatabaseConnection();
        const isConnected = result && result.status === 'ok';
        setDbStatus({ connected: isConnected, checking: false });
      } catch (err) {
        console.error('Error checking database connection:', err);
        setDbStatus({ connected: false, checking: false });
      }
    };

    checkConnection();
  }, []);

  // If already logged in, redirect to appropriate dashboard
  if (userInfo) {
    if (userInfo.role === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (userInfo.role === 'doctor') {
      return <Navigate to="/dashboard/doctor" replace />;
    } else if (userInfo.role === 'secretary') {
      return <Navigate to="/dashboard/secretary" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with username:', username);

      // Clear any previous logged out flag
      authUtils.clearUserData();

      // Import the API service
      const apiService = (await import('../utils/apiService')).default;

      // Try multiple login approaches to handle potential CORS issues
      let loginSuccess = false;
      let userData = null;

      // Common request options
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ username, password }),
        mode: 'cors',
        credentials: 'include', // Always include credentials for proper authentication
        cache: 'no-cache'
      };

      // Approach 1: Try with API service (which has its own fallback mechanisms)
      try {
        console.log('Approach 1: Using apiService.login');
        userData = await apiService.login(username, password);
        console.log('Login successful with approach 1');
        loginSuccess = true;
      } catch (error) {
        console.warn('Approach 1 failed with error:', error);
      }

      // Approach 2: Try with Railway deployed backend directly
      if (!loginSuccess) {
        try {
          console.log('Approach 2: Direct fetch to Railway backend');
          const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app/api/users/login', requestOptions);

          if (response.ok) {
            userData = await response.json();
            console.log('Login successful with approach 2');
            loginSuccess = true;
          } else {
            console.log('Approach 2 failed with status:', response.status);
          }
        } catch (error) {
          console.warn('Approach 2 failed with error:', error);
        }
      }

      // Approach 3: Try with Railway backend using /users/login endpoint
      if (!loginSuccess) {
        try {
          console.log('Approach 3: Direct fetch to Railway backend with alternate endpoint');
          const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app/users/login', requestOptions);

          if (response.ok) {
            userData = await response.json();
            console.log('Login successful with approach 3');
            loginSuccess = true;
          } else {
            console.log('Approach 3 failed with status:', response.status);
          }
        } catch (error) {
          console.warn('Approach 3 failed with error:', error);
        }
      }

      // Approach 4: Try with local server directly
      if (!loginSuccess) {
        try {
          console.log('Approach 4: Direct fetch to local server');
          const response = await fetch('http://localhost:5000/api/users/login', requestOptions);

          if (response.ok) {
            userData = await response.json();
            console.log('Login successful with approach 4');
            loginSuccess = true;
          } else {
            console.log('Approach 4 failed with status:', response.status);
          }
        } catch (error) {
          console.warn('Approach 4 failed with error:', error);
        }
      }

      if (loginSuccess && userData) {
        console.log('Login successful, storing user data');

        // Store user data using authUtils
        authUtils.storeUserData(userData, userData.sessionId);

        // Use the login function from AuthContext
        login(userData);

        console.log('User data stored, redirecting to dashboard');

        // Redirect to appropriate dashboard based on role
        setTimeout(() => {
          const role = userData.role;
          if (role === 'admin') {
            window.location.href = '/dashboard/admin';
          } else if (role === 'doctor') {
            window.location.href = '/dashboard/doctor';
          } else if (role === 'secretary') {
            window.location.href = '/dashboard/secretary';
          } else {
            window.location.href = '/dashboard';
          }
        }, 100);
      } else {
        throw new Error('All login attempts failed');
      }
    } catch (err) {
      console.error('Login error details:', err);
      setError(`Login failed: ${err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Prevent form submission on Enter key in input fields
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center py-8 sm:px-6 lg:px-8 fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.5 4a2.5 2.5 0 014.607-1.346.75.75 0 001.264-.057 4 4 0 117.129 3.571.75.75 0 00-.5 1.057 3.5 3.5 0 01-6.6 3.115.75.75 0 00-1.4.05A2.5 2.5 0 015.5 9.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 000 1.5h1.5a.75.75 0 00.75-.75 1 1 0 011-1 .75.75 0 00.75-.75 1 1 0 011-1 .75.75 0 00.75-.75V4zm3 10a2.5 2.5 0 104.607 1.346.75.75 0 011.264.057 4 4 0 11-7.129-3.571.75.75 0 00.5-1.057 3.5 3.5 0 016.6-3.115.75.75 0 001.4-.05A2.5 2.5 0 0114.5 4.5a.75.75 0 00.75.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 00-.75.75 1 1 0 01-1 1 .75.75 0 00-.75.75 1 1 0 01-1 1 .75.75 0 00-.75.75V14z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold text-gray-900">UroHealth Central</h2>
        <p className="mt-1 text-center text-sm text-gray-600">
          Sign in to access the clinic management system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 fade-in-element">
          {error && (
            <div className="bg-red-50 border-l-2 border-red-400 p-2 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-3 w-3 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="form-label">
                Username or Email
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your username or email"
                />
                <p className="mt-1 text-xs text-gray-500">You can use either your username or email address to sign in</p>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 sign-in-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>


          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center py-2 px-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Home
            </Link>
          </div>

          {/* Database Connection Status */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="relative inline-flex">
                <div className={`w-3 h-3 rounded-full ${dbStatus.checking ? 'bg-yellow-400' : dbStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {dbStatus.checking && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-yellow-400 opacity-75"></div>
                )}
              </div>
              <span className={`text-xs font-medium ${dbStatus.checking ? 'text-yellow-700' : dbStatus.connected ? 'text-green-700' : 'text-red-700'}`}>
                {dbStatus.checking ? 'Checking connection...' : dbStatus.connected ? 'Database connected' : 'Database disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
