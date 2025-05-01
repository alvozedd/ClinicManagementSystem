// Utility functions for API calls

/**
 * Makes an API request with multiple fallback endpoints
 * @param {string} path - The API path (e.g., '/patients')
 * @param {Object} options - Fetch options
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<any>} - The response data
 */
export const makeApiRequest = async (path, options = {}, requiresAuth = true) => {
  const isProduction = import.meta.env.PROD;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  // Add authentication headers if required
  const headers = { ...options.headers };
  if (requiresAuth) {
    const authHeaders = getAuthHeaders();
    Object.assign(headers, authHeaders);
  }
  
  // Define endpoints to try in order
  const endpoints = [
    // Direct Railway URL (most reliable in production)
    `https://clinicmanagementsystem-production-081b.up.railway.app${path}`,
    // Standard API URL
    `${API_URL}${path}`,
    // API URL without /api prefix
    `${API_URL.replace('/api', '')}${path}`
  ];
  
  // In development, prioritize localhost
  if (!isProduction) {
    endpoints.reverse();
  }
  
  let lastError = null;
  
  // Try each endpoint until one works
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        ...options,
        headers,
        mode: 'cors'
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log(`Request successful with endpoint: ${endpoint}`);
          return data;
        } else {
          const text = await response.text();
          console.log(`Request successful with non-JSON response: ${text.substring(0, 100)}...`);
          return text;
        }
      } else {
        const errorText = await response.text();
        console.warn(`Request failed with status ${response.status} at ${endpoint}: ${errorText}`);
        lastError = new Error(`${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.warn(`Error with endpoint ${endpoint}:`, error);
      lastError = error;
    }
  }
  
  // If we get here, all endpoints failed
  throw lastError || new Error('All API request attempts failed');
};

/**
 * Gets authentication headers from storage
 * @returns {Object} - The authentication headers
 */
export const getAuthHeaders = () => {
  // Try to get token from sessionStorage first
  let token = null;
  
  try {
    const sessionUserInfo = sessionStorage.getItem('userInfo');
    if (sessionUserInfo) {
      const userInfo = JSON.parse(sessionUserInfo);
      token = userInfo.token;
    }
  } catch (e) {
    console.warn('Error accessing sessionStorage:', e);
  }
  
  // If not found, try localStorage
  if (!token) {
    try {
      const localUserInfo = localStorage.getItem('userInfo');
      if (localUserInfo) {
        const userInfo = JSON.parse(localUserInfo);
        token = userInfo.token;
      }
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
    }
  }
  
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export default {
  makeApiRequest,
  getAuthHeaders
};
