import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserPlus, FaTimes, FaCalendarAlt, FaUser } from 'react-icons/fa';

const SuperSimpleAddToQueueModal = ({ patients, appointments, onClose, onSave }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [todaysAppointments, setTodaysAppointments] = useState([]);

  // Filter patients based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = patients.filter(
      patient => 
        (patient.name && patient.name.toLowerCase().includes(term)) || 
        (patient.phone && patient.phone.includes(term))
    );
    
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  // Filter today's appointments
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filtered = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date || appointment.scheduled_date);
      appointmentDate.setHours(0, 0, 0, 0);
      
      return (
        appointmentDate.getTime() === today.getTime() && 
        appointment.status !== 'Completed' &&
        appointment.status !== 'Cancelled' &&
        appointment.status !== 'No-show'
      );
    });
    
    setTodaysAppointments(filtered);
  }, [appointments]);

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setSelectedAppointment(null);
    
    // Check if patient has an appointment today
    const patientAppointments = todaysAppointments.filter(
      appointment => 
        appointment.patient_id === patient._id || 
        appointment.patient_id?._id === patient._id
    );
    
    if (patientAppointments.length > 0) {
      setSelectedAppointment(patientAppointments[0]);
      setIsWalkIn(false);
    } else {
      setIsWalkIn(true);
    }
  };

  // Handle appointment selection
  const handleAppointmentSelect = (appointment) => {
    setSelectedAppointment(appointment);
    setIsWalkIn(false);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedPatient) {
      alert('Please select a patient');
      return;
    }
    
    const queueEntry = {
      patient_id: selectedPatient._id,
      is_walk_in: isWalkIn,
      appointment_id: selectedAppointment?._id,
      status: 'Waiting'
    };
    
    onSave(queueEntry);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add Patient to Queue</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        {!selectedPatient ? (
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Search Patient</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or phone number..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {filteredPatients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 max-h-[50vh] overflow-y-auto">
                {filteredPatients.map(patient => (
                  <div
                    key={patient._id}
                    onClick={() => handlePatientSelect(patient)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-gray-600">{patient.phone}</div>
                    {patient.yearOfBirth && (
                      <div className="text-sm text-gray-600">
                        Age: {new Date().getFullYear() - patient.yearOfBirth}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : searchTerm.trim() !== '' ? (
              <div className="text-center py-4 text-gray-500">
                No patients found matching "{searchTerm}"
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <FaUser className="text-blue-500 mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-blue-800">{selectedPatient.name}</h3>
                  <p className="text-sm text-blue-600">{selectedPatient.phone}</p>
                  {selectedPatient.yearOfBirth && (
                    <p className="text-sm text-blue-600">
                      Age: {new Date().getFullYear() - selectedPatient.yearOfBirth}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setSelectedAppointment(null);
                    setIsWalkIn(false);
                  }}
                  className="ml-auto text-blue-500 hover:text-blue-700"
                >
                  Change
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Appointment Type</h3>
              
              <div className="space-y-3">
                {todaysAppointments.filter(
                  appointment => 
                    appointment.patient_id === selectedPatient._id || 
                    appointment.patient_id?._id === selectedPatient._id
                ).length > 0 ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Today's Appointments</h4>
                    {todaysAppointments
                      .filter(
                        appointment => 
                          appointment.patient_id === selectedPatient._id || 
                          appointment.patient_id?._id === selectedPatient._id
                      )
                      .map(appointment => (
                        <div
                          key={appointment._id}
                          onClick={() => handleAppointmentSelect(appointment)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedAppointment?._id === appointment._id
                              ? 'bg-green-50 border-green-300'
                              : 'border-gray-200 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-blue-500 mr-2" />
                            <div>
                              <div className="font-medium">
                                {appointment.type || 'Consultation'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {appointment.reason || 'No reason provided'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : null}
                
                <div
                  onClick={() => {
                    setIsWalkIn(true);
                    setSelectedAppointment(null);
                  }}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isWalkIn
                      ? 'bg-green-50 border-green-300'
                      : 'border-gray-200 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center">
                    <FaUserPlus className="text-blue-500 mr-2" />
                    <div>
                      <div className="font-medium">Walk-in</div>
                      <div className="text-sm text-gray-600">
                        No prior appointment
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add to Queue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperSimpleAddToQueueModal;
