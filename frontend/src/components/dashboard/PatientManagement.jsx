import { useState, useEffect } from 'react';
import { FaUserPlus, FaSearch, FaEdit, FaTrash, FaArrowLeft, FaPhone, FaEnvelope, FaFileMedical, FaCalendarAlt, FaThLarge, FaList } from 'react-icons/fa';
import apiService from '../../utils/apiService';
import PatientView from './PatientView';
import './DashboardStyles.css';

const PatientManagement = ({ role, selectedPatient, onSelectPatient, onBackToPatients }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [patientNotes, setPatientNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Form state for adding/editing patients
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    phone: '',
    year_of_birth: '',
    next_of_kin_name: '',
    next_of_kin_relationship: '',
    next_of_kin_phone: '',
    medicalHistory: [],
    allergies: [],
    medications: []
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  // Fetch notes when a patient is selected
  useEffect(() => {
    if (selectedPatient && selectedPatient._id) {
      fetchPatientNotes(selectedPatient._id);
    } else {
      setPatientNotes([]);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPatients();
      setPatients(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddPatient = () => {
    setFormData({
      name: '',
      gender: '',
      phone: '',
      year_of_birth: '',
      next_of_kin_name: '',
      next_of_kin_relationship: '',
      next_of_kin_phone: '',
      medicalHistory: [],
      allergies: [],
      medications: []
    });
    setShowAddModal(true);
  };

  const handleEditPatient = (patient) => {
    setCurrentPatient(patient);
    setFormData({
      name: patient.name,
      gender: patient.gender,
      phone: patient.phone,
      year_of_birth: patient.year_of_birth || '',
      next_of_kin_name: patient.next_of_kin_name,
      next_of_kin_relationship: patient.next_of_kin_relationship,
      next_of_kin_phone: patient.next_of_kin_phone,
      medicalHistory: patient.medicalHistory || [],
      allergies: patient.allergies || [],
      medications: patient.medications || []
    });
    setShowEditModal(true);
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await apiService.deletePatient(patientId);
        fetchPatients();
      } catch (err) {
        console.error('Error deleting patient:', err);
        setError('Failed to delete patient. Please try again.');
      }
    }
  };

  const submitAddPatient = async (e) => {
    e.preventDefault();
    try {
      const patientData = {
        ...formData,
        createdBy: role
      };
      await apiService.createPatient(patientData);
      setShowAddModal(false);
      fetchPatients();
    } catch (err) {
      console.error('Error adding patient:', err);
      setError('Failed to add patient. Please try again.');
    }
  };

  const submitEditPatient = async (e) => {
    e.preventDefault();
    try {
      await apiService.updatePatient(currentPatient._id, formData);
      setShowEditModal(false);
      fetchPatients();

      // If we're editing the currently selected patient, update it
      if (selectedPatient && selectedPatient._id === currentPatient._id) {
        onSelectPatient({
          ...selectedPatient,
          ...formData
        });
      }
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Failed to update patient. Please try again.');
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  // Calculate age from year of birth
  const calculateAge = (yearOfBirth) => {
    if (!yearOfBirth) return 'N/A';
    const currentYear = new Date().getFullYear();
    return currentYear - yearOfBirth;
  };

  // Fetch patient notes
  const fetchPatientNotes = async (patientId) => {
    // Only fetch notes if we have a patient ID and the user is a doctor
    if (!patientId || (role && role !== 'doctor')) return;

    try {
      setLoadingNotes(true);
      const notes = await apiService.getDiagnosesByPatientId(patientId);
      setPatientNotes(notes);
    } catch (err) {
      console.error('Error fetching patient notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render Patient List View
  const renderPatientList = () => {
    if (filteredPatients.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No patients found. Try a different search term or add a new patient.
        </div>
      );
    }

    return (
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
        {filteredPatients.map(patient => (
          <div
            key={patient._id}
            className={`dashboard-card p-4 cursor-pointer hover:shadow-md transition-all ${
              viewMode === 'list' ? "flex items-center justify-between" : ""
            } ${patient.createdBy === 'visitor' ? 'visitor-appointment' : ''}`}
            onClick={() => onSelectPatient(patient)}
          >
            {viewMode === 'grid' ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{patient.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Age: {calculateAge(patient.year_of_birth)}</p>
                  </div>
                  <span className={`badge ${
                    patient.gender === 'Male' ? 'badge-blue' :
                    patient.gender === 'Female' ? 'badge-pink' : 'badge-gray'
                  } dark:text-white`}>
                    {patient.gender}
                  </span>
                </div>
                <div className="mt-3 flex items-center text-gray-600 dark:text-gray-300 text-sm">
                  <FaPhone className="mr-1" />
                  <span>{patient.phone}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Added by: {patient.createdBy || 'Unknown'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPatient(patient);
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <FaEdit />
                    </button>
                    {role === 'doctor' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePatient(patient._id);
                        }}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold">
                      {patient.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{patient.name}</h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                      <span className="mr-3">Age: {calculateAge(patient.year_of_birth)}</span>
                      <FaPhone className="mr-1" />
                      <span>{patient.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`badge mr-3 ${
                    patient.gender === 'Male' ? 'badge-blue' :
                    patient.gender === 'Female' ? 'badge-pink' : 'badge-gray'
                  } dark:text-white`}>
                    {patient.gender}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPatient(patient);
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <FaEdit />
                    </button>
                    {role === 'doctor' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePatient(patient._id);
                        }}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render Patient Detail View
  const renderPatientDetail = () => {
    if (!selectedPatient) return null;

    return (
      <div>
        <PatientView
          patient={selectedPatient}
          onBackToPatients={onBackToPatients}
        />

        {role === 'doctor' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="glass-card p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 dark:text-white mb-3">Medical History</h3>
                {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedPatient.medicalHistory.map((item, index) => (
                      <li key={index} className="p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                        <div className="font-medium dark:text-white">{item.condition}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Diagnosed: {item.diagnosedDate}</div>
                        {item.notes && <div className="text-sm mt-1 dark:text-gray-200">{item.notes}</div>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No medical history recorded.</p>
                )}
              </div>

              <div className="glass-card p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 dark:text-white mb-3">Allergies</h3>
                {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.allergies.map((allergy, index) => (
                      <span key={index} className="badge badge-red dark:bg-red-700 dark:text-white">{allergy}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No allergies recorded.</p>
                )}

                <h3 className="font-semibold text-gray-700 dark:text-white mt-4 mb-3">Current Medications</h3>
                {selectedPatient.medications && selectedPatient.medications.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedPatient.medications.map((med, index) => (
                      <li key={index} className="p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                        <div className="font-medium dark:text-white">{med.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {med.dosage}, {med.frequency}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No medications recorded.</p>
                )}
              </div>
            </div>

            {/* Patient Notes Section */}
            <div className="glass-card p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700 dark:text-white">
                  <FaFileMedical className="inline mr-2 text-blue-600 dark:text-blue-400" />
                  Patient Notes
                </h3>
                {loadingNotes ? (
                  <span className="text-sm text-gray-500 dark:text-gray-400">Loading notes...</span>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {patientNotes.length} {patientNotes.length === 1 ? 'note' : 'notes'} found
                  </span>
                )}
              </div>

              {loadingNotes ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">Loading patient notes...</p>
                </div>
              ) : patientNotes.length === 0 ? (
                <div className="text-center py-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-300">No notes found for this patient.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patientNotes.map(note => (
                    <div key={note._id} className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            {note.appointment_id && note.appointment_id.type ? note.appointment_id.type : 'Appointment'}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-300">{formatDate(note.createdAt)}</p>
                        </div>
                        {note.appointment_id && note.appointment_id.status && (
                          <span className={`badge ${note.appointment_id.status === 'Completed' ? 'badge-green' : 'badge-blue'} dark:bg-blue-700 dark:text-white`}>
                            {note.appointment_id.status}
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        <p className="text-gray-700 dark:text-white whitespace-pre-line">{note.diagnosis_text}</p>
                      </div>

                      {note.diagnosis && note.diagnosis.medications && note.diagnosis.medications.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Medications:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {note.diagnosis.medications.map((med, index) => (
                              <span key={index} className="badge badge-blue text-xs dark:bg-blue-700 dark:text-white">
                                {med.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {note.diagnosis && note.diagnosis.treatment_plan && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Treatment Plan:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{note.diagnosis.treatment_plan}</p>
                        </div>
                      )}

                      {note.diagnosis && note.diagnosis.follow_up_instructions && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Follow-up:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{note.diagnosis.follow_up_instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // Add Patient Modal
  const renderAddPatientModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Patient</h2>

          <form onSubmit={submitAddPatient}>
            <div className="form-group">
              <label className="form-label dark:text-white">Full Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label dark:text-white">Gender*</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label dark:text-white">Phone Number*</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label dark:text-white">Year of Birth</label>
              <input
                type="number"
                name="year_of_birth"
                value={formData.year_of_birth}
                onChange={handleInputChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="form-group">
              <label className="form-label dark:text-white">Next of Kin Name</label>
              <input
                type="text"
                name="next_of_kin_name"
                value={formData.next_of_kin_name}
                onChange={handleInputChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="form-group">
              <label className="form-label dark:text-white">Next of Kin Relationship</label>
              <input
                type="text"
                name="next_of_kin_relationship"
                value={formData.next_of_kin_relationship}
                onChange={handleInputChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="form-group">
              <label className="form-label dark:text-white">Next of Kin Phone</label>
              <input
                type="tel"
                name="next_of_kin_phone"
                value={formData.next_of_kin_phone}
                onChange={handleInputChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn btn-outline-primary mr-2 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-900/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Add Patient
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit Patient Modal
  const renderEditPatientModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Patient</h2>

          <form onSubmit={submitEditPatient}>
            <div className="form-group">
              <label className="form-label dark:text-white">Full Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label dark:text-white">Gender*</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label dark:text-white">Phone Number*</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label dark:text-white">Year of Birth</label>
              <input
                type="number"
                name="year_of_birth"
                value={formData.year_of_birth}
                onChange={handleInputChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="form-group">
              <label className="form-label dark:text-white">Next of Kin Name</label>
              <input
                type="text"
                name="next_of_kin_name"
                value={formData.next_of_kin_name}
                onChange={handleInputChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="form-group">
              <label className="form-label dark:text-white">Next of Kin Relationship</label>
              <input
                type="text"
                name="next_of_kin_relationship"
                value={formData.next_of_kin_relationship}
                onChange={handleInputChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="form-group">
              <label className="form-label dark:text-white">Next of Kin Phone</label>
              <input
                type="tel"
                name="next_of_kin_phone"
                value={formData.next_of_kin_phone}
                onChange={handleInputChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="btn btn-outline-primary mr-2 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-900/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Update Patient
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="patient-management">
      {selectedPatient ? (
        renderPatientDetail()
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Patient Management</h1>
            <button
              onClick={handleAddPatient}
              className="btn btn-primary flex items-center dark:bg-blue-700 dark:hover:bg-blue-600"
              title="Add Patient"
              aria-label="Add Patient"
            >
              <FaUserPlus className="mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm md:text-base">Add</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <div className="search-input-container w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search patients..."
                className="form-input w-full dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="search-icon dark:text-gray-400" />
            </div>

            <div className="flex space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setViewMode('grid')}
                className={`btn ${viewMode === 'grid' ? 'btn-primary dark:bg-blue-700 dark:hover:bg-blue-600' : 'btn-outline-primary dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-900/30'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`btn ${viewMode === 'list' ? 'btn-primary dark:bg-blue-700 dark:hover:bg-blue-600' : 'btn-outline-primary dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-900/30'}`}
              >
                List
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-gray-600 dark:text-gray-300">Loading patients...</p>
            </div>
          ) : (
            renderPatientList()
          )}
        </>
      )}

      {showAddModal && renderAddPatientModal()}
      {showEditModal && renderEditPatientModal()}
    </div>
  );
};

export default PatientManagement;
