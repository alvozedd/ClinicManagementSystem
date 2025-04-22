import { useContext, useState, useEffect } from 'react'
import AuthContext from './context/AuthContext'
import { savePatients, saveAppointments, saveReports } from './data/mockData'
import { STORAGE_KEYS, loadFromLocalStorage } from './utils/localStorage'
import SimplifiedDoctorDashboard from './components/SimplifiedDoctorDashboard'
import SimplifiedSecretaryDashboard from './components/SimplifiedSecretaryDashboard'
import AdminDashboard from './components/AdminDashboard'

function Dashboard() {
  const { userInfo, logout } = useContext(AuthContext)

  // State for data
  const [patientsData, setPatientsData] = useState([])
  const [appointmentsData, setAppointmentsData] = useState([])
  const [reportsData, setReportsData] = useState([])
  const [refreshTrigger, setRefreshTrigger] = useState(0) // Used to trigger data refresh

  // Load data from localStorage when component mounts or refresh is triggered
  useEffect(() => {
    const loadedPatients = loadFromLocalStorage(STORAGE_KEYS.PATIENTS, []);
    const loadedAppointments = loadFromLocalStorage(STORAGE_KEYS.APPOINTMENTS, []);
    const loadedReports = loadFromLocalStorage(STORAGE_KEYS.REPORTS, []);

    console.log('Dashboard - Loading data from localStorage:');
    console.log('Patients:', loadedPatients);
    console.log('Appointments:', loadedAppointments);
    console.log('STORAGE KEYS USED:', STORAGE_KEYS);
    console.log('Raw localStorage content for patients:', localStorage.getItem(STORAGE_KEYS.PATIENTS));
    console.log('Raw localStorage content for appointments:', localStorage.getItem(STORAGE_KEYS.APPOINTMENTS));

    // Check for visitor-created records
    const visitorPatients = loadedPatients.filter(p => p.createdBy === 'visitor');
    const visitorAppointments = loadedAppointments.filter(a => a.createdBy === 'visitor');
    console.log('Visitor-created patients:', visitorPatients);
    console.log('Visitor-created appointments:', visitorAppointments);

    setPatientsData(loadedPatients);
    setAppointmentsData(loadedAppointments);
    setReportsData(loadedReports);
  }, [refreshTrigger]) // Re-run when refreshTrigger changes

  // Save data to localStorage whenever it changes
  useEffect(() => {
    savePatients(patientsData);
  }, [patientsData]);

  useEffect(() => {
    saveAppointments(appointmentsData);
  }, [appointmentsData]);

  useEffect(() => {
    saveReports(reportsData);
  }, [reportsData]);

  // Handler for updating patient information
  const handleUpdatePatient = (updatedPatient) => {
    // Check if the patient exists in the current patients array
    const patientExists = patientsData.some(p => p.id === updatedPatient.id);

    // Handle appointments separately if they exist in the update
    if (updatedPatient.appointments) {
      // Process the appointments
      handleAppointmentUpdates(updatedPatient.appointments, updatedPatient.id);

      // Remove appointments from the patient object to avoid duplication
      const { appointments, ...patientWithoutAppointments } = updatedPatient;
      updatedPatient = patientWithoutAppointments;
    }

    // Update or add the patient
    if (patientExists) {
      // Update existing patient
      const updatedPatients = patientsData.map(p =>
        p.id === updatedPatient.id ? { ...p, ...updatedPatient } : p
      );
      setPatientsData(updatedPatients);
    } else {
      // Add new patient
      setPatientsData([...patientsData, updatedPatient]);
    }

    // Immediately save to localStorage
    savePatients(patientExists ?
      patientsData.map(p => p.id === updatedPatient.id ? { ...p, ...updatedPatient } : p) :
      [...patientsData, updatedPatient]);
  };

  // Handler for deleting a patient
  const handleDeletePatient = (patientId) => {
    // Confirm deletion with the user
    if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return; // User cancelled the deletion
    }

    // Remove the patient from the patients array
    const updatedPatients = patientsData.filter(p => p.id !== patientId);
    setPatientsData(updatedPatients);

    // Also remove all appointments associated with this patient
    const updatedAppointments = appointmentsData.filter(a => a.patientId !== patientId);
    setAppointmentsData(updatedAppointments);

    // Save changes to localStorage
    savePatients(updatedPatients);
    saveAppointments(updatedAppointments);

    // Show success message
    alert('Patient deleted successfully');
  };

  // Helper function to handle appointment updates
  const handleAppointmentUpdates = (appointments, patientId) => {
    if (!appointments || !appointments.length) return;

    // Process each appointment
    let updatedAppointmentsData = [...appointmentsData];
    let hasChanges = false;

    appointments.forEach(appointment => {
      // Check if this is a new appointment or an update
      const existingAppointmentIndex = updatedAppointmentsData.findIndex(a => a.id === appointment.id);

      if (existingAppointmentIndex >= 0) {
        // Update existing appointment
        updatedAppointmentsData[existingAppointmentIndex] = {
          ...updatedAppointmentsData[existingAppointmentIndex],
          ...appointment,
          updatedAt: new Date().toISOString()
        };
        hasChanges = true;
      } else {
        // Add new appointment
        updatedAppointmentsData.push({
          ...appointment,
          patientId: patientId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setAppointmentsData(updatedAppointmentsData);
      // Immediately save to localStorage
      saveAppointments(updatedAppointmentsData);
    }
  };

  // Handler for saving diagnosis or updating appointments
  const handleSaveDiagnosis = (updatedAppointment) => {
    console.log('Dashboard - Handling appointment update:', updatedAppointment);

    // Check if this is a new appointment (ID starts with 'new-')
    const isNewAppointment = updatedAppointment.id.toString().startsWith('new-');

    // For diagnosis, ensure the appointment status is set to Completed
    let appointmentToSave = updatedAppointment;
    if (updatedAppointment.diagnosis && !isNewAppointment) {
      appointmentToSave = {
        ...updatedAppointment,
        status: 'Completed',
        updatedAt: new Date().toISOString()
      };
    }

    // Check for duplicate appointments with the same patient and date
    // This prevents creating multiple appointments when just changing status
    const hasDuplicate = !isNewAppointment && appointmentsData.some(a =>
      a.id !== appointmentToSave.id &&
      a.patientId === appointmentToSave.patientId &&
      a.date === appointmentToSave.date &&
      a.time === appointmentToSave.time
    );

    if (hasDuplicate) {
      console.warn('Detected potential duplicate appointment. Ensuring update only.');
    }

    // Update the appointments array
    let updatedAppointments;
    if (isNewAppointment) {
      // Generate a proper ID for new appointments
      const newId = `appointment-${Date.now()}`;
      appointmentToSave = {
        ...appointmentToSave,
        id: newId
      };

      // For new appointments, add to the array
      updatedAppointments = [...appointmentsData, appointmentToSave];
      console.log('Added new appointment:', appointmentToSave);
    } else {
      // For existing appointments, update in the array
      updatedAppointments = appointmentsData.map(a =>
        a.id === appointmentToSave.id ? appointmentToSave : a
      );
      console.log('Updated existing appointment:', appointmentToSave);
    }

    // Update state and save to localStorage
    setAppointmentsData(updatedAppointments);
    saveAppointments(updatedAppointments);

    // Show success message
    if (updatedAppointment.diagnosis) {
      alert('Consultation information saved successfully!');
    } else {
      alert('Appointment saved successfully!');
    }
  }

  const handleLogout = () => {
    logout()
    // Use window.location to ensure full page reload
    window.location.href = '/'
  }

  // Render different content based on user role
  const renderContent = () => {
    // For admin, use the admin dashboard focused on user management
    if (userInfo.role === 'admin') {
      return (
        <AdminDashboard
          username={userInfo?.username}
        />
      );
    }

    // For doctors, use the simplified doctor dashboard
    if (userInfo.role === 'doctor') {
      return (
        <SimplifiedDoctorDashboard
          patients={patientsData}
          appointments={appointmentsData}
          onUpdatePatient={handleUpdatePatient}
          onDiagnoseAppointment={handleSaveDiagnosis}
          onDeletePatient={handleDeletePatient}
          username={userInfo?.username}
        />
      );
    }

    // For secretaries, use the simplified secretary dashboard
    if (userInfo.role === 'secretary') {
      return (
        <SimplifiedSecretaryDashboard
          patients={patientsData}
          appointments={appointmentsData}
          onUpdatePatient={handleUpdatePatient}
          onDiagnoseAppointment={handleSaveDiagnosis}
          username={userInfo?.username}
        />
      );
    }

    // Default fallback
    return <div>Unknown user role</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M5.5 4a2.5 2.5 0 014.607-1.346.75.75 0 001.264-.057 4 4 0 117.129 3.571.75.75 0 00-.5 1.057 3.5 3.5 0 01-6.6 3.115.75.75 0 00-1.4.05A2.5 2.5 0 015.5 9.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 000 1.5h1.5a.75.75 0 00.75-.75 1 1 0 011-1 .75.75 0 00.75-.75 1 1 0 011-1 .75.75 0 00.75-.75V4zm3 10a2.5 2.5 0 104.607 1.346.75.75 0 011.264.057 4 4 0 11-7.129-3.571.75.75 0 00.5-1.057 3.5 3.5 0 016.6-3.115.75.75 0 001.4-.05A2.5 2.5 0 0114.5 4.5a.75.75 0 00.75.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 00-.75.75 1 1 0 01-1 1 .75.75 0 00-.75.75 1 1 0 01-1 1 .75.75 0 00-.75.75V14z" clipRule="evenodd" />
              </svg>
              UroHealth Central
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm">
                Signed in as <strong>{userInfo?.role}</strong>
              </span>
              <button
                onClick={() => {
                  console.log('Refreshing data from localStorage...');
                  setRefreshTrigger(prev => prev + 1);
                  alert('Data refreshed from localStorage');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm mr-2"
                title="Refresh data from localStorage"
              >
                Refresh Data
              </button>
              <button
                onClick={handleLogout}
                className="bg-blue-800 hover:bg-blue-900 text-white px-3 py-1 rounded text-sm"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  )
}

export default Dashboard
