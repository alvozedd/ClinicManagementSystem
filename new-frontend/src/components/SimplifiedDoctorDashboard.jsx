import { useState } from 'react';
import { getTodaysAppointments } from '../data/mockData';
import PatientSearch from './PatientSearch';
import SimplifiedPatientView from './SimplifiedPatientView';
import SimplifiedDiagnosisModal from './SimplifiedDiagnosisModal';
import AddPatientForm from './AddPatientForm';
import DoctorCalendarView from './DoctorCalendarView';

function SimplifiedDoctorDashboard({
  patients,
  appointments,
  onUpdatePatient,
  onDiagnoseAppointment,
  username
}) {
  const [activeTab, setActiveTab] = useState('patient-management');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosingAppointment, setDiagnosingAppointment] = useState(null);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);

  // Get today's appointments
  const todaysAppointments = getTodaysAppointments();

  // Filter upcoming appointments (excluding today's)
  const upcomingAppointments = appointments
    .filter(a => {
      const appointmentDate = new Date(a.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate > today && !todaysAppointments.some(ta => ta.id === a.id);
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5); // Show only next 5 upcoming appointments

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

  return (
    <div className="p-4">
      {/* Welcome Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h1 className="text-xl font-bold text-blue-800">Welcome, Dr. {username}!</h1>
        <p className="text-sm text-blue-600">Today is {new Date().toLocaleDateString()}</p>
      </div>

      {/* Simple Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('patient-management')}
          className={`py-3 px-6 font-medium text-base border-b-2 -mb-px ${
            activeTab === 'patient-management'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Patient Management
          </div>
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`py-3 px-6 font-medium text-base border-b-2 -mb-px ${
            activeTab === 'appointments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Appointments
          </div>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`py-3 px-6 font-medium text-base border-b-2 -mb-px ${
            activeTab === 'calendar'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm11 14V6H4v10h12z" clipRule="evenodd" />
            </svg>
            Calendar
          </div>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-md p-6">
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
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {todaysAppointments.length} Appointments
                </div>
              </div>

              {todaysAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todaysAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-blue-50 transition-colors"
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No appointments scheduled for today.</p>
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
                      className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-blue-50 transition-colors"
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
              <SimplifiedPatientView
                patient={selectedPatient}
                appointments={appointments.filter(a => a.patientId === selectedPatient.id)}
                onClose={handleClosePatientView}
                onUpdatePatient={onUpdatePatient}
                onDiagnoseAppointment={onDiagnoseAppointment}
              />
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
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SimplifiedDoctorDashboard;
