import { useState } from 'react';
import PatientSearchAppointmentModal from './PatientSearchAppointmentModal';
import { FaPlus } from 'react-icons/fa';

function NewAppointmentButton({ patients, onSave, onAddPatient, userRole = 'doctor' }) {
  const [showAddAppointmentForm, setShowAddAppointmentForm] = useState(false);

  const handleSaveAppointment = (newAppointment) => {
    console.log('Adding new appointment in NewAppointmentButton:', newAppointment);
    
    // Add the new appointment to the global state
    onSave(newAppointment);
    setShowAddAppointmentForm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowAddAppointmentForm(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-base font-medium flex items-center justify-center"
        aria-label="Add Appointment"
      >
        <FaPlus className="mr-2" />
        <span>New Appointment</span>
      </button>

      {/* Patient Search for Appointment Modal */}
      {showAddAppointmentForm && (
        <PatientSearchAppointmentModal
          patients={patients}
          onClose={() => setShowAddAppointmentForm(false)}
          onSave={handleSaveAppointment}
          onAddPatient={onAddPatient}
        />
      )}
    </>
  );
}

export default NewAppointmentButton;
