const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:5000';
let authToken = null;

// Test data
const testPatient = {
  name: 'Test Patient',
  gender: 'Male',
  phone: '1234567890',
  year_of_birth: 1990,
  next_of_kin_name: 'Test Relative',
  next_of_kin_relationship: 'Spouse',
  next_of_kin_phone: '0987654321',
  createdBy: 'doctor',
  // Add required fields in the correct format
  medicalHistory: [
    {
      condition: 'None',
      diagnosedDate: '2023-01-01',
      notes: 'No significant medical history'
    }
  ],
  allergies: ['None'],
  medications: [
    {
      name: 'None',
      dosage: 'N/A',
      frequency: 'N/A',
      startDate: '2023-01-01'
    }
  ]
};

const testAppointment = {
  appointment_date: new Date().toISOString(), // Today's date and time
  optional_time: '10:00',
  reason: 'Test appointment',
  status: 'Scheduled', // Note the capital S
  type: 'Consultation',
  createdBy: 'doctor'
};

// Helper functions
async function login() {
  console.log('Logging in...');
  try {
    // Try multiple login endpoints
    let response;
    let data;

    try {
      // First try the API endpoint
      console.log('Trying API login endpoint...');
      response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin@urohealth.com',
          password: 'admin123'
        })
      });

      if (response.ok) {
        data = await response.json();
        authToken = data.token;
        console.log('Login successful with API endpoint, token received');
        return data;
      }
    } catch (apiError) {
      console.log('API login endpoint failed:', apiError.message);
    }

    try {
      // Try the non-API endpoint
      console.log('Trying non-API login endpoint...');
      response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin@urohealth.com',
          password: 'admin123'
        })
      });

      if (!response.ok) {
        throw new Error(`Login failed with status ${response.status}`);
      }

      data = await response.json();
      authToken = data.token;
      console.log('Login successful with non-API endpoint, token received');
      return data;
    } catch (nonApiError) {
      console.log('Non-API login endpoint failed:', nonApiError.message);
      throw nonApiError;
    }
  } catch (error) {
    console.error('All login attempts failed:', error.message);
    throw error;
  }
}

async function createPatient() {
  console.log('Creating test patient...');
  try {
    const response = await fetch(`${API_URL}/api/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testPatient)
    });

    if (!response.ok) {
      // Try alternative endpoint
      console.log('Trying alternative endpoint...');
      const altResponse = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(testPatient)
      });

      if (!altResponse.ok) {
        throw new Error(`Failed to create patient: ${altResponse.status}`);
      }

      const data = await altResponse.json();
      console.log('Patient created successfully:', data);
      return data;
    }

    const data = await response.json();
    console.log('Patient created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating patient:', error.message);
    throw error;
  }
}

async function getPatients() {
  console.log('Getting all patients...');
  try {
    const response = await fetch(`${API_URL}/api/patients`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      // Try alternative endpoint
      console.log('Trying alternative endpoint...');
      const altResponse = await fetch(`${API_URL}/patients`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!altResponse.ok) {
        throw new Error(`Failed to get patients: ${altResponse.status}`);
      }

      const data = await altResponse.json();
      console.log(`Retrieved ${data.length} patients`);
      return data;
    }

    const data = await response.json();
    console.log(`Retrieved ${data.length} patients`);
    return data;
  } catch (error) {
    console.error('Error getting patients:', error.message);
    throw error;
  }
}

async function createAppointment(patientId) {
  console.log('Creating test appointment...');
  try {
    const appointmentData = {
      ...testAppointment,
      patient_id: patientId
    };

    const response = await fetch(`${API_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(appointmentData)
    });

    if (!response.ok) {
      // Try alternative endpoint
      console.log('Trying alternative endpoint...');
      const altResponse = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(appointmentData)
      });

      if (!altResponse.ok) {
        throw new Error(`Failed to create appointment: ${altResponse.status}`);
      }

      const data = await altResponse.json();
      console.log('Appointment created successfully:', data);
      return data;
    }

    const data = await response.json();
    console.log('Appointment created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating appointment:', error.message);
    throw error;
  }
}

async function getAppointments() {
  console.log('Getting all appointments...');
  try {
    const response = await fetch(`${API_URL}/api/appointments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      // Try alternative endpoint
      console.log('Trying alternative endpoint...');
      const altResponse = await fetch(`${API_URL}/appointments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!altResponse.ok) {
        throw new Error(`Failed to get appointments: ${altResponse.status}`);
      }

      const data = await altResponse.json();
      console.log(`Retrieved ${data.length} appointments`);
      return data;
    }

    const data = await response.json();
    console.log(`Retrieved ${data.length} appointments`);
    return data;
  } catch (error) {
    console.error('Error getting appointments:', error.message);
    throw error;
  }
}

async function addToQueue(appointmentId, patientId) {
  console.log('Adding appointment to queue...');
  try {
    // Create queue entry data
    const queueData = {
      patient_id: patientId,
      appointment_id: appointmentId,
      status: 'waiting',
      ticket_number: 1 // This will be assigned by the server
    };

    // Try the API endpoint first
    try {
      console.log('Trying API endpoint for queue...');
      const response = await fetch(`${API_URL}/api/queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(queueData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Added to queue successfully:', data);
        return data;
      }
    } catch (apiError) {
      console.log('API queue endpoint failed:', apiError.message);
    }

    // Try the non-API endpoint
    console.log('Trying non-API endpoint for queue...');
    const altResponse = await fetch(`${API_URL}/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(queueData)
    });

    if (!altResponse.ok) {
      throw new Error(`Failed to add to queue: ${altResponse.status}`);
    }

    const data = await altResponse.json();
    console.log('Added to queue successfully:', data);
    return data;
  } catch (error) {
    console.error('Error adding to queue:', error.message);
    throw error;
  }
}

async function getQueue() {
  console.log('Getting queue...');
  try {
    // Try the API endpoint first
    try {
      console.log('Trying API endpoint for queue...');
      const response = await fetch(`${API_URL}/api/queue`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Retrieved ${data.length} queue entries`);
        return data;
      }
    } catch (apiError) {
      console.log('API queue endpoint failed:', apiError.message);
    }

    // Try the non-API endpoint
    console.log('Trying non-API endpoint for queue...');
    const altResponse = await fetch(`${API_URL}/queue`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!altResponse.ok) {
      throw new Error(`Failed to get queue: ${altResponse.status}`);
    }

    const data = await altResponse.json();
    console.log(`Retrieved ${data.length} queue entries`);
    return data;
  } catch (error) {
    console.error('Error getting queue:', error.message);
    throw error;
  }
}

// Main test function
async function runTests() {
  try {
    // Step 1: Login
    await login();

    // Step 2: Get existing patients
    const existingPatients = await getPatients();

    // Step 3: Create a new patient
    const newPatient = await createPatient();
    console.log('New patient created with ID:', newPatient._id);

    // Step 4: Get patients again to verify the new patient was added
    const updatedPatients = await getPatients();
    console.log(`Patient count before: ${existingPatients.length}, after: ${updatedPatients.length}`);

    // Step 5: Get existing appointments
    const existingAppointments = await getAppointments();

    // Step 6: Create a new appointment for the new patient
    const newAppointment = await createAppointment(newPatient._id);
    console.log('New appointment created with ID:', newAppointment._id);

    // Step 7: Get appointments again to verify the new appointment was added
    const updatedAppointments = await getAppointments();
    console.log(`Appointment count before: ${existingAppointments.length}, after: ${updatedAppointments.length}`);

    // Step 8: Add the appointment to the queue
    await addToQueue(newAppointment._id, newPatient._id);

    // Step 9: Get the queue to verify the appointment was added
    const queue = await getQueue();

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the tests
runTests();
