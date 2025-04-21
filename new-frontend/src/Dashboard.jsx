import { useContext, useState, useEffect } from 'react'
import AuthContext from './context/AuthContext'
import { patients, appointments, reports, getTodaysAppointments, getRecentPatients, getRecentReports, savePatients, saveAppointments, saveReports } from './data/mockData'
import EditPatientModal from './components/EditPatientModal'
import EditAppointmentModal from './components/EditAppointmentModal'
import EditReportModal from './components/EditReportModal'
import ViewPatientModal from './components/ViewPatientModal'
import AddPatientForm from './components/AddPatientForm'
import RebookAppointmentModal from './components/RebookAppointmentModal'
import DiagnosisModal from './components/DiagnosisModal'
import DoctorPatientView from './components/DoctorPatientView'
import PatientSearch from './components/PatientSearch'
import SimplifiedDoctorDashboard from './components/SimplifiedDoctorDashboard'
import SimplifiedSecretaryDashboard from './components/SimplifiedSecretaryDashboard'
import AdminDashboard from './components/AdminDashboard'

function Dashboard() {
  const { userInfo, logout } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('dashboard')

  // State for data
  const [patientsData, setPatientsData] = useState(patients)
  const [appointmentsData, setAppointmentsData] = useState(appointments)
  const [reportsData, setReportsData] = useState(reports)

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

  // Get data for dashboard
  const todaysAppointments = getTodaysAppointments()
  const recentPatients = getRecentPatients()
  const recentReports = getRecentReports()

  // State for modals
  const [editingPatient, setEditingPatient] = useState(null)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [editingReport, setEditingReport] = useState(null)
  const [viewingPatient, setViewingPatient] = useState(null)
  const [showAddPatientForm, setShowAddPatientForm] = useState(false)
  const [rebookingAppointment, setRebookingAppointment] = useState(null)
  const [diagnosingAppointment, setDiagnosingAppointment] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)

  // Handlers for edit actions
  const handleEditPatient = (patient) => {
    setEditingPatient(patient)
  }

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment)
  }

  const handleEditReport = (report) => {
    setEditingReport(report)
  }

  const handleViewPatient = (patient) => {
    setViewingPatient(patient)
  }

  // Handlers for save actions
  const handleSavePatient = (updatedPatient) => {
    const updatedPatients = patientsData.map(p =>
      p.id === updatedPatient.id ? updatedPatient : p
    )
    setPatientsData(updatedPatients)
    setEditingPatient(null)
  }

  const handleSaveAppointment = (updatedAppointment) => {
    const updatedAppointments = appointmentsData.map(a =>
      a.id === updatedAppointment.id ? updatedAppointment : a
    )
    setAppointmentsData(updatedAppointments)
    setEditingAppointment(null)
  }

  const handleSaveReport = (updatedReport) => {
    const updatedReports = reportsData.map(r =>
      r.id === updatedReport.id ? updatedReport : r
    )
    setReportsData(updatedReports)
    setEditingReport(null)
  }

  // Handler for adding a new patient
  const handleAddPatient = (newPatient) => {
    setPatientsData([...patientsData, newPatient])
    setShowAddPatientForm(false)
  }

  // Handler for rebooking an appointment
  const handleRebookAppointment = (newAppointment) => {
    // Mark the old appointment as 'Rebooked'
    const updatedAppointments = appointmentsData.map(a =>
      a.id === rebookingAppointment.id ? { ...a, status: 'Rebooked' } : a
    )

    // Add the new appointment
    setAppointmentsData([...updatedAppointments, newAppointment])
    setRebookingAppointment(null)
  }

  // Handler for saving diagnosis and clinical impression
  const handleSaveDiagnosis = (updatedAppointment) => {
    // Ensure the appointment status is set to Completed when adding a diagnosis
    const appointmentWithStatus = {
      ...updatedAppointment,
      status: 'Completed'
    };

    const updatedAppointments = appointmentsData.map(a =>
      a.id === appointmentWithStatus.id ? appointmentWithStatus : a
    )
    setAppointmentsData(updatedAppointments)
    setDiagnosingAppointment(null)

    // Show success message
    alert('Consultation information saved successfully!')
  }

  // Handler for updating patient information
  const handleUpdatePatient = (updatedPatient) => {
    // Check if the patient exists in the current patients array
    const patientExists = patientsData.some(p => p.id === updatedPatient.id);

    // Check if there are new appointments to add to the global appointments list
    if (updatedPatient.appointments) {
      const patientAppointments = appointmentsData.filter(a => a.patientId === updatedPatient.id);
      const newAppointments = updatedPatient.appointments.filter(
        newAppt => !patientAppointments.some(oldAppt => oldAppt.id === newAppt.id)
      );

      if (newAppointments.length > 0) {
        // Add the new appointments to the global appointments list
        setAppointmentsData([...appointmentsData, ...newAppointments]);
      }
    }

    if (patientExists) {
      // Update existing patient
      const updatedPatients = patientsData.map(p =>
        p.id === updatedPatient.id ? updatedPatient : p
      );
      setPatientsData(updatedPatients);
    } else {
      // Add new patient
      setPatientsData([...patientsData, updatedPatient]);
    }

    // Update the selected patient with new data
    setSelectedPatient(updatedPatient);
  }

  const handleLogout = () => {
    logout()
    // Use window.location to ensure full page reload
    window.location.href = '/'
  }

  // Render different content based on active tab
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

    switch(activeTab) {
      case 'patients':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold">Patients</h1>
                <p className="text-gray-600">Manage patient records and medical history</p>
              </div>
              {userInfo.role === 'secretary' && (
                <button
                  onClick={() => setShowAddPatientForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Patient
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">ID</th>
                    <th className="py-2 px-4 border-b text-left">Name</th>
                    <th className="py-2 px-4 border-b text-left">Date of Birth</th>
                    <th className="py-2 px-4 border-b text-left">Contact</th>
                    <th className="py-2 px-4 border-b text-left">Last Visit</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patientsData.map(patient => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{patient.id}</td>
                      <td className="py-2 px-4 border-b">{patient.firstName} {patient.lastName}</td>
                      <td className="py-2 px-4 border-b">{patient.dateOfBirth}</td>
                      <td className="py-2 px-4 border-b">{patient.phone}</td>
                      <td className="py-2 px-4 border-b">{patient.lastVisit}</td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Patient Modals */}
            {editingPatient && (
              <EditPatientModal
                patient={editingPatient}
                onClose={() => setEditingPatient(null)}
                onSave={handleSavePatient}
              />
            )}

            {viewingPatient && (
              <ViewPatientModal
                patient={viewingPatient}
                onClose={() => setViewingPatient(null)}
              />
            )}

            {showAddPatientForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <AddPatientForm
                    onSave={handleAddPatient}
                    onCancel={() => setShowAddPatientForm(false)}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'appointments':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">Appointments</h1>
                <p className="text-gray-600">{userInfo.role === 'doctor' ? 'View your upcoming appointments and patient details' : 'Schedule and manage patient appointments'}</p>
              </div>

              {userInfo.role === 'doctor' && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Today: {new Date().toLocaleDateString()}</span>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {todaysAppointments.length} Appointments Today
                  </div>
                </div>
              )}
            </div>

            {userInfo.role === 'doctor' && (
              <>
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h2 className="text-lg font-semibold text-blue-800 mb-2">Today's Schedule</h2>
                  {todaysAppointments.length > 0 ? (
                    <div className="space-y-2">
                      {todaysAppointments.map(appointment => (
                        <div
                          key={appointment.id}
                          className="bg-white p-3 rounded-lg border border-blue-100 flex justify-between items-center cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => handleViewPatient(patientsData.find(p => p.id === appointment.patientId))}
                        >
                          <div className="flex-grow">
                            <div className="font-medium">{appointment.time} - {appointment.patientName}</div>
                            <div className="text-sm text-gray-600">{appointment.type}: {appointment.reason}</div>
                            <div className="mt-1">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${appointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' : appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {appointment.status === 'Completed' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDiagnosingAppointment(appointment);
                                }}
                                className={`px-3 py-1 rounded-md text-sm text-white ${appointment.diagnosis ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                              >
                                {appointment.diagnosis ? 'Edit Diagnosis' : 'Add Diagnosis'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No appointments scheduled for today.</p>
                  )}
                </div>

                <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h2 className="text-lg font-semibold text-yellow-800 mb-2">Pending Diagnoses</h2>
                  {appointmentsData.filter(a => a.status === 'Completed' && !a.diagnosis).length > 0 ? (
                    <div className="space-y-2">
                      {appointmentsData
                        .filter(a => a.status === 'Completed' && !a.diagnosis)
                        .map(appointment => (
                          <div
                            key={appointment.id}
                            className="bg-white p-3 rounded-lg border border-yellow-100 flex justify-between items-center cursor-pointer hover:bg-yellow-50 transition-colors"
                            onClick={() => handleViewPatient(patientsData.find(p => p.id === appointment.patientId))}
                          >
                            <div className="flex-grow">
                              <div className="font-medium">{appointment.patientName}</div>
                              <div className="text-sm text-gray-600">{appointment.date} at {appointment.time} - {appointment.type}</div>
                              <div className="text-sm text-gray-600">Reason: {appointment.reason}</div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDiagnosingAppointment(appointment);
                                }}
                                className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-700"
                              >
                                Add Diagnosis
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No pending diagnoses.</p>
                  )}
                </div>
              </>
            )}

            <div>
              <h2 className="text-lg font-semibold mb-3 border-b pb-2">
                {userInfo.role === 'doctor' ? 'All Upcoming Appointments' : 'All Appointments'}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {userInfo.role !== 'doctor' && <th className="py-2 px-4 border-b text-left">ID</th>}
                      <th className="py-2 px-4 border-b text-left">Patient</th>
                      <th className="py-2 px-4 border-b text-left">Date</th>
                      <th className="py-2 px-4 border-b text-left">Time</th>
                      <th className="py-2 px-4 border-b text-left">Type</th>
                      <th className="py-2 px-4 border-b text-left">Status</th>
                      {userInfo.role === 'doctor' ? (
                        <th className="py-2 px-4 border-b text-left">Actions</th>
                      ) : (
                        <>
                          <th className="py-2 px-4 border-b text-left">Diagnosis</th>
                          <th className="py-2 px-4 border-b text-left">Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentsData
                      .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by date
                      .map(appointment => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        {userInfo.role !== 'doctor' && <td className="py-2 px-4 border-b">{appointment.id}</td>}
                        <td className="py-2 px-4 border-b font-medium">{appointment.patientName}</td>
                        <td className="py-2 px-4 border-b">{appointment.date}</td>
                        <td className="py-2 px-4 border-b">{appointment.time}</td>
                        <td className="py-2 px-4 border-b">{appointment.type}</td>
                        <td className="py-2 px-4 border-b">
                          <span className={`px-2 py-1 rounded-full text-xs ${appointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' : appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {appointment.status}
                          </span>
                        </td>
                        {userInfo.role !== 'doctor' && (
                          <td className="py-2 px-4 border-b">
                            {appointment.diagnosis ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Completed</span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span>
                            )}
                          </td>
                        )}
                        <td className="py-2 px-4 border-b">
                          <div className="flex space-x-2">
                            {userInfo.role === 'doctor' ? (
                              <button
                                onClick={() => handleViewPatient(patientsData.find(p => p.id === appointment.patientId))}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                View Patient
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleViewPatient(patientsData.find(p => p.id === appointment.patientId))}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  View Patient
                                </button>
                                {userInfo.role === 'secretary' && (
                                  <button
                                    onClick={() => setRebookingAppointment(appointment)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    Rebook
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEditAppointment(appointment)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Edit
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Appointment Modals */}
            {editingAppointment && (
              <EditAppointmentModal
                appointment={editingAppointment}
                onClose={() => setEditingAppointment(null)}
                onSave={handleSaveAppointment}
              />
            )}

            {rebookingAppointment && (
              <RebookAppointmentModal
                appointment={rebookingAppointment}
                onClose={() => setRebookingAppointment(null)}
                onSave={handleRebookAppointment}
              />
            )}

            {diagnosingAppointment && (
              <DiagnosisModal
                appointment={diagnosingAppointment}
                onClose={() => setDiagnosingAppointment(null)}
                onSave={handleSaveDiagnosis}
              />
            )}

            {viewingPatient && (
              <ViewPatientModal
                patient={viewingPatient}
                onClose={() => setViewingPatient(null)}
              />
            )}
          </div>
        );



      case 'patient-management':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Patient Management</h1>
              <p className="text-gray-600">Search, view and update patient information</p>
            </div>

            {selectedPatient ? (
              <DoctorPatientView
                patient={selectedPatient}
                appointments={appointmentsData}
                onClose={() => setSelectedPatient(null)}
                onUpdatePatient={handleUpdatePatient}
                onDiagnoseAppointment={setDiagnosingAppointment}
              />
            ) : (
              <div className="mt-4">
                <PatientSearch
                  patients={patientsData}
                  onSelectPatient={setSelectedPatient}
                />
              </div>
            )}
          </div>
        );

      case 'reports':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-4">Reports</h1>
            <p className="mb-4">View and generate clinical reports</p>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">ID</th>
                    <th className="py-2 px-4 border-b text-left">Patient</th>
                    <th className="py-2 px-4 border-b text-left">Date</th>
                    <th className="py-2 px-4 border-b text-left">Type</th>
                    <th className="py-2 px-4 border-b text-left">Title</th>
                    <th className="py-2 px-4 border-b text-left">Doctor</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{report.id}</td>
                      <td className="py-2 px-4 border-b">{report.patientName}</td>
                      <td className="py-2 px-4 border-b">{report.date}</td>
                      <td className="py-2 px-4 border-b">{report.type}</td>
                      <td className="py-2 px-4 border-b">{report.title}</td>
                      <td className="py-2 px-4 border-b">{report.doctor}</td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => handleViewPatient(patientsData.find(p => p.id === report.patientId))}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          View Patient
                        </button>
                        <button
                          onClick={() => handleEditReport(report)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Report Modal */}
            {editingReport && (
              <EditReportModal
                report={editingReport}
                onClose={() => setEditingReport(null)}
                onSave={handleSaveReport}
              />
            )}

            {viewingPatient && (
              <ViewPatientModal
                patient={viewingPatient}
                onClose={() => setViewingPatient(null)}
              />
            )}
          </div>
        );

      default: // dashboard
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-4">Welcome, {userInfo?.username}!</h1>
            <p className="mb-4">You are logged in as: <strong>{userInfo?.role}</strong></p>

            {userInfo.role === 'doctor' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">Doctor's Quick Access</h3>
                    <p className="text-sm text-blue-600">Search and view complete patient records during consultations</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('patient-view')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Open Patient View
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Today's Appointments */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <h2 className="text-lg font-semibold mb-3 text-blue-700 border-b pb-2">Today's Appointments</h2>
                {todaysAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {todaysAppointments.map(appointment => (
                      <div key={appointment.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-gray-600">{appointment.time} - {appointment.type}</p>
                        </div>
                        <div>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No appointments scheduled for today.</p>
                )}
                <div className="mt-4 text-right">
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View all appointments →
                  </button>
                </div>
              </div>

              {/* Recent Patients */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <h2 className="text-lg font-semibold mb-3 text-green-700 border-b pb-2">Recent Patients</h2>
                <div className="space-y-3">
                  {recentPatients.map(patient => (
                    <div key={patient.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                        <p className="text-sm text-gray-600">Last visit: {patient.lastVisit}</p>
                      </div>
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <button
                    onClick={() => setActiveTab('patients')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View all patients →
                  </button>
                </div>
              </div>

              {/* Recent Reports */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4 lg:col-span-2">
                <h2 className="text-lg font-semibold mb-3 text-purple-700 border-b pb-2">Recent Reports</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 text-left">Date</th>
                        <th className="py-2 px-4 text-left">Patient</th>
                        <th className="py-2 px-4 text-left">Type</th>
                        <th className="py-2 px-4 text-left">Title</th>
                        <th className="py-2 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReports.map(report => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4">{report.date}</td>
                          <td className="py-2 px-4">{report.patientName}</td>
                          <td className="py-2 px-4">{report.type}</td>
                          <td className="py-2 px-4">{report.title}</td>
                          <td className="py-2 px-4">
                            <button
                            onClick={() => handleViewPatient(patientsData.find(p => p.id === report.patientId))}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            View Patient
                          </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-right">
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View all reports →
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

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
                onClick={handleLogout}
                className="bg-blue-800 hover:bg-blue-900 text-white px-3 py-1 rounded text-sm"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Only shown for admin role */}
      {userInfo.role === 'admin' && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-2 font-medium text-sm border-b-2 ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('patients')}
                className={`py-4 px-2 font-medium text-sm border-b-2 ${activeTab === 'patients' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Patients
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-2 font-medium text-sm border-b-2 ${activeTab === 'appointments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Appointments
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-2 font-medium text-sm border-b-2 ${activeTab === 'reports' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Reports
              </button>
            </nav>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Global Modals */}
      {viewingPatient && (
        <ViewPatientModal
          patient={viewingPatient}
          onClose={() => setViewingPatient(null)}
        />
      )}
    </div>
  )
}

export default Dashboard
