import { useState, useEffect } from 'react';
import { patients as allPatients } from '../data/mockData';

function DoctorPatientView({ patient, appointments, onClose, onUpdatePatient, onDiagnoseAppointment }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedPatient, setEditedPatient] = useState({...patient});
  const [editedMedicalHistory, setEditedMedicalHistory] = useState([...patient.medicalHistory || []]);
  const [editedMedications, setEditedMedications] = useState([...patient.medications || []]);
  const [editedAllergies, setEditedAllergies] = useState(patient.allergies ? [...patient.allergies] : []);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState({ condition: '', diagnosedDate: '', notes: '' });
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '', startDate: '' });

  // Clinical information state
  const [clinicalNotes, setClinicalNotes] = useState(patient.clinicalNotes || '');
  const [patientFiles, setPatientFiles] = useState(patient.files || []);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('notes');

  useEffect(() => {
    if (patient && appointments) {
      // Filter appointments for this patient and sort by date (most recent first)
      const filteredAppointments = appointments
        .filter(a => a.patientId === patient.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setPatientAppointments(filteredAppointments);

      // Reset edited state when patient changes
      setEditedPatient({...patient});
      setEditedMedicalHistory([...patient.medicalHistory || []]);
      setEditedMedications([...patient.medications || []]);
      setEditedAllergies(patient.allergies ? [...patient.allergies] : []);

      // Reset clinical information state
      setClinicalNotes(patient.clinicalNotes || '');
      setPatientFiles(patient.files || []);
      setSelectedFile(null);
      setUploadProgress(0);

      setEditMode(false);
    }
  }, [patient, appointments]);

  // Handlers for editing patient information
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setEditedAllergies(prev => [...prev, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index) => {
    setEditedAllergies(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCondition = () => {
    if (newCondition.condition.trim() && newCondition.diagnosedDate) {
      setEditedMedicalHistory(prev => [...prev, {...newCondition}]);
      setNewCondition({ condition: '', diagnosedDate: '', notes: '' });
    }
  };

  const handleRemoveCondition = (index) => {
    setEditedMedicalHistory(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddMedication = () => {
    if (newMedication.name.trim() && newMedication.dosage.trim()) {
      setEditedMedications(prev => [...prev, {...newMedication}]);
      setNewMedication({ name: '', dosage: '', frequency: '', startDate: '' });
    }
  };

  const handleRemoveMedication = (index) => {
    setEditedMedications(prev => prev.filter((_, i) => i !== index));
  };

  // Clinical information handlers
  const handleNotesChange = (e) => {
    setClinicalNotes(e.target.value);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    if (!selectedFile) return;

    // In a real app, you would upload to a server here
    // For now, we'll simulate an upload and add to local state

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);

        // Add file to patient files
        const newFile = {
          id: Date.now().toString(),
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          uploadDate: new Date().toISOString(),
          url: URL.createObjectURL(selectedFile) // In a real app, this would be the server URL
        };

        setPatientFiles(prev => [...prev, newFile]);
        setSelectedFile(null);
        setUploadProgress(0);
      }
    }, 300);
  };

  const handleDeleteFile = (fileId) => {
    setPatientFiles(prev => prev.filter(file => file.id !== fileId));
  };


  const handleRebookAppointment = (appointment) => {
    // Create a new appointment based on the previous one
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format date as YYYY-MM-DD
    const formattedDate = tomorrow.toISOString().split('T')[0];

    // Create a new appointment object
    const newAppointment = {
      id: `app-${Date.now()}`, // Generate a unique ID
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      date: formattedDate,
      time: '09:00',
      type: appointment ? appointment.type : 'Follow-up',
      reason: appointment ? `Follow-up for: ${appointment.reason}` : 'Follow-up appointment',
      status: 'Scheduled',
      notes: ''
    };

    // Show confirmation dialog
    if (window.confirm(`Book a follow-up appointment for ${patient.firstName} ${patient.lastName} on ${formattedDate} at 9:00 AM?`)) {
      // Add the new appointment to the appointments list
      const updatedAppointments = [newAppointment, ...patientAppointments];
      setPatientAppointments(updatedAppointments);

      // In a real app, this would save to the database
      alert('Appointment booked successfully! (Note: In a real app, this would be saved to the database)');
    }
  };

  const handleSaveChanges = () => {
    const updatedPatient = {
      ...patient,
      ...editedPatient,
      medicalHistory: editedMedicalHistory,
      medications: editedMedications,
      allergies: editedAllergies,
      clinicalNotes: clinicalNotes,
      files: patientFiles,
      lastVisit: new Date().toISOString().split('T')[0] // Update last visit date
    };

    onUpdatePatient(updatedPatient);
    setEditMode(false);
  };

  if (!patient) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <span className="mr-2">Patient: {editMode ?
                <input
                  type="text"
                  name="firstName"
                  value={editedPatient.firstName}
                  onChange={handleInputChange}
                  className="bg-blue-500 px-2 py-1 rounded mr-1 w-32"
                /> : patient.firstName} {editMode ?
                <input
                  type="text"
                  name="lastName"
                  value={editedPatient.lastName}
                  onChange={handleInputChange}
                  className="bg-blue-500 px-2 py-1 rounded w-32"
                /> : patient.lastName}
              </span>
              <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">ID: {patient.id}</span>
            </h2>
            <p className="text-sm opacity-90">
              {editMode ? (
                <select
                  name="gender"
                  value={editedPatient.gender}
                  onChange={handleInputChange}
                  className="bg-blue-500 px-2 py-1 rounded mr-2"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : patient.gender} •
              {editMode ? (
                <input
                  type="number"
                  name="dateOfBirth"
                  value={editedPatient.dateOfBirth ? new Date(editedPatient.dateOfBirth).getFullYear() : ''}
                  onChange={(e) => {
                    const year = e.target.value;
                    // Create a date with just the year (Jan 1 of that year)
                    const dateStr = `${year}-01-01`;
                    setEditedPatient(prev => ({
                      ...prev,
                      dateOfBirth: dateStr
                    }));
                  }}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="bg-blue-500 px-2 py-1 rounded mx-2 w-24"
                  placeholder="Year"
                />
              ) : patient.dateOfBirth ? new Date(patient.dateOfBirth).getFullYear() : 'Unknown'} •
              {calculateAge(editMode ? editedPatient.dateOfBirth : patient.dateOfBirth)} years
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {editMode ? (
              <>
                <button
                  onClick={handleSaveChanges}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium mr-2"
              >
                Edit Patient
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 px-6 border-b">
          <div className="flex space-x-6">
            <button
              className={`py-4 px-4 font-medium text-base border-b-2 ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Overview
              </div>
            </button>
            <button
              className={`py-4 px-4 font-medium text-base border-b-2 ${activeTab === 'appointments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('appointments')}
            >
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Appointments
              </div>
            </button>
            <button
              className={`py-4 px-4 font-medium text-base border-b-2 ${activeTab === 'clinical' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('clinical')}
            >
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                Clinical Info
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Personal Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="font-medium w-32 text-gray-700 text-base">Phone:</span>
                    {editMode ? (
                      <input
                        type="text"
                        name="phone"
                        value={editedPatient.phone}
                        onChange={handleInputChange}
                        className="border border-gray-300 px-3 py-2 rounded w-full text-base"
                      />
                    ) : (
                      <span className="text-base">{patient.phone}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-32 text-gray-700 text-base">Email:</span>
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={editedPatient.email}
                        onChange={handleInputChange}
                        className="border border-gray-300 px-3 py-2 rounded w-full text-base"
                      />
                    ) : (
                      <span className="text-base">{patient.email}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-32 text-gray-700 text-base">Address:</span>
                    {editMode ? (
                      <input
                        type="text"
                        name="address"
                        value={editedPatient.address}
                        onChange={handleInputChange}
                        className="border border-gray-300 px-3 py-2 rounded w-full text-base"
                      />
                    ) : (
                      <span className="text-base">{patient.address}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-32 text-gray-700 text-base">Last Visit:</span>
                    <span className="text-base font-semibold text-blue-600">{patient.lastVisit}</span>
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Insurance Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="font-medium w-32 text-gray-700 text-base">Provider:</span>
                    {editMode ? (
                      <input
                        type="text"
                        name="insuranceProvider"
                        value={editedPatient.insuranceProvider}
                        onChange={handleInputChange}
                        className="border border-gray-300 px-3 py-2 rounded w-full text-base"
                      />
                    ) : (
                      <span className="text-base">{patient.insuranceProvider}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-32 text-gray-700 text-base">Policy Number:</span>
                    {editMode ? (
                      <input
                        type="text"
                        name="insuranceNumber"
                        value={editedPatient.insuranceNumber}
                        onChange={handleInputChange}
                        className="border border-gray-300 px-3 py-2 rounded w-full text-base"
                      />
                    ) : (
                      <span className="text-base">{patient.insuranceNumber}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Next of Kin */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Next of Kin</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="font-medium w-32 text-gray-700 text-base">Name:</span>
                    {editMode ? (
                      <input
                        type="text"
                        name="nextOfKinName"
                        value={editedPatient.nextOfKinName || ''}
                        onChange={handleInputChange}
                        className="border border-gray-300 px-3 py-2 rounded w-full text-base"
                      />
                    ) : (
                      <span className="text-base">{patient.nextOfKinName || 'Not provided'}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-32 text-gray-700 text-base">Relationship:</span>
                    {editMode ? (
                      <input
                        type="text"
                        name="nextOfKinRelationship"
                        value={editedPatient.nextOfKinRelationship || ''}
                        onChange={handleInputChange}
                        className="border border-gray-300 px-3 py-2 rounded w-full text-base"
                      />
                    ) : (
                      <span className="text-base">{patient.nextOfKinRelationship || 'Not provided'}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-32 text-gray-700 text-base">Phone:</span>
                    {editMode ? (
                      <input
                        type="text"
                        name="nextOfKinPhone"
                        value={editedPatient.nextOfKinPhone || ''}
                        onChange={handleInputChange}
                        className="border border-gray-300 px-3 py-2 rounded w-full text-base"
                      />
                    ) : (
                      <span className="text-base">{patient.nextOfKinPhone || 'Not provided'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Allergies */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Allergies</h3>
                {editMode ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {editedAllergies.length > 0 ? (
                        editedAllergies.map((allergy, index) => (
                          <div key={index} className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                            {allergy}
                            <button
                              onClick={() => handleRemoveAllergy(index)}
                              className="ml-1 text-red-600 hover:text-red-800"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No known allergies.</p>
                      )}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        placeholder="Add new allergy"
                        className="border border-gray-300 px-2 py-1 rounded flex-1"
                      />
                      <button
                        onClick={handleAddAllergy}
                        className="ml-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        disabled={!newAllergy.trim()}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  patient.allergies && patient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy, index) => (
                        <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No known allergies.</p>
                  )
                )}
              </div>

              {/* Previous Appointments */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6 md:col-span-2">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Previous Appointments</h3>
                {patientAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {patientAppointments.slice(0, 3).map(appointment => (
                      <div key={appointment.id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg border mb-2 shadow-sm">
                        <div>
                          <p className="font-medium text-base">{appointment.date} at {appointment.time}</p>
                          <p className="text-base text-gray-700 mt-1">{appointment.type} - {appointment.reason}</p>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            appointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No appointment history.</p>
                )}
                <div className="mt-4 text-right">
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700 inline-flex items-center"
                  >
                    View all appointments
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Recent Diagnoses */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6 md:col-span-2">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Recent Diagnoses</h3>
                {patientAppointments.filter(a => a.diagnosis).length > 0 ? (
                  <div className="space-y-4">
                    {patientAppointments
                      .filter(a => a.diagnosis)
                      .slice(0, 3)
                      .map(appointment => (
                        <div key={appointment.id} className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-2 shadow-sm">
                          <div className="flex justify-between">
                            <p className="font-medium text-base">{appointment.date}</p>
                            <p className="text-sm text-gray-600">{appointment.type}</p>
                          </div>
                          <div className="mt-2">
                            <p className="text-base font-medium text-blue-800">Diagnosis/Impression:</p>
                            <p className="text-base mt-1">{truncateText(appointment.diagnosis.notes, 150)}</p>
                          </div>
                          {appointment.diagnosis.treatment && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-blue-800">Treatment:</p>
                              <p className="text-sm">{truncateText(appointment.diagnosis.treatment, 100)}</p>
                            </div>
                          )}
                          {appointment.diagnosis.files && appointment.diagnosis.files.length > 0 && (
                            <div className="mt-2 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                              </svg>
                              <p className="text-xs text-blue-600 font-medium">{appointment.diagnosis.files.length} {appointment.diagnosis.files.length === 1 ? 'file' : 'files'} attached</p>
                            </div>
                          )}
                          <button
                            onClick={() => onDiagnoseAppointment(appointment)}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Full Details
                          </button>
                        </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No diagnoses recorded yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-xl font-semibold text-gray-800">Appointment History</h3>
                <button
                  onClick={() => handleRebookAppointment(null)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-green-700 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Book New Appointment
                </button>
              </div>
              {patientAppointments.length > 0 ? (
                <div className="space-y-6">
                  {patientAppointments.map(appointment => (
                    <div key={appointment.id} className="p-5 border rounded-lg hover:bg-gray-50 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-lg">{appointment.date} at {appointment.time}</p>
                          <p className="text-base text-gray-700 mt-1">{appointment.type} - {appointment.reason}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            appointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRebookAppointment(appointment)}
                              className="px-4 py-2 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                            >
                              Rebook
                            </button>
                            {appointment.status === 'Completed' && (
                              <button
                                onClick={() => onDiagnoseAppointment(appointment)}
                                className={`px-4 py-2 rounded text-sm font-medium ${appointment.diagnosis ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-yellow-600 text-white hover:bg-yellow-700'}`}
                              >
                                {appointment.diagnosis ? 'Edit Diagnosis' : 'Add Diagnosis'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mt-4">
                          <p className="text-base font-medium text-gray-700 mb-1">Notes:</p>
                          <p className="text-base bg-gray-50 p-3 rounded-lg">{appointment.notes}</p>
                        </div>
                      )}



                      {appointment.diagnosis && (
                        <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <p className="text-base font-medium text-blue-800">Diagnosis/Impression:</p>
                            <button
                              onClick={() => onDiagnoseAppointment(appointment)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Edit
                            </button>
                          </div>
                          <p className="text-base mt-2 whitespace-pre-line">{appointment.diagnosis.notes}</p>

                          {appointment.diagnosis.treatment && (
                            <div className="mt-3 bg-white p-3 rounded-lg">
                              <p className="text-base font-medium text-blue-800 mb-1">Treatment Plan:</p>
                              <p className="text-base">{appointment.diagnosis.treatment}</p>
                            </div>
                          )}

                          {appointment.diagnosis.files && appointment.diagnosis.files.length > 0 && (
                            <div className="mt-3 border-t border-blue-200 pt-3">
                              <p className="text-base font-medium text-blue-800 mb-2">Attached Files:</p>
                              <div className="space-y-2">
                                {appointment.diagnosis.files.map((file, index) => (
                                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                                    <div className="flex items-center">
                                      {file.type && file.type.includes('pdf') ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                        </svg>
                                      ) : file.type && file.type.includes('image') ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                      ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                      <span className="text-sm">{file.name}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                      <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                      >
                                        View
                                      </a>
                                      <a
                                        href={file.url}
                                        download={file.name}
                                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                      >
                                        Download
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {appointment.diagnosis.followUp && (
                            <div className="mt-3 bg-white p-3 rounded-lg">
                              <p className="text-base font-medium text-blue-800 mb-1">Follow-up:</p>
                              <p className="text-base">{appointment.diagnosis.followUp}</p>
                            </div>
                          )}

                          <p className="text-sm text-gray-500 mt-3">
                            Last updated: {formatDate(appointment.diagnosis.updatedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No appointment history.</p>
              )}
            </div>
          )}



          {activeTab === 'clinical' && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Clinical Information</h3>
                {editMode && (
                  <div className="text-base text-blue-600 font-medium">
                    Update clinical information below
                  </div>
                )}
              </div>

              {/* Sub-navigation for clinical information sections */}
              <div className="flex border-b mb-6">
                <button
                  className={`py-3 px-6 font-medium text-base border-b-2 -mb-px ${activeSection === 'notes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveSection('notes')}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    Notes
                  </div>
                </button>

                <button
                  className={`py-3 px-6 font-medium text-base border-b-2 -mb-px ${activeSection === 'uploads' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveSection('uploads')}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Uploads
                  </div>
                </button>
              </div>

              {/* Notes Section */}
              {activeSection === 'notes' && (
                <div>
                  <h4 className="font-medium text-gray-700 text-lg mb-3">Clinical Notes</h4>
                  {editMode ? (
                    <textarea
                      value={clinicalNotes}
                      onChange={handleNotesChange}
                      className="w-full h-64 border border-gray-300 rounded-lg p-4 text-base"
                      placeholder="Enter clinical notes here..."
                    />
                  ) : (
                    <div className="bg-gray-50 p-5 rounded-lg border min-h-[250px] shadow-sm">
                      {clinicalNotes ? (
                        <p className="whitespace-pre-line text-base">{clinicalNotes}</p>
                      ) : (
                        <p className="text-gray-500 italic text-base">No clinical notes recorded.</p>
                      )}
                    </div>
                  )}
                </div>
              )}



              {/* Uploads Section */}
              {activeSection === 'uploads' && (
                <div>
                  <h4 className="font-medium text-gray-700 text-lg mb-3">Patient Documents</h4>

                  {/* File Upload Form */}
                  {editMode && (
                    <div className="bg-gray-50 p-5 rounded-lg border mb-5 shadow-sm">
                      <h5 className="font-medium text-gray-700 text-base mb-3">Upload New Document</h5>
                      <div className="flex flex-col space-y-3">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="border border-gray-300 rounded-lg p-3 text-base"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        {selectedFile && (
                          <div className="mt-3">
                            <p className="text-base">{selectedFile.name} ({formatFileSize(selectedFile.size)})</p>
                            {uploadProgress > 0 && uploadProgress < 100 ? (
                              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                                <div
                                  className="bg-blue-600 h-3 rounded-full"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            ) : (
                              <button
                                onClick={handleFileUpload}
                                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                              >
                                Upload Document
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* File List */}
                  {patientFiles.length > 0 ? (
                    <div className="space-y-4">
                      {patientFiles.map(file => (
                        <div key={file.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 shadow-sm">
                          <div className="flex items-center">
                            <div className="mr-4">
                              {file.type.includes('pdf') ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                              ) : file.type.includes('image') ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-base">{file.name}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatFileSize(file.size)} • Uploaded on {new Date(file.uploadDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                            >
                              View Document
                            </a>
                            {editMode && (
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-base p-4 bg-gray-50 rounded-lg border">No documents uploaded.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Medical History</h3>
                {editMode && (
                  <div className="text-sm text-blue-600">
                    Add or remove conditions below
                  </div>
                )}
              </div>

              {editMode ? (
                <div className="space-y-4">
                  {/* Existing conditions */}
                  {editedMedicalHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosed Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {editedMedicalHistory.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{item.condition}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{item.diagnosedDate}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-900">{item.notes}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <button
                                  onClick={() => handleRemoveCondition(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic mb-4">No medical history recorded.</p>
                  )}

                  {/* Add new condition form */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-700 mb-2">Add New Condition</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Condition</label>
                        <input
                          type="text"
                          value={newCondition.condition}
                          onChange={(e) => setNewCondition({...newCondition, condition: e.target.value})}
                          className="border border-gray-300 px-2 py-1 rounded w-full"
                          placeholder="e.g. Hypertension"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Diagnosed Date</label>
                        <input
                          type="date"
                          value={newCondition.diagnosedDate}
                          onChange={(e) => setNewCondition({...newCondition, diagnosedDate: e.target.value})}
                          className="border border-gray-300 px-2 py-1 rounded w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                        <input
                          type="text"
                          value={newCondition.notes}
                          onChange={(e) => setNewCondition({...newCondition, notes: e.target.value})}
                          className="border border-gray-300 px-2 py-1 rounded w-full"
                          placeholder="Optional notes"
                        />
                      </div>
                    </div>
                    <div className="mt-3 text-right">
                      <button
                        onClick={handleAddCondition}
                        disabled={!newCondition.condition.trim() || !newCondition.diagnosedDate}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Add Condition
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // View mode
                patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosed Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {patient.medicalHistory.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{item.condition}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{item.diagnosedDate}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">{item.notes}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No medical history recorded.</p>
                )
              )}
            </div>
          )}

          {activeTab === 'medications' && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Current Medications</h3>
                {editMode && (
                  <div className="text-sm text-blue-600">
                    Add or remove medications below
                  </div>
                )}
              </div>

              {editMode ? (
                <div className="space-y-4">
                  {/* Existing medications */}
                  {editedMedications.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {editedMedications.map((med, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{med.name}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{med.dosage}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{med.frequency}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{med.startDate}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <button
                                  onClick={() => handleRemoveMedication(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic mb-4">No medications recorded.</p>
                  )}

                  {/* Add new medication form */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-700 mb-2">Add New Medication</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Medication Name</label>
                        <input
                          type="text"
                          value={newMedication.name}
                          onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                          className="border border-gray-300 px-2 py-1 rounded w-full"
                          placeholder="e.g. Lisinopril"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Dosage</label>
                        <input
                          type="text"
                          value={newMedication.dosage}
                          onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                          className="border border-gray-300 px-2 py-1 rounded w-full"
                          placeholder="e.g. 10mg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Frequency</label>
                        <input
                          type="text"
                          value={newMedication.frequency}
                          onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                          className="border border-gray-300 px-2 py-1 rounded w-full"
                          placeholder="e.g. Once daily"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={newMedication.startDate}
                          onChange={(e) => setNewMedication({...newMedication, startDate: e.target.value})}
                          className="border border-gray-300 px-2 py-1 rounded w-full"
                        />
                      </div>
                    </div>
                    <div className="mt-3 text-right">
                      <button
                        onClick={handleAddMedication}
                        disabled={!newMedication.name.trim() || !newMedication.dosage.trim()}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Add Medication
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // View mode
                patient.medications && patient.medications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {patient.medications.map((med, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{med.name}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{med.dosage}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{med.frequency}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{med.startDate}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No medications recorded.</p>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 flex justify-between">
          <div>
            {editMode && (
              <button
                onClick={handleSaveChanges}
                className="px-5 py-2 bg-green-600 text-white rounded-md text-base font-medium hover:bg-green-700 mr-3"
              >
                Save Changes
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';

  const date = new Date(dateString);
  return date.toLocaleString();
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default DoctorPatientView;
