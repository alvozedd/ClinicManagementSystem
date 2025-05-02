/**
 * CORS Test Script
 * 
 * This script tests the CORS configuration of the backend API.
 * Run with: node test-cors.js
 */

const axios = require('axios');

// Base URL for API requests
const API_URL = 'https://clinicmanagementsystem-production-081b.up.railway.app';

// Test login credentials
const testCredentials = {
  username: 'secretary@urohealth.com',
  password: 'secretary123'
};

// Test CORS configuration
async function testCORS() {
  console.log('Testing CORS configuration...');
  
  try {
    // Test login endpoint
    console.log('Testing login endpoint...');
    const loginResponse = await axios({
      method: 'post',
      url: `${API_URL}/users/login`,
      data: testCredentials,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://urohealthltd.netlify.app'
      },
      withCredentials: true
    });
    
    console.log('Login response:', loginResponse.status);
    console.log('Login headers:', loginResponse.headers);
    
    if (loginResponse.status === 200) {
      console.log('Login successful!');
      console.log('User data:', loginResponse.data);
      
      // Extract token
      const token = loginResponse.data.token;
      
      // Test protected endpoint
      console.log('\nTesting protected endpoint...');
      const patientsResponse = await axios({
        method: 'get',
        url: `${API_URL}/patients`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Origin': 'https://urohealthltd.netlify.app'
        },
        withCredentials: true
      });
      
      console.log('Patients response:', patientsResponse.status);
      console.log('Number of patients:', patientsResponse.data.length);
      
      console.log('\nCORS configuration is working correctly!');
    } else {
      console.error('Login failed with status:', loginResponse.status);
    }
  } catch (error) {
    console.error('CORS test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run the test
testCORS();
