import { createContext, useState, useEffect } from 'react';
import apiService from '../utils/apiService';
import authUtils from '../utils/authUtils';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      console.log('Initializing authentication state');

      try {
        // Get user data from storage
        const userData = authUtils.getUserData();

        if (userData) {
          console.log('User data found, checking if token refresh is needed');

          // Check if token needs refresh (expires in less than 5 minutes)
          let needsRefresh = false;

          if (userData.token) {
            try {
              const tokenData = JSON.parse(atob(userData.token.split('.')[1]));
              const expiryTime = tokenData.exp * 1000; // Convert to milliseconds
              const currentTime = Date.now();
              const timeUntilExpiry = expiryTime - currentTime;

              console.log(`Token expires in ${Math.floor(timeUntilExpiry / 1000 / 60)} minutes`);

              // If token expires in less than 5 minutes, refresh it
              if (timeUntilExpiry < 5 * 60 * 1000) {
                console.log('Token is about to expire, needs refresh');
                needsRefresh = true;
              }
            } catch (error) {
              console.error('Error parsing token:', error);
              needsRefresh = true; // Refresh if we can't parse the token
            }
          } else {
            console.log('No token found in user data, needs refresh');
            needsRefresh = true;
          }

          // If token needs refresh, try to refresh it
          if (needsRefresh) {
            console.log('Attempting to refresh token');
            try {
              const sessionId = authUtils.getSessionId();
              const refreshedData = await apiService.refreshToken(sessionId, userData._id);

              if (refreshedData && refreshedData.token) {
                console.log('Token refreshed successfully');

                // Update the user data with the new token
                const updatedUserData = {
                  ...userData,
                  token: refreshedData.token,
                  ...(refreshedData.user || {})
                };

                // Store the updated user data
                authUtils.storeUserData(updatedUserData, refreshedData.sessionId);

                // Update state
                setUserInfo(updatedUserData);
              } else {
                console.warn('Token refresh returned no data');
                setUserInfo(userData); // Use existing data
              }
            } catch (error) {
              console.error('Error refreshing token:', error);
              // Still set the user info with existing data
              setUserInfo(userData);
            }
          } else {
            // Token is still valid, use existing data
            setUserInfo(userData);
          }

          console.log('Successfully restored user session');
        } else {
          console.log('No user data found in storage');
          setUserInfo(null);
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (data) => {
    console.log('Login function called with data:', data ? 'Data present' : 'No data');

    if (!data) {
      console.error('No data provided to login function');
      return;
    }

    // Store user data in storage
    authUtils.storeUserData(data, data.sessionId);

    // Update state
    setUserInfo(data);

    console.log('User logged in successfully');
  };

  const logout = async () => {
    try {
      console.log('Logout function called');

      // Get session ID to include in logout request
      const sessionId = authUtils.getSessionId();
      console.log('Session ID for logout:', sessionId ? 'Found' : 'Not found');

      // Prepare for redirection
      const redirectToLogin = () => {
        console.log('Redirecting to login page');
        // Use replace instead of href to avoid adding to browser history
        window.location.replace('/login');
      };

      // First, call the API to logout (revoke refresh token)
      try {
        await apiService.logout(sessionId);
        console.log('Server-side logout successful');
      } catch (apiError) {
        console.warn('Server-side logout failed, but continuing with client-side logout:', apiError);
      }

      // Clear all client-side storage to ensure immediate logout effect
      authUtils.clearUserData();

      // Update state
      setUserInfo(null);

      console.log('User logged out successfully');

      // Use a small timeout to avoid the flashing issue
      // This allows React to process the state change before redirecting
      setTimeout(redirectToLogin, 50);
    } catch (error) {
      console.error('Error during logout:', error);

      // Ensure all storage is cleared even if there was an error
      authUtils.clearUserData();
      setUserInfo(null);

      // Redirect with a small delay
      setTimeout(() => {
        window.location.replace('/login');
      }, 50);
    }
  };

  return (
    <AuthContext.Provider value={{ userInfo, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
