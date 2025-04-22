import { useState, useEffect } from 'react';
import { getTodaysAppointments } from '../data/mockData';
import PatientSearch from './PatientSearch';
import SimplifiedPatientView from './SimplifiedPatientView';
import SimplifiedDiagnosisModal from './SimplifiedDiagnosisModal';
import AddPatientForm from './AddPatientForm';
import DoctorCalendarView from './DoctorCalendarView';
import PatientNavigator from './PatientNavigator';
import { createAppointmentRecord } from '../utils/recordCreation';
import DoctorPatientSearchAppointmentModal from './DoctorPatientSearchAppointmentModal';
import AppointmentManagementModal from './AppointmentManagementModal';
import { FaCalendarAlt, FaUserMd, FaClipboardList, FaSearch, FaUserPlus, FaEye, FaArrowLeft, FaTimes, FaPlus, FaUser } from 'react-icons/fa';
import { getCreatorLabel } from '../utils/recordCreation';

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
  username
}) {
  const [activeTab, setActiveTab] = useState('patient-management');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosingAppointment, setDiagnosingAppointment] = useState(null);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [showAddAppointmentForm, setShowAddAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Get today's appointments - recalculate whenever appointments change
  const todaysAppointments = getTodaysAppointments();

  // Log today's appointments whenever they change
  useEffect(() => {
    console.log('Doctor dashboard - Today\'s appointments updated:', todaysAppointments);
  }, [todaysAppointments, appointments]);

  // Filter upcoming appointments (excluding today's)
  const upcomingAppointments = appointments
    .filter(a => {
      const appointmentDate = new Date(a.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get date strings for comparison logging
      const appointmentDateStr = a.date;
      const todayDateStr = today.toISOString().split('T')[0];
      console.log(`Upcoming filter - Appointment date: ${appointmentDateStr}, Today: ${todayDateStr}`);

      // Only include future dates (not today)
      return appointmentDate > today;
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

    // Update the appointment in the global state
    onDiagnoseAppointment(appointmentWithStatus);

    // Close the diagnosis modal
    setDiagnosingAppointment(null);

    // If we're in the patient management tab, refresh the patient view
    if (activeTab === 'patient-management' && selectedPatient) {
      // This will trigger a re-render of the SimplifiedPatientView component
      setSelectedPatient({...selectedPatient});
    }
  };

  // Handle adding a new patient
  const handleAddPatient = (newPatient) => {
    onUpdatePatient(newPatient); // This will add the patient to the patients array
    setShowAddPatientForm(false);
    // Select the newly created patient
    setSelectedPatient(newPatient);
    setActiveTab('patient-management');
  };

  // Get current date in a readable format
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Count pending diagnoses
  const pendingDiagnoses = appointments.filter(a => a.status === 'Completed' && !a.diagnosis).length;

  // We don't want to auto-select patients anymore
  // This was causing the search to not be visible by default
  useEffect(() => {
    // Only auto-select if explicitly requested via URL or other means
    // This is intentionally left empty to prevent auto-selection
  }, [activeTab, selectedPatient, todaysAppointments, patients]);

  return (
    <div className="p-4">
      {/* Welcome Banner with Quick Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-6 mb-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome, Dr. {username}!</h1>
            <p className="text-blue-100">{currentDate}</p>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <div className="font-bold text-2xl">{todaysAppointments.length}</div>
              <div className="text-sm">Today's Appointments</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <div className="font-bold text-2xl">{pendingDiagnoses}</div>
              <div className="text-sm">Pending Diagnoses</div>
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
              <FaUserMd className="h-5 w-5 mr-2" />
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
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
        {activeTab === 'calendar' ? (
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
                <h2 className="text-lg font-semibold text-gray-800">Today's Appointments</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddAppointmentForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center"
                  >
                    <FaPlus className="h-3 w-3 mr-1" />
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
                        <button
                          className="text-green-600 hover:text-green-800 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAppointment(appointment);
                          }}
                        >
                          Edit
                        </button>
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
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>

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
                        <button
                          className="text-green-600 hover:text-green-800 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAppointment(appointment);
                          }}
                        >
                          Edit
                        </button>
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
              <div className="relative">
                <PatientNavigator
                  patients={patients}
                  currentPatient={selectedPatient}
                  onSelectPatient={setSelectedPatient}
                  onClose={handleClosePatientView}
                />
                <SimplifiedPatientView
                  patient={selectedPatient}
                  appointments={appointments.filter(a => a.patientId === selectedPatient.id)}
                  onClose={handleClosePatientView}
                  onUpdatePatient={onUpdatePatient}
                  onDiagnoseAppointment={onDiagnoseAppointment}
                  onDeletePatient={onDeletePatient}
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Patient Management</h2>
                    <p className="text-gray-600">Search for patients or add a new patient record</p>
                  </div>
                  <button
                    onClick={() => setShowAddPatientForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium flex items-center shadow-md transition duration-200"
                  >
                    <FaUserPlus className="h-4 w-4 mr-2" />
                    Add New Patient
                  </button>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                      <FaSearch className="mr-2 text-blue-600" />
                      Patient Search
                    </h3>
                    <p className="text-gray-600 text-sm">Search for a patient by name, ID, or phone number</p>
                  </div>
                  <PatientSearch
                    patients={patients}
                    onSelectPatient={setSelectedPatient}
                  />
                </div>

                {/* Recent Patients Quick Access */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Patients</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patients.slice(0, 6).map(patient => (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <div className="font-medium text-blue-700">{patient.firstName} {patient.lastName}</div>
                        <div className="text-sm text-gray-600">{calculateAge(patient.dateOfBirth)} years • {patient.gender}</div>
                        <div className="text-sm text-gray-600 mt-1">Phone: {patient.phone}</div>
                        {patient.createdBy && (
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <FaUser className="mr-1" size={10} />
                            Added by: <span className="font-medium ml-1">
                              {patient.createdBy === 'visitor' ? 'Patient (Online)' :
                               patient.createdBy === 'doctor' ? 'Doctor' :
                               patient.createdBy === 'secretary' ? 'Secretary' :
                               patient.createdByName || getCreatorLabel(patient.createdBy)}
                            </span>
                          </div>
                        )}
                        <button
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(patient);
                          }}
                        >
                          <FaEye className="mr-1" /> View Details
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
