import { createContext, useState, useEffect } from 'react';
import apiService from '../utils/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Check if user is logged in
      const storedUserInfo = localStorage.getItem('userInfo');

      if (storedUserInfo) {
        const parsedUserInfo = JSON.parse(storedUserInfo);

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
                const updatedUserInfo = localStorage.getItem('userInfo');
                if (updatedUserInfo) {
                  setUserInfo(JSON.parse(updatedUserInfo));
                }
              } catch (error) {
                console.error('Failed to refresh token on startup:', error);
                // If refresh fails, clear user info
                setUserInfo(null);
                localStorage.removeItem('userInfo');
              }
            } else {
              // Token is still valid
              setUserInfo(parsedUserInfo);
            }
          } catch (error) {
            console.error('Error checking token:', error);
            setUserInfo(parsedUserInfo);
          }
        } else {
          // No token in user info
          setUserInfo(parsedUserInfo);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (data) => {
    setUserInfo(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const logout = async () => {
    try {
      // Call the API to logout (revoke refresh token)
      await apiService.logout();

      // Update state
      setUserInfo(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if server-side logout fails, clear local state
      setUserInfo(null);
    }
  };

  return (
    <AuthContext.Provider value={{ userInfo, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
