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

  // State for today's appointments
  const [todaysAppointments, setTodaysAppointments] = useState([]);

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
    <div className="p-4">
      {/* Welcome Banner with Quick Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-6 mb-6 text-white shadow-lg relative">
        <div className="absolute inset-0 opacity-40 rounded-lg overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\",%3E%3Cg fill=\"none\" fill-rule=\"evenodd\",%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.6\",%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')", backgroundSize: "30px 30px"}}>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold mb-2">{getTimeBasedGreeting()}, {username}</h1>
            <p className="text-blue-100">{getFormattedDate()}</p>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <div className="font-bold text-2xl">{todaysAppointments.length}</div>
              <div className="text-sm">Today's Appointments</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <div className="font-bold text-2xl">{pendingAppointments}</div>
              <div className="text-sm">Pending Appointments</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <div className="font-bold text-2xl">{needsDiagnosisCount}</div>
              <div className="text-sm">Needs Diagnosis</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <div className="font-bold text-2xl">{totalPatients}</div>
              <div className="text-sm">Total Patients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6 p-1">
        <div className="flex flex-wrap">
          <button
            onClick={() => setActiveTab('patient-management')}
            className={`flex-1 py-3 px-4 rounded-md font-medium text-base transition-all duration-200 flex justify-center items-center ${
              activeTab === 'patient-management'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <FaUserTie className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Patient Management</span>
              <span className="sm:hidden">Patients</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-3 px-4 rounded-md font-medium text-base transition-all duration-200 flex justify-center items-center ${
              activeTab === 'appointments'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <FaClipboardList className="h-5 w-5 mr-2" />
              <span>Appointments</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-3 px-4 rounded-md font-medium text-base transition-all duration-200 flex justify-center items-center ${
              activeTab === 'calendar'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <FaCalendarAlt className="h-5 w-5 mr-2" />
              <span>Calendar</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-md p-6">
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
                <h2 className="text-lg font-semibold text-gray-800">Today's Appointments</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddAppointmentForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Appointment
                  </button>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {todaysAppointments.length} Appointments
                  </div>
                </div>
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
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusFilter === 'Needs Diagnosis' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                >
                  Needs Diagnosis
                </button>
              </div>

              {/* Filter appointments based on selected status */}
              {todaysAppointments.length > 0 ? (
                todaysAppointments.filter(appointment => statusFilter === 'all' || appointment.status === statusFilter).length > 0 ? (
                <div className="space-y-3">
                  {todaysAppointments
                    .filter(appointment => statusFilter === 'all' || appointment.status === statusFilter)
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
                            className="text-blue-600 hover:text-blue-800 font-medium"
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
                          >
                            View Patient
                          </button>
                          <div className="flex space-x-2">
                            <button
                              className="text-green-600 hover:text-green-800 font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAppointment(appointment);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteAppointment(appointment._id);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      No {statusFilter.toLowerCase()} appointments found for today.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    {statusFilter === 'all'
                      ? 'No appointments scheduled for today.'
                      : `No ${statusFilter.toLowerCase()} appointments for today.`}
                  </p>
                </div>
              )}
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
                            className="text-blue-600 hover:text-blue-800 font-medium"
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
                          >
                            View Patient
                          </button>
                          <div className="flex space-x-2">
                            <button
                              className="text-green-600 hover:text-green-800 font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAppointment(appointment);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteAppointment(appointment._id);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No upcoming appointments scheduled.</p>
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
                  appointments={appointments.filter(a => a.patientId === selectedPatient.id || a.patient_id === selectedPatient._id)}
                  onClose={handleClosePatientView}
                  onUpdatePatient={onUpdatePatient}
                  onSelectPatient={setSelectedPatient}
                  onDeletePatient={onDeletePatient}
                />
              </>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Patient Search</h2>
                  <button
                    onClick={() => setShowAddPatientForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add New Patient
                  </button>
                </div>
                <PatientSearch
                  patients={patients}
                  onSelectPatient={setSelectedPatient}
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
