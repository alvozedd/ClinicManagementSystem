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
    <div className="bg-white rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-800">
          {editMode ? (
            <div className="flex space-x-2">
              <input
                type="text"
                name="firstName"
                value={editedPatient.firstName}
                onChange={handleInputChange}
                className="border border-blue-300 rounded px-2 py-1 w-32"
              />
              <input
                type="text"
                name="lastName"
                value={editedPatient.lastName}
                onChange={handleInputChange}
                className="border border-blue-300 rounded px-2 py-1 w-32"
              />
            </div>
          ) : (
            <>
              {patient.firstName} {patient.lastName}
            </>
          )}
        </h2>
        <div className="flex space-x-2">
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
              >
                Edit
              </button>
              {onDeletePatient && (
                <button
                  onClick={handleDeletePatient}
                  className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleSaveChanges}
                className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-4">
        {editMode ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={editedPatient.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year of Birth</label>
              <input
                type="number"
                name="dateOfBirth"
                value={editedPatient.dateOfBirth && !isNaN(new Date(editedPatient.dateOfBirth).getFullYear()) ? new Date(editedPatient.dateOfBirth).getFullYear() : ''}
                onChange={(e) => {
                  const year = e.target.value;
                  if (year && !isNaN(year)) {
                    // Create a date with just the year (Jan 1 of that year)
                    const dateStr = `${year}-01-01`;
                    setEditedPatient(prev => ({
                      ...prev,
                      dateOfBirth: dateStr
                    }));
                  } else {
                    // If input is empty or invalid, clear the date
                    setEditedPatient(prev => ({
                      ...prev,
                      dateOfBirth: ''
                    }));
                  }
                }}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter year of birth"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={editedPatient.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                name="email"
                value={editedPatient.email || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        ) : (
          <>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Age:</strong> {calculateAge(patient.dateOfBirth)} years</p>
            <p><strong>Phone:</strong> {patient.phone}</p>
            <p><strong>Email:</strong> {patient.email || 'Not provided'}</p>
          </>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Appointments</h3>
        {appointments && appointments.length > 0 ? (
          <div className="space-y-2">
            {appointments.map((appointment, index) => (
              <div key={index} className="border rounded p-2">
                <p><strong>Date:</strong> {appointment.date}</p>
                <p><strong>Time:</strong> {appointment.time}</p>
                <p><strong>Type:</strong> {appointment.type}</p>
                <p><strong>Reason:</strong> {appointment.reason || 'Not specified'}</p>
                <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${appointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' : appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' : appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' : appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{appointment.status}</span></p>
                {onDiagnoseAppointment && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => {
                        if (onDiagnoseAppointment) {
                          // Create a diagnosis modal or redirect to diagnosis page
                          onDiagnoseAppointment(appointment);
                        }
                      }}
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      {appointment.diagnosis || (appointment.diagnoses && appointment.diagnoses.length > 0) ? 'Edit Diagnosis' : 'Add Diagnosis'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No appointments found</p>
        )}
      </div>
    </div>
  )
}

export default BasicPatientView;
