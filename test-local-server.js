/**
 * Local Server Test Script
 * 
 * This script tests the local server.
 * Run with: node test-local-server.js
 */

const fetch = require('node-fetch');

// Local server URL
const LOCAL_URL = 'http://localhost:5000';

// Endpoints to check
const endpoints = [
  '/',
  '/health',
  '/api/health'
];

// Test credentials
const testCredentials = {
  username: 'mbugua_pm', // or 'secretary@urohealth.com'
  password: 'doctor123'  // or 'secretary123'
};

// Check each endpoint
async function checkEndpoints() {
  console.log('Checking local server status...');
  console.log(`Base URL: ${LOCAL_URL}`);

  for (const endpoint of endpoints) {
    const url = `${LOCAL_URL}${endpoint}`;
    console.log(`\nChecking endpoint: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('Response:', JSON.stringify(data, null, 2));
          } else {
            const text = await response.text();
            console.log('Response:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
          }
        } catch (e) {
          console.log('Error parsing response:', e.message);
        }
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }

  // Test login
  console.log('\nTesting login...');
  try {
    const response = await fetch(`${LOCAL_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(testCredentials)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Login successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      try {
        const errorText = await response.text();
        console.log(`Login failed: ${errorText}`);
      } catch (e) {
        console.log('Could not read error text');
      }
    }
  } catch (error) {
    console.log(`Login error: ${error.message}`);
  }
}

// Run the check
checkEndpoints().catch(error => {
  console.error('Unhandled error:', error);
});
