/**
 * CORS Fix Test Script
 * 
 * This script tests the CORS configuration after our fixes.
 * Run with: node test-cors-fix.js
 */

const fetch = require('node-fetch');

// Base URL for API requests
const RAILWAY_URL = 'https://clinicmanagementsystem-production-081b.up.railway.app';
const NETLIFY_URL = 'https://urohealthltd.netlify.app';

// Test health endpoint
async function testHealthEndpoint() {
  console.log('Testing health endpoint...');
  
  try {
    const response = await fetch(`${RAILWAY_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': NETLIFY_URL,
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:');
    response.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
      return true;
    } else {
      console.error('Health check failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error testing health endpoint:', error);
    return false;
  }
}

// Test login endpoint
async function testLoginEndpoint() {
  console.log('\nTesting login endpoint...');
  
  try {
    const response = await fetch(`${RAILWAY_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': NETLIFY_URL,
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        username: 'secretary@urohealth.com',
        password: 'secretary123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:');
    response.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Login successful!');
      console.log('User role:', data.role);
      return true;
    } else {
      console.error('Login failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error testing login endpoint:', error);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('=== CORS Fix Test ===');
  console.log('Railway URL:', RAILWAY_URL);
  console.log('Netlify URL:', NETLIFY_URL);
  console.log('=====================\n');
  
  const healthResult = await testHealthEndpoint();
  const loginResult = await testLoginEndpoint();
  
  console.log('\n=== Test Results ===');
  console.log('Health endpoint:', healthResult ? 'PASS' : 'FAIL');
  console.log('Login endpoint:', loginResult ? 'PASS' : 'FAIL');
  console.log('===================');
}

runTests();
