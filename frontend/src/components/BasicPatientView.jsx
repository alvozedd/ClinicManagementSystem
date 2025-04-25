import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { getCreatorLabel } from '../utils/recordCreation';

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
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-blue-800">
          {editMode ? (
            <div className="flex space-x-2">
              <input
                type="text"
                name="firstName"
                value={editedPatient.firstName}
                onChange={handleInputChange}
                className="border border-blue-300 rounded px-3 py-2 w-32 md:w-40 text-base"
              />
              <input
                type="text"
                name="lastName"
                value={editedPatient.lastName}
                onChange={handleInputChange}
                className="border border-blue-300 rounded px-3 py-2 w-32 md:w-40 text-base"
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
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm md:text-base hover:bg-blue-700"
              >
                Edit
              </button>
              {onDeletePatient && (
                <button
                  onClick={handleDeletePatient}
                  className="bg-red-600 text-white px-3 py-1.5 rounded text-sm md:text-base hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleSaveChanges}
                className="bg-green-600 text-white px-3 py-1.5 rounded text-sm md:text-base hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-3 py-1.5 rounded text-sm md:text-base hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-4">
        {editMode ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={editedPatient.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Year of Birth</label>
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
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded"
                placeholder="Year"
              />
            </div>
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={editedPatient.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={editedPatient.email || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded"
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:text-base mb-3">
              <p><span className="font-semibold">Gender:</span> {patient.gender}</p>
              <p><span className="font-semibold">Age:</span> {calculateAge(patient.dateOfBirth)} years</p>
              <p><span className="font-semibold">Phone:</span> {patient.phone}</p>
              <p><span className="font-semibold">Email:</span> {patient.email || 'N/A'}</p>
            </div>

            {patient.createdBy && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm md:text-base text-gray-700 flex items-center">
                  <span className="font-semibold mr-2">Added by:</span>
                  <span className={`px-2 py-1 rounded text-xs md:text-sm font-medium ${
                    patient.createdBy === 'doctor' ? 'bg-blue-100 text-blue-800' :
                    patient.createdBy === 'secretary' ? 'bg-green-100 text-green-800' :
                    patient.createdBy === 'visitor' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    <FaUser className="inline mr-1" size={12} />
                    {patient.createdBy === 'visitor' ? 'Patient (Online)' :
                     patient.createdBy === 'doctor' ? 'Doctor' :
                     patient.createdBy === 'secretary' ? 'Secretary' :
                     patient.createdByName || getCreatorLabel(patient.createdBy)}
                  </span>
                  {patient.createdAt && (
                    <span className="text-xs md:text-sm text-gray-500 ml-2">
                      on {new Date(patient.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-base md:text-lg font-semibold mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Appointments
        </h3>
        {appointments && appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((appointment, index) => (
              <div key={index} className="border rounded-lg p-3 md:p-4 text-sm md:text-base shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between mb-2">
                  <div>
                    <span className="font-semibold">{appointment.date}</span> • {appointment.time}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                    appointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{appointment.status}</span>
                </div>
                <p className="truncate mb-2"><span className="font-semibold">{appointment.type}:</span> {appointment.reason || 'Not specified'}</p>

                {appointment.createdBy && (
                  <div className="mb-2 text-xs md:text-sm text-gray-600 flex items-center">
                    <span className="mr-1">Added by:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      appointment.createdBy === 'doctor' ? 'bg-blue-100 text-blue-800' :
                      appointment.createdBy === 'secretary' ? 'bg-green-100 text-green-800' :
                      appointment.createdBy === 'visitor' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <FaUser className="inline mr-1" size={10} />
                      {appointment.createdBy === 'visitor' ? 'Patient (Online)' :
                       appointment.createdBy === 'doctor' ? 'Doctor' :
                       appointment.createdBy === 'secretary' ? 'Secretary' :
                       appointment.createdByName || getCreatorLabel(appointment.createdBy)}
                    </span>
                  </div>
                )}

                {onDiagnoseAppointment && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => {
                        if (onDiagnoseAppointment) {
                          onDiagnoseAppointment(appointment);
                        }
                      }}
                      className="bg-yellow-500 text-white px-3 py-1.5 rounded text-sm md:text-base hover:bg-yellow-600 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-500 text-sm md:text-base">No appointments found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BasicPatientView;
