/**
 * Authentication utilities for managing user sessions
 */

// Constants
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  SESSION_ID: 'sessionId',
  SESSION_ACTIVE: 'session_active',
  SESSION_TIMESTAMP: 'session_timestamp',
  USER_LOGGED_OUT: 'user_logged_out'
};

/**
 * Store user information in all available storage mechanisms
 * @param {Object} userData - User data to store
 * @param {string} sessionId - Session ID (optional)
 */
export const storeUserData = (userData, sessionId = null) => {
  try {
    // Clear any previous logged out flag
    localStorage.removeItem(STORAGE_KEYS.USER_LOGGED_OUT);
    
    // Store user data in sessionStorage (primary)
    sessionStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
    
    // Store user data in localStorage (backup)
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
    
    // Store session ID if provided
    if (sessionId) {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    }
    
    // Set session flags
    localStorage.setItem(STORAGE_KEYS.SESSION_ACTIVE, 'true');
    localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, new Date().getTime().toString());
    
    console.log('User data stored successfully in multiple storage locations');
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

/**
 * Retrieve user information from available storage mechanisms
 * @returns {Object|null} - User data or null if not found
 */
export const getUserData = () => {
  try {
    // Check if user has explicitly logged out
    const userLoggedOut = localStorage.getItem(STORAGE_KEYS.USER_LOGGED_OUT) === 'true';
    if (userLoggedOut) {
      console.log('User has explicitly logged out, not retrieving session');
      return null;
    }
    
    // Check if session is still valid
    if (!isSessionValid()) {
      console.log('Session is invalid or expired');
      return null;
    }
    
    // Try sessionStorage first (most reliable)
    let userData = null;
    try {
      const sessionData = sessionStorage.getItem(STORAGE_KEYS.USER_INFO);
      if (sessionData) {
        userData = JSON.parse(sessionData);
        console.log('Found user data in sessionStorage');
      }
    } catch (error) {
      console.warn('Error accessing sessionStorage:', error);
    }
    
    // If not found, try localStorage
    if (!userData) {
      try {
        const localData = localStorage.getItem(STORAGE_KEYS.USER_INFO);
        if (localData) {
          userData = JSON.parse(localData);
          console.log('Found user data in localStorage');
        }
      } catch (error) {
        console.warn('Error accessing localStorage:', error);
      }
    }
    
    return userData;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

/**
 * Get the current session ID
 * @returns {string|null} - Session ID or null if not found
 */
export const getSessionId = () => {
  try {
    // Try sessionStorage first
    let sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
    
    // If not found, try localStorage
    if (!sessionId) {
      sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    }
    
    return sessionId;
  } catch (error) {
    console.error('Error retrieving session ID:', error);
    return null;
  }
};

/**
 * Clear all user data and session information
 */
export const clearUserData = () => {
  try {
    // Clear sessionStorage
    sessionStorage.removeItem(STORAGE_KEYS.USER_INFO);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    sessionStorage.clear();
    
    // Clear localStorage items
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ACTIVE);
    localStorage.removeItem(STORAGE_KEYS.SESSION_TIMESTAMP);
    
    // Set logged out flag
    localStorage.setItem(STORAGE_KEYS.USER_LOGGED_OUT, 'true');
    
    console.log('All user data cleared successfully');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

/**
 * Check if the current session is valid
 * @returns {boolean} - True if session is valid, false otherwise
 */
export const isSessionValid = () => {
  try {
    const sessionActive = localStorage.getItem(STORAGE_KEYS.SESSION_ACTIVE);
    const sessionTimestamp = localStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP);
    const currentTime = new Date().getTime();
    
    // If session flag is missing or session is too old, consider it invalid
    if (!sessionActive || !sessionTimestamp || 
        (currentTime - parseInt(sessionTimestamp)) > SESSION_DURATION) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
};

/**
 * Check if a token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token is expired or invalid, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Get the expiration time from the token (JWT tokens are base64 encoded)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const { exp } = JSON.parse(jsonPayload);
    
    // Check if the token is expired
    return Date.now() >= exp * 1000;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get authentication headers for API requests
 * @returns {Object} - Headers object with Authorization if available
 */
export const getAuthHeaders = () => {
  const userData = getUserData();
  if (userData && userData.token) {
    return { 'Authorization': `Bearer ${userData.token}` };
  }
  return {};
};

export default {
  storeUserData,
  getUserData,
  getSessionId,
  clearUserData,
  isSessionValid,
  isTokenExpired,
  getAuthHeaders
};
