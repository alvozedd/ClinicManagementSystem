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
 * Store user information in sessionStorage only
 * @param {Object} userData - User data to store
 * @param {string} sessionId - Session ID (optional)
 */
export const storeUserData = (userData, sessionId = null) => {
  try {
    // Store user data in sessionStorage only
    sessionStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData));

    // Store session ID if provided
    if (sessionId) {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    }

    console.log('User data stored successfully in sessionStorage');
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

/**
 * Retrieve user information from sessionStorage only
 * @returns {Object|null} - User data or null if not found
 */
export const getUserData = () => {
  try {
    // Try to get data from sessionStorage
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

    return userData;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

/**
 * Get the current session ID from sessionStorage
 * @returns {string|null} - Session ID or null if not found
 */
export const getSessionId = () => {
  try {
    // Get from sessionStorage only
    const sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
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
    // Clear sessionStorage only
    sessionStorage.removeItem(STORAGE_KEYS.USER_INFO);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    sessionStorage.clear();

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
    // Check if user data exists in sessionStorage
    const userData = sessionStorage.getItem(STORAGE_KEYS.USER_INFO);
    return !!userData;
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
  if (!token) {
    console.log('No token provided, considering expired');
    return true;
  }

  try {
    // Validate token format
    if (!token.includes('.') || token.split('.').length !== 3) {
      console.error('Invalid token format');
      return true;
    }

    // Get the expiration time from the token (JWT tokens are base64 encoded)
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.error('Invalid token structure - missing payload');
      return true;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Safely decode base64
    let decodedString;
    try {
      decodedString = atob(base64);
    } catch (e) {
      console.error('Error decoding base64:', e);
      return true;
    }

    // Convert to UTF-8 string
    const jsonPayload = decodeURIComponent(
      decodedString.split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );

    // Parse JSON payload
    const payload = JSON.parse(jsonPayload);
    const { exp } = payload;

    if (!exp) {
      console.error('Token does not contain expiration time');
      return true;
    }

    // Check if the token is expired
    const now = Date.now() / 1000; // Convert to seconds
    const isExpired = now >= exp;

    if (isExpired) {
      console.log('Token is expired. Current time:', new Date(now * 1000).toISOString(),
                 'Expiration time:', new Date(exp * 1000).toISOString());
    } else {
      console.log('Token is valid. Expires in:', Math.round((exp - now) / 60), 'minutes');
    }

    return isExpired;
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
