import { useState, useEffect } from 'react';
import { getTodaysAppointments } from '../data/mockData';
import PatientSearch from './PatientSearch';
import SimplifiedPatientView from './SimplifiedPatientView';
import SimplifiedNotesModal from './SimplifiedNotesModal';
import AddPatientForm from './AddPatientForm';
import DoctorCalendarView from './DoctorCalendarView';
import PatientNavigator from './PatientNavigator';
import GlobalDiagnosesView from './GlobalDiagnosesView';
import DoctorPatientSearchAppointmentModal from './DoctorPatientSearchAppointmentModal';
import AppointmentManagementModal from './AppointmentManagementModal';
import AppointmentCard from './AppointmentCard';
import AppointmentQueueWrapper from './AppointmentQueueWrapper';
import TodaysAppointments from './TodaysAppointments';
import ActionButtons from './ActionButtons';
import { FaCalendarAlt, FaUserMd, FaClipboardList, FaEye, FaArrowLeft, FaUser, FaFileMedical, FaUserClock } from 'react-icons/fa';
import { getCreatorLabel } from '../utils/recordCreation';
import { getTimeBasedGreeting, getFormattedDate, filterAppointmentsByTimePeriod, updateAppointmentStatuses, identifyAppointmentsNeedingDiagnosis, getRelativeDateLabel } from '../utils/timeUtils';
import apiService from '../utils/apiService';
import './AppointmentTabs.css';

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

function SimplifiedDoctorDashboard({
  patients,
  appointments,
  onUpdatePatient,
  onDiagnoseAppointment,
  onDeletePatient,
  onDeleteAppointment,
  username,
  userRole,
  userInfo
}) {
  // Debug props
  console.log('Doctor Dashboard - username:', username);
  console.log('Doctor Dashboard - userInfo:', userInfo);

  // Set global user role for patient view component
  window.userRole = 'doctor';
  // State for active tab (patient-management, appointments, diagnoses, calendar, or queue)
  const [activeTab, setActiveTab] = useState('patient-management');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosingAppointment, setDiagnosingAppointment] = useState(null);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [showAddAppointmentForm, setShowAddAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('today');

  // State for today's appointments
  const [todaysAppointments, setTodaysAppointments] = useState([]);

  // Fetch today's appointments whenever appointments change
  useEffect(() => {
    const fetchTodaysAppointments = async () => {
      try {
        const appointments = await getTodaysAppointments();
        setTodaysAppointments(appointments);
        console.log('Doctor dashboard - Today\'s appointments updated:', appointments);
      } catch (error) {
        console.error('Error fetching today\'s appointments:', error);
        setTodaysAppointments([]);
      }
    };

    fetchTodaysAppointments();
  }, [appointments]);

  // Filter upcoming appointments (excluding today's)
  const upcomingAppointments = appointments
    .filter(a => {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Get appointment date
      const appointmentDateStr = a.date;

      console.log(`Upcoming filter - Appointment date: ${appointmentDateStr}, Today: ${todayStr}`);

      // Only include future dates (strictly after today)
      return appointmentDateStr > todayStr;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5); // Show only next 5 upcoming appointments

  console.log('Upcoming appointments:', upcomingAppointments);

  // Handle viewing a patient
  const handleViewPatient = (patient) => {
    if (!patient) {
      console.error('Patient not found');
      return;
    }
    setSelectedPatient(patient);
    setActiveTab('patient-management');
  };

  // Handle closing patient view
  const handleClosePatientView = () => {
    console.log('Closing patient view');
    // Immediately clear the patient selection
    setSelectedPatient(null);
  };

  // Handle saving notes
  const handleSaveNotes = (updatedAppointment) => {
    // Make sure the appointment status is set to Completed when adding notes
    const appointmentWithStatus = {
      ...updatedAppointment,
      status: 'Completed'
    };

    console.log('Saving notes in SimplifiedDoctorDashboard:', appointmentWithStatus);

    // Check if this is a new note or an update to an existing one
    const isNewNote = !diagnosingAppointment.diagnosis;

    // If this is a new note for an appointment that already has notes,
    // we need to preserve the existing notes array
    if (!isNewNote && diagnosingAppointment.diagnoses) {
      // Add the new note to the existing notes array
      appointmentWithStatus.diagnoses = [
        appointmentWithStatus.diagnosis,
        ...diagnosingAppointment.diagnoses
      ];
    }

    // Update the appointment in the global state
    onDiagnoseAppointment(appointmentWithStatus);

    // Close the notes modal
    setDiagnosingAppointment(null);

    // Trigger a local refresh to ensure UI is updated
    setLocalRefreshTrigger(prev => prev + 1);

    // If we're in the patient management tab, wait a moment then refresh the patient view
    if (activeTab === 'patient-management' && selectedPatient) {
      // Wait a moment to ensure the notes are saved before refreshing
      setTimeout(() => {
        // This will trigger a re-render of the SimplifiedPatientView component
        setSelectedPatient({...selectedPatient});
        // Trigger another refresh after the timeout
        setLocalRefreshTrigger(prev => prev + 1);
      }, 500);
    }
  };

  // Handle editing a diagnosis
  const handleEditDiagnosis = (diagnosis) => {
    console.log('Editing diagnosis:', diagnosis);

    // Find the appointment associated with this diagnosis
    const appointment = appointments.find(a => a._id === diagnosis.appointmentId || a.id === diagnosis.appointmentId);

    if (appointment) {
      // Set up the appointment with the diagnosis for editing
      const appointmentWithDiagnosis = {
        ...appointment,
        diagnosis: {
          ...diagnosis,
          notes: diagnosis.diagnosisText, // Map the diagnosis text to notes for the modal
        }
      };

      setDiagnosingAppointment(appointmentWithDiagnosis);
    } else {
      console.error('Could not find appointment for diagnosis:', diagnosis);
      alert('Could not find the appointment associated with this diagnosis.');
    }
  };

  // Handle deleting a diagnosis
  const handleDeleteDiagnosis = async (diagnosisId) => {
    console.log('Deleting diagnosis with ID:', diagnosisId);

    try {
      // Confirm deletion with the user
      if (!window.confirm('Are you sure you want to delete this diagnosis? This action cannot be undone.')) {
        return;
      }

      // Call the API to delete the diagnosis
      await apiService.deleteDiagnosis(diagnosisId);

      // Show success message
      alert('Diagnosis deleted successfully.');

      // Trigger a local refresh to update the UI
      setLocalRefreshTrigger(prev => prev + 1);

      // If we're in the patient management tab and have a selected patient, refresh the patient view
      if (activeTab === 'patient-management' && selectedPatient) {
        // This will trigger a re-render of the SimplifiedPatientView component
        setSelectedPatient({...selectedPatient});
      }
    } catch (error) {
      console.error('Error deleting diagnosis:', error);
      alert('Failed to delete diagnosis. Please try again.');
    }
  };

  // Handle adding a new patient
  const handleAddPatient = (newPatient) => {
    onUpdatePatient(newPatient); // This will add the patient to the patients array
    setShowAddPatientForm(false);
    // Select the newly created patient
    setSelectedPatient(newPatient);
    setActiveTab('patient-management');
    // Trigger a local refresh to update the UI
    setLocalRefreshTrigger(prev => prev + 1);
  };

  // Get current date and greeting
  const currentDate = getFormattedDate();
  const greeting = getTimeBasedGreeting();

  // Update appointment statuses based on time
  const updatedAppointments = updateAppointmentStatuses(appointments);

  // Identify appointments that need diagnoses
  const appointmentsNeedingDiagnosis = identifyAppointmentsNeedingDiagnosis(updatedAppointments);

  // Count pending diagnoses
  const pendingDiagnoses = appointmentsNeedingDiagnosis.length;

  // We don't want to auto-select patients anymore
  // This was causing the search to not be visible by default
  useEffect(() => {
    // Only auto-select if explicitly requested via URL or other means
    // This is intentionally left empty to prevent auto-selection
  }, [activeTab, selectedPatient, todaysAppointments, patients]);

  // Add a local refresh mechanism to ensure changes are immediately visible
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);

  // This effect will run whenever the patients or appointments props change
  // or when a local refresh is triggered
  useEffect(() => {
    console.log('SimplifiedDoctorDashboard - Detected changes in patients or appointments');

    // If we have a selected patient, make sure it's up to date with the latest data
    if (selectedPatient) {
      const updatedPatient = patients.find(p =>
        p._id === selectedPatient._id ||
        p.id === selectedPatient.id
      );

      if (updatedPatient) {
        console.log('Updating selected patient with latest data');
        setSelectedPatient(updatedPatient);
      }
    }
  }, [patients, appointments, localRefreshTrigger]);

  return (
    <div className="p-2">
      {/* Welcome Banner with Quick Stats and Upcoming Appointments */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-md p-3 mb-3 text-white shadow-md relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 mb-3">
          <div>
            <h1 className="text-base md:text-lg lg:text-xl font-semibold mb-0.5 leading-tight">{greeting}, {username}</h1>
            <p className="text-blue-100 text-xs">{currentDate}</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <div className="bg-white bg-opacity-20 rounded-md p-1.5 backdrop-blur-sm">
              <div className="font-semibold text-sm leading-tight">{todaysAppointments.length}</div>
              <div className="text-xs">Today's Appointments</div>
            </div>

            <div className="bg-white bg-opacity-20 rounded-md p-1.5 backdrop-blur-sm">
              <div className="font-semibold text-sm leading-tight">{patients.length}</div>
              <div className="text-xs">Total Patients</div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments Section */}
        {upcomingAppointments.length > 0 && (
          <div className="mt-2">
            <h3 className="text-xs font-semibold mb-2">Upcoming Appointments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {upcomingAppointments.slice(0, 3).map((appointment) => {
                // Get relative date label for this appointment
                const relativeDateLabel = getRelativeDateLabel(appointment.date);

                return (
                <div
                  key={appointment.id || appointment._id}
                  className="bg-white bg-opacity-20 rounded-md p-2 backdrop-blur-sm cursor-pointer hover:bg-opacity-30 transition-all"
                  onClick={() => {
                    const patient = patients.find(p => p.id === appointment.patientId || p._id === appointment.patientId);
                    if (patient) {
                      handleViewPatient(patient);
                    }
                  }}
                >
                  <div className="font-medium text-xs">{appointment.patientName}</div>
                  <div className="text-xs">
                    <span className="font-semibold">{relativeDateLabel}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      appointment.status === 'Scheduled' ? 'bg-green-50 text-green-700' :
                      appointment.status === 'Completed' ? 'bg-blue-50 text-blue-700' :
                      appointment.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                      appointment.status === 'Needs Diagnosis' ? 'bg-purple-50 text-purple-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {appointment.status}
                    </span>
                    {appointment.createdBy && (
                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                        appointment.createdBy === 'doctor' ? 'bg-blue-50 text-blue-700' :
                        appointment.createdBy === 'secretary' ? 'bg-green-50 text-green-700' :
                        appointment.createdBy === 'admin' ? 'bg-gray-50 text-gray-700' :
                        'bg-purple-50 text-purple-700'
                      }`}>
                        <FaUser className="inline mr-1" size={8} />
                        {getCreatorLabel(appointment.createdBy)}
                      </span>
                    )}
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Tab Navigation - Mobile Optimized */}
      <div className="bg-white rounded-md shadow-sm mb-4 p-2">
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => setActiveTab('patient-management')}
            className={`py-3 px-2 rounded-md flex flex-col justify-center items-center transition-all ${
              activeTab === 'patient-management'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaUserMd className="h-6 w-6 mb-1" />
            <span className="text-sm font-medium text-center">Patients</span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-3 px-2 rounded-md flex flex-col justify-center items-center transition-all ${
              activeTab === 'appointments'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaClipboardList className="h-6 w-6 mb-1" />
            <span className="text-sm font-medium text-center">
              <span className="hidden md:inline">Appointments</span>
              <span className="md:hidden">Appts</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('diagnoses')}
            className={`py-3 px-2 rounded-md flex flex-col justify-center items-center transition-all ${
              activeTab === 'diagnoses'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaFileMedical className="h-6 w-6 mb-1" />
            <span className="text-sm font-medium text-center">Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-3 px-2 rounded-md flex flex-col justify-center items-center transition-all ${
              activeTab === 'calendar'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaCalendarAlt className="h-6 w-6 mb-1" />
            <span className="text-sm font-medium text-center">Calendar</span>
          </button>


        </div>
      </div>

      {/* Content Area - Enhanced Styling */}
      <div className="bg-white rounded-md shadow-sm p-4">
        {activeTab === 'diagnoses' ? (
          <GlobalDiagnosesView
            onViewPatient={(patientId) => {
              const patient = patients.find(p => p._id === patientId || p.id === patientId);
              if (patient) {
                handleViewPatient(patient);
              }
            }}
            onEditDiagnosis={handleEditDiagnosis}
            onDeleteDiagnosis={handleDeleteDiagnosis}
          />
        ) : activeTab === 'calendar' ? (
          <DoctorCalendarView
            appointments={appointments}
            onDiagnoseAppointment={onDiagnoseAppointment}
            onViewPatient={(patientId) => {
              const patient = patients.find(p => p.id === patientId);
              if (patient) {
                handleViewPatient(patient);
              }
            }}
          />
        ) : activeTab === 'appointments' ? (
          <>
            <AppointmentQueueWrapper
              patients={patients}
              appointments={appointments}
              userRole="doctor"
              onUpdateAppointment={onDiagnoseAppointment}
              onViewPatient={handleViewPatient}
              onEditAppointment={setEditingAppointment}
              onDeleteAppointment={onDeleteAppointment}
              onUpdatePatient={onUpdatePatient}
              onAddDiagnosis={setDiagnosingAppointment}
            />
            <div className="mt-6">
          <div>
            {/* Today's Appointments Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setShowAddAppointmentForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-base font-medium flex items-center justify-center"
                  aria-label="Add Appointment"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Add Appointment</span>
                </button>
              </div>

              <TodaysAppointments
                onViewPatient={handleViewPatient}
                onEditAppointment={setEditingAppointment}
                onDeleteAppointment={onDeleteAppointment}
              />
            </div>



            {/* Upcoming Appointments Section */}
            <div>
              <h2 className="text-xl font-semibold text-blue-800 mb-3">Upcoming Appointments</h2>

              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onViewPatient={handleViewPatient}
                      onEditAppointment={setEditingAppointment}
                      onDiagnoseAppointment={setDiagnosingAppointment}
                      onDeleteAppointment={onDeleteAppointment}
                      patients={patients}
                      onUpdatePatient={onUpdatePatient}
                      isDoctor={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-appointments">
                  <p>No upcoming appointments scheduled.</p>
                </div>
              )}
            </div>
          </div>
            </div>
          </>
        ) : (
          <div>
            {/* Patient Management Tab */}
            {selectedPatient ? (
              <div className="relative">
                <PatientNavigator
                  patients={patients}
                  currentPatient={selectedPatient}
                  onSelectPatient={setSelectedPatient}
                  onClose={handleClosePatientView}
                />
                <SimplifiedPatientView
                  patient={selectedPatient}
                  appointments={appointments.filter(a =>
                    (a.patientId === selectedPatient.id) ||
                    (a.patient_id === selectedPatient._id) ||
                    (a.patientId === selectedPatient._id) ||
                    (a.patient_id === selectedPatient.id)
                  )}
                  onClose={handleClosePatientView}
                  onUpdatePatient={onUpdatePatient}
                  onDiagnoseAppointment={(appointment) => {
                    setDiagnosingAppointment(appointment);
                  }}
                  onDeletePatient={(patientId) => {
                    onDeletePatient(patientId);
                    handleClosePatientView(); // Close the patient view after deletion
                  }}
                />

                {/* Floating Close Button (visible on mobile) */}
                <div className="fixed bottom-4 right-4 md:hidden z-10">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClosePatientView();
                    }}
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                    aria-label="Back to patient list"
                  >
                    <FaArrowLeft className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <PatientSearch
                  patients={patients}
                  onSelectPatient={setSelectedPatient}
                  onAddPatient={() => setShowAddPatientForm(true)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {diagnosingAppointment && (
        <SimplifiedNotesModal
          appointment={diagnosingAppointment}
          onClose={() => setDiagnosingAppointment(null)}
          onSave={handleSaveNotes}
        />
      )}

      {/* Add Patient Modal */}
      {showAddPatientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Add New Patient</h2>
              <button
                onClick={() => setShowAddPatientForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <AddPatientForm
              onSave={handleAddPatient}
              onCancel={() => setShowAddPatientForm(false)}
              createdBy="doctor"
            />
          </div>
        </div>
      )}

      {/* Patient Search for Appointment Modal */}
      {showAddAppointmentForm && (
        <DoctorPatientSearchAppointmentModal
          patients={patients}
          onClose={() => setShowAddAppointmentForm(false)}
          onSave={(newAppointment) => {
            // Add the new appointment to the global state
            onDiagnoseAppointment(newAppointment);
            setShowAddAppointmentForm(false);
          }}
          onAddPatient={(newPatient) => {
            // Add the new patient to the global state
            onUpdatePatient(newPatient);
          }}
        />
      )}

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <AppointmentManagementModal
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onSave={(updatedAppointment) => {
            // Update the appointment in the global state
            onDiagnoseAppointment(updatedAppointment);
            setEditingAppointment(null);
          }}
        />
      )}
    </div>
  );
}

export default SimplifiedDoctorDashboard;
