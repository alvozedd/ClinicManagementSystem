import React, { useState } from 'react';

function BasicPatientView({ patient, appointments, onClose, onUpdatePatient, onDeletePatient, onDiagnoseAppointment }) {
  // State for editing mode
  const [editMode, setEditMode] = useState(false);
  const [editedPatient, setEditedPatient] = useState({...patient});

  // Handle input changes for patient editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle saving patient changes
  const handleSaveChanges = () => {
    onUpdatePatient(editedPatient);
    setEditMode(false);
  };

  // Handle canceling edits
  const handleCancelEdit = () => {
    setEditedPatient({...patient});
    setEditMode(false);
  };

  // Handle deleting the patient
  const handleDeletePatient = () => {
    if (onDeletePatient) {
      // Use MongoDB _id if available, otherwise fall back to client-side id
      const patientId = patient._id || patient.id;
      if (window.confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}? This action cannot be undone.`)) {
        onDeletePatient(patientId);
        onClose(); // Close the patient view after deletion
      }
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <div className="bg-white rounded-lg p-2 sm:p-3 shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base sm:text-lg font-bold text-blue-800">
          {editMode ? (
            <div className="flex space-x-1">
              <input
                type="text"
                name="firstName"
                value={editedPatient.firstName}
                onChange={handleInputChange}
                className="border border-blue-300 rounded px-1 py-0.5 w-24 text-sm"
              />
              <input
                type="text"
                name="lastName"
                value={editedPatient.lastName}
                onChange={handleInputChange}
                className="border border-blue-300 rounded px-1 py-0.5 w-24 text-sm"
              />
            </div>
          ) : (
            <>
              {patient.firstName} {patient.lastName}
            </>
          )}
        </h2>
        <div className="flex space-x-1">
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs hover:bg-blue-700"
              >
                Edit
              </button>
              {onDeletePatient && (
                <button
                  onClick={handleDeletePatient}
                  className="bg-red-600 text-white px-1.5 py-0.5 rounded text-xs hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleSaveChanges}
                className="bg-green-600 text-white px-1.5 py-0.5 rounded text-xs hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-1.5 py-0.5 rounded text-xs hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-2 text-sm">
        {editMode ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Gender</label>
              <select
                name="gender"
                value={editedPatient.gender}
                onChange={handleInputChange}
                className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Year of Birth</label>
              <input
                type="number"
                name="dateOfBirth"
                value={editedPatient.dateOfBirth && !isNaN(new Date(editedPatient.dateOfBirth).getFullYear()) ? new Date(editedPatient.dateOfBirth).getFullYear() : ''}
                onChange={(e) => {
                  const year = e.target.value;
                  if (year && !isNaN(year)) {
                    const dateStr = `${year}-01-01`;
                    setEditedPatient(prev => ({
                      ...prev,
                      dateOfBirth: dateStr
                    }));
                  } else {
                    setEditedPatient(prev => ({
                      ...prev,
                      dateOfBirth: ''
                    }));
                  }
                }}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                placeholder="Year"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Phone</label>
              <input
                type="tel"
                name="phone"
                value={editedPatient.phone}
                onChange={handleInputChange}
                className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Email</label>
              <input
                type="email"
                name="email"
                value={editedPatient.email || ''}
                onChange={handleInputChange}
                className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <p><span className="font-semibold">Gender:</span> {patient.gender}</p>
            <p><span className="font-semibold">Age:</span> {calculateAge(patient.dateOfBirth)} yrs</p>
            <p><span className="font-semibold">Phone:</span> {patient.phone}</p>
            <p><span className="font-semibold">Email:</span> {patient.email || 'N/A'}</p>
          </div>
        )}
      </div>

      <div className="mt-2">
        <h3 className="text-sm font-semibold mb-1 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Appointments
        </h3>
        {appointments && appointments.length > 0 ? (
          <div className="space-y-1">
            {appointments.map((appointment, index) => (
              <div key={index} className="border rounded p-1.5 text-xs">
                <div className="flex justify-between mb-1">
                  <div>
                    <span className="font-semibold">{appointment.date}</span> • {appointment.time}
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    appointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{appointment.status}</span>
                </div>
                <p className="truncate"><span className="font-semibold">{appointment.type}:</span> {appointment.reason || 'Not specified'}</p>
                {onDiagnoseAppointment && (
                  <div className="mt-1 flex justify-end">
                    <button
                      onClick={() => {
                        if (onDiagnoseAppointment) {
                          onDiagnoseAppointment(appointment);
                        }
                      }}
                      className="bg-yellow-500 text-white px-1.5 py-0.5 rounded text-xs hover:bg-yellow-600 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {appointment.diagnosis || (appointment.diagnoses && appointment.diagnoses.length > 0) ? 'Edit' : 'Add'} Diagnosis
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-xs">No appointments found</p>
        )}
      </div>
    </div>
  )
}

export default BasicPatientView;
