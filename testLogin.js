const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login with API path...');
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin@urohealth.com',
          password: 'admin123',
        }),
      });
      
      console.log('API path response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('API path response data:', data);
      } else {
        console.log('API path response text:', await response.text());
      }
    } catch (apiPathError) {
      console.error('API path error:', apiPathError);
      
      console.log('\nTesting login with non-API path...');
      try {
        const response = await fetch('http://localhost:5000/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'admin@urohealth.com',
            password: 'admin123',
          }),
        });
        
        console.log('Non-API path response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Non-API path response data:', data);
        } else {
          console.log('Non-API path response text:', await response.text());
        }
      } catch (nonApiPathError) {
        console.error('Non-API path error:', nonApiPathError);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();
