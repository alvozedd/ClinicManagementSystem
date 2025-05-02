/**
 * Dashboard Testing Script
 * 
 * This script helps test the functionality of the UroHealth dashboards.
 * Run this in the browser console when on the login page.
 */

// Test database connection
async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    // Try multiple endpoints to test connection
    const endpoints = [
      'https://clinicmanagementsystem-production-081b.up.railway.app/health',
      'https://clinicmanagementsystem-production-081b.up.railway.app/api/health',
      '/health',
      '/api/health'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying health check at: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          cache: 'no-cache',
          mode: 'cors'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Database connection successful:', data);
          return { success: true, data };
        }
      } catch (error) {
        console.warn(`Health check failed for ${endpoint}:`, error);
      }
    }
    
    console.error('❌ All database connection tests failed');
    return { success: false, error: 'All connection attempts failed' };
  } catch (error) {
    console.error('❌ Error testing database connection:', error);
    return { success: false, error };
  }
}

// Get test users
async function getTestUsers() {
  console.log('Fetching test users...');
  
  try {
    // Try multiple endpoints to get test users
    const endpoints = [
      'https://clinicmanagementsystem-production-081b.up.railway.app/test-users',
      'https://clinicmanagementsystem-production-081b.up.railway.app/api/test-users',
      '/test-users',
      '/api/test-users'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying to fetch test users from: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          cache: 'no-cache',
          mode: 'cors'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Test users fetched successfully:', data);
          return { success: true, users: data };
        }
      } catch (error) {
        console.warn(`Failed to fetch test users from ${endpoint}:`, error);
      }
    }
    
    console.error('❌ Failed to fetch test users from all endpoints');
    return { success: false, users: [] };
  } catch (error) {
    console.error('❌ Error fetching test users:', error);
    return { success: false, users: [] };
  }
}

// Test login with credentials
async function testLogin(username, password) {
  console.log(`Testing login with username: ${username}`);
  
  try {
    // Try multiple endpoints for login
    const endpoints = [
      'https://clinicmanagementsystem-production-081b.up.railway.app/users/login',
      'https://clinicmanagementsystem-production-081b.up.railway.app/api/users/login',
      '/users/login',
      '/api/users/login'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying login at: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify({ username, password }),
          cache: 'no-cache',
          mode: 'cors'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Login successful:', data);
          return { success: true, userData: data };
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.warn(`Login failed at ${endpoint} with status ${response.status}:`, errorData);
        }
      } catch (error) {
        console.warn(`Login request failed for ${endpoint}:`, error);
      }
    }
    
    console.error('❌ All login attempts failed');
    return { success: false, error: 'All login attempts failed' };
  } catch (error) {
    console.error('❌ Error during login test:', error);
    return { success: false, error };
  }
}

// Run all tests
async function runAllTests() {
  console.log('🔍 Starting dashboard tests...');
  
  // Test database connection
  const connectionResult = await testDatabaseConnection();
  console.log(`Database connection test: ${connectionResult.success ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  // Get test users
  const usersResult = await getTestUsers();
  console.log(`Test users fetch: ${usersResult.success ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  // Test login for each user role
  if (usersResult.success && usersResult.users.length > 0) {
    for (const user of usersResult.users) {
      const loginResult = await testLogin(user.username, user.password);
      console.log(`Login test for ${user.username} (${user.role}): ${loginResult.success ? 'PASSED ✅' : 'FAILED ❌'}`);
      
      if (loginResult.success) {
        console.log(`User data for ${user.username}:`, loginResult.userData);
      }
    }
  } else {
    // Test with default credentials
    const defaultUsers = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'doctor', password: 'doctor123', role: 'doctor' },
      { username: 'secretary', password: 'secretary123', role: 'secretary' }
    ];
    
    for (const user of defaultUsers) {
      const loginResult = await testLogin(user.username, user.password);
      console.log(`Login test for ${user.username} (${user.role}): ${loginResult.success ? 'PASSED ✅' : 'FAILED ❌'}`);
      
      if (loginResult.success) {
        console.log(`User data for ${user.username}:`, loginResult.userData);
      }
    }
  }
  
  console.log('🏁 All tests completed');
}

// Function to fill login form and submit
function fillLoginForm(username, password) {
  // Find the username and password inputs
  const usernameInput = document.querySelector('input[name="username"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const submitButton = document.querySelector('button[type="submit"]');
  
  if (usernameInput && passwordInput && submitButton) {
    // Fill the form
    usernameInput.value = username;
    passwordInput.value = password;
    
    // Trigger input events to ensure React state is updated
    usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Submit the form
    submitButton.click();
    
    return true;
  } else {
    console.error('Could not find login form elements');
    return false;
  }
}

// Export functions for use in browser console
window.dashboardTests = {
  testDatabaseConnection,
  getTestUsers,
  testLogin,
  runAllTests,
  fillLoginForm
};

console.log('Dashboard test utilities loaded. Use window.dashboardTests to access the test functions.');
