import React from 'react';
import ActionButtons from './ActionButtons';

/**
 * Reusable appointment card component
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
const AppointmentCard = ({
  appointment,
  onViewPatient,
  onEditAppointment,
  onDiagnoseAppointment,
  onDeleteAppointment,
  patients,
  onUpdatePatient,
  isDoctor = false
}) => {
  const handleCardClick = () => {
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

  return (
    <div
      key={appointment.id || appointment._id}
      className={`p-4 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-blue-50 transition-colors ${
        appointment.status === 'Scheduled' ? 'bg-green-50' :
        appointment.status === 'Completed' ? 'bg-blue-50' :
        appointment.status === 'Cancelled' ? 'bg-red-50' :
        appointment.status === 'Pending' ? 'bg-yellow-50' :
        'bg-white'
      }`}
      onClick={handleCardClick}
    >
      <div>
        <div className="font-medium text-lg">{appointment.time} - {appointment.patientName}</div>
        <div className="text-gray-600">{appointment.type || ''}: {appointment.reason}</div>
      </div>
      <div className="flex space-x-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          appointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
          appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
          appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
          appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {appointment.status}
        </span>
        <ActionButtons
          appointment={appointment}
          onViewPatient={onViewPatient}
          onEditAppointment={onEditAppointment}
          onDiagnoseAppointment={onDiagnoseAppointment}
          onDeleteAppointment={onDeleteAppointment}
          patients={patients}
          onUpdatePatient={onUpdatePatient}
          isDoctor={isDoctor}
        />
      </div>
    </div>
  );
};

export default AppointmentCard;
