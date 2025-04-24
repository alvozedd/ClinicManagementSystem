import React from 'react';

function BasicPatientView({ patient, onClose }) {
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
          {patient.firstName} {patient.lastName}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mb-4">
        <p><strong>Gender:</strong> {patient.gender}</p>
        <p><strong>Age:</strong> {calculateAge(patient.dateOfBirth)} years</p>
        <p><strong>Phone:</strong> {patient.phone}</p>
        <p><strong>Email:</strong> {patient.email || 'Not provided'}</p>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Appointments</h3>
        {patient.appointments && patient.appointments.length > 0 ? (
          <div className="space-y-2">
            {patient.appointments.map((appointment, index) => (
              <div key={index} className="border rounded p-2">
                <p><strong>Date:</strong> {appointment.date}</p>
                <p><strong>Type:</strong> {appointment.type}</p>
                <p><strong>Status:</strong> {appointment.status}</p>
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
