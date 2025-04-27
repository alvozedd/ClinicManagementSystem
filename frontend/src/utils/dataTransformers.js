// Data transformer functions to convert between backend and frontend data formats

/**
 * Transform a patient from the backend format to the frontend format
 * @param {Object} backendPatient - Patient object from the backend API
 * @returns {Object} - Patient object in the frontend format
 */
export const transformPatientFromBackend = (backendPatient) => {
  if (!backendPatient) return null;

  // Log the incoming patient data to debug createdBy issues
  console.log('transformPatientFromBackend - Raw patient data:', {
    _id: backendPatient._id,
    name: backendPatient.name,
    createdBy: backendPatient.createdBy,
    created_by_user_id: backendPatient.created_by_user_id
  });

  // Split the name into firstName and lastName
  const nameParts = backendPatient.name ? backendPatient.name.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Create a date of birth string from year_of_birth if available
  let dateOfBirth = '';
  if (backendPatient.year_of_birth && !isNaN(backendPatient.year_of_birth)) {
    dateOfBirth = `${backendPatient.year_of_birth}-01-01`; // January 1st of the birth year
  }

  // Determine the correct createdBy value
  const createdByValue = backendPatient.createdBy || (backendPatient.created_by_user_id ? 'doctor' : 'visitor');

  // Create the transformed patient object
  const transformedPatient = {
    _id: backendPatient._id, // Keep the MongoDB ID
    id: backendPatient._id, // Also set as id for compatibility
    firstName,
    lastName,
    gender: backendPatient.gender || '',
    phone: backendPatient.phone || '',
    dateOfBirth: dateOfBirth,
    yearOfBirth: backendPatient.year_of_birth || '',
    nextOfKinName: backendPatient.next_of_kin_name || '',
    nextOfKinRelationship: backendPatient.next_of_kin_relationship || '',
    nextOfKinPhone: backendPatient.next_of_kin_phone || '',
    createdBy: createdByValue, // Use the actual createdBy field if available
    createdAt: backendPatient.createdAt || new Date().toISOString(),
    updatedAt: backendPatient.updatedAt || new Date().toISOString(),
    // Additional frontend-only fields
    lastVisit: backendPatient.updatedAt ? new Date(backendPatient.updatedAt).toISOString().split('T')[0] : '',
    // Include medical history, medications, and allergies from backend
    medicalHistory: backendPatient.medicalHistory || [],
    medications: backendPatient.medications || [],
    allergies: backendPatient.allergies || []
  };

  // Log the transformed patient data to debug createdBy issues
  console.log('transformPatientFromBackend - Transformed patient data:', {
    _id: transformedPatient._id,
    name: `${transformedPatient.firstName} ${transformedPatient.lastName}`,
    createdBy: transformedPatient.createdBy
  });

  return transformedPatient;
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
  // Extract year from dateOfBirth if available
  let yearOfBirth = frontendPatient.yearOfBirth;

  // Check if yearOfBirth is an empty string and set it to null
  if (yearOfBirth === '') {
    yearOfBirth = null;
  }

  // If no yearOfBirth but dateOfBirth exists, extract year from dateOfBirth
  if ((yearOfBirth === undefined || yearOfBirth === null) && frontendPatient.dateOfBirth) {
    const date = new Date(frontendPatient.dateOfBirth);
    if (!isNaN(date.getFullYear())) {
      yearOfBirth = date.getFullYear();
    }
  }

  // Log the year of birth for debugging
  console.log('Transforming patient to backend with year of birth:', yearOfBirth);

  return {
    name: `${frontendPatient.firstName} ${frontendPatient.lastName}`.trim(),
    gender: frontendPatient.gender || '',
    phone: frontendPatient.phone || '',
    year_of_birth: yearOfBirth,
    next_of_kin_name: frontendPatient.nextOfKinName || 'Not Provided',
    next_of_kin_relationship: frontendPatient.nextOfKinRelationship || 'Not Provided',
    next_of_kin_phone: frontendPatient.nextOfKinPhone || '0000000000',
    // Include medical history, medications, and allergies
    medicalHistory: frontendPatient.medicalHistory || [],
    allergies: frontendPatient.allergies || [],
    medications: frontendPatient.medications || [],
    // Preserve the createdBy field if it exists
    createdBy: frontendPatient.createdBy
  };
};

/**
 * Transform an appointment from the backend format to the frontend format
 * @param {Object} backendAppointment - Appointment object from the backend API
 * @returns {Object} - Appointment object in the frontend format
 */
export const transformAppointmentFromBackend = (backendAppointment) => {
  if (!backendAppointment) return null;

  // Extract date and time from appointment_date
  const appointmentDate = new Date(backendAppointment.appointment_date);
  const date = appointmentDate.toISOString().split('T')[0];

  // Use optional_time if available, otherwise format from the date
  const time = backendAppointment.optional_time ||
               `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`;

  // Use the status, type, and reason fields directly if available
  let status = backendAppointment.status || 'Scheduled';
  let type = backendAppointment.type || 'Consultation';
  let reason = backendAppointment.reason || '';

  // For backward compatibility, still check notes if the fields are not set
  if ((!backendAppointment.status || !backendAppointment.type) && backendAppointment.notes) {
    const notesLines = backendAppointment.notes.split('\n');

    // Try to extract type and reason from notes
    for (const line of notesLines) {
      if (line.startsWith('Type:') && !backendAppointment.type) {
        type = line.replace('Type:', '').trim();
      } else if (line.startsWith('Reason:') && !backendAppointment.reason) {
        reason = line.replace('Reason:', '').trim();
      } else if (line.startsWith('Status:') && !backendAppointment.status) {
        status = line.replace('Status:', '').trim();
      }
    }
  }

  console.log(`Status for appointment ${backendAppointment._id}: ${status}`);


  // Get patient name from populated patient_id field
  let patientName = 'Unknown';
  let patientId = null;

  if (backendAppointment.patient_id) {
    if (typeof backendAppointment.patient_id === 'object') {
      patientName = backendAppointment.patient_id.name || 'Unknown';
      patientId = backendAppointment.patient_id._id;
    } else {
      patientId = backendAppointment.patient_id;
    }
  }

  return {
    _id: backendAppointment._id, // Keep the MongoDB ID
    id: backendAppointment._id, // Also set as id for compatibility
    patientId: patientId,
    patientName: patientName,
    date: date,
    time: time,
    type: type,
    reason: reason || 'General consultation',
    status: status,
    notes: backendAppointment.notes || '',
    createdBy: backendAppointment.created_by_user_id ? 'staff' : 'visitor',
    createdAt: backendAppointment.createdAt || new Date().toISOString(),
    updatedAt: backendAppointment.updatedAt || new Date().toISOString(),
    patient_id: patientId // Keep the original field for compatibility
  };
};

/**
 * Transform an array of appointments from backend to frontend format
 * @param {Array} backendAppointments - Array of appointment objects from the backend
 * @returns {Array} - Array of appointment objects in frontend format
 */
export const transformAppointmentsFromBackend = (backendAppointments) => {
  if (!backendAppointments || !Array.isArray(backendAppointments)) return [];
  return backendAppointments.map(appointment => transformAppointmentFromBackend(appointment));
};

/**
 * Transform an appointment from frontend format to backend format for creating/updating
 * @param {Object} frontendAppointment - Appointment object in frontend format
 * @param {Object} existingAppointment - Optional existing appointment data from backend
 * @returns {Object} - Appointment object in backend format
 */
export const transformAppointmentToBackend = (frontendAppointment, existingAppointment = null) => {
  // Log the status we're trying to set
  console.log(`Setting appointment status to: ${frontendAppointment.status}`);

  // For backward compatibility, still maintain notes with status, type, and reason
  let notes = '';

  if (existingAppointment && existingAppointment.notes) {
    // Keep any existing notes that don't relate to status, type, or reason
    const existingNotes = existingAppointment.notes;
    const notesLines = existingNotes.split('\n');
    const otherLines = notesLines.filter(line =>
      !line.startsWith('Type:') &&
      !line.startsWith('Reason:') &&
      !line.startsWith('Status:'));

    // Add the status, type, and reason lines
    otherLines.push(`Type: ${frontendAppointment.type || existingAppointment.type || 'Consultation'}`);
    otherLines.push(`Reason: ${frontendAppointment.reason || existingAppointment.reason || 'Not specified'}`);
    otherLines.push(`Status: ${frontendAppointment.status || existingAppointment.status || 'Scheduled'}`);

    notes = otherLines.join('\n');
  } else {
    // No existing notes, create new ones
    notes = `Type: ${frontendAppointment.type || 'Consultation'}\nReason: ${frontendAppointment.reason || 'Not specified'}\nStatus: ${frontendAppointment.status || 'Scheduled'}`;
  }

  // Return the appointment with both the notes field (for backward compatibility)
  // and the dedicated status, type, and reason fields
  return {
    patient_id: frontendAppointment.patientId || frontendAppointment.patient_id,
    appointment_date: new Date(frontendAppointment.date),
    optional_time: frontendAppointment.time || '',
    notes: notes, // Keep notes for backward compatibility
    status: frontendAppointment.status || 'Scheduled',
    type: frontendAppointment.type || 'Consultation',
    reason: frontendAppointment.reason || ''
  };
};
