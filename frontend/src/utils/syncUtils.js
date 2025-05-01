// Utility functions for synchronizing data between frontend and backend

import apiService from './apiService';
import { transformPatientFromBackend, transformAppointmentFromBackend } from './dataTransformers';

/**
 * Synchronizes local patient data with the backend
 * @param {Array} localPatients - Array of patient objects from local state
 * @returns {Promise<Array>} - Updated array of patient objects
 */
export const syncPatients = async (localPatients = []) => {
  try {
    console.log('Syncing patients with backend...');
    
    // Fetch patients from backend
    const backendPatients = await apiService.getPatients();
    console.log(`Fetched ${backendPatients.length} patients from backend`);
    
    // Transform backend patients to frontend format
    const transformedBackendPatients = backendPatients.map(patient => 
      transformPatientFromBackend(patient)
    );
    
    // If we have no local patients, just return the backend patients
    if (!localPatients || localPatients.length === 0) {
      console.log('No local patients, using backend patients only');
      return transformedBackendPatients;
    }
    
    // Merge local and backend patients
    // Strategy: Use backend patients as base, but keep any local patients that don't exist in backend
    const mergedPatients = [...transformedBackendPatients];
    
    // Find local patients that don't exist in backend (temporary patients)
    const tempPatients = localPatients.filter(localPatient => 
      localPatient._isTemporary && 
      !transformedBackendPatients.some(backendPatient => 
        backendPatient._id === localPatient._id || 
        (backendPatient.phone === localPatient.phone && 
         backendPatient.name === `${localPatient.firstName} ${localPatient.lastName}`)
      )
    );
    
    // Add temporary patients to merged list
    if (tempPatients.length > 0) {
      console.log(`Adding ${tempPatients.length} temporary patients to merged list`);
      mergedPatients.push(...tempPatients);
    }
    
    console.log(`Sync complete. Total patients: ${mergedPatients.length}`);
    return mergedPatients;
  } catch (error) {
    console.error('Error syncing patients:', error);
    // Return original local patients if sync fails
    return localPatients;
  }
};

/**
 * Synchronizes local appointment data with the backend
 * @param {Array} localAppointments - Array of appointment objects from local state
 * @returns {Promise<Array>} - Updated array of appointment objects
 */
export const syncAppointments = async (localAppointments = []) => {
  try {
    console.log('Syncing appointments with backend...');
    
    // Fetch appointments from backend
    const backendAppointments = await apiService.getAppointments();
    console.log(`Fetched ${backendAppointments.length} appointments from backend`);
    
    // Transform backend appointments to frontend format
    const transformedBackendAppointments = backendAppointments.map(appointment => 
      transformAppointmentFromBackend(appointment)
    );
    
    // If we have no local appointments, just return the backend appointments
    if (!localAppointments || localAppointments.length === 0) {
      console.log('No local appointments, using backend appointments only');
      return transformedBackendAppointments;
    }
    
    // Merge local and backend appointments
    // Strategy: Use backend appointments as base, but keep any local appointments that don't exist in backend
    const mergedAppointments = [...transformedBackendAppointments];
    
    // Find local appointments that don't exist in backend (temporary appointments)
    const tempAppointments = localAppointments.filter(localAppointment => 
      localAppointment._isTemporary && 
      !transformedBackendAppointments.some(backendAppointment => 
        backendAppointment._id === localAppointment._id
      )
    );
    
    // Add temporary appointments to merged list
    if (tempAppointments.length > 0) {
      console.log(`Adding ${tempAppointments.length} temporary appointments to merged list`);
      mergedAppointments.push(...tempAppointments);
    }
    
    console.log(`Sync complete. Total appointments: ${mergedAppointments.length}`);
    return mergedAppointments;
  } catch (error) {
    console.error('Error syncing appointments:', error);
    // Return original local appointments if sync fails
    return localAppointments;
  }
};

/**
 * Attempts to push temporary patients to the backend
 * @param {Array} patients - Array of patient objects
 * @returns {Promise<Array>} - Updated array of patient objects with temporary patients pushed to backend
 */
export const pushTemporaryPatients = async (patients = []) => {
  if (!patients || patients.length === 0) return patients;
  
  const tempPatients = patients.filter(patient => patient._isTemporary);
  if (tempPatients.length === 0) return patients;
  
  console.log(`Attempting to push ${tempPatients.length} temporary patients to backend`);
  
  const updatedPatients = [...patients];
  
  for (const tempPatient of tempPatients) {
    try {
      // Prepare patient data for backend
      const patientData = {
        name: `${tempPatient.firstName} ${tempPatient.lastName}`,
        gender: tempPatient.gender,
        phone: tempPatient.phone,
        year_of_birth: tempPatient.yearOfBirth || tempPatient.year_of_birth,
        next_of_kin_name: tempPatient.nextOfKinName || tempPatient.next_of_kin_name,
        next_of_kin_relationship: tempPatient.nextOfKinRelationship || tempPatient.next_of_kin_relationship,
        next_of_kin_phone: tempPatient.nextOfKinPhone || tempPatient.next_of_kin_phone,
        createdBy: tempPatient.createdBy || 'doctor'
      };
      
      // Push to backend
      const result = await apiService.createPatient(patientData);
      
      if (result && result._id) {
        console.log(`Successfully pushed temporary patient to backend: ${result._id}`);
        
        // Replace temporary patient with backend patient
        const index = updatedPatients.findIndex(p => p._id === tempPatient._id);
        if (index !== -1) {
          updatedPatients[index] = transformPatientFromBackend(result);
        }
      }
    } catch (error) {
      console.error(`Failed to push temporary patient ${tempPatient._id} to backend:`, error);
    }
  }
  
  return updatedPatients;
};

/**
 * Attempts to push temporary appointments to the backend
 * @param {Array} appointments - Array of appointment objects
 * @returns {Promise<Array>} - Updated array of appointment objects with temporary appointments pushed to backend
 */
export const pushTemporaryAppointments = async (appointments = []) => {
  if (!appointments || appointments.length === 0) return appointments;
  
  const tempAppointments = appointments.filter(appointment => appointment._isTemporary);
  if (tempAppointments.length === 0) return appointments;
  
  console.log(`Attempting to push ${tempAppointments.length} temporary appointments to backend`);
  
  const updatedAppointments = [...appointments];
  
  for (const tempAppointment of tempAppointments) {
    try {
      // Prepare appointment data for backend
      const appointmentData = {
        patient_id: tempAppointment.patient_id || tempAppointment.patientId,
        appointment_date: tempAppointment.appointment_date || tempAppointment.date,
        optional_time: tempAppointment.optional_time || tempAppointment.time || '10:00',
        status: tempAppointment.status || 'Scheduled',
        type: tempAppointment.type || 'Consultation',
        reason: tempAppointment.reason || '',
        createdBy: tempAppointment.createdBy || 'doctor'
      };
      
      // Push to backend
      const result = await apiService.createAppointment(appointmentData);
      
      if (result && result._id) {
        console.log(`Successfully pushed temporary appointment to backend: ${result._id}`);
        
        // Replace temporary appointment with backend appointment
        const index = updatedAppointments.findIndex(a => a._id === tempAppointment._id);
        if (index !== -1) {
          updatedAppointments[index] = transformAppointmentFromBackend(result);
        }
      }
    } catch (error) {
      console.error(`Failed to push temporary appointment ${tempAppointment._id} to backend:`, error);
    }
  }
  
  return updatedAppointments;
};

export default {
  syncPatients,
  syncAppointments,
  pushTemporaryPatients,
  pushTemporaryAppointments
};
