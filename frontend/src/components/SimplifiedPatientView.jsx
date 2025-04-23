import { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { getCreatorLabel } from '../utils/recordCreation';
import AppointmentManagementModal from './AppointmentManagementModal';
import SimplifiedDiagnosisModal from './SimplifiedDiagnosisModal';

function SimplifiedPatientView({ patient, appointments, onClose, onUpdatePatient, onDiagnoseAppointment, onDeletePatient }) {
  const [activeTab, setActiveTab] = useState('biodata');
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

  // Handle deleting the patient
  const handleDeletePatient = () => {
    if (onDeletePatient) {
      onDeletePatient(patient.id);
      onClose(); // Close the patient view after deletion
    }
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
                    <label className="text-xs block mb-1">Year of Birth</label>
                    <input
                      type="number"
                      name="dateOfBirth"
                      value={editedPatient.dateOfBirth ? new Date(editedPatient.dateOfBirth).getFullYear() : ''}
                      onChange={(e) => {
                        const year = e.target.value;
                        // Create a date with just the year (Jan 1 of that year)
                        const dateStr = `${year}-01-01`;
                        setEditedPatient(prev => ({
                          ...prev,
                          dateOfBirth: dateStr
                        }));
                      }}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="border border-blue-300 rounded px-2 py-1 w-full bg-blue-50"
                      placeholder="Year"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {patient.gender} • {calculateAge(patient.dateOfBirth)} years
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    Phone: {patient.phone}
                  </span>
                  {patient.lastVisit && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      Last Visit: {patient.lastVisit}
                    </span>
                  )}
                  {previousDiagnoses.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {previousDiagnoses.length} Previous Diagnoses
                    </span>
                  )}
                </div>
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
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-4 relative">
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
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Edit Biodata
                  </button>
                  {onDeletePatient && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}? This action cannot be undone.`)) {
                          handleDeletePatient();
                        }
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Delete Patient
                    </button>
                  )}
                </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year of Birth</label>
                    <input
                      type="number"
                      name="dateOfBirth"
                      value={editedPatient.dateOfBirth ? new Date(editedPatient.dateOfBirth).getFullYear() : ''}
                      onChange={(e) => {
                        const year = e.target.value;
                        // Create a date with just the year (Jan 1 of that year)
                        const dateStr = `${year}-01-01`;
                        setEditedPatient(prev => ({
                          ...prev,
                          dateOfBirth: dateStr
                        }));
                      }}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Enter year of birth"
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
                    <p className="text-sm text-gray-500">Year of Birth</p>
                    <p className="font-medium">{patient.dateOfBirth ? new Date(patient.dateOfBirth).getFullYear() : 'Not provided'} ({calculateAge(patient.dateOfBirth)} years)</p>
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

                {patient.createdBy && (
                  <div className="border-b pb-2 mb-2">
                    <p className="text-sm text-gray-500">Record Created By</p>
                    <div className="flex items-center mt-1">
                      <span className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                        patient.createdBy === 'doctor' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        patient.createdBy === 'secretary' ? 'bg-green-100 text-green-800 border border-green-200' :
                        'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        <span className="flex items-center">
                          <FaUser className="mr-2" />
                          {getCreatorLabel(patient.createdBy)}
                        </span>
                      </span>
                      {patient.createdAt && (
                        <span className="text-sm text-gray-500 ml-2">
                          on {new Date(patient.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}

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
                        {appointment.createdBy && (
                          <div className="flex items-center mt-1">
                            <span className="text-gray-500 text-sm mr-1">Recorded by:</span>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                              appointment.createdBy === 'doctor' ? 'bg-blue-100 text-blue-800' :
                              appointment.createdBy === 'secretary' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {getCreatorLabel(appointment.createdBy)}
                            </span>
                          </div>
                        )}
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

                      {appointment.diagnosis.files && appointment.diagnosis.files.length > 0 && (
                        <div className="mt-4 border-t border-blue-100 pt-3">
                          <p className="font-medium text-blue-800 mb-2">Attached Files:</p>
                          <div className="space-y-2">
                            {appointment.diagnosis.files.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                                <div className="flex items-center">
                                  {file.type && file.type.includes('pdf') ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                  ) : file.type && file.type.includes('image') ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                  <span className="text-sm">{file.name}</span>
                                </div>
                                <div className="flex space-x-2">
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                  >
                                    View
                                  </a>
                                  <a
                                    href={file.url}
                                    download={file.name}
                                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                  >
                                    Download
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
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
                  <div key={appointment.id} className={`border rounded-lg p-4 hover:bg-gray-50 ${appointment.status === 'Scheduled' ? 'bg-green-50' : appointment.status === 'Completed' ? 'bg-blue-50' : appointment.status === 'Cancelled' ? 'bg-red-50' : appointment.status === 'Pending' ? 'bg-yellow-50' : 'bg-white'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-medium text-lg">{appointment.date} at {appointment.time}</p>
                        <p className="text-gray-600">{appointment.type} - {appointment.reason}</p>
                        {appointment.createdBy && (
                          <div className="flex items-center mt-1">
                            <span className="text-gray-500 text-sm mr-1">Booked by:</span>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                              appointment.createdBy === 'doctor' ? 'bg-blue-100 text-blue-800' :
                              appointment.createdBy === 'secretary' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {getCreatorLabel(appointment.createdBy)}
                            </span>
                            {appointment.createdAt && (
                              <span className="text-xs text-gray-500 ml-1">
                                on {new Date(appointment.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
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

                        {appointment.diagnosis.files && appointment.diagnosis.files.length > 0 && (
                          <div className="mt-3 border-t border-blue-200 pt-3">
                            <p className="font-medium text-blue-800 mb-2">Attached Files:</p>
                            <div className="space-y-2">
                              {appointment.diagnosis.files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                                  <div className="flex items-center">
                                    {file.type && file.type.includes('pdf') ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                      </svg>
                                    ) : file.type && file.type.includes('image') ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                    <span className="text-sm">{file.name}</span>
                                  </div>
                                  <div className="flex space-x-2">
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                    >
                                      View
                                    </a>
                                    <a
                                      href={file.url}
                                      download={file.name}
                                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                    >
                                      Download
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

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
