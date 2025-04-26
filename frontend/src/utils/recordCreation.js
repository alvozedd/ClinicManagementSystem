/**
 * Utility functions for creating patient and appointment records with creator information
 */

/**
 * Create a new patient record with creator information
 * @param {Object} patientData - Basic patient data
 * @param {string} createdBy - Who created the record ('doctor', 'secretary', or 'visitor')
 * @returns {Object} Complete patient object with ID and creator info
 */
export const createPatientRecord = (patientData, createdBy) => {
  // Generate a new patient ID
  const patientId = 'P' + Math.floor(Math.random() * 10000).toString().padStart(3, '0');

  // Get current date and time
  const now = new Date();
  const createdAt = now.toISOString();

  // Create the complete patient object with default values for required fields
  return {
    id: patientId,
    ...patientData,
    // Ensure next_of_kin fields have default values if not provided
    nextOfKinName: patientData.nextOfKinName || 'Not Provided',
    nextOfKinRelationship: patientData.nextOfKinRelationship || 'Not Provided',
    nextOfKinPhone: patientData.nextOfKinPhone || '0000000000',
    lastVisit: now.toISOString().split('T')[0],
    medicalHistory: [],
    medications: [],
    allergies: [],
    createdBy: createdBy,
    createdAt: createdAt,
    updatedAt: createdAt
  };
};

/**
 * Create a new appointment record with creator information
 * @param {Object} appointmentData - Basic appointment data
 * @param {Object} patient - Patient object the appointment is for
 * @param {string} createdBy - Who created the record ('doctor', 'secretary', or 'visitor')
 * @returns {Object} Complete appointment object with ID and creator info
 */
export const createAppointmentRecord = (appointmentData, patient, createdBy) => {
  // Generate a new appointment ID
  const appointmentId = 'A' + Math.floor(Math.random() * 10000).toString().padStart(3, '0');

  // Get current date and time
  const now = new Date();
  const createdAt = now.toISOString();

  // Create the complete appointment object
  return {
    id: appointmentId,
    patientId: patient.id,
    patientName: `${patient.firstName} ${patient.lastName}`,
    ...appointmentData,
    status: appointmentData.status || 'Scheduled',
    createdBy: createdBy,
    createdAt: createdAt,
    updatedAt: createdAt
  };
};

/**
 * Get a human-readable label for the creator
 * @param {string} createdBy - Creator identifier ('doctor', 'secretary', 'visitor', or 'admin')
 * @returns {string} Human-readable label
 */
export const getCreatorLabel = (createdBy) => {
  switch (createdBy) {
    case 'doctor':
      return 'Doctor';
    case 'secretary':
      return 'Secretary';
    case 'visitor':
      return 'Patient (Online)';
    case 'admin':
      return 'Admin';
    case null:
    case undefined:
    case '':
      return 'Patient (Online)';
    default:
      return 'Patient (Online)';
  }
};
