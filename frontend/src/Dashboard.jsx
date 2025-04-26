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
  transformAppointmentToBackend,
  transformAppointmentFromBackend
} from './utils/dataTransformers'
import { clearAllCaches, clearCache } from './data/mockData'
import { updateAppointmentStatuses } from './utils/timeUtils'

function Dashboard() {
  const { userInfo, logout } = useContext(AuthContext)

  // State for data
  const [patientsData, setPatientsData] = useState([])
  const [appointmentsData, setAppointmentsData] = useState([])
  const [reportsData, setReportsData] = useState([])
  const [refreshTrigger, setRefreshTrigger] = useState(0) // Used to trigger data refresh
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null) // Track the currently selected patient

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
            // Find all diagnoses for this appointment
            const appointmentDiagnoses = diagnosesResponse.filter(d => d.appointment_id === appointment._id);
            if (appointmentDiagnoses && appointmentDiagnoses.length > 0) {
              console.log(`Found ${appointmentDiagnoses.length} diagnoses for appointment ${appointment._id}:`, appointmentDiagnoses);

              // Process all diagnoses for this appointment
              const diagnosesArray = appointmentDiagnoses.map(diagnosis => {
                // Try to parse the diagnosis_text as JSON to get structured data
                let diagnosisObj = {
                  id: diagnosis._id, // Store the diagnosis ID
                  notes: diagnosis.diagnosis_text,
                  treatment: '',
                  followUp: '',
                  files: [],
                  updatedAt: diagnosis.updatedAt || diagnosis.createdAt,
                  createdAt: diagnosis.createdAt
                };

                try {
                  // Try to parse the diagnosis_text as JSON
                  const parsedDiagnosis = JSON.parse(diagnosis.diagnosis_text);
                  if (parsedDiagnosis && typeof parsedDiagnosis === 'object') {
                    diagnosisObj = {
                      ...diagnosisObj,
                      ...parsedDiagnosis
                    };
                    console.log('Successfully parsed diagnosis JSON:', diagnosisObj);
                  }
                } catch (e) {
                  console.log('Diagnosis text is not valid JSON, using as plain text');
                }

                return diagnosisObj;
              });

              // Sort diagnoses by creation date (newest first)
              diagnosesArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

              // Ensure the appointment status is set to Completed when it has diagnoses
              return {
                ...appointment,
                diagnoses: diagnosesArray,
                // Keep the most recent diagnosis as the primary one for backward compatibility
                diagnosis: diagnosesArray[0],
                status: 'Completed'
              };
            }
            return appointment;
          });

          console.log('Appointments with diagnoses:', appointmentsWithDiagnoses);

          // Update appointment statuses based on time (for appointments that need diagnoses)
          const updatedAppointments = updateAppointmentStatuses(appointmentsWithDiagnoses);
          console.log('Appointments after status updates:', updatedAppointments);

          setAppointmentsData(updatedAppointments);
        } else {
          console.log('No diagnoses found or no appointments to link them to');
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
      setIsLoading(true); // Show loading state
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

        // Update local state immediately (optimistic update)
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

        // Add to local state immediately (optimistic update)
        setPatientsData(prevData => [...prevData, transformedResponse]);
      }

      console.log('Patient saved to database:', response);

      // Clear only the patients cache to ensure fresh data
      clearCache('patients');

      // Refresh only patient data from API
      const patientsResponse = await apiService.getPatients();
      const transformedPatients = transformPatientsFromBackend(patientsResponse);
      setPatientsData(transformedPatients);

      return response;
    } catch (error) {
      console.error('Error saving patient:', error);
      setError('Failed to save patient. Please try again.');
      alert('Failed to save patient to database. Please try again.');
      throw error;
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  // Handler for deleting an appointment (moved to line 427)

  // Handler for deleting a patient and all associated data
  const handleDeletePatient = async (patientId) => {
    // Confirm deletion with the user
    if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone. All appointments and diagnoses for this patient will also be deleted.')) {
      return; // User cancelled the deletion
    }

    try {
      console.log('Deleting patient with ID:', patientId);
      setIsLoading(true); // Show loading state

      // Find the patient in our local state to get the MongoDB _id
      const patientToDelete = patientsData.find(p => p._id === patientId || p.id === patientId);

      if (!patientToDelete) {
        throw new Error('Patient not found in local state');
      }

      const mongoId = patientToDelete._id;
      console.log('Found patient to delete with MongoDB ID:', mongoId);

      // Delete patient via API (backend will handle cascade deletion of appointments and diagnoses)
      const response = await apiService.deletePatient(mongoId);
      console.log('Delete patient response:', response);

      // Clear all caches to ensure fresh data
      clearAllCaches();

      // Refresh all data from API to ensure consistency
      setRefreshTrigger(prev => prev + 1);

      // Show success message
      alert(`Patient ${patientToDelete.name || patientToDelete.firstName + ' ' + patientToDelete.lastName} and all associated data deleted successfully.\n\nDeleted:\n- ${response.deletedAppointments} appointment(s)\n- ${response.deletedDiagnoses} diagnosis/diagnoses`);

      // Return to the main dashboard view if we were viewing the deleted patient
      if (selectedPatient && (selectedPatient._id === mongoId || selectedPatient.id === patientId)) {
        // If there's a selected patient and it's the one we just deleted, clear the selection
        if (typeof onPatientDeleted === 'function') {
          onPatientDeleted();
        }
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      setError('Failed to delete patient. Please try again.');

      // Check if this is a permission error
      if (error.includes && error.includes('Not authorized')) {
        alert('You do not have permission to delete this patient. Please contact an administrator.');
      } else {
        alert('Failed to delete patient. Please try again: ' + error.message);
      }
    } finally {
      setIsLoading(false); // Hide loading state
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

          // Log the updated appointments data
          console.log('Updated appointments data after transform');
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

          // Log the updated appointments data
          console.log('Updated appointments data after adding new appointment');
        }
      }

      // Clear all caches to ensure fresh data
      clearAllCaches();

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
      setIsLoading(true); // Show loading state
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

      // Log the appointment we're about to save
      console.log('Appointment to save:', appointmentToSave);

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

        // Add to local state immediately (optimistic update)
        setAppointmentsData(prev => [...prev, transformedResponse]);

        // Log the updated appointments data
        console.log('Updated appointments data after adding new appointment in handleSaveDiagnosis');
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

        // Update in local state immediately (optimistic update)
        setAppointmentsData(prev =>
          prev.map(a => a._id === appointmentToSave._id ? transformedResponse : a)
        );

        // Log the updated appointments data
        console.log('Updated appointments data after updating appointment in handleSaveDiagnosis');
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

        let diagnosisResponse;

        // Check if we're updating an existing diagnosis or creating a new one
        if (appointmentToSave.diagnosisId) {
          // Update existing diagnosis
          console.log('Updating existing diagnosis with ID:', appointmentToSave.diagnosisId);

          // Extract diagnosis information from the appointmentToSave object
          const diagnosisData = appointmentToSave.diagnosis || {};

          // Make sure we're sending the complete diagnosis object as a JSON string
          const updatedDiagnosisObj = {
            notes: diagnosisData.notes || '',
            treatment: diagnosisData.treatment || '',
            followUp: diagnosisData.followUp || '',
            files: diagnosisData.files || [],
            updatedAt: new Date().toISOString()
          };

          console.log('Updating diagnosis with data:', updatedDiagnosisObj);

          diagnosisResponse = await apiService.updateDiagnosis(appointmentToSave.diagnosisId, {
            diagnosis_text: JSON.stringify(updatedDiagnosisObj)
          });
        } else {
          // Create new diagnosis
          console.log('Creating new diagnosis for appointment:', appointmentResponse._id);
          diagnosisResponse = await apiService.createDiagnosis({
            appointment_id: appointmentResponse._id,
            diagnosis_text: diagnosisText
          });
        }

        console.log('Saved diagnosis to database:', diagnosisResponse);

        // Extract diagnosis information from the appointmentToSave object
        const diagnosisData = appointmentToSave.diagnosis || {};

        // Create a consistent diagnosis object for UI updates
        const diagnosisObjForUI = {
          id: appointmentToSave.diagnosisId || diagnosisResponse._id,
          _id: appointmentToSave.diagnosisId || diagnosisResponse._id,
          notes: diagnosisData.notes || '',
          treatment: diagnosisData.treatment || '',
          followUp: diagnosisData.followUp || '',
          files: diagnosisData.files || [],
          updatedAt: new Date().toISOString()
        };

        console.log('Diagnosis object for UI updates:', diagnosisObjForUI);

        // Handle optimistic updates differently based on whether we're creating or updating
        if (appointmentToSave.diagnosisId) {
          // For updates, replace the existing diagnosis in the reports data
          setReportsData(prev =>
            prev.map(d => d._id === appointmentToSave.diagnosisId ?
              { ...d, diagnosis_text: JSON.stringify(diagnosisObjForUI) } : d)
          );

          // Update the appointment with the updated diagnosis
          setAppointmentsData(prev =>
            prev.map(a => a._id === appointmentResponse._id ? {
              ...a,
              // Update the diagnosis in the diagnoses array
              diagnoses: a.diagnoses ?
                a.diagnoses.map(d => (d._id === appointmentToSave.diagnosisId || d.id === appointmentToSave.diagnosisId) ?
                  diagnosisObjForUI : d)
                : [diagnosisObjForUI],
              // Update the primary diagnosis if it's the one being edited
              diagnosis: a.diagnosis && (a.diagnosis._id === appointmentToSave.diagnosisId || a.diagnosis.id === appointmentToSave.diagnosisId) ?
                diagnosisObjForUI : a.diagnosis,
              status: 'Completed'
            } : a)
          );
        } else {
          // For new diagnoses, add to reports data
          setReportsData(prev => [...prev, {
            ...diagnosisResponse,
            diagnosis_text: JSON.stringify(diagnosisObjForUI)
          }]);

          // Update the appointment with the new diagnosis
          setAppointmentsData(prev =>
            prev.map(a => a._id === appointmentResponse._id ? {
              ...a,
              // Add the new diagnosis to the diagnoses array
              diagnoses: a.diagnoses ? [diagnosisObjForUI, ...a.diagnoses] : [diagnosisObjForUI],
              // Update the primary diagnosis to be the newest one
              diagnosis: diagnosisObjForUI,
              status: 'Completed'
            } : a)
          );
        }

        // Log the updated appointments data after adding diagnosis
        console.log('Updated appointments data after adding diagnosis');
      }

      // Show success message
      if (updatedAppointment.diagnosis) {
        alert('Consultation information saved successfully!');
      } else {
        alert('Appointment saved successfully!');
      }

      // Clear specific caches to ensure fresh data
      clearCache('appointments');
      if (appointmentToSave.diagnosis) {
        clearCache('reports');
      }

      // Perform a complete refresh of all data to ensure consistency
      console.log('Performing complete data refresh after diagnosis save/update');

      // Fetch fresh data directly
      const patientsResponse = await apiService.getPatients();
      const transformedPatients = transformPatientsFromBackend(patientsResponse);
      setPatientsData(transformedPatients);

      const appointmentsResponse = await apiService.getAppointments();
      const transformedAppointments = transformAppointmentsFromBackend(appointmentsResponse);
      setAppointmentsData(transformedAppointments);

      const diagnosesResponse = await apiService.getDiagnoses();
      setReportsData(diagnosesResponse);

      // Force a refresh of the UI by triggering the refresh trigger
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error saving diagnosis/appointment:', error);
      setError('Failed to save. Please try again.');
      alert('Failed to save diagnosis/appointment. Please try again.');
    } finally {
      setIsLoading(false); // Hide loading state
    }
  }

  // Handler for deleting appointments
  const handleDeleteAppointment = async (appointmentId) => {
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      setIsLoading(true); // Show loading state
      console.log('Deleting appointment with ID:', appointmentId);

      // Delete appointment via API
      await apiService.deleteAppointment(appointmentId);

      // Remove the appointment from the local state immediately (optimistic update)
      setAppointmentsData(prev => prev.filter(a => a._id !== appointmentId));

      // Clear appointments cache
      clearCache('appointments');

      // Refresh appointments data from API
      const appointmentsResponse = await apiService.getAppointments();
      const transformedAppointments = transformAppointmentsFromBackend(appointmentsResponse);
      setAppointmentsData(transformedAppointments);

      // Show success message
      alert('Appointment deleted successfully');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError('Failed to delete appointment. Please try again.');
      alert('Failed to delete appointment. Please try again: ' + error.message);
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  const handleLogout = async () => {
    console.log('Dashboard: handleLogout called');
    try {
      // Call the logout function from AuthContext
      await logout();
      // The redirect is handled in the AuthContext logout function
      // No need to redirect here as it would race with the redirect in AuthContext
    } catch (error) {
      console.error('Error during logout from Dashboard:', error);
      // If there's an error, force a redirect to login page
      window.location.href = '/login';
    }
  }

  // Render different content based on user role
  const renderContent = () => {
    // Debug userInfo
    console.log('Dashboard - userInfo:', userInfo);

    // For admin, use the admin dashboard focused on user management
    if (userInfo.role === 'admin') {
      return (
        <AdminDashboard
          username={userInfo?.name || userInfo?.username || userInfo?.email}
          userInfo={userInfo}
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
          username={userInfo?.name || userInfo?.username || userInfo?.email}
          userRole={userInfo?.role}
          userInfo={userInfo}
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
          onDeletePatient={handleDeletePatient}
          username={userInfo?.name || userInfo?.username || userInfo?.email}
          userRole={userInfo?.role}
          userInfo={userInfo}
        />
      );
    }

    // Default fallback
    return <div>Unknown user role</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="text-white shadow-md sticky top-0 z-50" style={{
        backgroundImage: "linear-gradient(rgba(30, 64, 175, 0.7), rgba(37, 99, 235, 0.7)), url('./image/Theone.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700 opacity-50"></div>
        <div className="container mx-auto px-4 py-4 relative z-10">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl md:text-2xl font-bold flex items-center hover:text-blue-100 transition-colors">
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
                onClick={async () => {
                  console.log('Refreshing data from API...');
                  setIsLoading(true); // Show loading state
                  try {
                    // Clear all caches to ensure fresh data
                    clearAllCaches();

                    // Fetch fresh data directly instead of using refreshTrigger
                    const patientsResponse = await apiService.getPatients();
                    const transformedPatients = transformPatientsFromBackend(patientsResponse);
                    setPatientsData(transformedPatients);

                    const appointmentsResponse = await apiService.getAppointments();
                    const transformedAppointments = transformAppointmentsFromBackend(appointmentsResponse);
                    setAppointmentsData(transformedAppointments);

                    const diagnosesResponse = await apiService.getDiagnoses();
                    setReportsData(diagnosesResponse);

                    // Show success message
                    alert('Data refreshed from database');
                  } catch (error) {
                    console.error('Error refreshing data:', error);
                    alert('Failed to refresh data. Please try again.');
                  } finally {
                    setIsLoading(false); // Hide loading state
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-2 md:px-3 py-1 rounded text-sm mr-2 flex items-center"
                title="Refresh Data"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-spin mr-1">⟳</span>
                ) : (
                  <FaSync className="md:mr-1" />
                )}
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

      <main className="container mx-auto px-4 py-8 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
              <div className="animate-spin text-blue-600 text-2xl">⟳</div>
              <div className="text-gray-700 font-medium">Loading...</div>
            </div>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  )
}

export default Dashboard
