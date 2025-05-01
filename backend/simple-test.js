/**
 * Simple test script to check Railway backend connection
 */

// Use built-in fetch API in Node.js
async function testEndpoint(url) {
  try {
    console.log(`Testing endpoint: ${url}`);
    const response = await fetch(url);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`✅ Success - Status: ${response.status}`);
        console.log('Response:', JSON.stringify(data).substring(0, 100) + '...');
      } else {
        const text = await response.text();
        console.log(`✅ Success - Status: ${response.status}`);
        console.log('Response:', text.substring(0, 100) + '...');
      }
      return true;
    } else {
      console.error(`❌ Failed - Status: ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText.substring(0, 200));
      return false;
    }
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('=== TESTING RAILWAY BACKEND ===');
  
  // Test the root endpoint
  const rootSuccess = await testEndpoint('https://clinicmanagementsystem-production-081b.up.railway.app/');
  
  // Test the health endpoint
  const healthSuccess = await testEndpoint('https://clinicmanagementsystem-production-081b.up.railway.app/api/health');
  
  // Test the patients endpoint
  const patientsSuccess = await testEndpoint('https://clinicmanagementsystem-production-081b.up.railway.app/patients');
  
  console.log('\n=== TEST RESULTS ===');
  console.log(`Root Endpoint: ${rootSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Health Endpoint: ${healthSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Patients Endpoint: ${patientsSuccess ? '✅ PASS' : '❌ FAIL'}`);
  
  const overallResult = rootSuccess && healthSuccess && patientsSuccess;
  console.log(`\nOverall Result: ${overallResult ? '✅ PASS' : '❌ FAIL'}`);
}

// Run the tests
runTests();
