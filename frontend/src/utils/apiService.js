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

    const response = await fetch(`${API_URL}/users/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies
      body: sessionId ? JSON.stringify({ sessionId }) : undefined,
    });

    const data = await handleResponse(response);

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
    console.log(`Sending login request to: ${API_URL}/users/login`);
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for refresh token
        body: JSON.stringify({ username, password }),
      });
      console.log('Login response status:', response.status, response.statusText);
      return handleResponse(response);
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

      // Then call the API to logout (revoke refresh token)
      const response = await fetch(`${API_URL}/users/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for refresh token
        body: sessionId ? JSON.stringify({ sessionId }) : undefined,
      });

      console.log('Logout API response status:', response.status);

      // Double-check that everything is cleared
      if (secureStorage.getItem('userInfo')) {
        console.warn('userInfo still exists in secureStorage after logout, clearing again');
        secureStorage.clear();
      }

      return handleResponse(response);
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
    return secureFetch(`${API_URL}/patients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      credentials: 'include', // Include cookies for refresh token
    });
  },

  getPatientById: async (id) => {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  createPatient: async (patientData) => {
    // Check if this is a visitor booking (no auth token needed)
    const isVisitorBooking = patientData.createdBy === 'visitor';

    const headers = {
      'Content-Type': 'application/json',
      ...(isVisitorBooking ? {} : authHeader()),
    };

    console.log('Creating patient with headers:', headers, 'isVisitorBooking:', isVisitorBooking);

    const response = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers,
      body: JSON.stringify(patientData),
    });
    return handleResponse(response);
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
    // Check if this is a visitor booking (no auth token needed)
    const isVisitorBooking = appointmentData.createdBy === 'visitor';

    const headers = {
      'Content-Type': 'application/json',
      ...(isVisitorBooking ? {} : authHeader()),
    };

    console.log('Creating appointment with headers:', headers, 'isVisitorBooking:', isVisitorBooking);

    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(appointmentData),
    });
    return handleResponse(response);
  },

  updateAppointment: async (id, appointmentData) => {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(appointmentData),
    });
    return handleResponse(response);
  },

  deleteAppointment: async (id) => {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
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
};

export default apiService;
