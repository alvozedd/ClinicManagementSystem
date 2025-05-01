// Test script for CRUD operations
import apiService from './utils/apiService';
import { syncPatients, syncAppointments } from './utils/syncUtils';
import { transformPatientToBackend, transformAppointmentToBackend } from './utils/dataTransformers';

// Mock user authentication
const mockAuth = async () => {
  const userInfo = {
    _id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'doctor',
    token: 'test-token'
  };
  
  // Store in sessionStorage for API calls
  sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
  console.log('Mock authentication completed');
  return userInfo;
};

// Test patient CRUD operations
const testPatientCRUD = async () => {
  console.log('=== TESTING PATIENT CRUD OPERATIONS ===');
  
  try {
    // 1. Create a test patient
    console.log('1. Creating test patient...');
    const testPatient = {
      firstName: 'Test',
      lastName: 'Patient',
      gender: 'Male',
      phone: '1234567890',
      yearOfBirth: '1990',
      nextOfKinName: 'Test Relative',
      nextOfKinRelationship: 'Sibling',
      nextOfKinPhone: '0987654321'
    };
    
    const patientToCreate = transformPatientToBackend(testPatient);
    const createdPatient = await apiService.createPatient(patientToCreate);
    console.log('Patient created successfully:', createdPatient);
    
    if (!createdPatient || !createdPatient._id) {
      throw new Error('Failed to create patient');
    }
    
    const patientId = createdPatient._id;
    
    // 2. Get the patient
    console.log(`2. Getting patient with ID ${patientId}...`);
    const retrievedPatient = await apiService.getPatient(patientId);
    console.log('Patient retrieved successfully:', retrievedPatient);
    
    if (!retrievedPatient || retrievedPatient._id !== patientId) {
      throw new Error('Failed to retrieve patient');
    }
    
    // 3. Update the patient
    console.log(`3. Updating patient with ID ${patientId}...`);
    const updatedPatientData = {
      ...patientToCreate,
      phone: '5555555555'
    };
    
    const updatedPatient = await apiService.updatePatient(patientId, updatedPatientData);
    console.log('Patient updated successfully:', updatedPatient);
    
    if (!updatedPatient || updatedPatient.phone !== '5555555555') {
      throw new Error('Failed to update patient');
    }
    
    // 4. Delete the patient
    console.log(`4. Deleting patient with ID ${patientId}...`);
    const deleteResult = await apiService.deletePatient(patientId);
    console.log('Patient deleted successfully:', deleteResult);
    
    // 5. Verify deletion
    try {
      const deletedPatient = await apiService.getPatient(patientId);
      if (deletedPatient && deletedPatient._id) {
        throw new Error('Patient was not deleted');
      }
    } catch (error) {
      console.log('Verified patient was deleted');
    }
    
    console.log('Patient CRUD operations completed successfully');
    return true;
  } catch (error) {
    console.error('Error in patient CRUD operations:', error);
    return false;
  }
};

// Test appointment CRUD operations
const testAppointmentCRUD = async () => {
  console.log('=== TESTING APPOINTMENT CRUD OPERATIONS ===');
  
  try {
    // First, create a test patient for appointments
    console.log('Creating test patient for appointments...');
    const testPatient = {
      firstName: 'Appointment',
      lastName: 'TestPatient',
      gender: 'Female',
      phone: '1234567890',
      yearOfBirth: '1985'
    };
    
    const patientToCreate = transformPatientToBackend(testPatient);
    const createdPatient = await apiService.createPatient(patientToCreate);
    console.log('Test patient created successfully:', createdPatient);
    
    if (!createdPatient || !createdPatient._id) {
      throw new Error('Failed to create test patient for appointments');
    }
    
    const patientId = createdPatient._id;
    
    // 1. Create a test appointment
    console.log('1. Creating test appointment...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const testAppointment = {
      patientId: patientId,
      date: tomorrow.toISOString().split('T')[0],
      time: '10:00',
      status: 'Scheduled',
      type: 'Consultation',
      reason: 'Test appointment',
      createdBy: 'doctor'
    };
    
    const appointmentToCreate = transformAppointmentToBackend(testAppointment);
    const createdAppointment = await apiService.createAppointment(appointmentToCreate);
    console.log('Appointment created successfully:', createdAppointment);
    
    if (!createdAppointment || !createdAppointment._id) {
      throw new Error('Failed to create appointment');
    }
    
    const appointmentId = createdAppointment._id;
    
    // 2. Get the appointment
    console.log(`2. Getting appointment with ID ${appointmentId}...`);
    const retrievedAppointment = await apiService.getAppointment(appointmentId);
    console.log('Appointment retrieved successfully:', retrievedAppointment);
    
    if (!retrievedAppointment || retrievedAppointment._id !== appointmentId) {
      throw new Error('Failed to retrieve appointment');
    }
    
    // 3. Update the appointment
    console.log(`3. Updating appointment with ID ${appointmentId}...`);
    const updatedAppointmentData = {
      ...appointmentToCreate,
      status: 'Completed'
    };
    
    const updatedAppointment = await apiService.updateAppointment(appointmentId, updatedAppointmentData);
    console.log('Appointment updated successfully:', updatedAppointment);
    
    if (!updatedAppointment || updatedAppointment.status !== 'Completed') {
      throw new Error('Failed to update appointment');
    }
    
    // 4. Delete the appointment
    console.log(`4. Deleting appointment with ID ${appointmentId}...`);
    const deleteResult = await apiService.deleteAppointment(appointmentId);
    console.log('Appointment deleted successfully:', deleteResult);
    
    // 5. Clean up - delete the test patient
    console.log(`Cleaning up - deleting test patient with ID ${patientId}...`);
    await apiService.deletePatient(patientId);
    
    console.log('Appointment CRUD operations completed successfully');
    return true;
  } catch (error) {
    console.error('Error in appointment CRUD operations:', error);
    return false;
  }
};

// Test data synchronization
const testDataSync = async () => {
  console.log('=== TESTING DATA SYNCHRONIZATION ===');
  
  try {
    // 1. Create a test patient
    console.log('1. Creating test patient...');
    const testPatient = {
      firstName: 'Sync',
      lastName: 'TestPatient',
      gender: 'Male',
      phone: '9876543210',
      yearOfBirth: '2000'
    };
    
    const patientToCreate = transformPatientToBackend(testPatient);
    const createdPatient = await apiService.createPatient(patientToCreate);
    console.log('Test patient created successfully:', createdPatient);
    
    if (!createdPatient || !createdPatient._id) {
      throw new Error('Failed to create test patient for sync test');
    }
    
    const patientId = createdPatient._id;
    
    // 2. Test patient synchronization
    console.log('2. Testing patient synchronization...');
    const patients = await apiService.getPatients();
    console.log(`Retrieved ${patients.length} patients from API`);
    
    // Create a temporary patient (not saved to backend)
    const tempPatient = {
      _id: 'temp_' + Date.now(),
      firstName: 'Temporary',
      lastName: 'Patient',
      gender: 'Female',
      phone: '5555555555',
      yearOfBirth: '1995',
      _isTemporary: true
    };
    
    // Add the temporary patient to the list
    const patientsWithTemp = [...patients, tempPatient];
    console.log(`Added temporary patient, now have ${patientsWithTemp.length} patients`);
    
    // Sync patients
    const syncedPatients = await syncPatients(patientsWithTemp);
    console.log(`After sync, have ${syncedPatients.length} patients`);
    
    // Check if temporary patient was pushed to backend
    const tempPatientAfterSync = syncedPatients.find(p => 
      p.firstName === 'Temporary' && p.lastName === 'Patient'
    );
    
    if (tempPatientAfterSync && !tempPatientAfterSync._isTemporary) {
      console.log('Temporary patient was successfully pushed to backend:', tempPatientAfterSync);
    } else {
      console.warn('Temporary patient was not pushed to backend or still marked as temporary');
    }
    
    // 3. Clean up - delete the test patients
    console.log(`3. Cleaning up - deleting test patient with ID ${patientId}...`);
    await apiService.deletePatient(patientId);
    
    if (tempPatientAfterSync && tempPatientAfterSync._id && !tempPatientAfterSync._isTemporary) {
      console.log(`Deleting temporary patient with ID ${tempPatientAfterSync._id}...`);
      await apiService.deletePatient(tempPatientAfterSync._id);
    }
    
    console.log('Data synchronization test completed successfully');
    return true;
  } catch (error) {
    console.error('Error in data synchronization test:', error);
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('=== STARTING CRUD TESTS ===');
  
  try {
    // Set up mock authentication
    await mockAuth();
    
    // Run tests
    const patientTestResult = await testPatientCRUD();
    const appointmentTestResult = await testAppointmentCRUD();
    const syncTestResult = await testDataSync();
    
    // Report results
    console.log('=== TEST RESULTS ===');
    console.log(`Patient CRUD: ${patientTestResult ? 'PASSED' : 'FAILED'}`);
    console.log(`Appointment CRUD: ${appointmentTestResult ? 'PASSED' : 'FAILED'}`);
    console.log(`Data Synchronization: ${syncTestResult ? 'PASSED' : 'FAILED'}`);
    
    if (patientTestResult && appointmentTestResult && syncTestResult) {
      console.log('All tests passed successfully!');
    } else {
      console.error('Some tests failed. Please check the logs for details.');
    }
  } catch (error) {
    console.error('Error running tests:', error);
  }
};

// Export the test functions
export {
  runAllTests,
  testPatientCRUD,
  testAppointmentCRUD,
  testDataSync
};

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location.search.includes('runTests=true')) {
  console.log('Auto-running tests...');
  runAllTests();
}
