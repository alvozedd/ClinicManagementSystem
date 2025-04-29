import React from 'react';
import ActionButtons from './ActionButtons';
import { FaUser } from 'react-icons/fa';
import { getCreatorLabel } from '../utils/recordCreation';
import { getRelativeDateLabel } from '../utils/timeUtils';
import './GlassEffects.css';

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
      className={`p-4 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:shadow-lg transition-all duration-300 appointment-card ${
        appointment.status === 'Scheduled' ? 'glass-card-green' :
        appointment.status === 'Completed' ? 'glass-card-blue' :
        appointment.status === 'Cancelled' ? 'glass-card-red' :
        'glass-card'
      }`}
      onClick={handleCardClick}
    >
      <div>
        <div className="font-medium text-lg">{appointment.patientName}</div>
        <div className="text-gray-600">{appointment.type || ''}: {appointment.reason}</div>
        {appointment.date && (
          <div className="text-xs text-gray-500 mt-1">
            {getRelativeDateLabel(appointment.date)}
          </div>
        )}
        {appointment.createdBy && (
          <div className="flex items-center mt-1">
            <span className="text-gray-500 text-xs mr-1">Added by:</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              appointment.createdBy === 'doctor' ? 'bg-blue-50 text-blue-700' :
              appointment.createdBy === 'secretary' ? 'bg-green-50 text-green-700' :
              appointment.createdBy === 'admin' ? 'bg-gray-50 text-gray-700' :
              'bg-purple-50 text-purple-700'
            }`}>
              <FaUser className="inline mr-1" size={10} />
              {getCreatorLabel(appointment.createdBy)}
            </span>
          </div>
        )}
      </div>
      <div className="flex space-x-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          appointment.status === 'Scheduled' ? 'bg-green-50 text-green-700' :
          appointment.status === 'Completed' ? 'bg-blue-50 text-blue-700' :
          appointment.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
          appointment.status === 'Needs Diagnosis' ? 'bg-purple-50 text-purple-700' :
          'bg-gray-50 text-gray-700'
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
