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

  // Define endpoints to try in order - Prioritize local server for development
  const endpoints = [
    // Local server (most reliable for development)
    `http://localhost:5000${path}`,
    // Standard API URL
    `${API_URL}${path}`,
    // API URL without /api prefix
    `${API_URL.replace('/api', '')}${path}`,
    // Direct Railway URL (fallback)
    `https://clinicmanagementsystem-production-081b.up.railway.app${path}`
  ];

  // Always use the endpoints in the defined order
  console.log('Using endpoints in standard order');

  let lastError = null;

  // Try each endpoint until one works
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const hasQuery = endpoint.includes('?');
      const timeParam = hasQuery ? `&_t=${timestamp}` : `?_t=${timestamp}`;
      const urlWithTimestamp = `${endpoint}${timeParam}`;

      console.log(`Making request to: ${urlWithTimestamp}`);

      // First try with credentials
      try {
        console.log(`Trying with credentials: include`);
        const response = await fetch(urlWithTimestamp, {
          ...options,
          headers,
          mode: 'cors',
          credentials: 'include',
          cache: 'no-cache'
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`Request successful with endpoint: ${endpoint} (with credentials)`);
            return data;
          } else {
            const text = await response.text();
            console.log(`Request successful with non-JSON response: ${text.substring(0, 100)}... (with credentials)`);
            return text;
          }
        } else {
          console.warn(`Request with credentials failed with status ${response.status} at ${endpoint}`);
          // Continue to try without credentials
        }
      } catch (credentialsError) {
        console.warn(`Error with credentials at endpoint ${endpoint}:`, credentialsError);
        // Continue to try without credentials
      }

      // Then try without credentials
      console.log(`Trying without credentials`);
      const response = await fetch(urlWithTimestamp, {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache'
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
 * Gets authentication headers from sessionStorage
 * @returns {Object} - The authentication headers
 */
export const getAuthHeaders = () => {
  // Try to get token from sessionStorage only
  let token = null;

  try {
    const sessionUserInfo = sessionStorage.getItem('userInfo');
    if (sessionUserInfo) {
      const userInfo = JSON.parse(sessionUserInfo);
      token = userInfo.token;
      console.log('Found token in sessionStorage');
    }
  } catch (e) {
    console.warn('Error accessing sessionStorage:', e);
  }

  if (token) {
    console.log('Using authentication token for request');
    return { 'Authorization': `Bearer ${token}` };
  } else {
    console.warn('No authentication token found');
    return {};
  }
};

/**
 * Test the database connection directly
 * @returns {Promise<Object>} - Connection status
 */
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      mode: 'cors',
      credentials: 'include',
      cache: 'no-cache'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Database connection test result:', data);
      return data;
    } else {
      console.error('Database connection test failed with status:', response.status);
      return { status: 'error', message: `HTTP error: ${response.status}` };
    }
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { status: 'error', message: error.message };
  }
};

export default {
  makeApiRequest,
  getAuthHeaders,
  testDatabaseConnection
};
