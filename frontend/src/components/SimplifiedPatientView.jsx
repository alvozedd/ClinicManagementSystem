import { useState, useEffect } from 'react';
import { FaUser, FaTrash, FaPhone, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import { getCreatorLabel } from '../utils/recordCreation';
import AppointmentManagementModal from './AppointmentManagementModal';
import SimplifiedNotesModal from './SimplifiedNotesModal';
import MedicalHistoryManager from './MedicalHistoryManager';
import AllergiesManager from './AllergiesManager';
import MedicationsManager from './MedicationsManager';
import PatientDiagnosesTab from './PatientDiagnosesTab';
import { transformAppointmentFromBackend } from '../utils/dataTransformers';
import { clearAllCaches } from '../data/mockData';

function SimplifiedPatientView({ patient, appointments, onClose, onUpdatePatient, onDiagnoseAppointment, onDeletePatient }) {
  const [activeTab, setActiveTab] = useState('biodata');
  const [editMode, setEditMode] = useState(false);
  const [editedPatient, setEditedPatient] = useState({...patient});
  const [managingAppointment, setManagingAppointment] = useState(null);
  const [isNewAppointment, setIsNewAppointment] = useState(false);
  const [diagnosingAppointment, setDiagnosingAppointment] = useState(null);
  const [editingDiagnosis, setEditingDiagnosis] = useState(null);

  // State for medical history, allergies, and medications
  const [editedMedicalHistory, setEditedMedicalHistory] = useState([...patient.medicalHistory || []]);
  const [editedAllergies, setEditedAllergies] = useState([...patient.allergies || []]);
  const [editedMedications, setEditedMedications] = useState([...patient.medications || []]);

  // Update local state when patient prop changes
  useEffect(() => {
    setEditedPatient({...patient});
    setEditedMedicalHistory([...patient.medicalHistory || []]);
    setEditedAllergies([...patient.allergies || []]);
    setEditedMedications([...patient.medications || []]);
  }, [patient]);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Separate past and upcoming appointments
  const pastAppointments = [...appointments]
    .filter(a => a.date < today || (a.date === today && a.status === 'Completed'))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first

  const upcomingAppointments = [...appointments]
    .filter(a => a.date > today || (a.date === today && a.status !== 'Completed'))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Earliest first

  // Combined sorted appointments (for backward compatibility)
  const sortedAppointments = [...upcomingAppointments, ...pastAppointments];

  // Get appointments with diagnoses
  const appointmentsWithDiagnoses = sortedAppointments.filter(a => a.diagnosis || (a.diagnoses && a.diagnoses.length > 0));
  console.log('Appointments with diagnoses:', appointmentsWithDiagnoses);

  // Create a flattened array of all diagnoses across all appointments
  const allDiagnoses = [];
  appointmentsWithDiagnoses.forEach(appointment => {
    if (appointment.diagnoses && appointment.diagnoses.length > 0) {
      // If we have the new diagnoses array structure, use it
      appointment.diagnoses.forEach(diagnosis => {
        allDiagnoses.push({
          ...diagnosis,
          appointmentId: appointment.id,
          appointmentDate: appointment.date,
          appointmentTime: appointment.time,
          appointmentType: appointment.type,
          appointmentReason: appointment.reason,
          appointmentCreatedBy: appointment.createdBy
        });
      });
    } else if (appointment.diagnosis) {
      // For backward compatibility
      allDiagnoses.push({
        ...appointment.diagnosis,
        appointmentId: appointment.id,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        appointmentType: appointment.type,
        appointmentReason: appointment.reason,
        appointmentCreatedBy: appointment.createdBy
      });
    }
  });

  // Sort all diagnoses by date (newest first)
  allDiagnoses.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  console.log('All diagnoses:', allDiagnoses);
  console.log('All appointments in SimplifiedPatientView:', appointments);
  console.log('Sorted appointments in SimplifiedPatientView:', sortedAppointments);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Handle input changes for patient editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle saving patient changes
  const handleSaveChanges = () => {
    // Combine all edited data
    const updatedPatient = {
      ...editedPatient,
      medicalHistory: editedMedicalHistory,
      allergies: editedAllergies,
      medications: editedMedications
    };

    // Clear caches to ensure fresh data
    clearAllCaches();

    // Update the patient
    onUpdatePatient(updatedPatient);
    setEditMode(false);
  };

  // Handle canceling edits
  const handleCancelEdit = () => {
    setEditedPatient({...patient});
    setEditedMedicalHistory([...patient.medicalHistory || []]);
    setEditedAllergies([...patient.allergies || []]);
    setEditedMedications([...patient.medications || []]);
    setEditMode(false);
  };

  // Handle deleting the patient
  const handleDeletePatient = () => {
    if (onDeletePatient) {
      // Use MongoDB _id if available, otherwise fall back to client-side id
      const patientId = patient._id || patient.id;
      console.log('SimplifiedPatientView - Deleting patient with ID:', patientId);
      onDeletePatient(patientId);
      onClose(); // Close the patient view after deletion
    }
  };

  // Handle adding a new appointment
  const handleAddAppointment = () => {
    setManagingAppointment({
      id: 'new-' + Date.now(),
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      type: 'Consultation',
      reason: '',
      status: 'Scheduled'
    });
    setIsNewAppointment(true);
  };

  // Handle editing an appointment
  const handleEditAppointment = (appointment) => {
    setManagingAppointment(appointment);
    setIsNewAppointment(false);
  };

  // Handle saving appointment changes
  const handleSaveAppointment = (updatedAppointment) => {
    // For new appointments, make sure we have the patient name
    const appointmentWithPatientInfo = {
      ...updatedAppointment,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`
    };

    onUpdatePatient({
      ...patient,
      appointments: isNewAppointment
        ? [...appointments, appointmentWithPatientInfo]
        : appointments.map(a => a.id === appointmentWithPatientInfo.id ? appointmentWithPatientInfo : a)
    });
    setManagingAppointment(null);
    setIsNewAppointment(false);
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
      setEditingDiagnosis(diagnosis);
    } else {
      console.error('Could not find appointment for diagnosis:', diagnosis);
      alert('Could not find the appointment associated with this diagnosis.');
    }
  };

  // Handle deleting a diagnosis
  const handleDeleteDiagnosis = async (diagnosisId) => {
    console.log('Deleting diagnosis with ID:', diagnosisId);

    try {
      // Call the API to delete the diagnosis
      await apiService.deleteDiagnosis(diagnosisId);

      // Show success message
      alert('Diagnosis deleted successfully.');

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting diagnosis:', error);
      alert('Failed to delete diagnosis. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-md">
      {/* Patient Header with larger font */}
      <div className="bg-blue-50 p-2 rounded-t-md border border-blue-200 mb-2">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <h2 className="text-base md:text-lg font-bold text-blue-800 leading-tight">
              {editMode ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="firstName"
                    value={editedPatient.firstName}
                    onChange={handleInputChange}
                    className="border border-blue-300 rounded px-2 py-1 w-28 text-sm bg-blue-50"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={editedPatient.lastName}
                    onChange={handleInputChange}
                    className="border border-blue-300 rounded px-2 py-1 w-28 text-sm bg-blue-50"
                  />
                </div>
              ) : (
                <>
                  {patient.firstName} {patient.lastName}
                </>
              )}
            </h2>
            <div className="text-gray-600">
              {editMode ? (
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="text-[8px] block">Gender</label>
                    <select
                      name="gender"
                      value={editedPatient.gender}
                      onChange={handleInputChange}
                      className="border border-blue-300 rounded px-1 py-0.5 w-full text-xs bg-blue-50"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[8px] block">Year of Birth</label>
                    <input
                      type="number"
                      name="dateOfBirth"
                      value={editedPatient.dateOfBirth && !isNaN(new Date(editedPatient.dateOfBirth).getFullYear()) ? new Date(editedPatient.dateOfBirth).getFullYear() : ''}
                      onChange={(e) => {
                        const year = e.target.value;
                        if (year && !isNaN(year)) {
                          // Create a date with just the year (Jan 1 of that year)
                          const dateStr = `${year}-01-01`;
                          setEditedPatient(prev => ({
                            ...prev,
                            dateOfBirth: dateStr
                          }));
                        } else {
                          // If input is empty or invalid, clear the date
                          setEditedPatient(prev => ({
                            ...prev,
                            dateOfBirth: ''
                          }));
                        }
                      }}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="border border-blue-300 rounded px-1 py-0.5 w-full text-xs bg-blue-50"
                      placeholder="Year"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm leading-none">
                    {patient.gender} • {calculateAge(patient.dateOfBirth)} yrs
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm leading-none flex items-center">
                    Ph: {patient.phone}
                  </span>
                  {patient.phone && (
                    <a
                      href={`tel:${patient.phone}`}
                      className="bg-gray-800 hover:bg-gray-900 text-white px-2 py-1 rounded-full text-sm leading-none flex items-center"
                      title="Call patient"
                    >
                      <FaPhoneAlt className="mr-1" size={10} /> Call
                    </a>
                  )}
                  {patient.lastVisit && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm leading-none">
                      Last: {patient.lastVisit}
                    </span>
                  )}
                  {allDiagnoses.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm leading-none">
                      {allDiagnoses.length} Diagnoses
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            {editMode && activeTab !== 'biodata' ? (
              <div className="flex space-x-1">
                <button
                  onClick={handleSaveChanges}
                  className="bg-green-600 text-white px-1 py-0.5 rounded text-[10px] hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-500 text-white px-1 py-0.5 rounded text-[10px] hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : activeTab !== 'biodata' ? (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-1 py-0.5 rounded text-[10px] hover:bg-blue-700"
              >
                Edit
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="flex border-b mb-2 relative">
        <button
          onClick={() => setActiveTab('biodata')}
          className={`py-2 px-4 font-medium text-sm border-b-2 -mb-px ${
            activeTab === 'biodata'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Biodata
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`py-2 px-4 font-medium text-sm border-b-2 -mb-px ${
            activeTab === 'appointments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="hidden md:inline">Appointments</span>
          <span className="md:hidden">Appts</span>
        </button>
        {userRole === 'doctor' && (
          <button
            onClick={() => setActiveTab('diagnoses')}
            className={`py-2 px-4 font-medium text-sm border-b-2 -mb-px ${
              activeTab === 'diagnoses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Notes
          </button>
        )}
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-4 font-medium text-sm border-b-2 -mb-px ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Info
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'biodata' ? (
        <div className="p-3">
          {/* Enhanced Patient Biodata Form */}
          <div className="border rounded p-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-base text-blue-800">Patient Biodata</h3>
              {!editMode && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                  >
                    <span className="md:hidden"><FaUser className="h-3 w-3 mr-1" /></span>
                    <span>Edit</span>
                  </button>
                  {onDeletePatient && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${patient.firstName} ${patient.lastName}?`)) {
                          handleDeletePatient();
                        }
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center"
                    >
                      <span className="md:hidden"><FaTrash className="h-3 w-3 mr-1" /></span>
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {editMode ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={editedPatient.firstName}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={editedPatient.lastName}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-700">Year of Birth</label>
                    <input
                      type="number"
                      name="dateOfBirth"
                      value={editedPatient.dateOfBirth && !isNaN(new Date(editedPatient.dateOfBirth).getFullYear()) ? new Date(editedPatient.dateOfBirth).getFullYear() : ''}
                      onChange={(e) => {
                        const year = e.target.value;
                        if (year && !isNaN(year)) {
                          // Create a date with just the year (Jan 1 of that year)
                          const dateStr = `${year}-01-01`;
                          setEditedPatient(prev => ({
                            ...prev,
                            dateOfBirth: dateStr,
                            yearOfBirth: parseInt(year)
                          }));
                        } else {
                          // If input is empty or invalid, clear the date
                          setEditedPatient(prev => ({
                            ...prev,
                            dateOfBirth: '',
                            yearOfBirth: null
                          }));
                        }
                      }}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Year"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700">Gender</label>
                    <select
                      name="gender"
                      value={editedPatient.gender}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editedPatient.phone}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editedPatient.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-700">Address</label>
                  <input
                    name="address"
                    value={editedPatient.address || ''}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>

                <h4 className="font-medium text-sm text-blue-700 border-b pb-2 mt-3">Next of Kin</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-700">Name</label>
                    <input
                      type="text"
                      name="nextOfKinName"
                      value={editedPatient.nextOfKinName || ''}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700">Relationship</label>
                    <input
                      type="text"
                      name="nextOfKinRelationship"
                      value={editedPatient.nextOfKinRelationship || ''}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-700">Next of Kin Phone</label>
                  <input
                    type="tel"
                    name="nextOfKinPhone"
                    value={editedPatient.nextOfKinPhone || ''}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 min-w-[80px] font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 min-w-[80px] font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500">First Name</p>
                    <p className="text-sm font-medium">{patient.firstName}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500">Last Name</p>
                    <p className="text-sm font-medium">{patient.lastName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500">Year of Birth</p>
                    <p className="text-sm font-medium">{patient.dateOfBirth ? new Date(patient.dateOfBirth).getFullYear() : 'Not provided'} ({calculateAge(patient.dateOfBirth)} yrs)</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm font-medium">{patient.gender}</p>
                  </div>
                </div>

                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <div className="flex items-center">
                    <p className="text-sm font-medium mr-2">{patient.phone}</p>
                    {patient.phone && (
                      <a
                        href={`tel:${patient.phone}`}
                        className="bg-gray-800 hover:bg-gray-900 text-white p-1.5 rounded-full"
                        title="Call patient"
                      >
                        <FaPhoneAlt size={12} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">Email</p>
                  <div className="flex items-center">
                    <p className="text-sm font-medium mr-2">{patient.email || 'Not provided'}</p>
                    {patient.email && (
                      <a
                        href={`mailto:${patient.email}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full"
                        title="Email patient"
                      >
                        <FaEnvelope size={12} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium">{patient.address || 'Not provided'}</p>
                </div>

                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">Patient ID</p>
                  <p className="text-sm font-medium">{patient.id}</p>
                </div>

                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">Record Created By</p>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      patient.createdBy === 'doctor' ? 'bg-blue-100 text-blue-800' :
                      patient.createdBy === 'secretary' ? 'bg-green-100 text-green-800' :
                      patient.createdBy === 'admin' ? 'bg-gray-100 text-gray-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      <span className="flex items-center">
                        <FaUser className="mr-1" size={12} />
                        {getCreatorLabel(patient.createdBy)}
                      </span>
                    </span>
                    {patient.createdAt && (
                      <span className="text-xs text-gray-500 ml-2">
                        on {new Date(patient.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="font-medium text-sm text-blue-700 border-b pb-2 mt-3">Next of Kin</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium">{patient.nextOfKinName || 'Not provided'}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500">Relationship</p>
                    <p className="text-sm font-medium">{patient.nextOfKinRelationship || 'Not provided'}</p>
                  </div>
                </div>

                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">Phone</p>
                  <div className="flex items-center">
                    <p className="text-sm font-medium mr-2">{patient.nextOfKinPhone || 'Not provided'}</p>
                    {patient.nextOfKinPhone && (
                      <a
                        href={`tel:${patient.nextOfKinPhone}`}
                        className="bg-gray-800 hover:bg-gray-900 text-white p-1.5 rounded-full"
                        title="Call next of kin"
                      >
                        <FaPhoneAlt size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Medical History */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">Medical History</h3>
              <div className="flex space-x-2">
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                )}
                {editMode && (
                  <div className="text-sm text-blue-600">
                    Add or remove medical conditions below
                  </div>
                )}
              </div>
            </div>

            {editMode ? (
              <MedicalHistoryManager
                medicalHistory={editedMedicalHistory}
                onUpdate={setEditedMedicalHistory}
              />
            ) : patient.medicalHistory && patient.medicalHistory.length > 0 ? (
              <div className="space-y-2">
                {patient.medicalHistory.map((condition, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                    <div>
                      <div className="font-medium">{condition.condition}</div>
                      <div className="text-sm text-gray-600">
                        Diagnosed: {condition.diagnosedDate} • {condition.notes}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          // Create a temporary edit mode just for this item
                          setEditMode(true);
                          // Focus on this item in the medical history manager
                          // This will be handled by scrolling to the item
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-gray-500 italic mb-4">No medical history recorded.</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Add Medical History
                </button>
              </div>
            )}
          </div>

          {/* Allergies */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">Allergies</h3>
              <div className="flex space-x-2">
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                )}
                {editMode && (
                  <div className="text-sm text-blue-600">
                    Add or remove allergies below
                  </div>
                )}
              </div>
            </div>

            {editMode ? (
              <AllergiesManager
                allergies={editedAllergies}
                onUpdate={setEditedAllergies}
              />
            ) : patient.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, index) => (
                  <div key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center">
                    <span>{allergy}</span>
                    <button
                      onClick={() => {
                        setEditMode(true);
                      }}
                      className="ml-2 text-red-600 hover:text-red-800 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-gray-500 italic mb-4">No allergies recorded.</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Add Allergies
                </button>
              </div>
            )}
          </div>

          {/* Medications */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">Current Medications</h3>
              <div className="flex space-x-2">
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                )}
                {editMode && (
                  <div className="text-sm text-blue-600">
                    Add or remove medications below
                  </div>
                )}
              </div>
            </div>

            {editMode ? (
              <MedicationsManager
                medications={editedMedications}
                onUpdate={setEditedMedications}
              />
            ) : patient.medications && patient.medications.length > 0 ? (
              <div className="space-y-2">
                {patient.medications.map((medication, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                    <div>
                      <div className="font-medium">{medication.name}</div>
                      <div className="text-sm text-gray-600">
                        {medication.dosage} • {medication.frequency} • Started: {medication.startDate}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditMode(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-gray-500 italic mb-4">No medications recorded.</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Add Medications
                </button>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'diagnoses' && userRole === 'doctor' ? (
        <div className="p-1">
          <PatientDiagnosesTab
            patient={patient}
            appointments={appointments}
            onEditDiagnosis={handleEditDiagnosis}
            onDeleteDiagnosis={handleDeleteDiagnosis}
            userRole={userRole}
          />
        </div>
      ) : activeTab === 'appointments' ? (
        <div className="p-3">
          {/* Appointments List */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg text-blue-800">Appointments</h3>
              <button
                onClick={handleAddAppointment}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center"
              >
                <span className="mr-1">+</span> Add Appointment
              </button>
            </div>

            {/* Enhanced Upcoming Appointments Section */}
            {upcomingAppointments.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-blue-800 text-base mb-3 border-b pb-2">Upcoming</h4>
                <div className="space-y-3">
                  {upcomingAppointments.map(appointment => (
                    <div key={appointment.id} className={`border rounded-lg p-3 hover:bg-gray-50 shadow-sm ${appointment.status === 'Scheduled' ? 'bg-green-50' : appointment.status === 'Completed' ? 'bg-blue-50' : appointment.status === 'Cancelled' ? 'bg-red-50' : appointment.status === 'Pending' ? 'bg-yellow-50' : 'bg-white'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-base leading-tight">{appointment.date} at {appointment.time}</p>
                          <p className="text-gray-600 text-sm leading-tight mt-1">{appointment.type} - {appointment.reason}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-gray-500 text-xs mr-1">Booked by:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              appointment.createdBy === 'doctor' ? 'bg-blue-100 text-blue-800' :
                              appointment.createdBy === 'secretary' ? 'bg-green-100 text-green-800' :
                              appointment.createdBy === 'admin' ? 'bg-gray-100 text-gray-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              <FaUser className="mr-1" size={10} />
                              {getCreatorLabel(appointment.createdBy)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
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
                            onClick={() => handleEditAppointment(appointment)}
                            className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-3 py-1 rounded"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Past Appointments Section */}
            <div className="mb-3">
              <h4 className="font-medium text-gray-700 text-base mb-3 border-b pb-2">Previous</h4>
              {pastAppointments.length > 0 ? (
                <div className="space-y-3">
                  {pastAppointments.map(appointment => (
                    <div key={appointment.id} className={`border rounded-lg p-3 hover:bg-gray-50 shadow-sm ${appointment.status === 'Scheduled' ? 'bg-green-50' : appointment.status === 'Completed' ? 'bg-blue-50' : appointment.status === 'Cancelled' ? 'bg-red-50' : appointment.status === 'Pending' ? 'bg-yellow-50' : 'bg-white'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-base leading-tight">{appointment.date} at {appointment.time}</p>
                          <p className="text-gray-600 text-sm leading-tight mt-1">{appointment.type} - {appointment.reason}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-gray-500 text-xs mr-1">Booked by:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              appointment.createdBy === 'doctor' ? 'bg-blue-100 text-blue-800' :
                              appointment.createdBy === 'secretary' ? 'bg-green-100 text-green-800' :
                              appointment.createdBy === 'admin' ? 'bg-gray-100 text-gray-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              <FaUser className="mr-1" size={10} />
                              {getCreatorLabel(appointment.createdBy)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
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
                            onClick={() => handleEditAppointment(appointment)}
                            className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-3 py-1 rounded"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">No previous appointments</p>
                </div>
              )}
            </div>

            {upcomingAppointments.length === 0 && pastAppointments.length === 0 && (
              <div className="text-center py-6 bg-gray-50 rounded-lg mt-3">
                <p className="text-gray-500 text-base">No appointments recorded for this patient</p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'overview' ? (
        <div className="p-3">
          {/* Patient Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-blue-800">Patient Information</h3>

            <div className="border rounded-lg p-3 bg-gray-50 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">First Name</p>
                  <p className="text-sm font-medium">{patient.firstName}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">Last Name</p>
                  <p className="text-sm font-medium">{patient.lastName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">Year of Birth</p>
                  <p className="text-sm font-medium">{patient.dateOfBirth ? new Date(patient.dateOfBirth).getFullYear() : 'Not provided'} ({calculateAge(patient.dateOfBirth)} yrs)</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="text-sm font-medium">{patient.gender}</p>
                </div>
              </div>

              <div className="border-b pb-2 mt-3">
                <p className="text-xs text-gray-500">Phone Number</p>
                <p className="text-sm font-medium">{patient.phone}</p>
              </div>

              <div className="border-b pb-2 mt-3">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{patient.email || 'Not provided'}</p>
              </div>
            </div>

            {/* Medical History */}
            <h3 className="font-semibold text-lg text-blue-800 mt-4">Medical History</h3>
            {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
              <div className="space-y-3">
                {patient.medicalHistory.map((condition, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border shadow-sm">
                    <div className="font-medium text-base">{condition.condition}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Diagnosed: {condition.diagnosedDate} • {condition.notes}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">No medical history recorded</p>
              </div>
            )}

            {/* Allergies */}
            <h3 className="font-semibold text-lg text-blue-800 mt-4">Allergies</h3>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border shadow-sm">
                {patient.allergies.map((allergy, index) => (
                  <div key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {allergy}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">No allergies recorded</p>
              </div>
            )}

            {/* Medications */}
            <h3 className="font-semibold text-lg text-blue-800 mt-4">Current Medications</h3>
            {patient.medications && patient.medications.length > 0 ? (
              <div className="space-y-3">
                {patient.medications.map((medication, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border shadow-sm">
                    <div className="font-medium text-base">{medication.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {medication.dosage} • {medication.frequency} • Started: {medication.startDate}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">No medications recorded</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3">
          {/* Default Tab */}
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-base">Please select a tab to view patient information</p>
          </div>
            <div className="flex justify-between items-center mb-3 mt-4">
              <h3 className="font-semibold text-lg text-blue-800">Appointments</h3>
              <button
                onClick={handleAddAppointment}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center"
              >
                <span className="mr-1">+</span> Add Appointment
              </button>
            </div>

            {/* Enhanced Upcoming Appointments Section */}
            {upcomingAppointments.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-blue-800 text-base mb-3 border-b pb-2">Upcoming</h4>
                <div className="space-y-3">
                  {upcomingAppointments.map(appointment => (
                    <div key={appointment.id} className={`border rounded-lg p-3 hover:bg-gray-50 shadow-sm ${appointment.status === 'Scheduled' ? 'bg-green-50' : appointment.status === 'Completed' ? 'bg-blue-50' : appointment.status === 'Cancelled' ? 'bg-red-50' : appointment.status === 'Pending' ? 'bg-yellow-50' : 'bg-white'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-base leading-tight">{appointment.date} at {appointment.time}</p>
                          <p className="text-gray-600 text-sm leading-tight mt-1">{appointment.type} - {appointment.reason}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-gray-500 text-xs mr-1">Booked by:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              appointment.createdBy === 'doctor' ? 'bg-blue-100 text-blue-800' :
                              appointment.createdBy === 'secretary' ? 'bg-green-100 text-green-800' :
                              appointment.createdBy === 'admin' ? 'bg-gray-100 text-gray-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              <FaUser className="mr-1" size={10} />
                              {getCreatorLabel(appointment.createdBy)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
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
                            onClick={() => handleEditAppointment(appointment)}
                            className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-3 py-1 rounded"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Past Appointments Section */}
            <div className="mb-3">
              <h4 className="font-medium text-gray-700 text-base mb-3 border-b pb-2">Previous</h4>
              {pastAppointments.length > 0 ? (
              <div className="space-y-3">
                {pastAppointments.map(appointment => (
                  <div key={appointment.id} className={`border rounded-lg p-3 hover:bg-gray-50 shadow-sm ${appointment.status === 'Scheduled' ? 'bg-green-50' : appointment.status === 'Completed' ? 'bg-blue-50' : appointment.status === 'Cancelled' ? 'bg-red-50' : appointment.status === 'Pending' ? 'bg-yellow-50' : 'bg-white'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-base leading-tight">{appointment.date} at {appointment.time}</p>
                        <p className="text-gray-600 text-sm leading-tight mt-1">{appointment.type} - {appointment.reason}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-gray-500 text-xs mr-1">Booked by:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            appointment.createdBy === 'doctor' ? 'bg-blue-100 text-blue-800' :
                            appointment.createdBy === 'secretary' ? 'bg-green-100 text-green-800' :
                            appointment.createdBy === 'admin' ? 'bg-gray-100 text-gray-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            <FaUser className="mr-1" size={10} />
                            {getCreatorLabel(appointment.createdBy)}
                          </span>
                          {appointment.createdAt && (
                            <span className="text-xs text-gray-500 ml-2">
                              on {new Date(appointment.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
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
                          onClick={() => handleEditAppointment(appointment)}
                          className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {appointment.diagnosis ? (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-800">Diagnosis:</p>
                        <p className="mt-1">{appointment.diagnosis.notes}</p>

                        {appointment.diagnosis.files && appointment.diagnosis.files.length > 0 && (
                          <div className="mt-3 border-t border-blue-200 pt-3">
                            <p className="font-medium text-blue-800 mb-2">Attached Files:</p>
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

                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDiagnosingAppointment(appointment);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                          >
                            Edit Notes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDiagnosingAppointment(appointment);
                          }}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600 shadow-md w-full md:w-auto"
                        >
                          Add Notes
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">No previous appointments recorded for this patient</p>
              </div>
            )}

            {upcomingAppointments.length === 0 && pastAppointments.length === 0 && (
              <div className="text-center py-6 bg-gray-50 rounded-lg mt-3">
                <p className="text-gray-500 text-base">No appointments recorded for this patient</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Management Modal */}
      {managingAppointment && (
        <AppointmentManagementModal
          appointment={managingAppointment}
          onClose={() => {
            setManagingAppointment(null);
            setIsNewAppointment(false);
          }}
          onSave={handleSaveAppointment}
          isNew={isNewAppointment}
        />
      )}

      {/* Notes Modal */}
      {diagnosingAppointment && (
        <SimplifiedNotesModal
          appointment={diagnosingAppointment}
          onClose={() => setDiagnosingAppointment(null)}
          onSave={(updatedAppointment) => {
            // Make sure the appointment status is set to Completed when adding notes
            const appointmentWithStatus = {
              ...updatedAppointment,
              status: 'Completed'
            };

            console.log('Saving notes in SimplifiedPatientView:', appointmentWithStatus);

            // Check if this is a new note or an update to an existing one
            const isNewNote = !diagnosingAppointment.diagnosis;

            // If this is a new note for an appointment that already has notes,
            // we need to preserve the existing notes array
            if (!isNewNote && diagnosingAppointment.diagnoses) {
              // Add the new note to the existing notes array
              appointmentWithStatus.diagnoses = [
                appointmentWithStatus.diagnosis,
                ...diagnosingAppointment.diagnoses
              ];
            }

            // Update the appointment with notes
            onDiagnoseAppointment(appointmentWithStatus);
            setDiagnosingAppointment(null);

            // Wait a moment before switching tabs to ensure state is updated
            setTimeout(() => {
              // Switch to the notes tab to show the new notes
              setActiveTab('diagnoses');
            }, 500);
          }}
        />
      )}
    </div>
  )
}

export default SimplifiedPatientView;
