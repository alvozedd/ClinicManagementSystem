const fetch = require('node-fetch');

async function testRailway() {
  try {
    console.log('Testing Railway server...');
    
    // Test the root endpoint
    try {
      console.log('\nTesting root endpoint...');
      const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app');
      console.log('Response status:', response.status);
      if (response.ok) {
        const text = await response.text();
        console.log('Response text:', text);
      } else {
        console.log('Response text:', await response.text());
      }
    } catch (error) {
      console.error('Error testing root endpoint:', error);
    }
    
    // Test the login endpoint with OPTIONS request
    try {
      console.log('\nTesting login endpoint with OPTIONS request...');
      const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app/users/login', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://urohealthltd.netlify.app',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      console.log('Response status:', response.status);
      console.log('Response headers:');
      for (const [key, value] of response.headers.entries()) {
        console.log(`  ${key}: ${value}`);
      }
    } catch (error) {
      console.error('Error testing OPTIONS request:', error);
    }
    
    // Test the login endpoint with POST request
    try {
      console.log('\nTesting login endpoint with POST request...');
      const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://urohealthltd.netlify.app'
        },
        body: JSON.stringify({
          username: 'admin@urohealth.com',
          password: 'admin123'
        })
      });
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
      } else {
        console.log('Response text:', await response.text());
      }
    } catch (error) {
      console.error('Error testing POST request:', error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testRailway();
