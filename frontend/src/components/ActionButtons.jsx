import React from 'react';

/**
 * Reusable action buttons component for appointments
 *
 * @param {Object} props
 * @param {Object} props.appointment - The appointment object
 * @param {Function} props.onViewPatient - Function to handle viewing a patient
 * @param {Function} props.onEditAppointment - Function to handle editing an appointment
 * @param {Function} props.onDiagnoseAppointment - Function to handle diagnosing an appointment (optional)
 * @param {Function} props.onDeleteAppointment - Function to handle deleting an appointment
 * @param {Array} props.patients - Array of patients
 * @param {Function} props.onUpdatePatient - Function to update patient data
 * @param {boolean} props.isDoctor - Whether the current user is a doctor (optional)
 */
const ActionButtons = ({
  appointment,
  onViewPatient,
  onEditAppointment,
  onDiagnoseAppointment,
  onDeleteAppointment,
  patients,
  onUpdatePatient,
  isDoctor = false
}) => {
  const handleViewPatient = (e) => {
    e.stopPropagation();
    const patient = patients.find(p => p.id === appointment.patientId);
    if (patient) {
      onViewPatient(patient);
    } else {
      // If patient not found, create a basic patient object from appointment data
      const newPatient = {
        id: appointment.patientId,
        firstName: appointment.patientName.split(' ')[0],
        lastName: appointment.patientName.split(' ').slice(1).join(' '),
        dateOfBirth: '',
        gender: '',
        phone: '',
        lastVisit: new Date().toISOString().split('T')[0],
        medicalHistory: [],
        medications: [],
        allergies: []
      };
      onUpdatePatient(newPatient); // Add to global state
      onViewPatient(newPatient);
    }
  };

  const handleEditAppointment = (e) => {
    e.stopPropagation();
    onEditAppointment(appointment);
  };

  const handleDiagnoseAppointment = (e) => {
    e.stopPropagation();
    onDiagnoseAppointment(appointment);
  };

  const handleDeleteAppointment = (e) => {
    e.stopPropagation();
    onDeleteAppointment(appointment._id || appointment.id);
  };

  return (
    <div className="flex space-x-3 action-buttons">
      <button
        className="text-blue-600 hover:text-blue-800 bg-blue-50 p-3 rounded-lg shadow-sm"
        onClick={handleViewPatient}
        title="View Patient"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>

      {isDoctor && onDiagnoseAppointment && (
        <button
          className="text-yellow-600 hover:text-yellow-800 bg-yellow-50 p-3 rounded-lg shadow-sm"
          onClick={handleDiagnoseAppointment}
          title="Diagnose"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      )}

      {onEditAppointment && (
        <button
          className="text-green-600 hover:text-green-800 bg-green-50 p-3 rounded-lg shadow-sm"
          onClick={handleEditAppointment}
          title="Edit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}

      <button
        className="text-red-600 hover:text-red-800 bg-red-50 p-3 rounded-lg shadow-sm"
        onClick={handleDeleteAppointment}
        title="Delete"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default ActionButtons;
