// Utility functions for synchronizing data between frontend and backend

import apiService from './apiService';
import authUtils from './authUtils';
import { transformPatientFromBackend, transformAppointmentFromBackend } from './dataTransformers';

/**
 * Synchronizes local patient data with the backend
 * @param {Array} localPatients - Array of patient objects from local state
 * @returns {Promise<Array>} - Updated array of patient objects
 */
export const syncPatients = async (localPatients = []) => {
  try {
    console.log('Syncing patients with backend...');

    // First, try to push any temporary patients to the backend
    if (localPatients && localPatients.length > 0) {
      const tempPatients = localPatients.filter(p => p._isTemporary);
      if (tempPatients.length > 0) {
        console.log(`Found ${tempPatients.length} temporary patients to push to backend`);
        await pushTemporaryPatients(localPatients);
      }
    }

    // Fetch patients from backend with direct Railway URL to avoid CORS issues
    console.log('Fetching patients directly from Railway backend...');
    try {
      const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app/patients', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...authUtils.getAuthHeaders()
        },
        mode: 'cors',
        cache: 'no-cache'
      });

      if (response.ok) {
        const backendPatients = await response.json();
        console.log(`Successfully fetched ${backendPatients.length} patients directly from Railway`);

        // Transform backend patients to frontend format
        const transformedBackendPatients = backendPatients.map(patient =>
          transformPatientFromBackend(patient)
        );

        console.log(`Sync complete. Total patients: ${transformedBackendPatients.length}`);
        return transformedBackendPatients;
      } else {
        console.error(`Failed to fetch patients directly: ${response.status}`);
        // Fall back to regular API call
      }
    } catch (directError) {
      console.error('Error fetching patients directly:', directError);
      // Fall back to regular API call
    }

    // Regular API call as fallback
    const backendPatients = await apiService.getPatients();
    console.log(`Fetched ${backendPatients.length} patients from backend API`);

    // Transform backend patients to frontend format
    const transformedBackendPatients = backendPatients.map(patient =>
      transformPatientFromBackend(patient)
    );

    console.log(`Sync complete. Total patients: ${transformedBackendPatients.length}`);
    return transformedBackendPatients;
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
        next_of_kin_name: tempPatient.nextOfKinName || tempPatient.next_of_kin_name || 'Not Provided',
        next_of_kin_relationship: tempPatient.nextOfKinRelationship || tempPatient.next_of_kin_relationship || 'Not Provided',
        next_of_kin_phone: tempPatient.nextOfKinPhone || tempPatient.next_of_kin_phone || '0000000000',
        createdBy: tempPatient.createdBy || 'doctor'
      };

      // Try direct Railway URL first
      try {
        console.log('Pushing patient directly to Railway backend...');
        const response = await fetch('https://clinicmanagementsystem-production-081b.up.railway.app/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authUtils.getAuthHeaders()
          },
          body: JSON.stringify(patientData),
          mode: 'cors'
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`Successfully pushed temporary patient to Railway backend: ${result._id}`);

          // Replace temporary patient with backend patient
          const index = updatedPatients.findIndex(p => p._id === tempPatient._id);
          if (index !== -1) {
            updatedPatients[index] = transformPatientFromBackend(result);
          }

          // Continue to next patient
          continue;
        } else {
          console.warn(`Direct push failed with status: ${response.status}`);
          // Fall back to API service
        }
      } catch (directError) {
        console.warn('Direct push failed:', directError);
        // Fall back to API service
      }

      // Fall back to using apiService
      const result = await apiService.createPatient(patientData);

      if (result && result._id) {
        console.log(`Successfully pushed temporary patient to backend via API service: ${result._id}`);

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
