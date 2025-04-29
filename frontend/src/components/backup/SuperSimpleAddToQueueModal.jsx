import { useState } from 'react';
import { FaUserPlus, FaSearch, FaWalking } from 'react-icons/fa';
import PatientSearch from './PatientSearch';
import AddPatientForm from './AddPatientForm';

function SuperSimpleAddToQueueModal({ patients, onClose, onSave }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [step, setStep] = useState(1); // 1: Select patient, 2: Enter reason

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setStep(2); // Move to reason step
  };

  // Handle adding a new patient
  const handleAddPatient = (newPatient) => {
    setSelectedPatient(newPatient);
    setShowAddPatientForm(false);
    setStep(2); // Move to reason step
  };

  // Handle form submission
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    
    const patientData = {
      patient_id: selectedPatient._id || selectedPatient.id,
      patientName: selectedPatient.name || `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      reason: reason || 'Walk-in visit'
    };
    
    onSave(patientData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-700">
            Add Walk-in Patient
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

        {step === 1 && (
          <div>
            {!showAddPatientForm ? (
              <div>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center">
                    <FaWalking className="text-blue-600 mr-2" />
                    <span className="font-medium">Select an existing patient or add a new one</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-700 flex items-center">
                    <FaSearch className="text-blue-600 mr-2" />
                    Find patient:
                  </p>
                  <button
                    onClick={() => setShowAddPatientForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <FaUserPlus className="mr-2" />
                    New Patient
                  </button>
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
          </div>
        )}

        {step === 2 && selectedPatient && (
          <div>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center">
                <FaWalking className="text-blue-600 mr-2" />
                <span className="font-medium">Adding {selectedPatient.name || `${selectedPatient.firstName} ${selectedPatient.lastName}`} as a walk-in patient</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  placeholder="Brief reason for visit (optional)"
                />
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add to Queue'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperSimpleAddToQueueModal;
