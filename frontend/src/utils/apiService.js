// API Service for making requests to the backend

// Get the API URL from environment variables or use a default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to handle fetch responses
const handleResponse = async (response) => {
  // Check if the response is JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();

    if (!response.ok) {
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

// Get auth header with JWT token
const authHeader = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const token = userInfo.token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
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
        body: JSON.stringify({ username, password }),
      });
      console.log('Login response status:', response.status, response.statusText);
      return handleResponse(response);
    } catch (error) {
      console.error('Network error during login:', error);
      throw error;
    }
  },

  // Patient endpoints
  getPatients: async () => {
    const response = await fetch(`${API_URL}/patients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
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
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  getUserById: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },

  createUser: async (userData) => {
    console.log('Creating user with data:', userData);
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(userData),
    });
    const result = await handleResponse(response);
    console.log('Create user response:', result);
    return result;
  },

  updateUser: async (id, userData) => {
    console.log('Updating user with ID:', id, 'and data:', userData);
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
      body: JSON.stringify(userData),
    });
    const result = await handleResponse(response);
    console.log('Update user response:', result);
    return result;
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
    });
    return handleResponse(response);
  },
};

export default apiService;
