import { useState, useEffect } from 'react';
import AppointmentManagementModal from './AppointmentManagementModal';
import PatientNavigator from './PatientNavigator';
import { clearAllCaches } from '../data/mockData';

function SecretaryPatientView({ patient, patients, appointments, onClose, onUpdatePatient, onSelectPatient, onDeletePatient }) {
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
              {patient.firstName} {patient.lastName}
            </h2>
            <div className="text-gray-600">
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
            </div>
          </div>
          <div className="flex flex-col space-y-2">
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

      {/* Content Area - Basic Version */}
      <div className="p-4">
        {activeTab === 'biodata' ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
            <p>Name: {patient.firstName} {patient.lastName}</p>
            <p>Gender: {patient.gender}</p>
            <p>Age: {calculateAge(patient.dateOfBirth)} years</p>
            <p>Phone: {patient.phone}</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Appointments</h3>
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
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <p><strong>Date:</strong> {appointment.date} at {appointment.time}</p>
                    <p><strong>Type:</strong> {appointment.type}</p>
                    <p><strong>Status:</strong> {appointment.status}</p>
                    <button
                      onClick={() => handleEditAppointment(appointment)}
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No appointments found for this patient.</p>
            )}
          </div>
        )}
      </div>

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
  )
}

export default SecretaryPatientView;
