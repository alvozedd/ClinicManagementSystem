// Data transformer functions to convert between backend and frontend data formats

/**
 * Transform a patient from the backend format to the frontend format
 * @param {Object} backendPatient - Patient object from the backend API
 * @returns {Object} - Patient object in the frontend format
 */
export const transformPatientFromBackend = (backendPatient) => {
  if (!backendPatient) return null;

  // Split the name into firstName and lastName
  const nameParts = backendPatient.name ? backendPatient.name.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    _id: backendPatient._id, // Keep the MongoDB ID
    id: backendPatient._id, // Also set as id for compatibility
    firstName,
    lastName,
    gender: backendPatient.gender || '',
    phone: backendPatient.phone || '',
    dateOfBirth: '', // Backend doesn't store this yet
    nextOfKinName: backendPatient.next_of_kin_name || '',
    nextOfKinRelationship: backendPatient.next_of_kin_relationship || '',
    nextOfKinPhone: backendPatient.next_of_kin_phone || '',
    createdBy: backendPatient.created_by_user_id ? 'doctor' : 'visitor', // Default assumption
    createdAt: backendPatient.createdAt || new Date().toISOString(),
    updatedAt: backendPatient.updatedAt || new Date().toISOString(),
    // Additional frontend-only fields
    lastVisit: backendPatient.updatedAt ? new Date(backendPatient.updatedAt).toISOString().split('T')[0] : '',
    medicalHistory: [],
    medications: [],
    allergies: []
  };
};

/**
 * Transform an array of patients from backend to frontend format
 * @param {Array} backendPatients - Array of patient objects from the backend
 * @returns {Array} - Array of patient objects in frontend format
 */
export const transformPatientsFromBackend = (backendPatients) => {
  if (!backendPatients || !Array.isArray(backendPatients)) return [];
  return backendPatients.map(patient => transformPatientFromBackend(patient));
};

/**
 * Transform a patient from frontend format to backend format for creating/updating
 * @param {Object} frontendPatient - Patient object in frontend format
 * @returns {Object} - Patient object in backend format
 */
export const transformPatientToBackend = (frontendPatient) => {
  return {
    name: `${frontendPatient.firstName} ${frontendPatient.lastName}`.trim(),
    gender: frontendPatient.gender || '',
    phone: frontendPatient.phone || '',
    next_of_kin_name: frontendPatient.nextOfKinName || 'Not Provided',
    next_of_kin_relationship: frontendPatient.nextOfKinRelationship || 'Not Provided',
    next_of_kin_phone: frontendPatient.nextOfKinPhone || '0000000000'
  };
};
