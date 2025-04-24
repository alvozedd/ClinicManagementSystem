import { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from './context/AuthContext'
import apiService from './utils/apiService'
import SimplifiedDoctorDashboard from './components/SimplifiedDoctorDashboard'
import SimplifiedSecretaryDashboard from './components/SimplifiedSecretaryDashboard'
import AdminDashboard from './components/AdminDashboard'
import { FaSignOutAlt, FaSync, FaUserMd, FaUserTie } from 'react-icons/fa'
import {
  transformPatientsFromBackend,
  transformPatientToBackend,
  transformAppointmentsFromBackend,
  transformAppointmentToBackend
} from './utils/dataTransformers'

function Dashboard() {
  const { userInfo, logout } = useContext(AuthContext)

  // State for data
  const [patientsData, setPatientsData] = useState([])
  const [appointmentsData, setAppointmentsData] = useState([])
  const [reportsData, setReportsData] = useState([])
  const [refreshTrigger, setRefreshTrigger] = useState(0) // Used to trigger data refresh
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Debug function to check user info and token
  useEffect(() => {
    console.log('Current user info:', userInfo);
    // We still need to keep the auth token in localStorage for API calls
    const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    console.log('Stored user info:', storedUserInfo);
    console.log('Auth token:', storedUserInfo.token);
  }, [userInfo]);

  // Load data from API when component mounts or refresh is triggered
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Show loading state
        setIsLoading(true);

        // Fetch patients from API
        const patientsResponse = await apiService.getPatients();
        console.log('Patients from API (raw):', patientsResponse);

        // Transform patients to frontend format
        const transformedPatients = transformPatientsFromBackend(patientsResponse);
        console.log('Transformed patients:', transformedPatients);
        setPatientsData(transformedPatients);

        // Fetch appointments from API
        const appointmentsResponse = await apiService.getAppointments();
        console.log('Appointments from API (raw):', appointmentsResponse);

        // Transform appointments to frontend format
        const transformedAppointments = transformAppointmentsFromBackend(appointmentsResponse);
        console.log('Transformed appointments:', transformedAppointments);
        setAppointmentsData(transformedAppointments);

        // Fetch diagnoses from API
        const diagnosesResponse = await apiService.getDiagnoses();
        console.log('Diagnoses from API:', diagnosesResponse);
        setReportsData(diagnosesResponse);

        // Link diagnoses to appointments
        if (diagnosesResponse && diagnosesResponse.length > 0 && transformedAppointments.length > 0) {
          console.log('Linking diagnoses to appointments...');
          const appointmentsWithDiagnoses = transformedAppointments.map(appointment => {
            // Find a diagnosis for this appointment
            const diagnosis = diagnosesResponse.find(d => d.appointment_id === appointment._id);
            if (diagnosis) {
              console.log(`Found diagnosis for appointment ${appointment._id}:`, diagnosis);

              // Try to parse the diagnosis_text as JSON to get structured data
              let diagnosisObj = {
                notes: diagnosis.diagnosis_text,
                treatment: '',
                followUp: '',
                files: [],
                updatedAt: diagnosis.updatedAt || diagnosis.createdAt
              };

              try {
                // Try to parse the diagnosis_text as JSON
                const parsedDiagnosis = JSON.parse(diagnosis.diagnosis_text);
                if (parsedDiagnosis && typeof parsedDiagnosis === 'object') {
                  diagnosisObj = parsedDiagnosis;
                  console.log('Successfully parsed diagnosis JSON:', diagnosisObj);
                }
              } catch (e) {
                console.log('Diagnosis text is not valid JSON, using as plain text');
              }

              return {
                ...appointment,
                diagnosis: diagnosisObj
              };
            }
            return appointment;
          });

          console.log('Appointments with diagnoses:', appointmentsWithDiagnoses);
          setAppointmentsData(appointmentsWithDiagnoses);
        }
      } catch (error) {
        console.error('Error fetching data from API:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]); // Re-run when refreshTrigger changes

  // Handler for updating patient information
  const handleUpdatePatient = async (updatedPatient) => {
    try {
      console.log('Updating patient with role:', userInfo?.role);
      console.log('Updated patient data:', updatedPatient);

      // Handle appointments separately if they exist in the update
      if (updatedPatient.appointments) {
        // Process the appointments
        await handleAppointmentUpdates(updatedPatient.appointments, updatedPatient._id);

        // Remove appointments from the patient object to avoid duplication
        const { appointments, ...patientWithoutAppointments } = updatedPatient;
        updatedPatient = patientWithoutAppointments;
      }

      // Use the API to save patient data
      let response;

      // Check if this is an existing patient with a MongoDB _id
      if (updatedPatient._id && updatedPatient._id.length === 24) {
        console.log('Updating existing patient with ID:', updatedPatient._id);
        // Update existing patient - transform to backend format
        const backendPatientData = transformPatientToBackend(updatedPatient);
        console.log('Sending to backend:', backendPatientData);
        response = await apiService.updatePatient(updatedPatient._id, backendPatientData);

        // Transform the response back to frontend format and update local state
        const transformedResponse = transformPatientsFromBackend([response])[0];
        console.log('Transformed response:', transformedResponse);

        // Update local state
        const updatedPatients = patientsData.map(p =>
          p._id === updatedPatient._id ? { ...p, ...transformedResponse } : p
        );
        setPatientsData(updatedPatients);
      } else {
        console.log('Creating new patient');
        // Add new patient - transform to backend format
        const backendPatientData = transformPatientToBackend(updatedPatient);
        console.log('Creating new patient with data:', backendPatientData);
        response = await apiService.createPatient(backendPatientData);

        // Transform the response back to frontend format
        const transformedResponse = transformPatientsFromBackend([response])[0];
        console.log('Transformed new patient response:', transformedResponse);

        // Add to local state
        setPatientsData([...patientsData, transformedResponse]);
      }

      console.log('Patient saved to database:', response);

      // Refresh data from API to ensure we have the latest data
      setRefreshTrigger(prev => prev + 1);

      return response;
    } catch (error) {
      console.error('Error saving patient:', error);
      setError('Failed to save patient. Please try again.');
      alert('Failed to save patient to database. Please try again.');
      throw error;
    }
  };

  // Handler for deleting an appointment (moved to line 427)

  // Handler for deleting a patient
  const handleDeletePatient = async (patientId) => {
    // Confirm deletion with the user
    if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return; // User cancelled the deletion
    }

    try {
      console.log('Deleting patient with ID:', patientId);

      // Find the patient in our local state to get the MongoDB _id
      const patientToDelete = patientsData.find(p => p._id === patientId || p.id === patientId);

      if (!patientToDelete) {
        throw new Error('Patient not found in local state');
      }

      const mongoId = patientToDelete._id;
      console.log('Found patient to delete with MongoDB ID:', mongoId);

      try {
        // Delete patient via API
        await apiService.deletePatient(mongoId);

        // Remove the patient from the local state
        const updatedPatients = patientsData.filter(p => p._id !== mongoId);
        setPatientsData(updatedPatients);

        // Also remove all appointments associated with this patient from local state
        const updatedAppointments = appointmentsData.filter(a => a.patient_id !== mongoId);
        setAppointmentsData(updatedAppointments);
      } catch (deleteError) {
        // Check if this is a permission error
        if (deleteError.includes('Not authorized as an admin')) {
          alert('The backend server needs to be restarted to apply permission changes. Please contact the administrator.');
        } else {
          throw deleteError;
        }
      }

      // Show success message
      alert('Patient deleted successfully');
    } catch (error) {
      console.error('Error deleting patient:', error);
      setError('Failed to delete patient. Please try again.');
      alert('Failed to delete patient. Please try again: ' + error.message);
    }
  };

  // Helper function to handle appointment updates
  const handleAppointmentUpdates = async (appointments, patientId) => {
    if (!appointments || !appointments.length) return;

    try {
      // Process each appointment
      for (const appointment of appointments) {
        // Check if this is a new appointment or an update
        const isNewAppointment = !appointment._id || appointment.id?.toString().startsWith('new-');

        if (!isNewAppointment) {
          // Find the existing appointment in our state
          const existingAppointment = appointmentsData.find(a => a._id === appointment._id);
          console.log('Found existing appointment:', existingAppointment);

          // Update existing appointment via API
          const appointmentData = transformAppointmentToBackend({
            patientId: patientId,
            date: appointment.date,
            time: appointment.time || '',
            status: appointment.status,
            type: appointment.type,
            reason: appointment.reason
          }, existingAppointment);

          const response = await apiService.updateAppointment(appointment._id, appointmentData);

          console.log('Updated appointment in database:', response);

          // Transform the response back to frontend format
          const transformedResponse = transformAppointmentFromBackend(response);
          console.log('Transformed updated appointment:', transformedResponse);

          // Update in local state
          setAppointmentsData(prev =>
            prev.map(a => a._id === appointment._id ? transformedResponse : a)
          );
        } else {
          // Add new appointment via API
          const appointmentData = transformAppointmentToBackend({
            patientId: patientId,
            date: appointment.date,
            time: appointment.time || '',
            notes: appointment.notes || '',
            type: appointment.type || 'Consultation',
            reason: appointment.reason || '',
            status: appointment.status || 'Scheduled'
          });
          const response = await apiService.createAppointment(appointmentData);

          console.log('Added new appointment to database:', response);

          // Transform the response back to frontend format
          const transformedResponse = transformAppointmentFromBackend(response);
          console.log('Transformed new appointment:', transformedResponse);

          // Add to local state
          setAppointmentsData(prev => [...prev, transformedResponse]);
        }
      }

      // Refresh data from API to ensure we have the latest data
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating appointments:', error);
      setError('Failed to update appointments. Please try again.');
      alert('Failed to update appointments. Please try again.');
    }
  };

  // Handler for saving diagnosis or updating appointments
  const handleSaveDiagnosis = async (updatedAppointment) => {
    try {
      console.log('Dashboard - Handling appointment update:', updatedAppointment);
      console.log('Status being set:', updatedAppointment.status);

      // Check if this is a new appointment (ID starts with 'new-')
      const isNewAppointment = !updatedAppointment._id || updatedAppointment.id?.toString().startsWith('new-');

      // For diagnosis, ensure the appointment status is set to Completed
      let appointmentToSave = updatedAppointment;
      if (updatedAppointment.diagnosis && !isNewAppointment) {
        appointmentToSave = {
          ...updatedAppointment,
          status: 'Completed'
        };
        console.log('Setting status to Completed for diagnosis');
      }

      // Handle the appointment update/creation
      let appointmentResponse;
      if (isNewAppointment) {
        // Create a new appointment via API
        const appointmentData = transformAppointmentToBackend(appointmentToSave);
        appointmentResponse = await apiService.createAppointment(appointmentData);

        console.log('Created new appointment in database:', appointmentResponse);

        // Transform the response back to frontend format
        const transformedResponse = transformAppointmentFromBackend(appointmentResponse);
        console.log('Transformed new appointment:', transformedResponse);

        // Add to local state
        setAppointmentsData(prev => [...prev, transformedResponse]);
      } else {
        // Find the existing appointment in our state
        const existingAppointment = appointmentsData.find(a => a._id === appointmentToSave._id);
        console.log('Found existing appointment:', existingAppointment);

        // Update existing appointment via API
        const appointmentData = transformAppointmentToBackend(appointmentToSave, existingAppointment);
        appointmentResponse = await apiService.updateAppointment(appointmentToSave._id, appointmentData);

        console.log('Updated appointment in database:', appointmentResponse);

        // Transform the response back to frontend format
        const transformedResponse = transformAppointmentFromBackend(appointmentResponse);
        console.log('Transformed updated appointment:', transformedResponse);

        // Update in local state
        setAppointmentsData(prev =>
          prev.map(a => a._id === appointmentToSave._id ? transformedResponse : a)
        );
      }

      // If there's a diagnosis, save it
      if (appointmentToSave.diagnosis) {
        // Use the diagnosisText field if available, otherwise extract from the diagnosis object
        let diagnosisText;
        let diagnosisObj;

        if (appointmentToSave.diagnosisText) {
          diagnosisText = appointmentToSave.diagnosisText;
          try {
            // Try to parse the JSON string to get the diagnosis object
            diagnosisObj = JSON.parse(diagnosisText);
          } catch (e) {
            console.error('Error parsing diagnosis text:', e);
            // If parsing fails, create a simple diagnosis object
            diagnosisObj = {
              notes: diagnosisText,
              treatment: '',
              followUp: '',
              files: [],
              updatedAt: new Date().toISOString()
            };
          }
        } else if (typeof appointmentToSave.diagnosis === 'object') {
          // If it's already an object, use it directly
          diagnosisObj = appointmentToSave.diagnosis;
          diagnosisText = JSON.stringify(diagnosisObj);
        } else {
          // Fallback to simple string
          diagnosisText = appointmentToSave.diagnosis;
          diagnosisObj = {
            notes: diagnosisText,
            treatment: '',
            followUp: '',
            files: [],
            updatedAt: new Date().toISOString()
          };
        }

        const diagnosisResponse = await apiService.createDiagnosis({
          appointment_id: appointmentResponse._id,
          diagnosis_text: diagnosisText
        });

        console.log('Saved diagnosis to database:', diagnosisResponse);

        // Add to reports data
        setReportsData(prev => [...prev, diagnosisResponse]);

        // Update the appointment with the diagnosis
        setAppointmentsData(prev =>
          prev.map(a => a._id === appointmentResponse._id ? {
            ...a,
            diagnosis: diagnosisObj,
            status: 'Completed'
          } : a)
        );
      }

      // Refresh data from API to ensure we have the latest data
      setRefreshTrigger(prev => prev + 1);

      // Show success message
      if (updatedAppointment.diagnosis) {
        alert('Consultation information saved successfully!');
      } else {
        alert('Appointment saved successfully!');
      }
    } catch (error) {
      console.error('Error saving diagnosis/appointment:', error);
      setError('Failed to save. Please try again.');
      alert('Failed to save diagnosis/appointment. Please try again.');
    }
  }

  // Handler for deleting appointments
  const handleDeleteAppointment = async (appointmentId) => {
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      console.log('Deleting appointment with ID:', appointmentId);

      // Delete appointment via API
      await apiService.deleteAppointment(appointmentId);

      // Remove the appointment from the local state
      setAppointmentsData(prev => prev.filter(a => a._id !== appointmentId));

      // Show success message
      alert('Appointment deleted successfully');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError('Failed to delete appointment. Please try again.');
      alert('Failed to delete appointment. Please try again: ' + error.message);
    }
  };

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
          onDeleteAppointment={handleDeleteAppointment}
          username={userInfo?.username}
          userRole={userInfo?.role}
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
          onDeleteAppointment={handleDeleteAppointment}
          username={userInfo?.username}
          userRole={userInfo?.role}
        />
      );
    }

    // Default fallback
    return <div>Unknown user role</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md relative">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\",%3E%3Cg fill=\"none\" fill-rule=\"evenodd\",%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.6\",%3E%3Cpath d=\"M0 0h10v10H0V0zm10 10h10v10H10V10z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')", backgroundSize: "20px 20px"}}>
          </div>
        </div>
        <div className="container mx-auto px-4 py-3 relative z-10">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-lg font-bold flex items-center hover:text-blue-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.5 4a2.5 2.5 0 014.607-1.346.75.75 0 001.264-.057 4 4 0 117.129 3.571.75.75 0 00-.5 1.057 3.5 3.5 0 01-6.6 3.115.75.75 0 00-1.4.05A2.5 2.5 0 015.5 9.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 000 1.5h1.5a.75.75 0 00.75-.75 1 1 0 011-1 .75.75 0 00.75-.75 1 1 0 011-1 .75.75 0 00.75-.75V4zm3 10a2.5 2.5 0 104.607 1.346.75.75 0 011.264.057 4 4 0 11-7.129-3.571.75.75 0 00.5-1.057 3.5 3.5 0 016.6-3.115.75.75 0 001.4-.05A2.5 2.5 0 0114.5 4.5a.75.75 0 00.75.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 00-.75.75 1 1 0 01-1 1 .75.75 0 00-.75.75 1 1 0 01-1 1 .75.75 0 00-.75.75V14z" clipRule="evenodd" />
              </svg>
              <span>UroHealth Central Ltd</span>
            </Link>
            <div className="flex items-center">
              <div className="mr-4 hidden md:flex items-center">
                {userInfo?.role === 'doctor' ? (
                  <FaUserMd className="text-white mr-2" />
                ) : (
                  <FaUserTie className="text-white mr-2" />
                )}
              </div>
              <button
                onClick={() => {
                  console.log('Refreshing data from API...');
                  setRefreshTrigger(prev => prev + 1);
                  alert('Data refreshed from database');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-2 md:px-3 py-1 rounded text-sm mr-2 flex items-center"
                title="Refresh Data"
              >
                <FaSync className="md:mr-1" />
                <span className="hidden md:inline">Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-blue-800 hover:bg-blue-900 text-white px-2 md:px-3 py-1 rounded text-sm flex items-center"
                title="Sign out"
              >
                <FaSignOutAlt className="md:mr-1" />
                <span className="hidden md:inline">Sign out</span>
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
