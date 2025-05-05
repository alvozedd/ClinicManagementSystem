// API Service for making requests to the backend
import authUtils from './authUtils';
import { makeApiRequest } from './apiUtils';

// For debugging
const DEBUG = true;

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

  // Get user info from all possible storage locations
  let userInfo = null;
  let token = null;

  // Try sessionStorage only
  try {
    const sessionUserInfo = sessionStorage.getItem('userInfo');
    if (sessionUserInfo) {
      userInfo = JSON.parse(sessionUserInfo);
      token = userInfo.token;
      console.log('Found token in sessionStorage');
    }
  } catch (e) {
    console.warn('Error accessing sessionStorage:', e);
  }

  console.log('Token retrieved:', token ? 'Yes (token exists)' : 'No');

  if (!token) {
    console.error('No token found in any storage');
    // Don't redirect immediately, return a rejection that the caller can handle
    return Promise.reject('No authentication token found');
  }

  // Check if token exists and is expired
  if (isTokenExpired(token)) {
    console.log('Token is expired, attempting to refresh');
    try {
      // Try to refresh the token
      const newToken = await refreshAccessToken();
      console.log('Token refreshed successfully:', newToken ? 'Yes' : 'No');

      // Update the Authorization header with the new token
      if (options.headers && options.headers.Authorization) {
        options.headers.Authorization = `Bearer ${newToken}`;
      }

      // If no Authorization header was provided, add it
      if (!options.headers) {
        options.headers = {
          Authorization: `Bearer ${newToken}`
        };
      } else if (!options.headers.Authorization) {
        options.headers.Authorization = `Bearer ${newToken}`;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Don't redirect immediately, return a rejection that the caller can handle
      return Promise.reject('Failed to refresh authentication token');
    }
  } else {
    // Token is valid, ensure it's in the headers
    if (!options.headers) {
      options.headers = {
        Authorization: `Bearer ${token}`
      };
    } else if (!options.headers.Authorization) {
      options.headers.Authorization = `Bearer ${token}`;
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

    // Check for 401 Unauthorized response
    if (response.status === 401) {
      console.log('Received 401 response, attempting to refresh token');
      try {
        // Try to refresh the token
        const newToken = await refreshAccessToken();
        console.log('Token refreshed after 401:', newToken ? 'Yes' : 'No');

        // Update the Authorization header with the new token
        if (options.headers) {
          options.headers.Authorization = `Bearer ${newToken}`;
        } else {
          options.headers = {
            Authorization: `Bearer ${newToken}`
          };
        }

        // Retry the request with the new token
        console.log('Retrying request with new token');
        const retryResponse = await fetch(url, options);
        return await handleResponse(retryResponse);
      } catch (refreshError) {
        console.error('Failed to refresh token after 401:', refreshError);
        // Don't redirect immediately, return a rejection that the caller can handle
        return Promise.reject('Session expired and token refresh failed');
      }
    }

    return await handleResponse(response);
  } catch (error) {
    // For network errors or other fetch failures
    console.error('Error in secure fetch:', error);
    return Promise.reject(error);
  }
};

// Get auth header with JWT token
const authHeader = () => {
  console.log('Getting auth header');
  return authUtils.getAuthHeaders();
};

// Check if token is expired
const isTokenExpired = (token) => {
  return authUtils.isTokenExpired(token);
};

// Refresh the access token
const refreshAccessToken = async () => {
  try {
    console.log('Attempting to refresh token');

    // Get user data and session ID
    const userData = authUtils.getUserData();
    const sessionId = authUtils.getSessionId();

    if (!userData) {
      console.error('No user data found, cannot refresh token');
      throw new Error('No user data found');
    }

    // Use makeApiRequest to try multiple endpoints
    const refreshData = await makeApiRequest('/users/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        token: userData.token,
        userId: userData._id || userData.id
      })
    }, false); // Don't require auth for token refresh

    if (refreshData && refreshData.token) {
      console.log('Token refreshed successfully');

      // Update the user data with the new token
      const updatedUserData = {
        ...userData,
        token: refreshData.token,
        ...(refreshData.user || {})
      };

      // Store the updated user data
      authUtils.storeUserData(updatedUserData, refreshData.sessionId);

      console.log('Token refresh completed successfully');
      return refreshData.token;
    }

    throw new Error('Token refresh failed - no new token received');
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// API methods
const apiService = {
  // Content endpoints
  getContent: async (section = null) => {
    try {
      if (DEBUG) console.log(`Fetching content${section ? ` for section: ${section}` : ''}`);

      // Build query string if section is provided
      const queryString = section ? `?section=${encodeURIComponent(section)}` : '';

      // Try direct Railway URL first (most reliable)
      try {
        if (DEBUG) console.log('First attempt - Using direct Railway URL for content');
        const response = await fetch(`https://clinicmanagementsystem-production-081b.up.railway.app/api/content${queryString}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          mode: 'cors',
          cache: 'no-cache'
        });

        if (response.ok) {
          const data = await response.json();
          if (DEBUG) console.log(`Successfully fetched ${data.length} content items with direct Railway URL`);
          return data;
        } else {
          if (DEBUG) console.warn(`Railway URL attempt failed with status: ${response.status}`);
        }
      } catch (railwayError) {
        if (DEBUG) console.warn('Railway URL attempt failed with error:', railwayError);
      }

      // Second attempt: Try without API prefix
      try {
        if (DEBUG) console.log('Second attempt - Using endpoint without API prefix');
        const response = await fetch(`https://clinicmanagementsystem-production-081b.up.railway.app/content${queryString}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          mode: 'cors',
          cache: 'no-cache'
        });

        if (response.ok) {
          const data = await response.json();
          if (DEBUG) console.log(`Successfully fetched ${data.length} content items without API prefix`);
          return data;
        } else {
          if (DEBUG) console.warn(`Second attempt failed with status: ${response.status}`);
        }
      } catch (secondError) {
        if (DEBUG) console.warn('Second attempt failed with error:', secondError);
      }

      // Fall back to makeApiRequest to try multiple endpoints
      if (DEBUG) console.log('Third attempt - Using makeApiRequest for content');
      const contentData = await makeApiRequest(`/content${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }, false); // Don't require auth for public content

      if (DEBUG) console.log(`Successfully fetched ${contentData.length} content items with makeApiRequest`);
      return contentData;
    } catch (error) {
      if (DEBUG) console.error('Error fetching content:', error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  // Auth endpoints
  login: async (username, password) => {
    console.log(`Attempting login with username: ${username}`);
    try {
      // Use makeApiRequest to try multiple endpoints
      const loginData = await makeApiRequest('/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      }, false); // Don't require auth for login

      console.log('Login successful');
      return loginData;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid username or password');
    }
  },

  logout: async (sessionId) => {
    try {
      console.log('Calling logout API with sessionId:', sessionId ? 'Present' : 'Not present');

      // Get refresh token from cookies if available
      let refreshToken = null;
      try {
        // Check if document.cookie exists (browser environment)
        if (typeof document !== 'undefined' && document.cookie) {
          const cookies = document.cookie.split(';');
          const refreshTokenCookie = cookies.find(cookie => cookie.trim().startsWith('refreshToken='));
          if (refreshTokenCookie) {
            refreshToken = refreshTokenCookie.split('=')[1];
            console.log('Found refresh token in cookies');
          }
        }
      } catch (cookieError) {
        console.warn('Error accessing cookies:', cookieError);
      }

      // Call the API first, before clearing storage
      try {
        const logoutData = await makeApiRequest('/users/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId || null,
            refreshToken: refreshToken || null
          }),
          credentials: 'include' // Include cookies in the request
        }, false); // Don't require auth for logout

        console.log('Logout API call successful');
        return logoutData;
      } catch (error) {
        console.warn('Logout API call failed:', error);
        // Continue even if the server-side logout fails
        return { success: true, message: 'Logged out (client-side only)' };
      }
    } catch (error) {
      console.error('Error during logout process:', error);
      return { success: true, message: 'Logged out (client-side only)' };
    }
  },

  refreshToken: async (sessionId, userId) => {
    console.log('Refreshing token with sessionId:', sessionId ? 'Yes' : 'No', 'and userId:', userId ? 'Yes' : 'No');

    try {
      // Use makeApiRequest to try multiple endpoints
      const refreshData = await makeApiRequest('/users/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          userId: userId
        })
      }, false); // Don't require auth for token refresh

      console.log('Token refresh successful');
      return refreshData;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh token');
    }
  },

  // Patient endpoints
  getPatients: async () => {
    try {
      console.log('Fetching patients');

      // Try direct Railway URL first (most reliable)
      try {
        console.log('First attempt - Using direct Railway URL');
        const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app/patients', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          mode: 'cors', // No credentials to avoid CORS issues
          cache: 'no-cache'
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully fetched ${data.length} patients with direct Railway URL`);
          return data;
        } else {
          console.warn(`Railway URL attempt failed with status: ${response.status}`);
        }
      } catch (railwayError) {
        console.warn('Railway URL attempt failed with error:', railwayError);
      }

      // Fall back to makeApiRequest to try multiple endpoints
      const patientsData = await makeApiRequest('/patients', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log(`Successfully fetched ${patientsData.length} patients with makeApiRequest`);
      return patientsData;
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  getPatientById: async (id) => {
    try {
      console.log(`Fetching patient with ID: ${id}`);

      // Use makeApiRequest to try multiple endpoints
      const patientData = await makeApiRequest(`/patients/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Successfully fetched patient details');
      return patientData;
    } catch (error) {
      console.error(`Error fetching patient with ID ${id}:`, error);
      throw error;
    }
  },

  createPatient: async (patientData) => {
    try {
      // Check if this is a visitor booking (no auth token needed)
      const isVisitorBooking = patientData.createdBy === 'visitor';
      const requiresAuth = !isVisitorBooking;

      console.log('Creating patient with data:', patientData);
      console.log('isVisitorBooking:', isVisitorBooking);

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add auth headers if required
      if (requiresAuth) {
        Object.assign(headers, authHeader());
      }

      // Try direct Railway URL first (most reliable)
      try {
        console.log('First attempt - Using direct Railway URL');
        const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app/patients', {
          method: 'POST',
          headers,
          body: JSON.stringify(patientData),
          mode: 'cors'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully created patient with Railway URL:', data);
          return data;
        } else {
          const errorText = await response.text();
          console.error('First attempt failed with status:', response.status, errorText);
        }
      } catch (railwayError) {
        console.warn('Railway URL attempt failed with error:', railwayError);
      }

      // Fall back to makeApiRequest to try multiple endpoints
      try {
        const createdPatient = await makeApiRequest('/patients', {
          method: 'POST',
          headers,
          body: JSON.stringify(patientData)
        }, requiresAuth);

        console.log('Successfully created patient with makeApiRequest:', createdPatient);
        return createdPatient;
      } catch (error) {
        console.error('Error creating patient with makeApiRequest:', error);

        // Create a temporary patient object with an ID for local use
        // This allows the UI to continue working even if the API call fails
        console.log('Creating temporary patient object for local use');
        const tempPatient = {
          _id: 'temp_' + Date.now(),
          name: patientData.name,
          gender: patientData.gender,
          phone: patientData.phone,
          year_of_birth: patientData.year_of_birth,
          next_of_kin_name: patientData.next_of_kin_name || 'Not Provided',
          next_of_kin_relationship: patientData.next_of_kin_relationship || 'Not Provided',
          next_of_kin_phone: patientData.next_of_kin_phone || '0000000000',
          medicalHistory: patientData.medicalHistory || [],
          allergies: patientData.allergies || [],
          medications: patientData.medications || [],
          createdBy: patientData.createdBy,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _isTemporary: true
        };

        return tempPatient;
      }
    } catch (error) {
      console.error('Error in createPatient:', error);
      throw error;
    }
  },

  updatePatient: async (id, patientData) => {
    try {
      console.log('Updating patient with ID:', id);
      console.log('Patient update data:', patientData);

      try {
        // Use makeApiRequest to try multiple endpoints
        const updatedPatient = await makeApiRequest(`/patients/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(patientData)
        });

        console.log('Patient update successful');
        return updatedPatient;
      } catch (error) {
        console.error('Error updating patient:', error);

        // Create a temporary updated patient object for local use
        console.log('Creating temporary updated patient object for local use');
        const tempPatient = {
          ...patientData,
          _id: id,
          updatedAt: new Date().toISOString(),
          _isTemporary: true
        };

        return tempPatient;
      }
    } catch (error) {
      console.error('Error in updatePatient:', error);
      throw error;
    }
  },

  deletePatient: async (id) => {
    try {
      console.log('Deleting patient with ID:', id);

      try {
        // Use makeApiRequest to try multiple endpoints
        const deleteResult = await makeApiRequest(`/patients/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Patient deletion successful');
        return deleteResult;
      } catch (error) {
        console.error('Error deleting patient:', error);

        // Return a success response anyway to allow the UI to remove the patient
        return { success: true, message: 'Patient deleted (local only)', _isTemporary: true };
      }
    } catch (error) {
      console.error('Error in deletePatient:', error);
      throw error;
    }
  },

  // Appointment endpoints
  getAppointmentById: async (id) => {
    try {
      console.log(`Fetching appointment with ID: ${id}`);
      return await makeApiRequest(`/appointments/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error(`Error fetching appointment with ID ${id}:`, error);
      throw error;
    }
  },

  getAppointments: async () => {
    try {
      console.log('Fetching appointments');

      // Try multiple approaches to get appointments
      try {
        // First try: with direct Railway URL (most reliable)
        try {
          console.log('First attempt - Using direct Railway URL');
          const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app/appointments', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...authHeader(),
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            mode: 'cors' // No credentials to avoid CORS issues
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Successfully fetched appointments with direct Railway URL:', data.length);
            return data;
          } else {
            console.warn(`Railway URL attempt failed with status: ${response.status}`);
          }
        } catch (railwayError) {
          console.warn('Railway URL attempt failed with error:', railwayError);
        }

        // Second try: with API prefix
        console.log('Second attempt - Using API prefix');
        const response = await fetch(`${API_URL}/appointments`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          credentials: 'include', // Include cookies for refresh token
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully fetched appointments with API URL:', data.length);
          return data;
        } else {
          console.warn(`API URL attempt failed with status: ${response.status}`);
        }
      } catch (firstError) {
        console.warn('Second attempt failed, trying without API prefix:', firstError);

        try {
          // Third try: without API prefix
          const baseUrl = API_URL.replace('/api', '');
          console.log('Third attempt - Using endpoint without API prefix:', `${baseUrl}/appointments`);

          const response = await fetch(`${baseUrl}/appointments`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...authHeader(),
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            credentials: 'include', // Include cookies for refresh token
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Successfully fetched appointments with base URL:', data.length);
            return data;
          } else {
            console.warn(`Base URL attempt failed with status: ${response.status}`);
            throw new Error(`Failed to fetch appointments: ${response.status}`);
          }
        } catch (thirdError) {
          console.error('All attempts to fetch appointments failed:', thirdError);
          // Return empty array instead of throwing to prevent UI errors
          return [];
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  getAppointmentsByPatientId: async (patientId) => {
    try {
      console.log(`Fetching appointments for patient ID: ${patientId}`);

      // Try multiple approaches to get patient appointments
      try {
        // First try: with direct Railway URL (most reliable)
        try {
          console.log('First attempt - Using direct Railway URL');
          const response = await fetch(`https://clinicmanagementsystem-production-081b.up.railway.app/appointments/patient/${patientId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...authHeader(),
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            mode: 'cors', // No credentials to avoid CORS issues
            credentials: 'omit' // Explicitly omit credentials
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`Successfully fetched appointments for patient ${patientId} with direct Railway URL:`, data.length);
            return data;
          } else {
            console.warn(`Railway URL attempt failed with status: ${response.status}`);
          }
        } catch (railwayError) {
          console.warn('Railway URL attempt failed with error:', railwayError);
        }

        // Second try: with API prefix
        console.log('Second attempt - Using API prefix');
        const response = await fetch(`${API_URL}/appointments/patient/${patientId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          credentials: 'include', // Include cookies for refresh token
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully fetched appointments for patient ${patientId} with API URL:`, data.length);
          return data;
        } else {
          console.warn(`API URL attempt failed with status: ${response.status}`);
        }
      } catch (firstError) {
        console.warn('Second attempt failed, trying without API prefix:', firstError);

        try {
          // Third try: without API prefix
          const baseUrl = API_URL.replace('/api', '');
          console.log('Third attempt - Using endpoint without API prefix:', `${baseUrl}/appointments/patient/${patientId}`);

          const response = await fetch(`${baseUrl}/appointments/patient/${patientId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...authHeader(),
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            credentials: 'include', // Include cookies for refresh token
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`Successfully fetched appointments for patient ${patientId} with base URL:`, data.length);
            return data;
          } else {
            console.warn(`Base URL attempt failed with status: ${response.status}`);
            throw new Error(`Failed to fetch patient appointments: ${response.status}`);
          }
        } catch (thirdError) {
          console.error('All attempts to fetch patient appointments failed:', thirdError);
          // Return empty array instead of throwing to prevent UI errors
          return [];
        }
      }
    } catch (error) {
      console.error(`Error fetching appointments for patient ${patientId}:`, error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
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

      // Format the appointment data to match the backend model
      const formattedData = {
        patient_id: appointmentData.patientId || appointmentData.patient_id,
        appointment_date: appointmentData.date || appointmentData.appointment_date || new Date().toISOString(),
        optional_time: appointmentData.time || appointmentData.optional_time || '10:00',
        status: 'Scheduled',
        type: appointmentData.type || 'Consultation',
        reason: appointmentData.reason || '',
        createdBy: appointmentData.createdBy || 'doctor'
      };

      console.log('Formatted appointment data:', formattedData);

      // Use the Railway deployment URL directly for production
      const isProduction = import.meta.env.PROD;
      const railwayEndpoint = isProduction
        ? 'https://clinicmanagementsystem-production-081b.up.railway.app/appointments'
        : 'http://localhost:5000/appointments';

      // Try multiple endpoints to handle both API and non-API routes
      let response;

      // First try with Railway URL
      try {
        console.log('First attempt - Using Railway endpoint:', railwayEndpoint);

        response = await fetch(railwayEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(formattedData),
          mode: 'cors'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully created appointment with Railway endpoint:', data);
          return data;
        }

        // If not ok, log the error response
        const errorText = await response.text();
        console.error('First attempt failed with status:', response.status, errorText);
      } catch (firstError) {
        console.warn('First attempt failed with error:', firstError);
      }

      // Second try with API prefix
      try {
        const endpoint = `${API_URL}/appointments`;
        console.log('Second attempt - Using appointment endpoint with API prefix:', endpoint);

        response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(formattedData),
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully created appointment with API URL:', data);
          return data;
        }

        // If not ok, log the error response
        const errorText = await response.text();
        console.error('Second attempt failed with status:', response.status, errorText);
      } catch (secondError) {
        console.warn('Second attempt failed with error:', secondError);
      }

      // Third try with base URL (no /api)
      try {
        const baseUrl = API_URL.replace('/api', '');
        const endpoint = `${baseUrl}/appointments`;
        console.log('Third attempt - Using appointment endpoint without API prefix:', endpoint);

        response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(formattedData),
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully created appointment with base URL:', data);
          return data;
        }

        // If not ok, log the error response
        const errorText = await response.text();
        console.error('Third attempt failed with status:', response.status, errorText);
        throw new Error(`Failed to create appointment: ${response.status} ${errorText}`);
      } catch (thirdError) {
        console.error('All attempts to create appointment failed:', thirdError);

        // Create a temporary appointment object for local use
        console.log('Creating temporary appointment object for local use');
        const tempAppointment = {
          _id: 'temp_' + Date.now(),
          patient_id: formattedData.patient_id,
          appointment_date: formattedData.appointment_date,
          optional_time: formattedData.optional_time,
          status: formattedData.status,
          type: formattedData.type,
          reason: formattedData.reason,
          createdBy: formattedData.createdBy,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _isTemporary: true
        };

        return tempAppointment;
      }
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

  // Appointment reordering for draggable appointments
  reorderAppointments: async (appointmentOrder) => {
    try {
      console.log('Reordering appointments with data:', appointmentOrder);

      // Store the order in localStorage first for immediate persistence
      // This ensures the order is saved even if the API calls fail
      const appointmentsInOrder = appointmentOrder.map(item => ({
        id: item.id,
        position: item.position
      }));

      // Save to sessionStorage to persist across page refreshes but not across sessions
      // This helps with the first-time reordering issue
      sessionStorage.setItem('appointmentOrder', JSON.stringify(appointmentsInOrder));

      // Also save to localStorage for longer persistence
      localStorage.setItem('appointmentOrder', JSON.stringify(appointmentsInOrder));

      // Try multiple approaches to reorder appointments
      try {
        // First try: with direct Railway URL
        const railwayUrl = 'https://clinicmanagementsystem-production-081b.up.railway.app/queue/reorder';
        console.log('First attempt - Using direct Railway URL for reordering');
        const response = await fetch(railwayUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
          body: JSON.stringify({ queueOrder: appointmentOrder }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully reordered appointments with direct Railway URL:', data);
          return data;
        } else {
          console.warn(`Railway URL attempt failed with status: ${response.status}`);
        }
      } catch (firstError) {
        console.warn('First attempt failed with error:', firstError);
      }

      // Second try with API prefix
      try {
        const baseUrl = API_URL.replace('/api', '');
        const endpoint = `${baseUrl}/queue/reorder`;
        console.log('Second attempt - Using queue/reorder endpoint:', endpoint);

        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
          body: JSON.stringify({ queueOrder: appointmentOrder }),
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully reordered appointments with API URL:', data);
          return data;
        }

        // If not ok, log the error response
        const errorText = await response.text();
        console.error('Second attempt failed with status:', response.status, errorText);
      } catch (secondError) {
        console.warn('Second attempt failed with error:', secondError);
      }

      // If all attempts fail, we've already saved to localStorage as a fallback
      console.log('All API attempts failed, using localStorage fallback for appointment order');

      // Return a mock success response
      return {
        success: true,
        message: 'Appointments reordered successfully (local only)',
        data: appointmentOrder,
        _isLocalOnly: true
      };
    } catch (error) {
      console.error('Error reordering appointments:', error);
      throw error;
    }
  },

  // Diagnosis endpoints
  getDiagnoses: async () => {
    try {
      console.log('Fetching diagnoses with auth headers:', authHeader());

      // Try direct Railway URL first (most reliable)
      try {
        console.log('First attempt - Using direct Railway URL for diagnoses');
        const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app/diagnoses', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          mode: 'cors',
          cache: 'no-cache'
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully fetched ${data.length} diagnoses with direct Railway URL`);
          return data;
        } else {
          console.warn(`Railway URL attempt failed with status: ${response.status}`);
        }
      } catch (railwayError) {
        console.warn('Railway URL attempt failed with error:', railwayError);
      }

      // Fall back to secureFetch
      return await secureFetch(`${API_URL}/diagnoses`, {
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
      console.error('Error fetching diagnoses:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Notes endpoints
  getNotes: async (filters = {}) => {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const response = await fetch(`${API_URL}/notes${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  getNotesByPatientId: async (patientId) => {
    try {
      console.log(`Fetching notes for patient ID: ${patientId}`);

      // First try: with direct Railway URL (most reliable)
      try {
        console.log('First attempt - Using direct Railway URL');
        const response = await fetch(`https://clinicmanagementsystem-production-081b.up.railway.app/api/notes/patient/${patientId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          mode: 'cors',
          credentials: 'omit' // Explicitly omit credentials
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully fetched notes for patient ${patientId} with direct Railway URL:`, data.length);
          return data;
        } else {
          console.warn(`Railway URL attempt failed with status: ${response.status}`);
        }
      } catch (railwayError) {
        console.warn('Railway URL attempt failed with error:', railwayError);
      }

      // Fallback to standard API URL
      const response = await fetch(`${API_URL}/notes/patient/${patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`Error fetching notes for patient ${patientId}:`, error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  getNotesByAppointmentId: async (appointmentId) => {
    const response = await fetch(`${API_URL}/notes/appointment/${appointmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  getNoteById: async (noteId) => {
    const response = await fetch(`${API_URL}/notes/${noteId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  createNote: async (noteData) => {
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(noteData),
    });
    return handleResponse(response);
  },

  updateNote: async (noteId, noteData) => {
    const response = await fetch(`${API_URL}/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(noteData),
    });
    return handleResponse(response);
  },

  deleteNote: async (noteId) => {
    const response = await fetch(`${API_URL}/notes/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  uploadNoteAttachment: async (noteId, formData) => {
    const response = await fetch(`${API_URL}/notes/${noteId}/attachments`, {
      method: 'POST',
      headers: {
        ...authHeader(),
      },
      body: formData,
    });
    return handleResponse(response);
  },

  deleteNoteAttachment: async (noteId, filename) => {
    const response = await fetch(`${API_URL}/notes/${noteId}/attachments/${filename}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  getDiagnosisByAppointmentId: async (appointmentId) => {
    try {
      console.log(`Fetching diagnoses for appointment ID: ${appointmentId}`);
      return await secureFetch(`${API_URL}/diagnoses/appointment/${appointmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error(`Error fetching diagnoses for appointment ${appointmentId}:`, error);
      return []; // Return empty array instead of throwing
    }
  },

  getDiagnosesByPatientId: async (patientId) => {
    try {
      console.log(`Fetching diagnoses for patient ID: ${patientId}`);

      // First try: with direct Railway URL (most reliable)
      try {
        console.log('First attempt - Using direct Railway URL for diagnoses');
        const response = await fetch(`https://clinicmanagementsystem-production-081b.up.railway.app/api/patients/${patientId}/diagnoses`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          mode: 'cors',
          credentials: 'omit' // Explicitly omit credentials to avoid CORS issues
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully fetched diagnoses for patient ${patientId} with direct Railway URL:`, data.length);
          return data;
        } else {
          console.warn(`Railway URL attempt failed with status: ${response.status}`);
        }
      } catch (railwayError) {
        console.warn('Railway URL attempt failed with error:', railwayError);
      }

      // Second try: with API_URL
      try {
        return await secureFetch(`${API_URL}/patients/${patientId}/diagnoses`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          credentials: 'include'
        });
      } catch (error) {
        console.error(`Error fetching diagnoses for patient ${patientId} with API_URL:`, error);

        // Third try: with diagnoses/patient endpoint as fallback
        try {
          console.log('Third attempt - Using diagnoses/patient endpoint');
          return await secureFetch(`${API_URL}/diagnoses/patient/${patientId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...authHeader(),
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            credentials: 'include'
          });
        } catch (thirdError) {
          console.error(`Error fetching diagnoses with third attempt:`, thirdError);
          return []; // Return empty array as last resort
        }
      }
    } catch (error) {
      console.error(`Error fetching diagnoses for patient ${patientId}:`, error);
      return []; // Return empty array instead of throwing
    }
  },

  createDiagnosis: async (diagnosisData) => {
    try {
      console.log('Creating diagnosis with data:', diagnosisData);
      return await secureFetch(`${API_URL}/diagnoses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        body: JSON.stringify(diagnosisData),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error creating diagnosis:', error);
      throw error; // Rethrow for create operations
    }
  },

  updateDiagnosis: async (id, diagnosisData) => {
    try {
      console.log(`Updating diagnosis ${id} with data:`, diagnosisData);
      return await secureFetch(`${API_URL}/diagnoses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        body: JSON.stringify(diagnosisData),
        credentials: 'include'
      });
    } catch (error) {
      console.error(`Error updating diagnosis ${id}:`, error);
      throw error; // Rethrow for update operations
    }
  },

  deleteDiagnosis: async (id) => {
    try {
      console.log(`Deleting diagnosis ${id}`);
      return await secureFetch(`${API_URL}/diagnoses/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error(`Error deleting diagnosis ${id}:`, error);
      throw error; // Rethrow for delete operations
    }
  },

  // User management endpoints (for admin)
  getUsers: async () => {
    try {
      console.log('Fetching users');

      // Try direct Railway URL first (most reliable)
      try {
        console.log('First attempt - Using direct Railway URL for users');
        const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app/api/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          credentials: 'include',
          mode: 'cors',
          cache: 'no-cache'
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully fetched ${data.length} users with direct Railway URL`);
          return data;
        } else {
          console.warn(`Railway URL attempt failed with status: ${response.status}`);
        }
      } catch (railwayError) {
        console.warn('Railway URL attempt failed with error:', railwayError);
      }

      // Fall back to makeApiRequest to try multiple endpoints
      const usersData = await makeApiRequest('/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log(`Successfully fetched ${usersData.length} users with makeApiRequest`);
      return usersData;
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  getUserById: async (id) => {
    try {
      console.log('Fetching user with ID:', id);

      // Try direct Railway URL first (most reliable)
      try {
        console.log('First attempt - Using direct Railway URL for user details');
        const response = await fetch(`https://clinicmanagementsystem-production-081b.up.railway.app/api/users/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          credentials: 'include',
          mode: 'cors',
          cache: 'no-cache'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully fetched user details with direct Railway URL');
          return data;
        } else {
          console.warn(`Railway URL attempt failed with status: ${response.status}`);
        }
      } catch (railwayError) {
        console.warn('Railway URL attempt failed with error:', railwayError);
      }

      // Fall back to makeApiRequest to try multiple endpoints
      const userData = await makeApiRequest(`/users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log('Successfully fetched user details with makeApiRequest');
      return userData;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      console.log('Creating user with data:', userData);

      // Try direct Railway URL first (most reliable)
      try {
        console.log('First attempt - Using direct Railway URL for user creation');
        const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          body: JSON.stringify(userData),
          credentials: 'include',
          mode: 'cors',
          cache: 'no-cache'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully created user with direct Railway URL:', data);
          return data;
        } else {
          const errorText = await response.text();
          console.warn(`Railway URL attempt failed with status: ${response.status}`, errorText);
        }
      } catch (railwayError) {
        console.warn('Railway URL attempt failed with error:', railwayError);
      }

      // Fall back to makeApiRequest to try multiple endpoints
      const createdUser = await makeApiRequest('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify(userData)
      });

      console.log('Successfully created user with makeApiRequest:', createdUser);
      return createdUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      console.log('Updating user with ID:', id, 'and data:', userData);

      // Try direct Railway URL first (most reliable)
      try {
        console.log('First attempt - Using direct Railway URL for user update');
        const response = await fetch(`https://clinicmanagementsystem-production-081b.up.railway.app/api/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          body: JSON.stringify(userData),
          credentials: 'include',
          mode: 'cors',
          cache: 'no-cache'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully updated user with direct Railway URL:', data);
          return data;
        } else {
          const errorText = await response.text();
          console.warn(`Railway URL attempt failed with status: ${response.status}`, errorText);
        }
      } catch (railwayError) {
        console.warn('Railway URL attempt failed with error:', railwayError);
      }

      // Fall back to makeApiRequest to try multiple endpoints
      const updatedUser = await makeApiRequest(`/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify(userData)
      });

      console.log('Successfully updated user with makeApiRequest:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      console.log('Deleting user with ID:', id);

      // Try direct Railway URL first (most reliable)
      try {
        console.log('First attempt - Using direct Railway URL for user deletion');
        const response = await fetch(`https://clinicmanagementsystem-production-081b.up.railway.app/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          credentials: 'include',
          mode: 'cors',
          cache: 'no-cache'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Successfully deleted user with direct Railway URL:', data);
          return data;
        } else {
          const errorText = await response.text();
          console.warn(`Railway URL attempt failed with status: ${response.status}`, errorText);
        }
      } catch (railwayError) {
        console.warn('Railway URL attempt failed with error:', railwayError);
      }

      // Fall back to makeApiRequest to try multiple endpoints
      const deleteResult = await makeApiRequest(`/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log('Successfully deleted user with makeApiRequest:', deleteResult);
      return deleteResult;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Content Management endpoints
  getContent: async (section) => {
    try {
      // Always try Railway URL first as it's most reliable
      const railwayUrl = `https://clinicmanagementsystem-production-081b.up.railway.app/api/content${section ? `?section=${section}` : ''}`;
      console.log('First attempt - Using direct Railway URL for content:', railwayUrl);

      try {
        const railwayResponse = await fetch(railwayUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          mode: 'cors',
          cache: 'no-cache'
        });

        console.log('Railway content API response status:', railwayResponse.status);

        if (railwayResponse.ok) {
          const data = await railwayResponse.json();
          console.log('Successfully fetched content from Railway URL:', data.length, 'items');
          return data;
        } else {
          console.warn('Railway URL attempt failed with status:', railwayResponse.status);
        }
      } catch (railwayError) {
        console.warn('Railway URL attempt failed with error:', railwayError);
      }

      // Fall back to API_URL if Railway URL fails
      const url = section ? `${API_URL}/content?section=${section}` : `${API_URL}/content`;
      console.log('Second attempt - Fetching content from URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-cache'
      });

      console.log('Content API response status:', response.status);

      const result = await handleResponse(response);
      console.log('Content API response data:', result);
      return result;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  },

  getAllContent: async () => {
    try {
      // For admin dashboard, we need authentication
      return secureFetch(`${API_URL}/content`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error fetching all content:', error);
      return []; // Return empty array instead of throwing
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

  // File upload for notes
  uploadFile: async (formData) => {
    try {
      console.log('Uploading file');

      return await secureFetch(`${API_URL}/uploads`, {
        method: 'POST',
        headers: {
          ...authHeader(),
          // Don't set Content-Type here, it will be set automatically with the boundary
        },
        body: formData,
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Get file for notes
  getFile: async (fileId) => {
    try {
      console.log('Getting file with ID:', fileId);

      return await secureFetch(`${API_URL}/uploads/${fileId}`, {
        method: 'GET',
        headers: {
          ...authHeader(),
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error getting file:', error);
      throw error;
    }
  }
};

export default apiService;
