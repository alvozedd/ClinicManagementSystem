import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTodaysAppointments } from '../data/mockData';
import PatientSearch from './PatientSearch';
// Using a simplified version for now
import SecretaryPatientView from './SecretaryPatientView';
import AddPatientForm from './AddPatientForm';
import SecretaryCalendarView from './SecretaryCalendarView';
import AppointmentManagementModal from './AppointmentManagementModal';
import PatientSearchAppointmentModal from './PatientSearchAppointmentModal';
import PatientNavigator from './PatientNavigator';
import AppointmentCard from './AppointmentCard';
import AppointmentQueueWrapper from './AppointmentQueueWrapper';
import TodaysAppointments from './TodaysAppointments';
import { FaCalendarAlt, FaUserTie, FaClipboardList, FaUser, FaUserClock } from 'react-icons/fa';
import { getTimeBasedGreeting, getFormattedDate, identifyAppointmentsNeedingDiagnosis, getRelativeDateLabel } from '../utils/timeUtils';
import { getCreatorLabel } from '../utils/recordCreation';
import { transformAppointmentFromBackend } from '../utils/dataTransformers';
import './AppointmentTabs.css';

function SimplifiedSecretaryDashboard({
  patients,
  appointments,
  onUpdatePatient,
  onDiagnoseAppointment,
  onDeleteAppointment,
  onDeletePatient,
  username,
  userRole,
  userInfo
}) {
  // Debug props
  console.log('Secretary Dashboard - username:', username);
  console.log('Secretary Dashboard - userInfo:', userInfo);

  // Set global user role for patient view component
  window.userRole = 'secretary';
  // State for active tab (patient-management, appointments, calendar, or queue)
  const [activeTab, setActiveTab] = useState('patient-management');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [rebookingAppointment, setRebookingAppointment] = useState(null);
  const [showAddAppointmentForm, setShowAddAppointmentForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // State for today's appointments and time filter
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [timeFilter, setTimeFilter] = useState('today');

  // Fetch today's appointments whenever appointments change
  useEffect(() => {
    const fetchTodaysAppointments = async () => {
      try {
        const appointments = await getTodaysAppointments();
        setTodaysAppointments(appointments);
        console.log('Secretary dashboard - Today\'s appointments updated:', appointments);
      } catch (error) {
        console.error('Error fetching today\'s appointments:', error);
        setTodaysAppointments([]);
      }
    };

    fetchTodaysAppointments();
  }, [appointments]);

  // Identify appointments that need diagnoses
  const appointmentsNeedingDiagnosis = identifyAppointmentsNeedingDiagnosis(appointments);

  // Calculate analytics
  const totalPatients = patients.length;
  const pendingAppointments = appointments.filter(a => a.status === 'Scheduled').length;
  const needsDiagnosisCount = appointmentsNeedingDiagnosis.length;

  // Helper function to filter appointments by time period
  const filterAppointmentsByTimePeriod = (appointments, timePeriod) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Calculate tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Calculate start of this week (Sunday)
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisWeekStartStr = thisWeekStart.toISOString().split('T')[0];

    // Calculate start of next week (next Sunday)
    const nextWeekStart = new Date(thisWeekStart);
    nextWeekStart.setDate(thisWeekStart.getDate() + 7);
    const nextWeekStartStr = nextWeekStart.toISOString().split('T')[0];

    // Calculate end of next week (next Saturday)
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
    const nextWeekEndStr = nextWeekEnd.toISOString().split('T')[0];

    // Calculate start of this month
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthStartStr = thisMonthStart.toISOString().split('T')[0];

    // Calculate start of next month
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextMonthStartStr = nextMonthStart.toISOString().split('T')[0];

    switch (timePeriod) {
      case 'today':
        return appointments.filter(a => a.date === todayStr);
      case 'tomorrow':
        return appointments.filter(a => a.date === tomorrowStr);
      case 'thisWeek':
        return appointments.filter(a => a.date >= thisWeekStartStr && a.date < nextWeekStartStr);
      case 'nextWeek':
        return appointments.filter(a => a.date >= nextWeekStartStr && a.date <= nextWeekEndStr);
      case 'thisMonth':
        return appointments.filter(a => a.date >= thisMonthStartStr && a.date < nextMonthStartStr);
      default:
        return appointments;
    }
  };

  // Filter upcoming appointments (excluding today's)
  const upcomingAppointments = appointments
    .filter(a => {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Get appointment date
      const appointmentDateStr = a.date;

      console.log(`Secretary - Upcoming filter - Appointment date: ${appointmentDateStr}, Today: ${todayStr}`);

      // Only include future dates (strictly after today)
      return appointmentDateStr > todayStr;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5); // Show only next 5 upcoming appointments

  console.log('Secretary - Upcoming appointments:', upcomingAppointments);

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
    setSelectedPatient(null);
  };

  // Handle adding a new patient
  const handleAddPatient = (newPatient) => {
    onUpdatePatient(newPatient); // This will add the patient to the patients array
    setShowAddPatientForm(false);
    // Select the newly created patient
    setSelectedPatient(newPatient);
    setActiveTab('patient-management');
  };

  // Handle rebooking an appointment
  const handleRebookAppointment = (appointment) => {
    setRebookingAppointment(appointment);
  };

  return (
    <div className="p-2">
      {/* Welcome Banner with Quick Stats and Upcoming Appointments */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-md p-3 mb-3 text-white shadow-md relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 mb-3">
          <div>
            <h1 className="text-base md:text-lg lg:text-xl font-semibold mb-0.5 leading-tight">{getTimeBasedGreeting()}, {username}</h1>
            <p className="text-blue-100 text-xs">{getFormattedDate()}</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <div className="bg-white bg-opacity-20 rounded-md p-1.5 backdrop-blur-sm">
              <div className="font-semibold text-sm leading-tight">{todaysAppointments.length}</div>
              <div className="text-xs">Today's Appointments</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-md p-1.5 backdrop-blur-sm">
              <div className="font-semibold text-sm leading-tight">{pendingAppointments}</div>
              <div className="text-xs">Scheduled Appointments</div>
            </div>

            <div className="bg-white bg-opacity-20 rounded-md p-1.5 backdrop-blur-sm">
              <div className="font-semibold text-sm leading-tight">{totalPatients}</div>
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
                // Get relative date label
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
                  <div className="text-xs flex justify-between">
                    <span className="font-semibold">{relativeDateLabel}</span>
                    <span>{appointment.time}</span>
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
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('patient-management')}
            className={`py-3 px-2 rounded-md flex flex-col justify-center items-center transition-all ${
              activeTab === 'patient-management'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaUserTie className="h-6 w-6 mb-1" />
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
        {activeTab === 'calendar' ? (
          <SecretaryCalendarView
            appointments={appointments}
            onUpdateAppointment={(updatedAppointment) => {
              console.log('Updating appointment from calendar in SimplifiedSecretaryDashboard:', updatedAppointment);
              // Update the appointment in the global state
              onDiagnoseAppointment(updatedAppointment);

              // Wait a moment before refreshing the UI
              setTimeout(() => {
                // Force a re-render by updating the state slightly
                setActiveTab(prev => prev === 'calendar' ? 'calendar' : prev);
              }, 500);
            }}
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
              userRole="secretary"
              onUpdateAppointment={onDiagnoseAppointment}
              onViewPatient={handleViewPatient}
              onEditAppointment={setEditingAppointment}
              onDeleteAppointment={onDeleteAppointment}
              onUpdatePatient={onUpdatePatient}
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                  aria-label="View Calendar"
                >
                  <span className="hidden md:inline">View Calendar</span>
                  <span className="md:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                </button>
              </div>

              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map(appointment => (
                    <AppointmentCard
                      key={appointment.id || appointment._id}
                      appointment={appointment}
                      onViewPatient={handleViewPatient}
                      onEditAppointment={(appointment) => setEditingAppointment(appointment)}
                      onDeleteAppointment={onDeleteAppointment}
                      patients={patients}
                      onUpdatePatient={onUpdatePatient}
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
              <>
                <SecretaryPatientView
                  patient={selectedPatient}
                  patients={patients}
                  appointments={appointments.filter(a =>
                    (a.patientId === selectedPatient.id) ||
                    (a.patient_id === selectedPatient._id) ||
                    (a.patientId === selectedPatient._id) ||
                    (a.patient_id === selectedPatient.id)
                  )}
                  onClose={handleClosePatientView}
                  onUpdatePatient={onUpdatePatient}
                  onSelectPatient={setSelectedPatient}
                  onDeletePatient={onDeletePatient}
                />
              </>
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
              createdBy="secretary"
            />
          </div>
        </div>
      )}

      {/* Patient Search for Appointment Modal */}
      {showAddAppointmentForm && (
        <PatientSearchAppointmentModal
          patients={patients}
          onClose={() => setShowAddAppointmentForm(false)}
          onSave={(newAppointment) => {
            console.log('Adding new appointment in SimplifiedSecretaryDashboard:', newAppointment);
            // Add the new appointment to the global state
            onDiagnoseAppointment(newAppointment);
            setShowAddAppointmentForm(false);

            // Wait a moment before refreshing the UI
            setTimeout(() => {
              // Force a re-render by updating the state
              setShowAddAppointmentForm(false);
            }, 500);
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
            console.log('Saving appointment in SimplifiedSecretaryDashboard:', updatedAppointment);
            // Update the appointment in the global state
            onDiagnoseAppointment(updatedAppointment);
            setEditingAppointment(null);

            // Wait a moment before refreshing the UI
            setTimeout(() => {
              // Force a re-render by updating the state
              setEditingAppointment(null);
            }, 500);
          }}
        />
      )}
    </div>
  );
}

export default SimplifiedSecretaryDashboard;
