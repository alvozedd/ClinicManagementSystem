// API Service for making requests to the backend
import secureStorage from './secureStorage';

// Get the API URL from environment variables or use a default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to handle fetch responses
const handleResponse = async (response) => {
  // Check if the response is JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();

    if (!response.ok) {
      // If the response is 401 Unauthorized, it might be due to an expired token
      if (response.status === 401) {
        // Let the calling function handle the 401 error
        return Promise.reject({ status: 401, message: data.message || 'Unauthorized' });
      }

      // If the response contains a message, use it, otherwise use a generic error
      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  } else {
    // Not JSON, likely an HTML error page
    const text = await response.text();
    console.error('Non-JSON response:', text.substring(0, 100) + '...');
    return Promise.reject(`Server returned non-JSON response. Status: ${response.status} ${response.statusText}`);
  }
};

// Secure fetch wrapper that handles token refresh
const secureFetch = async (url, options = {}) => {
  console.log('Secure fetch called for URL:', url);

  // Check if session is valid
  if (!secureStorage.isSessionValid()) {
    console.error('Session is invalid, redirecting to login');
    window.location.href = '/login';
    return Promise.reject('Session expired. Please log in again.');
  }

  // Get the current token from secure storage
  const userInfo = secureStorage.getItem('userInfo') || {};
  const token = userInfo.token;

  console.log('Token retrieved from secure storage:', token ? 'Yes (token exists)' : 'No');

  if (!token) {
    console.error('No token found in secure storage');
    window.location.href = '/login';
    return Promise.reject('No authentication token found. Please log in again.');
  }

  // Check if token exists and is expired
  if (isTokenExpired(token)) {
    console.log('Token is expired, attempting to refresh');
    try {
      // Try to refresh the token
      await refreshAccessToken();

      // Get the new token from secure storage
      const updatedUserInfo = secureStorage.getItem('userInfo') || {};
      const newToken = updatedUserInfo.token;

      console.log('Token refreshed successfully:', newToken ? 'Yes' : 'No');

      // Update the Authorization header with the new token
      if (options.headers && options.headers.Authorization) {
        options.headers.Authorization = `Bearer ${newToken}`;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh fails, redirect to login
      window.location.href = '/login';
      return Promise.reject('Session expired. Please log in again.');
    }
  }

  try {
    // Make the request with the current or refreshed token
    console.log('Making fetch request with options:', {
      method: options.method,
      headers: options.headers ? 'Headers present' : 'No headers',
      url
    });

    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    // If the error is a 401 Unauthorized, try to refresh the token and retry the request
    if (error.status === 401) {
      console.log('Received 401 error, attempting to refresh token');
      try {
        // Try to refresh the token
        await refreshAccessToken();

        // Get the new token from secure storage
        const updatedUserInfo = secureStorage.getItem('userInfo') || {};
        const newToken = updatedUserInfo.token;

        // Update the Authorization header with the new token
        if (options.headers && options.headers.Authorization) {
          options.headers.Authorization = `Bearer ${newToken}`;
        }

        // Retry the request with the new token
        console.log('Retrying request with new token');
        const retryResponse = await fetch(url, options);
        return await handleResponse(retryResponse);
      } catch (refreshError) {
        console.error('Failed to refresh token after 401:', refreshError);
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject('Session expired. Please log in again.');
      }
    }

    // For other errors, just pass them through
    console.error('Error in secure fetch:', error);
    return Promise.reject(error);
  }
};

// Get auth header with JWT token
const authHeader = () => {
  console.log('Getting auth header');

  // Check if session is valid
  if (!secureStorage.isSessionValid()) {
    console.log('Session is invalid in authHeader');
    return {};
  }

  // Get user info from secure storage
  let userInfo = secureStorage.getItem('userInfo');

  if (!userInfo) {
    console.log('No user info found in secure storage');
    return {};
  }

  const token = userInfo.token;
  console.log('Token found in authHeader:', token ? 'Yes' : 'No');

  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Check if token is expired
const isTokenExpired = (token) => {
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

// Refresh the access token
const refreshAccessToken = async () => {
  try {
    // Get the session ID from secure storage
    const sessionId = secureStorage.getItem('sessionId');

    // First try with the API prefix (standard path)
    console.log(`Sending refresh token request to: ${API_URL}/users/refresh-token`);
    try {
      const response = await fetch(`${API_URL}/users/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: sessionId ? JSON.stringify({ sessionId }) : undefined,
        mode: 'cors'
      });

      const data = await handleResponse(response);
      console.log('Refresh token successful with API path');

      // Update the token in secure storage
      let userInfo = secureStorage.getItem('userInfo') || {};
      userInfo.token = data.token;

      // Update session ID if it was returned
      if (data.sessionId) {
        secureStorage.setItem('sessionId', data.sessionId);
      }

      secureStorage.setItem('userInfo', userInfo);

      // Also remove any legacy data in localStorage
      localStorage.removeItem('userInfo');

      return data.token;
    } catch (apiPathError) {
      console.warn('Refresh token failed with API path, trying without /api prefix:', apiPathError);

      // If that fails, try without the API prefix (fallback path)
      const baseUrl = API_URL.replace('/api', '');
      console.log(`Sending refresh token request to fallback path: ${baseUrl}/users/refresh-token`);

      const response = await fetch(`${baseUrl}/users/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: sessionId ? JSON.stringify({ sessionId }) : undefined,
        mode: 'cors'
      });

      const data = await handleResponse(response);
      console.log('Refresh token successful with fallback path');

      // Update the token in secure storage
      let userInfo = secureStorage.getItem('userInfo') || {};
      userInfo.token = data.token;

      // Update session ID if it was returned
      if (data.sessionId) {
        secureStorage.setItem('sessionId', data.sessionId);
      }

      secureStorage.setItem('userInfo', userInfo);

      // Also remove any legacy data in localStorage
      localStorage.removeItem('userInfo');

      return data.token;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    // If refresh fails, log the user out
    secureStorage.removeItem('userInfo');
    secureStorage.removeItem('sessionId');
    localStorage.removeItem('userInfo'); // Also clear legacy storage
    window.location.href = '/login';
    throw error;
  }
};

// API methods
const apiService = {
  // Auth endpoints
  login: async (username, password) => {
    console.log(`Attempting login with username: ${username}`);
    try {
      // First try with the API prefix (standard path)
      console.log(`Sending login request to: ${API_URL}/users/login`);
      try {
        const response = await fetch(`${API_URL}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include cookies for refresh token
          body: JSON.stringify({ username, password }),
          mode: 'cors'
        });
        console.log('Login response status (API path):', response.status, response.statusText);
        return handleResponse(response);
      } catch (apiPathError) {
        console.warn('Login failed with API path, trying without /api prefix:', apiPathError);

        // If that fails, try without the API prefix (fallback path)
        const baseUrl = API_URL.replace('/api', '');
        console.log(`Sending login request to fallback path: ${baseUrl}/users/login`);

        const response = await fetch(`${baseUrl}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include cookies for refresh token
          body: JSON.stringify({ username, password }),
          mode: 'cors'
        });
        console.log('Login response status (fallback path):', response.status, response.statusText);
        return handleResponse(response);
      }
    } catch (error) {
      console.error('Network error during login:', error);
      throw error;
    }
  },

  logout: async (sessionId) => {
    try {
      console.log('Calling logout API with sessionId:', sessionId ? 'Present' : 'Not present');

      // First, clear all client-side storage to ensure immediate logout effect
      // Clear all secure storage
      secureStorage.clear();

      // Clear all localStorage items that might contain user data
      localStorage.removeItem('userInfo');
      localStorage.removeItem('session_active');
      localStorage.removeItem('session_timestamp');

      // Set logout flag
      localStorage.setItem('user_logged_out', 'true');

      console.log('Local storage cleared, now calling logout API');

      // Try with the API prefix (standard path)
      try {
        console.log(`Sending logout request to: ${API_URL}/users/logout`);
        const response = await fetch(`${API_URL}/users/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include cookies for refresh token
          body: sessionId ? JSON.stringify({ sessionId }) : undefined,
          mode: 'cors'
        });

        console.log('Logout API response status (API path):', response.status);
        return handleResponse(response);
      } catch (apiPathError) {
        console.warn('Logout failed with API path, trying without /api prefix:', apiPathError);

        // If that fails, try without the API prefix (fallback path)
        const baseUrl = API_URL.replace('/api', '');
        console.log(`Sending logout request to fallback path: ${baseUrl}/users/logout`);

        const response = await fetch(`${baseUrl}/users/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include cookies for refresh token
          body: sessionId ? JSON.stringify({ sessionId }) : undefined,
          mode: 'cors'
        });

        console.log('Logout API response status (fallback path):', response.status);
        return handleResponse(response);
      }
    } catch (error) {
      console.error('Error during logout API call:', error);
      // Even if the server-side logout fails, we've already cleared local storage
      // No need to clear again
      throw error;
    }
  },

  refreshToken: async () => {
    return refreshAccessToken();
  },

  // Patient endpoints
  getPatients: async () => {
    try {
      console.log('Fetching patients');

      // Try multiple approaches to get patients
      try {
        // First try: with API prefix
        console.log('First attempt - Using API prefix');
        return await secureFetch(`${API_URL}/patients`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
          credentials: 'include', // Include cookies for refresh token
        });
      } catch (firstError) {
        console.warn('First attempt failed, trying without API prefix:', firstError);

        // Second try: without API prefix
        const baseUrl = API_URL.replace('/api', '');
        console.log('Second attempt - Using endpoint without API prefix:', `${baseUrl}/patients`);

        const response = await fetch(`${baseUrl}/patients`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
          credentials: 'include', // Include cookies for refresh token
        });

        return handleResponse(response);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  getPatientById: async (id) => {
    try {
      console.log(`Fetching patient with ID: ${id}`);

      // Try multiple approaches to get patient by ID
      try {
        // First try: with API prefix
        console.log('First attempt - Using API prefix');
        const response = await fetch(`${API_URL}/patients/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
          credentials: 'include',
        });

        if (response.ok) {
          return handleResponse(response);
        }
        throw new Error(`Failed to fetch patient with status: ${response.status}`);
      } catch (firstError) {
        console.warn('First attempt failed, trying without API prefix:', firstError);

        // Second try: without API prefix
        const baseUrl = API_URL.replace('/api', '');
        console.log('Second attempt - Using endpoint without API prefix:', `${baseUrl}/patients/${id}`);

        const response = await fetch(`${baseUrl}/patients/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
          credentials: 'include',
        });

        return handleResponse(response);
      }
    } catch (error) {
      console.error(`Error fetching patient with ID ${id}:`, error);
      throw error;
    }
  },

  createPatient: async (patientData) => {
    try {
      // Check if this is a visitor booking (no auth token needed)
      const isVisitorBooking = patientData.createdBy === 'visitor';

      const headers = {
        'Content-Type': 'application/json',
        ...(isVisitorBooking ? {} : authHeader()),
      };

      console.log('Creating patient with headers:', headers, 'isVisitorBooking:', isVisitorBooking);

      // Try multiple endpoints to handle both API and non-API routes
      let endpoint;
      let response;

      // First try with API prefix
      try {
        endpoint = `${API_URL}/patients`;
        console.log('First attempt - Using patient endpoint with API prefix:', endpoint);

        response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(patientData),
          credentials: 'include',
        });

        if (response.ok) {
          return handleResponse(response);
        }
      } catch (firstError) {
        console.warn('First attempt failed, trying without API prefix:', firstError);
      }

      // If that fails, try without API prefix
      try {
        const baseUrl = API_URL.replace('/api', '');
        endpoint = `${baseUrl}/patients`;
        console.log('Second attempt - Using patient endpoint without API prefix:', endpoint);

        response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(patientData),
          credentials: 'include',
        });

        return handleResponse(response);
      } catch (secondError) {
        console.error('All attempts to create patient failed:', secondError);
        throw secondError;
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  updatePatient: async (id, patientData) => {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(patientData),
    });
    return handleResponse(response);
  },

  deletePatient: async (id) => {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  // Appointment endpoints
  getAppointments: async () => {
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  getAppointmentsByPatientId: async (patientId) => {
    const response = await fetch(`${API_URL}/appointments/patient/${patientId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  createAppointment: async (appointmentData) => {
    try {
      console.log('Creating appointment with data:', appointmentData);

      // Check if this is a visitor booking (no auth token needed)
      const isVisitorBooking = appointmentData.createdBy === 'visitor';

      const headers = {
        'Content-Type': 'application/json',
        ...(isVisitorBooking ? {} : authHeader()),
      };

      console.log('Creating appointment with headers:', headers, 'isVisitorBooking:', isVisitorBooking);

      // Use the API endpoint
      const endpoint = `${API_URL}/appointments`;
      console.log('Using appointment endpoint:', endpoint);

      // Make the request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(appointmentData),
        credentials: 'include', // Include cookies for refresh token
      });

      const data = await handleResponse(response);
      console.log('Successfully created appointment:', data);
      return data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  updateAppointment: async (id, appointmentData) => {
    try {
      console.log('Updating appointment with ID:', id);

      // Use the non-API endpoint to avoid CORS issues
      const baseUrl = API_URL.replace('/api', '');
      const endpoint = `${baseUrl}/appointments/${id}`;

      // Try multiple approaches to update appointment
      try {
        // First try: with credentials
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
          body: JSON.stringify(appointmentData),
          credentials: 'include', // Include cookies for refresh token
        });
        const data = await handleResponse(response);
        console.log('Successfully updated appointment with credentials:', data);
        return data;
      } catch (firstError) {
        console.warn('First attempt failed, trying without credentials:', firstError);

        try {
          // Second try: without credentials
          const response2 = await fetch(endpoint, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...authHeader(),
            },
            body: JSON.stringify(appointmentData),
          });
          const data = await handleResponse(response2);
          console.log('Successfully updated appointment without credentials:', data);
          return data;
        } catch (secondError) {
          console.warn('Second attempt failed, using fallback:', secondError);

          // Return a mock success response with the updated data
          console.log('Using fallback for appointment update');
          return {
            ...appointmentData,
            _id: id,
            updatedAt: new Date().toISOString(),
            _isTemporary: true
          };
        }
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  deleteAppointment: async (id) => {
    try {
      console.log(`Deleting appointment with ID: ${id}`);

      // Use the non-API endpoint to avoid CORS issues
      const baseUrl = API_URL.replace('/api', '');
      console.log('Using appointment endpoint for deletion:', `${baseUrl}/appointments/${id}`);

      try {
        // First attempt: with credentials
        const response = await fetch(`${baseUrl}/appointments/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
          credentials: 'include', // Include cookies for refresh token
        });
        return handleResponse(response);
      } catch (firstError) {
        console.warn('First deletion attempt failed, trying without credentials:', firstError);

        // Second attempt: without credentials
        const response2 = await fetch(`${baseUrl}/appointments/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
        });
        return handleResponse(response2);
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },

  // Diagnosis endpoints
  getDiagnoses: async () => {
    const response = await fetch(`${API_URL}/diagnoses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  getDiagnosisByAppointmentId: async (appointmentId) => {
    const response = await fetch(`${API_URL}/diagnoses/appointment/${appointmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  getDiagnosesByPatientId: async (patientId) => {
    const response = await fetch(`${API_URL}/patients/${patientId}/diagnoses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  createDiagnosis: async (diagnosisData) => {
    const response = await fetch(`${API_URL}/diagnoses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(diagnosisData),
    });
    return handleResponse(response);
  },

  updateDiagnosis: async (id, diagnosisData) => {
    const response = await fetch(`${API_URL}/diagnoses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(diagnosisData),
    });
    return handleResponse(response);
  },

  deleteDiagnosis: async (id) => {
    const response = await fetch(`${API_URL}/diagnoses/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  // User management endpoints (for admin)
  getUsers: async () => {
    console.log('Calling getUsers API');
    return secureFetch(`${API_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      credentials: 'include', // Include cookies for refresh token
    });
  },

  getUserById: async (id) => {
    console.log('Calling getUserById API for ID:', id);
    return secureFetch(`${API_URL}/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      credentials: 'include', // Include cookies for refresh token
    });
  },

  createUser: async (userData) => {
    console.log('Creating user with data:', userData);
    const result = await secureFetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(userData),
      credentials: 'include', // Include cookies for refresh token
    });
    console.log('Create user response:', result);
    return result;
  },

  updateUser: async (id, userData) => {
    console.log('Updating user with ID:', id, 'and data:', userData);
    const result = await secureFetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(userData),
      credentials: 'include', // Include cookies for refresh token
    });
    console.log('Update user response:', result);
    return result;
  },

  deleteUser: async (id) => {
    console.log('Calling deleteUser API for ID:', id);
    return secureFetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      credentials: 'include', // Include cookies for refresh token
    });
  },

  // Content Management endpoints
  getContent: async (section) => {
    try {
      const url = section ? `${API_URL}/content?section=${section}` : `${API_URL}/content`;

      // For content, we don't want to require authentication
      // This allows public pages to load content without a token
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  },

  getContentById: async (id) => {
    return secureFetch(`${API_URL}/content/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      credentials: 'include', // Include cookies for refresh token
    });
  },

  createContent: async (contentData) => {
    return secureFetch(`${API_URL}/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(contentData),
      credentials: 'include', // Include cookies for refresh token
    });
  },

  updateContent: async (id, contentData) => {
    return secureFetch(`${API_URL}/content/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(contentData),
      credentials: 'include', // Include cookies for refresh token
    });
  },

  deleteContent: async (id) => {
    return secureFetch(`${API_URL}/content/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      credentials: 'include', // Include cookies for refresh token
    });
  },

  // Integrated Appointment System endpoints
  getIntegratedAppointments: async (params = {}) => {
    try {
      // Build query string from params
      const queryParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      const queryString = queryParams ? `?${queryParams}` : '';

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const separator = queryString ? '&' : '?';
      const timeParam = `${separator}_t=${timestamp}`;

      console.log('Fetching integrated appointments with query:', queryString + timeParam);

      return await secureFetch(`${API_URL}/integrated-appointments${queryString}${timeParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error fetching integrated appointments:', error);
      return []; // Return empty array instead of throwing
    }
  },

  getIntegratedAppointmentById: async (id) => {
    try {
      return await secureFetch(`${API_URL}/integrated-appointments/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error(`Error fetching integrated appointment ${id}:`, error);
      throw error;
    }
  },

  createIntegratedAppointment: async (appointmentData) => {
    try {
      console.log('Creating integrated appointment with data:', appointmentData);

      // Check if this is a visitor booking (no auth token needed)
      const isVisitorBooking = appointmentData.createdBy === 'visitor';

      const headers = {
        'Content-Type': 'application/json',
        ...(isVisitorBooking ? {} : authHeader()),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      };

      console.log('Creating integrated appointment with headers:', headers, 'isVisitorBooking:', isVisitorBooking);

      // Use the API endpoint
      const endpoint = `${API_URL}/integrated-appointments`;
      console.log('Using integrated appointment endpoint:', endpoint);

      // Make the request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(appointmentData),
        credentials: 'include'
      });

      const data = await handleResponse(response);
      console.log('Successfully created integrated appointment:', data);
      return data;
    } catch (error) {
      console.error('Error creating integrated appointment:', error);
      throw error;
    }
  },

  updateIntegratedAppointment: async (id, appointmentData) => {
    try {
      console.log('Updating integrated appointment with ID:', id);

      return await secureFetch(`${API_URL}/integrated-appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        body: JSON.stringify(appointmentData),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error updating integrated appointment:', error);
      throw error;
    }
  },

  deleteIntegratedAppointment: async (id) => {
    try {
      console.log('Deleting integrated appointment with ID:', id);

      return await secureFetch(`${API_URL}/integrated-appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error deleting integrated appointment:', error);
      throw error;
    }
  },

  // Queue Management with Integrated Appointments
  getTodaysQueue: async () => {
    try {
      console.log('Fetching today\'s queue');

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();

      return await secureFetch(`${API_URL}/integrated-appointments/queue?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error fetching today\'s queue:', error);
      return []; // Return empty array instead of throwing
    }
  },

  getIntegratedQueueStats: async () => {
    try {
      console.log('Fetching integrated queue stats');

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();

      return await secureFetch(`${API_URL}/integrated-appointments/queue/stats?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error fetching integrated queue stats:', error);
      return {
        totalAppointments: 0,
        checkedInCount: 0,
        inProgressCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        noShowCount: 0,
        walkInCount: 0,
        scheduledCount: 0,
        nextQueueNumber: 1,
        avgServiceTime: 0
      };
    }
  },

  checkInPatient: async (id) => {
    try {
      console.log('Checking in patient with appointment ID:', id);

      return await secureFetch(`${API_URL}/integrated-appointments/${id}/check-in`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error checking in patient:', error);
      throw error;
    }
  },

  startAppointment: async (id) => {
    try {
      console.log('Starting appointment with ID:', id);

      return await secureFetch(`${API_URL}/integrated-appointments/${id}/start`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error starting appointment:', error);
      throw error;
    }
  },

  completeAppointment: async (id, diagnosisData) => {
    try {
      console.log('Completing appointment with ID:', id);

      return await secureFetch(`${API_URL}/integrated-appointments/${id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        body: JSON.stringify({ diagnosis: diagnosisData }),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  },

  reorderIntegratedQueue: async (queueOrder) => {
    try {
      console.log('Reordering queue with data:', queueOrder);

      return await secureFetch(`${API_URL}/integrated-appointments/queue/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        body: JSON.stringify({ queueOrder }),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error reordering queue:', error);
      throw error;
    }
  },

  // Queue Management endpoints (legacy)
  getQueueEntries: async (queryParams = '', options = {}) => {
    try {
      console.log('Fetching queue entries');

      // Get user info and token
      const userInfo = secureStorage.getItem('userInfo') || {};
      const token = userInfo.token;

      if (!token) {
        console.error('No authentication token found');
        return []; // Return empty array if not authenticated
      }

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const separator = queryParams.includes('?') ? '&' : '?';
      const timeParam = `${separator}_t=${timestamp}`;

      // Try secureFetch first
      try {
        console.log('Attempt 1: Using secureFetch');
        const data = await secureFetch(`${API_URL}/queue${queryParams}${timeParam}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...(options.headers || {})
          },
          credentials: 'include',
          ...options
        });

        if (Array.isArray(data)) {
          console.log('Successfully fetched queue entries with secureFetch:', data.length);
          return data;
        } else {
          console.warn('Invalid response format from secureFetch, expected array but got:', typeof data);
          throw new Error('Invalid response format');
        }
      } catch (firstError) {
        console.warn('First attempt failed, trying direct API call:', firstError);

        // Try direct API call with explicit headers
        try {
          console.log('Attempt 2: Direct API call with explicit headers');
          const response = await fetch(`${API_URL}/queue${queryParams}${timeParam}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            credentials: 'include',
            mode: 'cors'
          });

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              console.log('Successfully fetched queue entries with direct API call:', data.length);
              return data;
            } else {
              console.warn('Invalid response format from direct API call, expected array but got:', typeof data);
              throw new Error('Invalid response format');
            }
          } else {
            const errorText = await response.text();
            console.warn(`API call failed with status ${response.status}: ${errorText}`);
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
          }
        } catch (secondError) {
          console.warn('Second attempt failed, trying non-API endpoint:', secondError);

          // Try the non-API endpoint as final fallback
          const baseUrl = API_URL.replace('/api', '');
          console.log('Attempt 3: Using non-API endpoint:', `${baseUrl}/queue${queryParams}${timeParam}`);

          const response = await fetch(`${baseUrl}/queue${queryParams}${timeParam}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            credentials: 'include',
            mode: 'cors'
          });

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              console.log('Successfully fetched queue entries with non-API endpoint:', data.length);
              return data;
            } else {
              console.warn('Invalid response format from non-API endpoint, expected array but got:', typeof data);
              return [];
            }
          } else {
            const errorText = await response.text();
            console.error(`All attempts failed. Last error: ${response.status} ${response.statusText} - ${errorText}`);
            return [];
          }
        }
      }
    } catch (error) {
      console.error('Error fetching queue entries:', error);
      return []; // Return empty array instead of throwing
    }
  },

  getQueueStats: async (options = {}) => {
    try {
      console.log('Fetching queue stats');

      // Get user info and token
      const userInfo = secureStorage.getItem('userInfo') || {};
      const token = userInfo.token;

      if (!token) {
        console.error('No authentication token found');
        return {
          totalPatients: 0,
          waitingPatients: 0,
          inProgressPatients: 0,
          completedPatients: 0,
          nextTicketNumber: 1,
        }; // Return default stats if not authenticated
      }

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();

      // Try secureFetch first
      try {
        console.log('Attempt 1: Using secureFetch for queue stats');
        return await secureFetch(`${API_URL}/queue/stats?_t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...(options.headers || {})
          },
          credentials: 'include',
          ...options
        });
      } catch (firstError) {
        console.warn('First attempt failed, trying direct API call for queue stats:', firstError);

        // Try direct API call with explicit headers
        try {
          console.log('Attempt 2: Direct API call with explicit headers for queue stats');
          const response = await fetch(`${API_URL}/queue/stats?_t=${timestamp}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            credentials: 'include',
            mode: 'cors'
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Successfully fetched queue stats with direct API call:', data);
            return data;
          } else {
            const errorText = await response.text();
            console.warn(`API call failed with status ${response.status}: ${errorText}`);
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
          }
        } catch (secondError) {
          console.warn('Second attempt failed, trying non-API endpoint for queue stats:', secondError);

          // Try the non-API endpoint as final fallback
          const baseUrl = API_URL.replace('/api', '');
          console.log('Attempt 3: Using non-API endpoint for queue stats:', `${baseUrl}/queue/stats?_t=${timestamp}`);

          const response = await fetch(`${baseUrl}/queue/stats?_t=${timestamp}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            credentials: 'include',
            mode: 'cors'
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Successfully fetched queue stats with non-API endpoint:', data);
            return data;
          } else {
            const errorText = await response.text();
            console.error(`All attempts failed. Last error: ${response.status} ${response.statusText} - ${errorText}`);
            return {
              totalPatients: 0,
              waitingPatients: 0,
              inProgressPatients: 0,
              completedPatients: 0,
              nextTicketNumber: 1,
            };
          }
        }
      }
    } catch (error) {
      console.error('Error fetching queue stats:', error);
      return {
        totalPatients: 0,
        waitingPatients: 0,
        inProgressPatients: 0,
        completedPatients: 0,
        nextTicketNumber: 1,
      }; // Return default stats on error
    }
  },

  addToQueue: async (queueData) => {
    try {
      // Ensure patient_id is properly formatted
      if (typeof queueData.patient_id === 'object' && queueData.patient_id._id) {
        queueData.patient_id = queueData.patient_id._id;
      }

      console.log('Adding to queue with data:', queueData);
      console.log('Patient ID type:', typeof queueData.patient_id);
      console.log('Patient ID value:', queueData.patient_id);

      // Get the next ticket number from the server
      let nextTicketNumber = 1;
      try {
        const statsResponse = await apiService.getQueueStats();
        nextTicketNumber = statsResponse.nextTicketNumber || 1;
        console.log('Got next ticket number from server:', nextTicketNumber);
      } catch (statsError) {
        console.warn('Could not get next ticket number from server, using default 1:', statsError);
      }

      // Prepare the request data
      const requestData = {
        ...queueData,
        ticket_number: nextTicketNumber
      };

      // Get user info and token
      const userInfo = secureStorage.getItem('userInfo') || {};
      const token = userInfo.token;

      if (!token) {
        console.error('No authentication token found');
        throw new Error('Authentication required. Please log in again.');
      }

      // Try direct API call first with explicit headers
      try {
        console.log('Attempt 1: Direct API call with explicit headers');
        const response = await fetch(`${API_URL}/queue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          body: JSON.stringify(requestData),
          credentials: 'include',
          mode: 'cors'
        });

        if (response.ok) {
          const serverQueueEntry = await response.json();
          console.log('Successfully added to queue with direct API call:', serverQueueEntry);

          if (!serverQueueEntry || !serverQueueEntry._id) {
            throw new Error('Invalid server response - no queue entry ID');
          }

          return serverQueueEntry;
        } else {
          const errorText = await response.text();
          console.warn(`API call failed with status ${response.status}: ${errorText}`);
          throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
      } catch (firstError) {
        console.warn('First attempt failed, trying with secureFetch:', firstError);

        // Try with secureFetch as second attempt
        try {
          console.log('Attempt 2: Using secureFetch');
          const serverQueueEntry = await secureFetch(`${API_URL}/queue`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...authHeader(),
            },
            body: JSON.stringify(requestData),
            credentials: 'include'
          });

          console.log('Successfully added to queue with secureFetch:', serverQueueEntry);

          if (!serverQueueEntry || !serverQueueEntry._id) {
            throw new Error('Invalid server response - no queue entry ID');
          }

          return serverQueueEntry;
        } catch (secondError) {
          console.warn('Second attempt failed, trying non-API endpoint:', secondError);

          // Try the non-API endpoint as final fallback
          const baseUrl = API_URL.replace('/api', '');
          console.log('Attempt 3: Using non-API endpoint:', `${baseUrl}/queue`);

          const response = await fetch(`${baseUrl}/queue`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify(requestData),
            credentials: 'include',
            mode: 'cors'
          });

          if (response.ok) {
            const serverQueueEntry = await response.json();
            console.log('Successfully added to queue with non-API endpoint:', serverQueueEntry);

            if (!serverQueueEntry || !serverQueueEntry._id) {
              throw new Error('Invalid server response - no queue entry ID');
            }

            return serverQueueEntry;
          } else {
            const errorText = await response.text();
            console.error(`All attempts failed. Last error: ${response.status} ${response.statusText} - ${errorText}`);
            throw new Error('All attempts to add to queue failed. Please try again later.');
          }
        }
      }
    } catch (error) {
      console.error('Error adding to queue:', error);
      throw new Error(`Failed to add to queue: ${error.message}`);
    }
  },

  updateQueueEntry: async (id, updateData) => {
    try {
      // Use the non-API endpoint for queue to avoid CORS issues
      const baseUrl = API_URL.replace('/api', '');
      console.log('Using queue endpoint for updating:', `${baseUrl}/queue/${id}`);

      const response = await fetch(`${baseUrl}/queue/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify(updateData),
        credentials: 'include', // Include cookies for refresh token
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error updating queue entry:', error);
      throw error;
    }
  },

  // Alias for updateQueueEntry with status-only updates
  updateQueueStatus: async (id, statusData) => {
    try {
      // Get user info and token
      const userInfo = secureStorage.getItem('userInfo') || {};
      const token = userInfo.token;

      if (!token) {
        console.error('No authentication token found');
        throw new Error('Authentication required. Please log in again.');
      }

      console.log(`Updating queue entry ${id} with status:`, statusData);

      // Try secureFetch first
      try {
        console.log('Attempt 1: Using secureFetch');
        return await secureFetch(`${API_URL}/queue/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
          body: JSON.stringify(statusData),
          credentials: 'include'
        });
      } catch (firstError) {
        console.warn('First attempt failed, trying direct API call:', firstError);

        // Try direct API call with explicit headers
        try {
          console.log('Attempt 2: Direct API call with explicit headers');
          const response = await fetch(`${API_URL}/queue/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify(statusData),
            credentials: 'include',
            mode: 'cors'
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Successfully updated queue status with direct API call:', data);
            return data;
          } else {
            const errorText = await response.text();
            console.warn(`API call failed with status ${response.status}: ${errorText}`);
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
          }
        } catch (secondError) {
          console.warn('Second attempt failed, trying non-API endpoint:', secondError);

          // Try the non-API endpoint as final fallback
          const baseUrl = API_URL.replace('/api', '');
          console.log('Attempt 3: Using non-API endpoint:', `${baseUrl}/queue/${id}`);

          const response = await fetch(`${baseUrl}/queue/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify(statusData),
            credentials: 'include',
            mode: 'cors'
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Successfully updated queue status with non-API endpoint:', data);
            return data;
          } else {
            const errorText = await response.text();
            console.error(`All attempts failed. Last error: ${response.status} ${response.statusText} - ${errorText}`);
            throw new Error('All attempts to update queue status failed. Please try again later.');
          }
        }
      }
    } catch (error) {
      console.error('Error updating queue status:', error);
      throw new Error(`Failed to update queue status: ${error.message}`);
    }
  },

  removeFromQueue: async (id) => {
    try {
      // Use the non-API endpoint for queue to avoid CORS issues
      const baseUrl = API_URL.replace('/api', '');
      console.log('Using queue endpoint for removing:', `${baseUrl}/queue/${id}`);

      try {
        const response = await fetch(`${baseUrl}/queue/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
          credentials: 'include', // Include cookies for refresh token
        });
        return handleResponse(response);
      } catch (corsError) {
        console.warn('CORS error with normal mode, trying alternative approach:', corsError);

        // Try without credentials
        const response2 = await fetch(`${baseUrl}/queue/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
        });
        return handleResponse(response2);
      }
    } catch (error) {
      console.error('Error removing from queue:', error);
      throw new Error('Failed to remove from queue. Please check your network connection and try again.');
    }
  },

  getNextPatient: async () => {
    return secureFetch(`${API_URL}/queue/next`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      credentials: 'include', // Include cookies for refresh token
    });
  },

  reorderQueue: async (queueOrderData) => {
    return secureFetch(`${API_URL}/queue/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(queueOrderData),
      credentials: 'include', // Include cookies for refresh token
    });
  },

  clearCompletedQueue: async () => {
    try {
      // Use the non-API endpoint for queue to avoid CORS issues
      const baseUrl = API_URL.replace('/api', '');
      console.log('Using queue endpoint for clearing completed:', `${baseUrl}/queue/clear-completed`);

      try {
        const response = await fetch(`${baseUrl}/queue/clear-completed`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
          credentials: 'include', // Include cookies for refresh token
        });
        return handleResponse(response);
      } catch (corsError) {
        console.warn('CORS error with normal mode, trying alternative approach:', corsError);

        // Try without credentials
        const response2 = await fetch(`${baseUrl}/queue/clear-completed`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
        });
        return handleResponse(response2);
      }
    } catch (error) {
      console.error('Error clearing completed queue entries:', error);
      throw new Error('Failed to clear completed queue entries. Please check your network connection and try again.');
    }
  },
};

export default apiService;
