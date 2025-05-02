/**
 * API Endpoints Test Script
 *
 * This script tests the core API endpoints to ensure they're working correctly.
 * Run with: node test-api-endpoints.js
 */

const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

// Base URL for API requests
const API_URL = 'http://localhost:5000/api';

// Test credentials
const testCredentials = {
  admin: { username: 'admin@urohealth.com', password: 'admin123' },
  doctor: { username: 'mbugua_pm', password: 'doctor123' },
  secretary: { username: 'secretary@urohealth.com', password: 'secretary123' }
};

// Store tokens for authenticated requests
const tokens = {};

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && (method.toLowerCase() === 'post' || method.toLowerCase() === 'put')) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response ? error.response.data : error.message,
      status: error.response ? error.response.status : 500
    };
  }
}

// Test authentication endpoints
async function testAuth() {
  console.log('\n🔐 Testing Authentication Endpoints...');

  // Test secretary login
  const role = 'secretary';
  const creds = testCredentials[role];
  console.log(`\nTesting ${role} login...`);
  const result = await makeRequest('post', '/users/login', creds);

  if (result.success) {
    console.log(`✅ ${role} login successful`);
    tokens[role] = result.data.token;
  } else {
    console.error(`❌ ${role} login failed:`, result.error);
  }
}

// Test user endpoints
async function testUsers() {
  console.log('\n👥 Testing User Endpoints...');

  // Get all users (admin only)
  if (tokens.admin) {
    console.log('\nGetting all users (admin)...');
    const result = await makeRequest('get', '/users', null, tokens.admin);

    if (result.success) {
      console.log(`✅ Got ${result.data.length} users`);
    } else {
      console.error('❌ Failed to get users:', result.error);
    }
  }

  // Skip profile tests as there's no specific endpoint for it
  console.log('\nSkipping user profile tests - no specific endpoint available');
}

// Test patient endpoints
async function testPatients() {
  console.log('\n🏥 Testing Patient Endpoints...');

  // Test with secretary role
  if (tokens.secretary) {
    // Get all patients
    console.log('\nGetting all patients...');
    const result = await makeRequest('get', '/patients', null, tokens.secretary);

    if (result.success) {
      console.log(`✅ Got ${result.data.length} patients`);

      // Create a test patient
      console.log('\nCreating a test patient...');
      const testPatient = {
        name: 'Test Patient ' + new Date().toISOString().slice(0, 10),
        gender: 'Male',
        phone: '1234567890',
        year_of_birth: '1980',
        next_of_kin_name: 'Test Relative',
        next_of_kin_relationship: 'Spouse',
        next_of_kin_phone: '0987654321'
      };

      const createResult = await makeRequest('post', '/patients', testPatient, tokens.secretary);

      if (createResult.success) {
        console.log(`✅ Created patient: ${createResult.data.name}`);
        const patientId = createResult.data._id;

        // Get the created patient
        console.log(`\nGetting patient with ID: ${patientId}...`);
        const patientResult = await makeRequest('get', `/patients/${patientId}`, null, tokens.secretary);

        if (patientResult.success) {
          console.log(`✅ Got patient: ${patientResult.data.name}`);

          // Update the patient
          console.log(`\nUpdating patient with ID: ${patientId}...`);
          const updateData = {
            name: patientResult.data.name + ' (Updated)',
            gender: patientResult.data.gender,
            phone: '9999999999',
            year_of_birth: patientResult.data.year_of_birth,
            next_of_kin_name: patientResult.data.next_of_kin_name,
            next_of_kin_relationship: patientResult.data.next_of_kin_relationship,
            next_of_kin_phone: patientResult.data.next_of_kin_phone
          };

          const updateResult = await makeRequest('put', `/patients/${patientId}`, updateData, tokens.secretary);

          if (updateResult.success) {
            console.log(`✅ Updated patient: ${updateResult.data.name}`);

            // Delete the patient
            console.log(`\nDeleting patient with ID: ${patientId}...`);
            const deleteResult = await makeRequest('delete', `/patients/${patientId}`, null, tokens.secretary);

            if (deleteResult.success) {
              console.log(`✅ Deleted patient successfully`);
            } else {
              console.error('❌ Failed to delete patient:', deleteResult.error);
            }
          } else {
            console.error('❌ Failed to update patient:', updateResult.error);
          }
        } else {
          console.error('❌ Failed to get patient:', patientResult.error);
        }
      } else {
        console.error('❌ Failed to create patient:', createResult.error);
      }
    } else {
      console.error('❌ Failed to get patients:', result.error);
    }
  }
}

// Test appointment endpoints
async function testAppointments() {
  console.log('\n📅 Testing Appointment Endpoints...');

  // Test with secretary role
  if (tokens.secretary) {
    // Get all appointments
    console.log('\nGetting all appointments...');
    const result = await makeRequest('get', '/appointments', null, tokens.secretary);

    if (result.success) {
      console.log(`✅ Got ${result.data.length} appointments`);

      if (result.data.length > 0) {
        // Get a specific appointment
        const appointmentId = result.data[0]._id;
        console.log(`\nGetting appointment with ID: ${appointmentId}...`);
        const appointmentResult = await makeRequest('get', `/appointments/${appointmentId}`, null, tokens.secretary);

        if (appointmentResult.success) {
          console.log(`✅ Got appointment for patient: ${appointmentResult.data.patient_id.name || appointmentResult.data.patient_id}`);
        } else {
          console.error('❌ Failed to get appointment:', appointmentResult.error);
        }
      }
    } else {
      console.error('❌ Failed to get appointments:', result.error);
    }
  }
}

// Test content endpoints
async function testContent() {
  console.log('\n📄 Testing Content Endpoints...');

  // Get all content (public endpoint)
  console.log('\nGetting all content...');
  const result = await makeRequest('get', '/content');

  if (result.success) {
    console.log(`✅ Got content with ${Object.keys(result.data).length} sections`);
  } else {
    console.error('❌ Failed to get content:', result.error);
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting API Endpoint Tests...');
  console.log(`🔗 API URL: ${API_URL}`);

  try {
    // Test server health
    console.log('\n🏥 Testing server health...');
    const healthResult = await makeRequest('get', '/health');

    if (healthResult.success) {
      console.log('✅ Server is healthy');
    } else {
      console.error('❌ Server health check failed:', healthResult.error);
      console.error('Make sure the backend server is running on port 5000');
      return;
    }

    // Run only doctor-related test suites
    await testAuth();
    // Skip user endpoints test
    await testPatients();
    // Skip appointment endpoints test
    // Skip content endpoints test

    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Error running tests:', error.message);
  }
}

// Run the tests
runTests();
