import { useState } from 'react';
import { FaSearch, FaUserPlus, FaCalendarAlt, FaWalking, FaRegStickyNote } from 'react-icons/fa';
import PatientSearch from './PatientSearch';
import AddPatientForm from './AddPatientForm';

function AddToQueueModal({ patients, appointments, onClose, onSave }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isWalkIn, setIsWalkIn] = useState(true);
  const [notes, setNotes] = useState('');
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [step, setStep] = useState(1); // 1: Select patient, 2: Select appointment or walk-in, 3: Confirm

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setStep(2);
  };

  // Handle adding a new patient
  const handleAddPatient = (newPatient) => {
    setSelectedPatient(newPatient);
    setShowAddPatientForm(false);
    setStep(2);
  };

  // Get today's appointments for the selected patient
  const getTodaysAppointments = () => {
    if (!selectedPatient) return [];
    
    const today = new Date().toISOString().split('T')[0];
    
    return appointments.filter(appointment => {
      // Check if the appointment is for today and for the selected patient
      const appointmentDate = new Date(appointment.appointment_date || appointment.date).toISOString().split('T')[0];
      const patientMatches = 
        appointment.patient_id === selectedPatient._id || 
        appointment.patient_id === selectedPatient.id ||
        appointment.patientId === selectedPatient._id ||
        appointment.patientId === selectedPatient.id;
      
      return appointmentDate === today && patientMatches && appointment.status !== 'Completed' && appointment.status !== 'Cancelled';
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const queueData = {
      patient_id: selectedPatient._id || selectedPatient.id,
      is_walk_in: isWalkIn,
      notes,
    };
    
    if (selectedAppointment && !isWalkIn) {
      queueData.appointment_id = selectedAppointment._id || selectedAppointment.id;
    }
    
    onSave(queueData);
  };

  // Render patient selection step
  const renderPatientSelection = () => (
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
      
      {showAddPatientForm ? (
        <AddPatientForm
          onSave={handleAddPatient}
          onCancel={() => setShowAddPatientForm(false)}
          createdBy="secretary"
        />
      ) : (
        <PatientSearch
          patients={patients}
          onSelectPatient={handlePatientSelect}
        />
      )}
    </div>
  );

  // Render appointment selection step
  const renderAppointmentSelection = () => {
    const todaysAppointments = getTodaysAppointments();
    
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Adding {selectedPatient.name || `${selectedPatient.firstName} ${selectedPatient.lastName}`} to Queue
          </h3>
          <p className="text-gray-600">
            Does this patient have an appointment today or is this a walk-in?
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="walk-in"
              name="visit-type"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              checked={isWalkIn}
              onChange={() => {
                setIsWalkIn(true);
                setSelectedAppointment(null);
              }}
            />
            <label htmlFor="walk-in" className="ml-2 block text-gray-700 flex items-center">
              <FaWalking className="text-blue-600 mr-2" />
              Walk-in (No appointment)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="appointment"
              name="visit-type"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              checked={!isWalkIn}
              onChange={() => setIsWalkIn(false)}
              disabled={todaysAppointments.length === 0}
            />
            <label htmlFor="appointment" className="ml-2 block text-gray-700 flex items-center">
              <FaCalendarAlt className="text-blue-600 mr-2" />
              Scheduled Appointment
            </label>
          </div>
          
          {!isWalkIn && todaysAppointments.length > 0 && (
            <div className="ml-6 mt-2">
              <p className="text-sm text-gray-600 mb-2">Select an appointment:</p>
              <div className="space-y-2">
                {todaysAppointments.map(appointment => (
                  <div
                    key={appointment._id || appointment.id}
                    className={`p-3 rounded-lg border ${
                      selectedAppointment && (selectedAppointment._id === appointment._id || selectedAppointment.id === appointment.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    } cursor-pointer transition-all duration-200`}
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <div className="font-medium">
                      {appointment.optional_time || appointment.time} - {appointment.type || 'Consultation'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {appointment.reason || 'No reason specified'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!isWalkIn && todaysAppointments.length === 0 && (
            <div className="ml-6 mt-2 text-sm text-red-600">
              No appointments found for today. Please select walk-in or create a new appointment.
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FaRegStickyNote className="text-blue-600 mr-2" />
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any notes about this visit..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            disabled={!isWalkIn && !selectedAppointment}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  // Render confirmation step
  const renderConfirmation = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Confirm Queue Entry
        </h3>
        <p className="text-gray-600">
          Please review the information below before adding to the queue.
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Patient</p>
            <p className="font-medium">{selectedPatient.name || `${selectedPatient.firstName} ${selectedPatient.lastName}`}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Visit Type</p>
            <p className="font-medium">{isWalkIn ? 'Walk-in' : 'Scheduled Appointment'}</p>
          </div>
          {!isWalkIn && selectedAppointment && (
            <>
              <div>
                <p className="text-sm text-gray-500">Appointment Time</p>
                <p className="font-medium">{selectedAppointment.optional_time || selectedAppointment.time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Appointment Type</p>
                <p className="font-medium">{selectedAppointment.type || 'Consultation'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Reason</p>
                <p className="font-medium">{selectedAppointment.reason || 'No reason specified'}</p>
              </div>
            </>
          )}
          {notes && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Notes</p>
              <p className="font-medium">{notes}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
        >
          Back
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add to Queue
        </button>
      </div>
    </div>
  );

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

        {step === 1 && renderPatientSelection()}
        {step === 2 && renderAppointmentSelection()}
        {step === 3 && renderConfirmation()}
      </div>
    </div>
  );
}

export default AddToQueueModal;
