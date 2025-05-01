import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUserTie, FaClipboardList, FaUser, FaUserClock } from 'react-icons/fa';
import PatientSearch from './PatientSearch';
import SecretaryPatientView from './SecretaryPatientView';
import AddPatientForm from './AddPatientForm';
import SecretaryCalendarView from './SecretaryCalendarView';
import PatientNavigator from './PatientNavigator';
import ModernAppointmentDashboard from './ModernAppointmentDashboard';
import ModernTodaysAppointments from './ModernTodaysAppointments';
import { getTimeBasedGreeting, getFormattedDate } from '../utils/timeUtils';
import apiService from '../utils/apiService';

function IntegratedSecretaryDashboard({
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

  // State for active tab (patient-management, appointments, calendar)
  const [activeTab, setActiveTab] = useState('patient-management');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [todaysAppointments, setTodaysAppointments] = useState([]);

  // Fetch today's appointments
  useEffect(() => {
    const fetchTodaysAppointments = async () => {
      try {
        const data = await apiService.getIntegratedAppointments({ today_only: true });
        setTodaysAppointments(data);
      } catch (error) {
        console.error('Error fetching today\'s appointments:', error);
        setTodaysAppointments([]);
      }
    };

    fetchTodaysAppointments();
  }, []);

  // Handle patient view
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('patient-management');
  };

  // Handle close patient view
  const handleClosePatientView = () => {
    setSelectedPatient(null);
  };

  // Handle add patient
  const handleAddPatient = async (patientData) => {
    try {
      const newPatient = await apiService.createPatient({
        ...patientData,
        createdBy: 'secretary'
      });

      setShowAddPatientForm(false);

      // Refresh patients list
      if (onUpdatePatient) {
        onUpdatePatient(newPatient);
      }

      return newPatient;
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  };

  // Get current date and greeting
  const currentDate = getFormattedDate();
  const greeting = getTimeBasedGreeting();

  return (
    <div className="p-2">
      {/* Welcome Banner with Quick Stats */}
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
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="mb-4">
        <ModernTodaysAppointments
          onUpdateAppointment={onDiagnoseAppointment}
          onViewPatient={(patientId) => {
            const patient = patients.find(p => p._id === patientId || p.id === patientId);
            if (patient) {
              handleViewPatient(patient);
            }
          }}
        />
      </div>

      {/* Enhanced Tab Navigation - Mobile Optimized */}
      <div className="bg-white rounded-md shadow-sm mb-4 p-2">
        <div className="grid grid-cols-3 gap-1">
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
            <FaUserClock className="h-6 w-6 mb-1" />
            <span className="text-sm font-medium text-center">Queue</span>
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

      {/* Content Area */}
      <div className="bg-white rounded-md shadow-sm p-4">
        {activeTab === 'calendar' ? (
          <SecretaryCalendarView
            appointments={appointments}
            onUpdateAppointment={(updatedAppointment) => {
              console.log('Updating appointment from calendar in IntegratedSecretaryDashboard:', updatedAppointment);
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
          <ModernAppointmentDashboard
            onUpdateAppointment={onDiagnoseAppointment}
            onDeleteAppointment={onDeleteAppointment}
          />
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
                  appointments={appointments.filter(a =>
                    (a.patientId === selectedPatient.id) ||
                    (a.patient_id === selectedPatient._id) ||
                    (a.patientId === selectedPatient._id) ||
                    (a.patient_id === selectedPatient.id)
                  )}
                  onClose={handleClosePatientView}
                  onUpdatePatient={onUpdatePatient}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Add New Patient</h2>
              <button
                onClick={() => setShowAddPatientForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
    </div>
  );
}

export default IntegratedSecretaryDashboard;
