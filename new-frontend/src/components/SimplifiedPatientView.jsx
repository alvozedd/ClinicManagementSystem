import { useState } from 'react';
import AppointmentManagementModal from './AppointmentManagementModal';
import SimplifiedDiagnosisModal from './SimplifiedDiagnosisModal';

function SimplifiedPatientView({ patient, appointments, onClose, onUpdatePatient, onDiagnoseAppointment }) {
  const [activeTab, setActiveTab] = useState('appointments');
  const [editMode, setEditMode] = useState(false);
  const [editedPatient, setEditedPatient] = useState({...patient});
  const [managingAppointment, setManagingAppointment] = useState(null);
  const [isNewAppointment, setIsNewAppointment] = useState(false);
  const [diagnosingAppointment, setDiagnosingAppointment] = useState(null);

  // Sort appointments by date (most recent first)
  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get previous diagnoses
  const previousDiagnoses = sortedAppointments.filter(a => a.diagnosis);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

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

  // Handle adding a new appointment
  const handleAddAppointment = () => {
    setManagingAppointment({
      id: 'new-' + Date.now(),
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      type: 'Consultation',
      reason: '',
      status: 'Scheduled'
    });
    setIsNewAppointment(true);
  };

  // Handle editing an appointment
  const handleEditAppointment = (appointment) => {
    setManagingAppointment(appointment);
    setIsNewAppointment(false);
  };

  // Handle saving appointment changes
  const handleSaveAppointment = (updatedAppointment) => {
    // For new appointments, make sure we have the patient name
    const appointmentWithPatientInfo = {
      ...updatedAppointment,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`
    };

    onUpdatePatient({
      ...patient,
      appointments: isNewAppointment
        ? [...appointments, appointmentWithPatientInfo]
        : appointments.map(a => a.id === appointmentWithPatientInfo.id ? appointmentWithPatientInfo : a)
    });
    setManagingAppointment(null);
    setIsNewAppointment(false);
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Patient Header */}
      <div className="bg-blue-50 p-4 rounded-t-lg border border-blue-200 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <h2 className="text-xl font-bold text-blue-800">
              {editMode ? (
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    name="firstName"
                    value={editedPatient.firstName}
                    onChange={handleInputChange}
                    className="border border-blue-300 rounded px-2 py-1 w-32 bg-blue-50"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={editedPatient.lastName}
                    onChange={handleInputChange}
                    className="border border-blue-300 rounded px-2 py-1 w-32 bg-blue-50"
                  />
                </div>
              ) : (
                <>
                  {patient.firstName} {patient.lastName}
                  <span className="ml-2 text-sm bg-blue-100 px-2 py-1 rounded-full">ID: {patient.id}</span>
                </>
              )}
            </h2>
            <div className="text-gray-600">
              {editMode ? (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-xs block mb-1">Gender</label>
                    <select
                      name="gender"
                      value={editedPatient.gender}
                      onChange={handleInputChange}
                      className="border border-blue-300 rounded px-2 py-1 w-full bg-blue-50"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editedPatient.dateOfBirth}
                      onChange={handleInputChange}
                      className="border border-blue-300 rounded px-2 py-1 w-full bg-blue-50"
                    />
                  </div>
                </div>
              ) : (
                <p>
                  {patient.gender} • {patient.dateOfBirth} • {calculateAge(patient.dateOfBirth)} years
                </p>
              )}
            </div>
            <div className="text-gray-600 mt-1">
              {editMode ? (
                <div className="mb-2">
                  <label className="text-xs block mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={editedPatient.phone}
                    onChange={handleInputChange}
                    className="border border-blue-300 rounded px-2 py-1 w-full bg-blue-50"
                  />
                </div>
              ) : (
                <p>
                  <span className="font-medium">Phone:</span> {patient.phone}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            {editMode && activeTab !== 'biodata' ? (
              <div className="flex space-x-2">
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
              </div>
            ) : activeTab !== 'biodata' ? (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
              >
                Edit
              </button>
            ) : null}
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
      </div>

      {/* Simple Tab Navigation */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`py-2 px-4 font-medium text-base border-b-2 -mb-px ${
            activeTab === 'appointments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Appointments
        </button>
        <button
          onClick={() => setActiveTab('diagnoses')}
          className={`py-2 px-4 font-medium text-base border-b-2 -mb-px ${
            activeTab === 'diagnoses'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Diagnoses
        </button>
        <button
          onClick={() => setActiveTab('biodata')}
          className={`py-2 px-4 font-medium text-base border-b-2 -mb-px ${
            activeTab === 'biodata'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Patient Biodata
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-4 font-medium text-base border-b-2 -mb-px ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Patient Info
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'biodata' ? (
        <div className="space-y-6">
          {/* Patient Biodata Form */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Patient Biodata</h3>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Edit Biodata
                </button>
              )}
            </div>

            {editMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={editedPatient.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={editedPatient.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editedPatient.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={editedPatient.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editedPatient.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={editedPatient.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                  <textarea
                    name="address"
                    value={editedPatient.address || ''}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <h4 className="font-medium text-gray-700 border-b pb-1 mt-6 mb-3">Next of Kin Information</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next of Kin Name (Optional)</label>
                    <input
                      type="text"
                      name="nextOfKinName"
                      value={editedPatient.nextOfKinName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship (Optional)</label>
                    <input
                      type="text"
                      name="nextOfKinRelationship"
                      value={editedPatient.nextOfKinRelationship || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next of Kin Phone (Optional)</label>
                  <input
                    type="tel"
                    name="nextOfKinPhone"
                    value={editedPatient.nextOfKinPhone || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <h4 className="font-medium text-gray-700 border-b pb-1 mt-6 mb-3">Insurance Information</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider (Optional)</label>
                    <input
                      type="text"
                      name="insuranceProvider"
                      value={editedPatient.insuranceProvider || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Number (Optional)</label>
                    <input
                      type="text"
                      name="insuranceNumber"
                      value={editedPatient.insuranceNumber || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">First Name</p>
                    <p className="font-medium">{patient.firstName}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Last Name</p>
                    <p className="font-medium">{patient.lastName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{patient.dateOfBirth} ({calculateAge(patient.dateOfBirth)} years)</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">{patient.gender}</p>
                  </div>
                </div>

                <div className="border-b pb-2">
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>

                <div className="border-b pb-2">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{patient.email || 'Not provided'}</p>
                </div>

                <div className="border-b pb-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{patient.address || 'Not provided'}</p>
                </div>

                <div className="border-b pb-2">
                  <p className="text-sm text-gray-500">Patient ID</p>
                  <p className="font-medium">{patient.id}</p>
                </div>

                <h4 className="font-medium text-gray-700 border-b pb-1 mt-6 mb-3">Next of Kin Information</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Next of Kin Name</p>
                    <p className="font-medium">{patient.nextOfKinName || 'Not provided'}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Relationship</p>
                    <p className="font-medium">{patient.nextOfKinRelationship || 'Not provided'}</p>
                  </div>
                </div>

                <div className="border-b pb-2">
                  <p className="text-sm text-gray-500">Next of Kin Phone</p>
                  <p className="font-medium">{patient.nextOfKinPhone || 'Not provided'}</p>
                </div>

                <h4 className="font-medium text-gray-700 border-b pb-1 mt-6 mb-3">Insurance Information</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Insurance Provider</p>
                    <p className="font-medium">{patient.insuranceProvider || 'Not provided'}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Insurance Number</p>
                    <p className="font-medium">{patient.insuranceNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Medical History */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Medical History</h3>
            {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
              <div className="space-y-2">
                {patient.medicalHistory.map((condition, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{condition.condition}</div>
                    <div className="text-sm text-gray-600">
                      Diagnosed: {condition.diagnosedDate} • {condition.notes}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No medical history recorded.</p>
            )}
          </div>

          {/* Allergies */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Allergies</h3>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, index) => (
                  <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No allergies recorded.</p>
            )}
          </div>

          {/* Medications */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Current Medications</h3>
            {patient.medications && patient.medications.length > 0 ? (
              <div className="space-y-2">
                {patient.medications.map((medication, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{medication.name}</div>
                    <div className="text-sm text-gray-600">
                      {medication.dosage} • {medication.frequency} • Started: {medication.startDate}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No medications recorded.</p>
            )}
          </div>
        </div>
      ) : activeTab === 'diagnoses' ? (
        <div className="space-y-6">
          {/* Diagnoses Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Diagnoses History</h3>
              <button
                onClick={() => {
                  // Create a new appointment for diagnosis if no appointments exist
                  if (sortedAppointments.length === 0) {
                    const newAppointment = {
                      id: 'new-' + Date.now(),
                      patientId: patient.id,
                      patientName: `${patient.firstName} ${patient.lastName}`,
                      date: new Date().toISOString().split('T')[0],
                      time: '09:00',
                      type: 'Consultation',
                      reason: 'General checkup',
                      status: 'Completed'
                    };
                    setDiagnosingAppointment(newAppointment);
                  } else {
                    // Use the most recent appointment for diagnosis
                    setDiagnosingAppointment(sortedAppointments[0]);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium"
              >
                Add New Diagnosis
              </button>
            </div>

            {previousDiagnoses.length > 0 ? (
              <div className="space-y-4">
                {previousDiagnoses.map(appointment => (
                  <div key={appointment.id} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-medium text-lg">{appointment.date} at {appointment.time}</p>
                        <p className="text-gray-600">{appointment.type} - {appointment.reason}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDiagnosingAppointment(appointment);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                      >
                        Edit Diagnosis
                      </button>
                    </div>

                    <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                      <p className="font-medium text-blue-800">Diagnosis:</p>
                      <p className="mt-1">{appointment.diagnosis.notes}</p>

                      {appointment.diagnosis.treatment && (
                        <div className="mt-2">
                          <p className="font-medium text-blue-800">Treatment:</p>
                          <p className="mt-1">{appointment.diagnosis.treatment}</p>
                        </div>
                      )}

                      {appointment.diagnosis.followUp && (
                        <div className="mt-2">
                          <p className="font-medium text-blue-800">Follow-up:</p>
                          <p className="mt-1">{appointment.diagnosis.followUp}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No diagnoses recorded for this patient.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Appointments List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Appointment History</h3>
              <button
                onClick={handleAddAppointment}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium"
              >
                Add Appointment
              </button>
            </div>

            {sortedAppointments.length > 0 ? (
              <div className="space-y-4">
                {sortedAppointments.map(appointment => (
                  <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-medium text-lg">{appointment.date} at {appointment.time}</p>
                        <p className="text-gray-600">{appointment.type} - {appointment.reason}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditAppointment(appointment)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>

                    {appointment.diagnosis ? (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-800">Diagnosis:</p>
                        <p className="mt-1">{appointment.diagnosis.notes}</p>

                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDiagnosingAppointment(appointment);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                          >
                            Edit Diagnosis
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDiagnosingAppointment(appointment);
                          }}
                          className="px-3 py-1 bg-yellow-600 text-white rounded text-sm font-medium hover:bg-yellow-700"
                        >
                          Add Diagnosis
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No appointments recorded for this patient.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Management Modal */}
      {managingAppointment && (
        <AppointmentManagementModal
          appointment={managingAppointment}
          onClose={() => {
            setManagingAppointment(null);
            setIsNewAppointment(false);
          }}
          onSave={handleSaveAppointment}
          isNew={isNewAppointment}
        />
      )}

      {/* Diagnosis Modal */}
      {diagnosingAppointment && (
        <SimplifiedDiagnosisModal
          appointment={diagnosingAppointment}
          onClose={() => setDiagnosingAppointment(null)}
          onSave={(updatedAppointment) => {
            // Make sure the appointment status is set to Completed when adding a diagnosis
            const appointmentWithStatus = {
              ...updatedAppointment,
              status: 'Completed'
            };

            // Update the appointment with diagnosis
            onDiagnoseAppointment(appointmentWithStatus);
            setDiagnosingAppointment(null);

            // Switch to the diagnoses tab to show the new diagnosis
            setActiveTab('diagnoses');
          }}
        />
      )}
    </div>
  );
}

export default SimplifiedPatientView;
