/**
 * Login Test Script
 * 
 * This script tests the login functionality by making direct API calls.
 * Run with: node test-login.js
 */

const fetch = require('node-fetch');

// Test credentials
const testCredentials = {
  username: 'mbugua_pm', // or 'secretary@urohealth.com'
  password: 'doctor123'  // or 'secretary123'
};

// API endpoints to try
const endpoints = [
  'https://clinicmanagementsystem-production-081b.up.railway.app/api/users/login',
  'https://clinicmanagementsystem-production-081b.up.railway.app/users/login',
  'http://localhost:5000/api/users/login'
];

// Test login with each endpoint
async function testLogin() {
  console.log('Testing login functionality...');
  console.log(`Using credentials: username=${testCredentials.username}, password=****`);

  for (const endpoint of endpoints) {
    console.log(`\nTrying endpoint: ${endpoint}`);
    
    try {
      // First try with credentials: include
      console.log('  With credentials: include');
      const response1 = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(testCredentials),
        credentials: 'include'
      });

      if (response1.ok) {
        const data = await response1.json();
        console.log('  ✅ Login successful!');
        console.log('  Response:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
        return;
      } else {
        console.log(`  ❌ Login failed with status: ${response1.status}`);
        try {
          const errorText = await response1.text();
          console.log(`  Error: ${errorText}`);
        } catch (e) {
          console.log('  Could not read error text');
        }
      }

      // Then try with credentials: omit
      console.log('  With credentials: omit');
      const response2 = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(testCredentials),
        credentials: 'omit'
      });

      if (response2.ok) {
        const data = await response2.json();
        console.log('  ✅ Login successful!');
        console.log('  Response:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
        return;
      } else {
        console.log(`  ❌ Login failed with status: ${response2.status}`);
        try {
          const errorText = await response2.text();
          console.log(`  Error: ${errorText}`);
        } catch (e) {
          console.log('  Could not read error text');
        }
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n❌ All login attempts failed');
}

// Run the test
testLogin().catch(error => {
  console.error('Unhandled error:', error);
});
