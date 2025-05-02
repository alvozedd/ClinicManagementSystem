/**
 * Utility to test database connection
 */

/**
 * Tests the connection to the database
 * @returns {Promise<boolean>} - True if connection is successful, false otherwise
 */
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Try multiple endpoints to test connection
    const endpoints = [
      'https://clinicmanagementsystem-production-081b.up.railway.app/health',
      'https://clinicmanagementsystem-production-081b.up.railway.app/api/health',
      import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/health` : null,
      'http://localhost:5000/health'
    ].filter(Boolean); // Remove null values
    
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
          console.log('Database connection successful:', data);
          return true;
        }
      } catch (error) {
        console.warn(`Health check failed for ${endpoint}:`, error);
      }
    }
    
    console.error('All database connection tests failed');
    return false;
  } catch (error) {
    console.error('Error testing database connection:', error);
    return false;
  }
};

/**
 * Gets a list of test users from the database
 * @returns {Promise<Array>} - Array of test users or empty array if failed
 */
export const getTestUsers = async () => {
  try {
    console.log('Fetching test users...');
    
    // Try multiple endpoints to get test users
    const endpoints = [
      'https://clinicmanagementsystem-production-081b.up.railway.app/test-users',
      'https://clinicmanagementsystem-production-081b.up.railway.app/api/test-users',
      import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/test-users` : null,
      'http://localhost:5000/test-users'
    ].filter(Boolean); // Remove null values
    
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
          console.log('Test users fetched successfully:', data);
          return data;
        }
      } catch (error) {
        console.warn(`Failed to fetch test users from ${endpoint}:`, error);
      }
    }
    
    console.error('Failed to fetch test users from all endpoints');
    return [];
  } catch (error) {
    console.error('Error fetching test users:', error);
    return [];
  }
};

export default {
  testDatabaseConnection,
  getTestUsers
};
