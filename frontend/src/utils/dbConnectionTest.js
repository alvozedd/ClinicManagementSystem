/**
 * Utility to test database connection
 */

/**
 * Tests the connection to the database
 * @returns {Promise<Object>} - Object with status and details about the connection
 */
export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');

    // Try multiple endpoints to test connection
    const endpoints = [
      // Production endpoints
      'https://clinicmanagementsystem-production-081b.up.railway.app/api/health',
      'https://clinicmanagementsystem-production-081b.up.railway.app/health',
      // Environment variable endpoint
      import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/health` : null,
      // Local development endpoint
      'http://localhost:5000/api/health',
      'http://localhost:5000/health'
    ].filter(Boolean); // Remove null values

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying health check at: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-cache',
          mode: 'cors',
          credentials: 'omit',
          timeout: 5000 // 5 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Database connection successful:', data);
          return {
            status: 'ok',
            message: data.message || 'Connected to database',
            timestamp: data.timestamp || new Date().toISOString(),
            endpoint
          };
        } else {
          console.warn(`Health check failed for ${endpoint} with status: ${response.status}`);
        }
      } catch (error) {
        console.warn(`Health check failed for ${endpoint}:`, error);
      }
    }

    console.error('All database connection tests failed');
    return {
      status: 'error',
      message: 'Failed to connect to database',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error testing database connection:', error);
    return {
      status: 'error',
      message: `Error: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
};

export default {
  testDatabaseConnection
};
