import { useState, useEffect } from 'react';
import { getTodaysAppointments } from '../data/mockData';
import PatientSearch from './PatientSearch';
import SimplifiedPatientView from './BasicPatientView';
import SimplifiedDiagnosisModal from './SimplifiedDiagnosisModal';
import AddPatientForm from './AddPatientForm';
import DoctorCalendarView from './DoctorCalendarView';
import PatientNavigator from './PatientNavigator';
import GlobalDiagnosesView from './GlobalDiagnosesView';
import DoctorPatientSearchAppointmentModal from './DoctorPatientSearchAppointmentModal';
import AppointmentManagementModal from './AppointmentManagementModal';
import { FaCalendarAlt, FaUserMd, FaClipboardList, FaSearch, FaUserPlus, FaEye, FaArrowLeft, FaUser, FaFileMedical } from 'react-icons/fa';
import { getCreatorLabel } from '../utils/recordCreation';
import { getTimeBasedGreeting, getFormattedDate, filterAppointmentsByTimePeriod, updateAppointmentStatuses, identifyAppointmentsNeedingDiagnosis } from '../utils/timeUtils';
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
  username
}) {
  const [activeTab, setActiveTab] = useState('patient-management');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosingAppointment, setDiagnosingAppointment] = useState(null);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [showAddAppointmentForm, setShowAddAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

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

  // Handle saving diagnosis
  const handleSaveDiagnosis = (updatedAppointment) => {
    // Make sure the appointment status is set to Completed when adding a diagnosis
    const appointmentWithStatus = {
      ...updatedAppointment,
      status: 'Completed'
    };

    console.log('Saving diagnosis in SimplifiedDoctorDashboard:', appointmentWithStatus);

    // Check if this is a new diagnosis or an update to an existing one
    const isNewDiagnosis = !diagnosingAppointment.diagnosis;

    // If this is a new diagnosis for an appointment that already has diagnoses,
    // we need to preserve the existing diagnoses array
    if (!isNewDiagnosis && diagnosingAppointment.diagnoses) {
      // Add the new diagnosis to the existing diagnoses array
      appointmentWithStatus.diagnoses = [
        appointmentWithStatus.diagnosis,
        ...diagnosingAppointment.diagnoses
      ];
    }

    // Update the appointment in the global state
    onDiagnoseAppointment(appointmentWithStatus);

    // Close the diagnosis modal
    setDiagnosingAppointment(null);

    // Trigger a local refresh to ensure UI is updated
    setLocalRefreshTrigger(prev => prev + 1);

    // If we're in the patient management tab, wait a moment then refresh the patient view
    if (activeTab === 'patient-management' && selectedPatient) {
      // Wait a moment to ensure the diagnosis is saved before refreshing
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
            <h1 className="text-lg font-bold mb-0.5 leading-tight">{greeting}, Dr. Paul Muchai</h1>
            <p className="text-blue-100 text-xs">{currentDate}</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <div className="bg-white bg-opacity-20 rounded-md p-1.5 backdrop-blur-sm">
              <div className="font-bold text-base leading-tight">{todaysAppointments.length}</div>
              <div className="text-xs">Today's Appointments</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-md p-1.5 backdrop-blur-sm">
              <div className="font-bold text-base leading-tight">{pendingDiagnoses}</div>
              <div className="text-xs">Needs Diagnosis</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-md p-1.5 backdrop-blur-sm">
              <div className="font-bold text-base leading-tight">{patients.length}</div>
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

      {/* Compact Tab Navigation - Same as Secretary Dashboard */}
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
              <FaUserMd className="h-3.5 w-3.5 mr-1" />
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
          <button
            onClick={() => setActiveTab('diagnoses')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium text-sm transition-all duration-200 flex justify-center items-center ${
              activeTab === 'diagnoses'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <FaFileMedical className="h-3.5 w-3.5 mr-1" />
              <span>Diagnoses</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content Area - More Compact - Same as Secretary Dashboard */}
      <div className="bg-white rounded-md shadow-sm p-2">
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
                            className="text-yellow-600 hover:text-yellow-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDiagnosingAppointment(appointment);
                            }}
                            title="Diagnose"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
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
                  ))}
                </div>
                    );
                  } else {
                    return (
                  <div className="no-appointments">
                    <p>
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
                } else if (timeFilter === 'all') {
                  return (
                <div className="no-appointments">
                  <p>
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

            {/* Pending Diagnoses Section */}
            {appointmentsNeedingDiagnosis.length > 0 && (
              <div className="mb-4">
                <h2 className="section-header flex items-center">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
                    {appointmentsNeedingDiagnosis.length}
                  </span>
                  Appointments Needing Diagnosis
                </h2>
                <div className="space-y-3">
                  {appointmentsNeedingDiagnosis
                    .sort((a, b) => {
                      // Sort by date first (oldest first)
                      const dateCompare = new Date(a.date) - new Date(b.date);
                      if (dateCompare !== 0) return dateCompare;
                      // If same date, sort by time
                      return a.time.localeCompare(b.time);
                    })
                    .map(appointment => (
                      <div
                        key={appointment.id}
                        className="p-4 rounded-lg border border-yellow-300 bg-yellow-50 flex justify-between items-center cursor-pointer hover:bg-yellow-100 transition-colors"
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
                          <div className="font-medium text-lg">{appointment.date} at {appointment.time} - {appointment.patientName}</div>
                          <div className="text-gray-600">{appointment.type}: {appointment.reason}</div>
                          <div className="text-sm text-yellow-700 mt-1">
                            <span className="font-medium">Status:</span> {appointment.status === 'Needs Diagnosis' ? 'Needs Diagnosis' : 'Completed without diagnosis'}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDiagnosingAppointment(appointment);
                            }}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Add Diagnosis"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              const patient = patients.find(p => p.id === appointment.patientId);
                              if (patient) {
                                handleViewPatient(patient);
                              }
                            }}
                            title="View Patient"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Upcoming Appointments Section */}
            <div>
              <h2 className="section-header">Upcoming Appointments</h2>

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
                        <div className="font-medium text-lg">{appointment.date} at {appointment.time}</div>
                        <div className="text-gray-600">{appointment.patientName} - {appointment.reason}</div>
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
                            className="text-yellow-600 hover:text-yellow-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDiagnosingAppointment(appointment);
                            }}
                            title="Diagnose"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Patient Management</h2>
                    <p className="text-gray-600 text-base md:text-lg">Search for patients or add a new patient record</p>
                  </div>
                  <button
                    onClick={() => setShowAddPatientForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-md font-medium text-base md:text-lg flex items-center shadow-md transition duration-200"
                  >
                    <FaUserPlus className="h-5 w-5 mr-2" />
                    Add New Patient
                  </button>
                </div>

                <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200 mb-6">
                  <div className="mb-4">
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2 flex items-center">
                      <FaSearch className="mr-2 text-blue-600" size={24} />
                      Patient Search
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base">Search for a patient by name, ID, or phone number</p>
                  </div>
                  <PatientSearch
                    patients={patients}
                    onSelectPatient={setSelectedPatient}
                  />
                </div>

                {/* Recent Patients Quick Access */}
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Recent Patients</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patients.slice(0, 6).map(patient => (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className="bg-white p-4 md:p-5 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <div className="font-medium text-blue-700 text-base md:text-lg">{patient.firstName} {patient.lastName}</div>
                        <div className="text-sm md:text-base text-gray-600">{calculateAge(patient.dateOfBirth)} years • {patient.gender}</div>
                        <div className="text-sm md:text-base text-gray-600 mt-2">Phone: {patient.phone}</div>
                        {patient.createdBy && (
                          <div className="text-xs md:text-sm text-gray-500 flex items-center mt-2">
                            <FaUser className="mr-1" size={12} />
                            Added by: <span className="font-medium ml-1">
                              {patient.createdBy === 'visitor' ? 'Patient (Online)' :
                               patient.createdBy === 'doctor' ? 'Doctor' :
                               patient.createdBy === 'secretary' ? 'Secretary' :
                               patient.createdByName || getCreatorLabel(patient.createdBy)}
                            </span>
                          </div>
                        )}
                        <button
                          className="mt-3 text-blue-600 hover:text-blue-800 text-sm md:text-base font-medium flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(patient);
                          }}
                        >
                          <FaEye className="mr-2" size={16} /> View Details
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

      {/* Diagnosis Modal */}
      {diagnosingAppointment && (
        <SimplifiedDiagnosisModal
          appointment={diagnosingAppointment}
          onClose={() => setDiagnosingAppointment(null)}
          onSave={handleSaveDiagnosis}
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
