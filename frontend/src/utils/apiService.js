// API Service for making requests to the backend

// Get the API URL from environment variables or use a default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to handle fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // If the response contains a message, use it, otherwise use a generic error
    const error = (data && data.message) || response.statusText;
    return Promise.reject(error);
  }
  
  return data;
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
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
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
    const response = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
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
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
      },
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
};

export default apiService;
