import { useState, useEffect } from 'react';
import AppointmentManagementModal from './AppointmentManagementModal';
import PatientNavigator from './PatientNavigator';
import { transformAppointmentFromBackend } from '../utils/dataTransformers';
import { clearAllCaches } from '../data/mockData';
import { FaUser } from 'react-icons/fa';
import { getCreatorLabel } from '../utils/recordCreation';

function SecretaryPatientView({ patient, patients, appointments, onClose, onUpdatePatient, onSelectPatient, onDeletePatient }) {
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

      {/* Appointments Section */}
      <div className="p-4">
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

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-2">Upcoming Appointments</h4>
              <div className="space-y-3">
                {upcomingAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className={`border rounded-lg p-4 ${
                      appointment.status === 'Scheduled' ? 'bg-green-50 border-green-200' :
                      appointment.status === 'Completed' ? 'bg-blue-50 border-blue-200' :
                      appointment.status === 'Cancelled' ? 'bg-red-50 border-red-200' :
                      appointment.status === 'Pending' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{appointment.date} at {appointment.time}</p>
                        <p className="text-gray-600">{appointment.type}</p>
                        {appointment.reason && <p className="text-gray-600 text-sm mt-1">Reason: {appointment.reason}</p>}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                        {appointment.createdBy && (
                          <div className="flex items-center mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              appointment.createdBy === 'doctor' ? 'bg-blue-100 text-blue-800' :
                              appointment.createdBy === 'secretary' ? 'bg-green-100 text-green-800' :
                              appointment.createdBy === 'admin' ? 'bg-gray-100 text-gray-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              <FaUser className="inline mr-1" size={10} />
                              {getCreatorLabel(appointment.createdBy)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleEditAppointment(appointment)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Past Appointments</h4>
              <div className="space-y-3">
                {pastAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className={`border rounded-lg p-4 ${
                      appointment.status === 'Completed' ? 'bg-blue-50 border-blue-200' :
                      appointment.status === 'Cancelled' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{appointment.date} at {appointment.time}</p>
                        <p className="text-gray-600">{appointment.type}</p>
                        {appointment.reason && <p className="text-gray-600 text-sm mt-1">Reason: {appointment.reason}</p>}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                        {appointment.createdBy && (
                          <div className="flex items-center mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              appointment.createdBy === 'doctor' ? 'bg-blue-100 text-blue-800' :
                              appointment.createdBy === 'secretary' ? 'bg-green-100 text-green-800' :
                              appointment.createdBy === 'admin' ? 'bg-gray-100 text-gray-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              <FaUser className="inline mr-1" size={10} />
                              {getCreatorLabel(appointment.createdBy)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleEditAppointment(appointment)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sortedAppointments.length === 0 && (
            <p className="text-gray-500 text-center py-4">No appointments found for this patient.</p>
          )}
        </div>
      </div>

      {/* Appointment Management Modal */}
      {managingAppointment && (
        <AppointmentManagementModal
          appointment={managingAppointment}
          onSave={handleSaveAppointment}
          onClose={() => {
            setManagingAppointment(null);
            setIsNewAppointment(false);
          }}
          isNew={isNewAppointment}
        />
      )}
    </div>
  );
}

export default SecretaryPatientView;
