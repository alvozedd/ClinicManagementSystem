import { useState, useEffect } from 'react';
import AppointmentManagementModal from './AppointmentManagementModal';
import PatientNavigator from './PatientNavigator';
import { transformAppointmentFromBackend } from '../utils/dataTransformers';
import { clearAllCaches } from '../data/mockData';

function SecretaryPatientView({ patient, patients, appointments, onClose, onUpdatePatient, onSelectPatient }) {
  const [activeTab, setActiveTab] = useState('appointments');
  const [editMode, setEditMode] = useState(false);
  const [editedPatient, setEditedPatient] = useState({...patient});
  const [managingAppointment, setManagingAppointment] = useState(null);
  const [isNewAppointment, setIsNewAppointment] = useState(false);

  // Update local state when patient prop changes
  useEffect(() => {
    setEditedPatient({...patient});
  }, [patient]);

  // Check if the patient was created within the last hour (secretary can only edit for 1 hour)
  const canEdit = () => {
    if (!patient.createdAt) return false;

    const creationTime = new Date(patient.createdAt).getTime();
    const currentTime = new Date().getTime();
    const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds

    return (currentTime - creationTime) <= oneHourInMs;
  };

  // Calculate time remaining for editing
  const getTimeRemaining = () => {
    if (!patient.createdAt) return { expired: true, minutes: 0 };

    const creationTime = new Date(patient.createdAt).getTime();
    const currentTime = new Date().getTime();
    const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds

    const timeElapsedMs = currentTime - creationTime;
    const timeRemainingMs = oneHourInMs - timeElapsedMs;

    if (timeRemainingMs <= 0) {
      return { expired: true, minutes: 0 };
    }

    // Convert to minutes
    const minutesRemaining = Math.floor(timeRemainingMs / (60 * 1000));
    return { expired: false, minutes: minutesRemaining };
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Separate past and upcoming appointments
  const pastAppointments = [...appointments]
    .filter(a => a.date < today || (a.date === today && a.status === 'Completed'))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first

  const upcomingAppointments = [...appointments]
    .filter(a => a.date > today || (a.date === today && a.status !== 'Completed'))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Earliest first

  // Combined sorted appointments (for backward compatibility)
  const sortedAppointments = [...upcomingAppointments, ...pastAppointments];

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
    // Clear caches to ensure fresh data
    clearAllCaches();

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

    // Clear caches to ensure fresh data
    clearAllCaches();

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
      {/* Patient Navigator */}
      <PatientNavigator
        patients={patients}
        currentPatient={patient}
        onSelectPatient={onSelectPatient}
        onClose={onClose}
      />
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
                  {sortedAppointments.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {sortedAppointments.length} Appointments
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
            ) : activeTab !== 'biodata' && canEdit() ? (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
              >
                Edit
              </button>
            ) : activeTab !== 'biodata' ? (
              <div className="text-xs text-gray-500 italic bg-gray-100 px-2 py-1 rounded">
                Editing locked
              </div>
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
          onClick={() => setActiveTab('biodata')}
          className={`py-2 px-4 font-medium text-base border-b-2 -mb-px ${
            activeTab === 'biodata'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Patient Biodata
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'biodata' ? (
        <div className="space-y-6">
          {/* Patient Biodata Form */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Patient Biodata</h3>
              {!editMode && canEdit() ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Edit Biodata
                  </button>
                  <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                    {getTimeRemaining().minutes} minutes left to edit
                  </div>
                </div>
              ) : !editMode ? (
                <div className="text-sm text-gray-500 italic">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    Editing locked (1-hour window expired)
                  </span>
                </div>
              ) : null}
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
                      value={editedPatient.dateOfBirth && !isNaN(new Date(editedPatient.dateOfBirth).getFullYear()) ? new Date(editedPatient.dateOfBirth).getFullYear() : ''}
                      onChange={(e) => {
                        const year = e.target.value;
                        if (year && !isNaN(year)) {
                          // Create a date with just the year (Jan 1 of that year)
                          const dateStr = `${year}-01-01`;
                          setEditedPatient(prev => ({
                            ...prev,
                            dateOfBirth: dateStr,
                            yearOfBirth: parseInt(year)
                          }));
                        } else {
                          // If input is empty or invalid, clear the date
                          setEditedPatient(prev => ({
                            ...prev,
                            dateOfBirth: '',
                            yearOfBirth: null
                          }));
                        }
                      }}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <p className="font-medium">{patient.dateOfBirth ? new Date(patient.dateOfBirth).getFullYear() : 'Not provided'} {patient.dateOfBirth ? `(${calculateAge(patient.dateOfBirth)} years)` : ''}</p>
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

                {patient.createdAt && (
                  <div className="border-b pb-2">
                    <p className="text-sm text-gray-500">Record Created</p>
                    <p className="font-medium">
                      {new Date(patient.createdAt).toLocaleString()}
                      {canEdit() && (
                        <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          {getTimeRemaining().minutes} minutes left to edit
                        </span>
                      )}
                    </p>
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


              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Appointments List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Appointments</h3>
              <button
                onClick={handleAddAppointment}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium"
              >
                Add Appointment
              </button>
            </div>

            {/* Upcoming Appointments Section */}
            {upcomingAppointments.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-blue-800 mb-3 border-b pb-1">Upcoming Appointments</h4>
                <div className="space-y-4">
                  {upcomingAppointments.map(appointment => (
                    <div key={appointment.id} className={`border rounded-lg p-4 hover:bg-gray-50 ${appointment.status === 'Scheduled' ? 'bg-green-50' : appointment.status === 'Completed' ? 'bg-blue-50' : appointment.status === 'Cancelled' ? 'bg-red-50' : appointment.status === 'Pending' ? 'bg-yellow-50' : 'bg-white'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-medium text-lg">{appointment.date} at {appointment.time}</p>
                          <p className="text-gray-600">{appointment.type} - {appointment.reason}</p>
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Appointments Section */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-3 border-b pb-1">Previous Appointments</h4>
              {pastAppointments.length > 0 ? (
              <div className="space-y-4">
                {pastAppointments.map(appointment => (
                  <div key={appointment.id} className={`border rounded-lg p-4 hover:bg-gray-50 ${appointment.status === 'Scheduled' ? 'bg-green-50' : appointment.status === 'Completed' ? 'bg-blue-50' : appointment.status === 'Cancelled' ? 'bg-red-50' : appointment.status === 'Pending' ? 'bg-yellow-50' : 'bg-white'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-medium text-lg">{appointment.date} at {appointment.time}</p>
                        <p className="text-gray-600">{appointment.type} - {appointment.reason}</p>
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No previous appointments recorded for this patient.</p>
              </div>
            )}

            {upcomingAppointments.length === 0 && pastAppointments.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg mt-4">
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
          isNew={isNewAppointment}
          onClose={() => {
            setManagingAppointment(null);
            setIsNewAppointment(false);
          }}
          onSave={handleSaveAppointment}
        />
      )}
    </div>
  );
}

export default SecretaryPatientView;
