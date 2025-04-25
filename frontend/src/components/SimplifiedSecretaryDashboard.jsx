import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTodaysAppointments } from '../data/mockData';
import PatientSearch from './PatientSearch';
// Using a simplified version for now
import SecretaryPatientView from './BasicPatientView';
import AddPatientForm from './AddPatientForm';
import SecretaryCalendarView from './SecretaryCalendarView';
import AppointmentManagementModal from './AppointmentManagementModal';
import PatientSearchAppointmentModal from './PatientSearchAppointmentModal';
import PatientNavigator from './PatientNavigator';
import { FaCalendarAlt, FaUserTie, FaClipboardList } from 'react-icons/fa';
import { getTimeBasedGreeting, getFormattedDate, identifyAppointmentsNeedingDiagnosis } from '../utils/timeUtils';
import { transformAppointmentFromBackend } from '../utils/dataTransformers';
import './AppointmentTabs.css';

function SimplifiedSecretaryDashboard({
  patients,
  appointments,
  onUpdatePatient,
  onDiagnoseAppointment,
  onDeleteAppointment,
  onDeletePatient,
  username
}) {
  const [activeTab, setActiveTab] = useState('patient-management');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [rebookingAppointment, setRebookingAppointment] = useState(null);
  const [showAddAppointmentForm, setShowAddAppointmentForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // State for today's appointments and time filter
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all');

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
            <h1 className="text-lg font-bold mb-0.5 leading-tight">{getTimeBasedGreeting()}</h1>
            <p className="text-blue-100 text-xs">{getFormattedDate()}</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <div className="bg-white bg-opacity-20 rounded-md p-1.5 backdrop-blur-sm">
              <div className="font-bold text-base leading-tight">{todaysAppointments.length}</div>
              <div className="text-xs">Today's Appointments</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-md p-1.5 backdrop-blur-sm">
              <div className="font-bold text-base leading-tight">{pendingAppointments}</div>
              <div className="text-xs">Pending Appointments</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-md p-1.5 backdrop-blur-sm">
              <div className="font-bold text-base leading-tight">{needsDiagnosisCount}</div>
              <div className="text-xs">Needs Diagnosis</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-md p-1.5 backdrop-blur-sm">
              <div className="font-bold text-base leading-tight">{totalPatients}</div>
              <div className="text-xs">Total Patients</div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments Section */}
        {upcomingAppointments.length > 0 && (
          <div className="mt-2">
            <h3 className="text-sm font-semibold mb-2">Upcoming Appointments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {upcomingAppointments.slice(0, 3).map((appointment) => (
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
                  <div className="font-semibold text-sm">{appointment.patientName}</div>
                  <div className="text-xs flex justify-between">
                    <span>{appointment.date}</span>
                    <span>{appointment.time}</span>
                  </div>
                  <div className="text-xs mt-1">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      appointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compact Tab Navigation */}
      <div className="bg-white rounded-md shadow-sm mb-3 p-0.5">
        <div className="flex flex-wrap">
          <button
            onClick={() => setActiveTab('patient-management')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium text-sm transition-all duration-200 flex justify-center items-center ${
              activeTab === 'patient-management'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <FaUserTie className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Patients</span>
              <span className="sm:hidden">Patients</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium text-sm transition-all duration-200 flex justify-center items-center ${
              activeTab === 'appointments'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <FaClipboardList className="h-3.5 w-3.5 mr-1" />
              <span>Appointments</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium text-sm transition-all duration-200 flex justify-center items-center ${
              activeTab === 'calendar'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <FaCalendarAlt className="h-3.5 w-3.5 mr-1" />
              <span>Calendar</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content Area - More Compact */}
      <div className="bg-white rounded-md shadow-sm p-2">
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
          <div>
            {/* Today's Appointments Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="section-header">Today's Appointments</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddAppointmentForm(true)}
                    className="add-appointment-btn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Appointment
                  </button>
                  <div className="appointment-count">
                    {todaysAppointments.length} Appointments
                  </div>
                </div>
              </div>

              {/* Time period filter tabs */}
              <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                <button
                  onClick={() => setTimeFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${timeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setTimeFilter('today')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${timeFilter === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimeFilter('tomorrow')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${timeFilter === 'tomorrow' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => setTimeFilter('thisWeek')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${timeFilter === 'thisWeek' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setTimeFilter('nextWeek')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${timeFilter === 'nextWeek' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  Next Week
                </button>
                <button
                  onClick={() => setTimeFilter('thisMonth')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${timeFilter === 'thisMonth' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  This Month
                </button>
              </div>

              {/* Status filter tabs */}
              <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('Pending')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusFilter === 'Pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter('Scheduled')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusFilter === 'Scheduled' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                >
                  Scheduled
                </button>
                <button
                  onClick={() => setStatusFilter('Completed')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusFilter === 'Completed' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setStatusFilter('Cancelled')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusFilter === 'Cancelled' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                >
                  Cancelled
                </button>
                <button
                  onClick={() => setStatusFilter('Needs Diagnosis')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusFilter === 'Needs Diagnosis' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}`}
                >
                  Needs Diagnosis
                </button>
              </div>

              {/* Filter appointments based on selected time period and status */}
              {(() => {
                // First filter by time period, then by status
                const filteredAppointments = timeFilter === 'all' ?
                  appointments : filterAppointmentsByTimePeriod(appointments, timeFilter);

                if (filteredAppointments.length > 0) {
                  if (filteredAppointments.filter(appointment => statusFilter === 'all' || appointment.status === statusFilter).length > 0) {
                    return (
                <div className="space-y-3">
                  {filteredAppointments
                    .filter(appointment => statusFilter === 'all' || appointment.status === statusFilter)
                    .sort((a, b) => {
                      // Sort by date first
                      const dateCompare = new Date(a.date) - new Date(b.date);
                      if (dateCompare !== 0) return dateCompare;
                      // If same date, sort by time
                      return a.time.localeCompare(b.time);
                    })
                    .map(appointment => (
                    <div
                      key={appointment.id}
                      className={`p-4 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-blue-50 transition-colors ${appointment.status === 'Scheduled' ? 'bg-green-50' : appointment.status === 'Completed' ? 'bg-blue-50' : appointment.status === 'Cancelled' ? 'bg-red-50' : appointment.status === 'Pending' ? 'bg-yellow-50' : 'bg-white'}`}
                      onClick={() => {
                        const patient = patients.find(p => p.id === appointment.patientId);
                        if (patient) {
                          handleViewPatient(patient);
                        } else {
                          // If patient not found, create a basic patient object from appointment data
                          const newPatient = {
                            id: appointment.patientId,
                            firstName: appointment.patientName.split(' ')[0],
                            lastName: appointment.patientName.split(' ').slice(1).join(' '),
                            dateOfBirth: '',
                            gender: '',
                            phone: '',
                            lastVisit: new Date().toISOString().split('T')[0],
                            medicalHistory: [],
                            medications: [],
                            allergies: []
                          };
                          onUpdatePatient(newPatient); // Add to global state
                          handleViewPatient(newPatient);
                        }
                      }}
                    >
                      <div>
                        <div className="font-medium text-lg">{appointment.time} - {appointment.patientName}</div>
                        <div className="text-gray-600">{appointment.type}: {appointment.reason}</div>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              const patient = patients.find(p => p.id === appointment.patientId);
                              if (patient) {
                                handleViewPatient(patient);
                              } else {
                                // If patient not found, create a basic patient object from appointment data
                                const newPatient = {
                                  id: appointment.patientId,
                                  firstName: appointment.patientName.split(' ')[0],
                                  lastName: appointment.patientName.split(' ').slice(1).join(' '),
                                  dateOfBirth: '',
                                  gender: '',
                                  phone: '',
                                  lastVisit: new Date().toISOString().split('T')[0],
                                  medicalHistory: [],
                                  medications: [],
                                  allergies: []
                                };
                                onUpdatePatient(newPatient); // Add to global state
                                handleViewPatient(newPatient);
                              }
                            }}
                            title="View Patient"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <div className="flex space-x-2">
                            <button
                              className="text-green-600 hover:text-green-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAppointment(appointment);
                              }}
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteAppointment(appointment._id);
                              }}
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                    );
                  } else {
                    return (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                          No {statusFilter.toLowerCase()} appointments found for {timeFilter === 'all' ? 'any time period' :
                            timeFilter === 'today' ? 'today' :
                            timeFilter === 'tomorrow' ? 'tomorrow' :
                            timeFilter === 'thisWeek' ? 'this week' :
                            timeFilter === 'nextWeek' ? 'next week' :
                            timeFilter === 'thisMonth' ? 'this month' : 'the selected time period'}.
                        </p>
                      </div>
                    );
                  }
                } else {
                  return (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        {statusFilter === 'all'
                          ? `No appointments scheduled for ${timeFilter === 'all' ? 'any time period' :
                              timeFilter === 'today' ? 'today' :
                              timeFilter === 'tomorrow' ? 'tomorrow' :
                              timeFilter === 'thisWeek' ? 'this week' :
                              timeFilter === 'nextWeek' ? 'next week' :
                              timeFilter === 'thisMonth' ? 'this month' : 'the selected time period'}.`
                          : `No ${statusFilter.toLowerCase()} appointments for ${timeFilter === 'all' ? 'any time period' :
                              timeFilter === 'today' ? 'today' :
                              timeFilter === 'tomorrow' ? 'tomorrow' :
                              timeFilter === 'thisWeek' ? 'this week' :
                              timeFilter === 'nextWeek' ? 'next week' :
                              timeFilter === 'thisMonth' ? 'this month' : 'the selected time period'}.`}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Upcoming Appointments Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                >
                  View Calendar
                </button>
              </div>

              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className={`p-4 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-blue-50 transition-colors ${appointment.status === 'Scheduled' ? 'bg-green-50' : appointment.status === 'Completed' ? 'bg-blue-50' : appointment.status === 'Cancelled' ? 'bg-red-50' : appointment.status === 'Pending' ? 'bg-yellow-50' : 'bg-white'}`}
                      onClick={() => {
                        const patient = patients.find(p => p.id === appointment.patientId);
                        if (patient) {
                          handleViewPatient(patient);
                        } else {
                          // If patient not found, create a basic patient object from appointment data
                          const newPatient = {
                            id: appointment.patientId,
                            firstName: appointment.patientName.split(' ')[0],
                            lastName: appointment.patientName.split(' ').slice(1).join(' '),
                            dateOfBirth: '',
                            gender: '',
                            phone: '',
                            lastVisit: new Date().toISOString().split('T')[0],
                            medicalHistory: [],
                            medications: [],
                            allergies: []
                          };
                          onUpdatePatient(newPatient); // Add to global state
                          handleViewPatient(newPatient);
                        }
                      }}
                    >
                      <div>
                        <div className="font-medium">{appointment.date} at {appointment.time}</div>
                        <div className="text-sm text-gray-600">{appointment.patientName} - {appointment.reason}</div>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              const patient = patients.find(p => p.id === appointment.patientId);
                              if (patient) {
                                handleViewPatient(patient);
                              } else {
                                // If patient not found, create a basic patient object from appointment data
                                const newPatient = {
                                  id: appointment.patientId,
                                  firstName: appointment.patientName.split(' ')[0],
                                  lastName: appointment.patientName.split(' ').slice(1).join(' '),
                                  dateOfBirth: '',
                                  gender: '',
                                  phone: '',
                                  lastVisit: new Date().toISOString().split('T')[0],
                                  medicalHistory: [],
                                  medications: [],
                                  allergies: []
                                };
                                onUpdatePatient(newPatient); // Add to global state
                                handleViewPatient(newPatient);
                              }
                            }}
                            title="View Patient"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <div className="flex space-x-2">
                            <button
                              className="text-green-600 hover:text-green-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAppointment(appointment);
                              }}
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteAppointment(appointment._id);
                              }}
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-appointments">
                  <p>No upcoming appointments scheduled.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Patient Management Tab */}
            {selectedPatient ? (
              <>
                <PatientNavigator
                  patients={patients}
                  currentPatient={selectedPatient}
                  onSelectPatient={setSelectedPatient}
                  onClose={handleClosePatientView}
                />
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
                  <div>
                    <h2 className="text-base font-bold text-gray-800 mb-0.5">Patient Management</h2>
                    <p className="text-gray-600 text-xs">Search for patients or add a new patient record</p>
                  </div>
                  <button
                    onClick={() => setShowAddPatientForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center shadow-sm transition duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add New Patient
                  </button>
                </div>

                <div className="bg-gray-50 p-2 rounded border border-gray-200 mb-2">
                  <div className="mb-1">
                    <h3 className="text-xs font-semibold text-gray-800 mb-0.5 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                      Patient Search
                    </h3>
                    <p className="text-gray-600 text-[10px]">Search for a patient by name, ID, or phone number</p>
                  </div>
                  <PatientSearch
                    patients={patients}
                    onSelectPatient={setSelectedPatient}
                  />
                </div>

                {/* Recent Patients Quick Access */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-800 mb-1">Recent Patients</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                    {patients.slice(0, 6).map(patient => (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className="bg-white p-1 rounded border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                      >
                        <div className="font-medium text-xs text-blue-700">{patient.firstName} {patient.lastName}</div>
                        <div className="text-[10px] text-gray-600">{patient.gender} • {patient.phone}</div>
                        {patient.createdBy && (
                          <div className="text-[8px] text-gray-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            By: <span className="font-medium ml-0.5">
                              {patient.createdBy === 'visitor' ? 'Patient' :
                               patient.createdBy === 'doctor' ? 'Doctor' :
                               patient.createdBy === 'secretary' ? 'Secretary' :
                               'Unknown'}
                            </span>
                          </div>
                        )}
                        <button
                          className="mt-0.5 text-blue-600 hover:text-blue-800 text-[10px] font-medium flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(patient);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
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
