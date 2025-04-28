import { useState } from 'react';
import { FaSearch, FaUserPlus, FaCalendarAlt, FaWalking } from 'react-icons/fa';
import PatientSearch from './PatientSearch';
import AddPatientForm from './AddPatientForm';
import apiService from '../utils/apiService';

function SimplifiedAddToQueueModal({ patients, appointments, onClose, onSave }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isWalkIn, setIsWalkIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [error, setError] = useState('');

  // Handle patient selection
  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);

    // For the direct queue approach, we just need to pass the patient data
    const patientData = {
      patient_id: patient._id || patient.id,
      patientName: patient.name || `${patient.firstName} ${patient.lastName}`,
      reason: 'Walk-in visit'
    };

    // Save to queue using the callback
    onSave(patientData);
  };

  // Handle adding a new patient
  const handleAddPatient = async (newPatient) => {
    setSelectedPatient(newPatient);
    setShowAddPatientForm(false);

    // For the direct queue approach, we just need to pass the patient data
    const patientData = {
      patient_id: newPatient._id,
      patientName: newPatient.name || `${newPatient.firstName} ${newPatient.lastName}`,
      reason: 'Walk-in visit'
    };

    // Save to queue using the callback
    onSave(patientData);
  };

  // This function is no longer needed with the direct queue approach
  // We're keeping it as a stub for compatibility
  const handleAddToQueue = async (patient, appointment, isWalkIn) => {
    setLoading(true);
    setError('');

    try {
      // For the direct queue approach, we just need to pass the patient data
      const patientData = {
        patient_id: patient._id || patient.id,
        patientName: patient.name || `${patient.firstName} ${patient.lastName}`,
        reason: 'Walk-in visit'
      };

      // Save to queue using the callback
      onSave(patientData);
    } catch (error) {
      console.error('Error adding to queue:', error);
      setError('Failed to add patient to queue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-700">
            Add Patient to Queue
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Processing...</p>
          </div>
        ) : (
          <>
            {!showAddPatientForm ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-700 flex items-center">
                    <FaSearch className="text-blue-600 mr-2" />
                    Select a patient to add to the queue:
                  </p>
                  <button
                    onClick={() => setShowAddPatientForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <FaUserPlus className="mr-2" />
                    New Patient
                  </button>
                </div>

                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center mb-2">
                    <FaCalendarAlt className="text-blue-600 mr-2" />
                    <span className="font-medium">Patients with appointments today will be automatically checked in.</span>
                  </div>
                  <div className="flex items-center">
                    <FaWalking className="text-blue-600 mr-2" />
                    <span className="font-medium">Walk-in patients will get a ticket number and an appointment will be created.</span>
                  </div>
                </div>

                <PatientSearch
                  patients={patients}
                  onSelectPatient={handlePatientSelect}
                />
              </div>
            ) : (
              <AddPatientForm
                onSave={handleAddPatient}
                onCancel={() => setShowAddPatientForm(false)}
                createdBy="secretary"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SimplifiedAddToQueueModal;
