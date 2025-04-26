import { createContext, useState, useEffect } from 'react';
import apiService from '../utils/apiService';
import secureStorage from '../utils/secureStorage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Check if user has explicitly logged out
      const userLoggedOut = localStorage.getItem('user_logged_out') === 'true';

      // If user has logged out, don't try to restore the session
      if (userLoggedOut) {
        console.log('User has explicitly logged out, not restoring session');
        secureStorage.clear();
        localStorage.removeItem('userInfo');
        setLoading(false);
        return;
      }

      // Check if session is valid
      if (!secureStorage.isSessionValid()) {
        console.log('Session is invalid or expired, not restoring session');
        secureStorage.clear();
        localStorage.removeItem('userInfo');
        setLoading(false);
        return;
      }

      // Check if user is logged in - try secure storage first, then fallback to localStorage
      const secureUserInfo = secureStorage.getItem('userInfo');
      const legacyUserInfo = localStorage.getItem('userInfo');

      let parsedUserInfo = null;

      // If we have data in secure storage, use that
      if (secureUserInfo) {
        parsedUserInfo = secureUserInfo;

        // If we also have legacy data in localStorage, remove it
        if (legacyUserInfo) {
          localStorage.removeItem('userInfo');
        }
      }
      // Otherwise, try to use and migrate legacy data
      else if (legacyUserInfo) {
        try {
          parsedUserInfo = JSON.parse(legacyUserInfo);

          // Migrate to secure storage
          secureStorage.setItem('userInfo', parsedUserInfo);

          // Remove from localStorage
          localStorage.removeItem('userInfo');
        } catch (error) {
          console.error('Error parsing legacy user info:', error);
        }
      }

      if (parsedUserInfo) {
        // Check if token is expired
        const token = parsedUserInfo.token;
        if (token) {
          try {
            // Check if token needs refresh
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const { exp } = JSON.parse(jsonPayload);
            const isExpired = Date.now() >= exp * 1000;

            // If token is expired or about to expire (within 5 minutes), refresh it
            const fiveMinutesInMs = 5 * 60 * 1000;
            if (isExpired || Date.now() >= (exp * 1000) - fiveMinutesInMs) {
              try {
                // Try to refresh the token
                await apiService.refreshToken();

                // Get the updated user info with new token
                const updatedUserInfo = secureStorage.getItem('userInfo');
                if (updatedUserInfo) {
                  setUserInfo(updatedUserInfo);
                }
              } catch (error) {
                console.error('Failed to refresh token on startup:', error);
                // If refresh fails, clear user info
                setUserInfo(null);
                secureStorage.clear();
                localStorage.removeItem('user_logged_out');
              }
            } else {
              // Token is still valid
              setUserInfo(parsedUserInfo);
            }
          } catch (error) {
            console.error('Error checking token:', error);
            setUserInfo(null);
            secureStorage.clear();
          }
        } else {
          // No token in user info
          setUserInfo(null);
          secureStorage.clear();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (data) => {
    // Clear any previous logged out flag
    localStorage.removeItem('user_logged_out');

    // Store the session ID separately
    if (data.sessionId) {
      secureStorage.setItem('sessionId', data.sessionId);
    }

    setUserInfo(data);
    // Store in secure storage instead of localStorage
    secureStorage.setItem('userInfo', data);

    console.log('User logged in successfully');
  };

  const logout = async () => {
    try {
      // Get session ID to include in logout request
      const sessionId = secureStorage.getItem('sessionId');

      // Call the API to logout (revoke refresh token)
      await apiService.logout(sessionId);

      // Update state
      setUserInfo(null);

      // Clear all secure storage
      secureStorage.clear();

      // Also clear localStorage in case there's any legacy data
      localStorage.removeItem('userInfo');

      // Add a flag to indicate user has explicitly logged out
      // This will prevent automatic login on page refresh
      localStorage.setItem('user_logged_out', 'true');

      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if server-side logout fails, clear local state
      setUserInfo(null);
      secureStorage.clear();
      localStorage.removeItem('userInfo');
      localStorage.setItem('user_logged_out', 'true');
    }
  };

  return (
    <AuthContext.Provider value={{ userInfo, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
