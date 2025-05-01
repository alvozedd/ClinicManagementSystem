/**
 * Test script to verify the backend server is running correctly
 * Run this script with: node test-server.js
 */

const fetch = require('node-fetch');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define the endpoints to test
const endpoints = [
  { url: 'https://clinicmanagementsystem-production-081b.up.railway.app/', method: 'GET', name: 'Root endpoint' },
  { url: 'https://clinicmanagementsystem-production-081b.up.railway.app/api/status', method: 'GET', name: 'Status endpoint' },
  { url: 'https://clinicmanagementsystem-production-081b.up.railway.app/api/health', method: 'GET', name: 'Health endpoint' },
  { url: 'https://clinicmanagementsystem-production-081b.up.railway.app/patients', method: 'GET', name: 'Patients endpoint' },
  { url: 'https://clinicmanagementsystem-production-081b.up.railway.app/appointments', method: 'GET', name: 'Appointments endpoint' }
];

// Test MongoDB connection
async function testMongoDBConnection() {
  console.log('\n--- Testing MongoDB Connection ---');
  
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://clinic_admin:adminMuchai123@cluster0.jrm4jes.mongodb.net/clinic_management?retryWrites=true&w=majority';
    console.log(`Connecting to MongoDB: ${mongoURI.substring(0, 20)}...`);
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connection successful');
    console.log(`Connected to: ${mongoose.connection.host}`);
    console.log(`Database name: ${mongoose.connection.name}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Collections: ${collections.map(c => c.name).join(', ')}`);
    
    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

// Test API endpoints
async function testEndpoints() {
  console.log('\n--- Testing API Endpoints ---');
  
  let allSuccessful = true;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}: ${endpoint.url}`);
      
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        let responseData;
        
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
          console.log(`✅ ${endpoint.name} - Status: ${response.status} - Response:`, JSON.stringify(responseData).substring(0, 100) + '...');
        } else {
          responseData = await response.text();
          console.log(`✅ ${endpoint.name} - Status: ${response.status} - Response:`, responseData.substring(0, 100) + '...');
        }
      } else {
        allSuccessful = false;
        console.error(`❌ ${endpoint.name} - Status: ${response.status}`);
        const errorText = await response.text();
        console.error('Error response:', errorText.substring(0, 200));
      }
    } catch (error) {
      allSuccessful = false;
      console.error(`❌ ${endpoint.name} - Error:`, error.message);
    }
    
    console.log('---');
  }
  
  return allSuccessful;
}

// Test POST request to create a patient
async function testCreatePatient() {
  console.log('\n--- Testing Patient Creation ---');
  
  try {
    const patientData = {
      name: 'Test Patient ' + Date.now(),
      gender: 'Male',
      phone: '1234567890',
      year_of_birth: '1980',
      next_of_kin_name: 'Test Relative',
      next_of_kin_relationship: 'Sibling',
      next_of_kin_phone: '0987654321',
      createdBy: 'visitor'
    };
    
    console.log('Creating test patient with data:', patientData);
    
    const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    });
    
    if (response.ok) {
      const createdPatient = await response.json();
      console.log('✅ Patient creation successful - Response:', JSON.stringify(createdPatient).substring(0, 100) + '...');
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Patient creation failed - Status: ${response.status}`);
      console.error('Error response:', errorText.substring(0, 200));
      return false;
    }
  } catch (error) {
    console.error('❌ Patient creation error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('=== BACKEND SERVER TEST SCRIPT ===');
  console.log('Testing connection to Railway deployment');
  
  const dbSuccess = await testMongoDBConnection();
  const endpointsSuccess = await testEndpoints();
  const createPatientSuccess = await testCreatePatient();
  
  console.log('\n=== TEST RESULTS ===');
  console.log(`MongoDB Connection: ${dbSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Endpoints: ${endpointsSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Patient Creation: ${createPatientSuccess ? '✅ PASS' : '❌ FAIL'}`);
  
  const overallResult = dbSuccess && endpointsSuccess && createPatientSuccess;
  console.log(`\nOverall Result: ${overallResult ? '✅ PASS' : '❌ FAIL'}`);
  
  process.exit(overallResult ? 0 : 1);
}

// Run the tests
runTests();
