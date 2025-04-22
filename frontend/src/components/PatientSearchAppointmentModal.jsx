import { useState } from 'react';
import PatientSearch from './PatientSearch';
import AppointmentManagementModal from './AppointmentManagementModal';
import AddPatientForm from './AddPatientForm';

function PatientSearchAppointmentModal({ patients, onClose, onSave, onAddPatient }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setShowAppointmentForm(true);
  };

  const handleAppointmentSave = (appointment) => {
    // Make sure the appointment has the correct patient information
    const appointmentWithPatient = {
      ...appointment,
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      createdBy: 'secretary',
      createdAt: appointment.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Pass the appointment up to the parent component
    onSave(appointmentWithPatient);
  };

  const handleClose = () => {
    onClose();
  };

  const handleAddPatient = (newPatient) => {
    // Add the new patient to the global state
    onAddPatient(newPatient);

    // Select the newly created patient for appointment
    setSelectedPatient(newPatient);
    setShowAddPatientForm(false);
    setShowAppointmentForm(true);
  };

  const handleShowAddPatientForm = () => {
    setShowAddPatientForm(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {showAppointmentForm ? `Create Appointment for ${selectedPatient.firstName} ${selectedPatient.lastName}` :
             showAddPatientForm ? 'Add New Patient' :
             'Select Patient for Appointment'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {showAddPatientForm ? (
          <AddPatientForm
            onSave={handleAddPatient}
            onCancel={() => setShowAddPatientForm(false)}
            createdBy="secretary"
          />
        ) : showAppointmentForm ? (
          <AppointmentManagementModal
            isNew={true}
            isEmbedded={true}
            appointment={{
              patientId: selectedPatient.id,
              patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`
            }}
            onClose={() => setShowAppointmentForm(false)}
            onSave={handleAppointmentSave}
          />
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">Please select a patient to create an appointment for:</p>
              <button
                onClick={handleShowAddPatientForm}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Patient
              </button>
            </div>
            <PatientSearch
              patients={patients}
              onSelectPatient={handlePatientSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientSearchAppointmentModal;
