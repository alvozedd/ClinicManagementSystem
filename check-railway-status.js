/**
 * Railway Backend Status Check Script
 * 
 * This script checks the status of the Railway backend.
 * Run with: node check-railway-status.js
 */

const fetch = require('node-fetch');

// Railway backend URL
const RAILWAY_URL = 'https://clinicmanagementsystem-production-081b.up.railway.app';

// Endpoints to check
const endpoints = [
  '/',
  '/health',
  '/api/health'
];

// Check each endpoint
async function checkEndpoints() {
  console.log('Checking Railway backend status...');
  console.log(`Base URL: ${RAILWAY_URL}`);

  for (const endpoint of endpoints) {
    const url = `${RAILWAY_URL}${endpoint}`;
    console.log(`\nChecking endpoint: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        },
        timeout: 10000 // 10 seconds timeout
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
}

// Run the check
checkEndpoints().catch(error => {
  console.error('Unhandled error:', error);
});
