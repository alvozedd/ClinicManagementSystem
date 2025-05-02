import { useState, useEffect } from 'react';
import { FaUserPlus, FaSearch, FaEdit, FaTrash, FaArrowLeft, FaPhone, FaEnvelope } from 'react-icons/fa';
import apiService from '../../utils/apiService';
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
            }`}
            onClick={() => onSelectPatient(patient)}
          >
            {viewMode === 'grid' ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{patient.name}</h3>
                    <p className="text-sm text-gray-500">Age: {calculateAge(patient.year_of_birth)}</p>
                  </div>
                  <span className={`badge ${
                    patient.gender === 'Male' ? 'badge-blue' : 
                    patient.gender === 'Female' ? 'badge-red' : 'badge-gray'
                  }`}>
                    {patient.gender}
                  </span>
                </div>
                <div className="mt-3 flex items-center text-gray-600 text-sm">
                  <FaPhone className="mr-1" />
                  <span>{patient.phone}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Added by: {patient.createdBy || 'Unknown'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPatient(patient);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    {role === 'doctor' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePatient(patient._id);
                        }}
                        className="text-red-600 hover:text-red-800"
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
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {patient.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{patient.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="mr-3">Age: {calculateAge(patient.year_of_birth)}</span>
                      <FaPhone className="mr-1" />
                      <span>{patient.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`badge mr-3 ${
                    patient.gender === 'Male' ? 'badge-blue' : 
                    patient.gender === 'Female' ? 'badge-red' : 'badge-gray'
                  }`}>
                    {patient.gender}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPatient(patient);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    {role === 'doctor' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePatient(patient._id);
                        }}
                        className="text-red-600 hover:text-red-800"
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
      <div className="patient-detail">
        <div className="flex items-center mb-6">
          <button
            onClick={onBackToPatients}
            className="mr-3 text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{selectedPatient.name}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="glass-card p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Personal Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium">{selectedPatient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{calculateAge(selectedPatient.year_of_birth)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{selectedPatient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Added by:</span>
                <span className="font-medium capitalize">{selectedPatient.createdBy || 'Unknown'}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Next of Kin</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{selectedPatient.next_of_kin_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Relationship:</span>
                <span className="font-medium">{selectedPatient.next_of_kin_relationship}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{selectedPatient.next_of_kin_phone}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleEditPatient(selectedPatient)}
                className="w-full btn btn-outline-primary flex items-center justify-center"
              >
                <FaEdit className="mr-2" />
                Edit Patient
              </button>
              {role === 'doctor' && (
                <button
                  onClick={() => handleDeletePatient(selectedPatient._id)}
                  className="w-full btn btn-outline btn-danger flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Delete Patient
                </button>
              )}
              <button
                className="w-full btn btn-outline-primary flex items-center justify-center"
              >
                <FaPhone className="mr-2" />
                Call Patient
              </button>
            </div>
          </div>
        </div>

        {role === 'doctor' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Medical History</h3>
              {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                <ul className="space-y-2">
                  {selectedPatient.medicalHistory.map((item, index) => (
                    <li key={index} className="p-2 bg-white rounded border border-gray-200">
                      <div className="font-medium">{item.condition}</div>
                      <div className="text-sm text-gray-600">Diagnosed: {item.diagnosedDate}</div>
                      {item.notes && <div className="text-sm mt-1">{item.notes}</div>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No medical history recorded.</p>
              )}
            </div>

            <div className="glass-card p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Allergies</h3>
              {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.allergies.map((allergy, index) => (
                    <span key={index} className="badge badge-red">{allergy}</span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No allergies recorded.</p>
              )}

              <h3 className="font-semibold text-gray-700 mt-4 mb-3">Current Medications</h3>
              {selectedPatient.medications && selectedPatient.medications.length > 0 ? (
                <ul className="space-y-2">
                  {selectedPatient.medications.map((med, index) => (
                    <li key={index} className="p-2 bg-white rounded border border-gray-200">
                      <div className="font-medium">{med.name}</div>
                      <div className="text-sm text-gray-600">
                        {med.dosage}, {med.frequency}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No medications recorded.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add Patient Modal
  const renderAddPatientModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Add New Patient</h2>
          
          <form onSubmit={submitAddPatient}>
            <div className="form-group">
              <label className="form-label">Full Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Gender*</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone Number*</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Year of Birth</label>
              <input
                type="number"
                name="year_of_birth"
                value={formData.year_of_birth}
                onChange={handleInputChange}
                className="form-input"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Next of Kin Name*</label>
              <input
                type="text"
                name="next_of_kin_name"
                value={formData.next_of_kin_name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Next of Kin Relationship*</label>
              <input
                type="text"
                name="next_of_kin_relationship"
                value={formData.next_of_kin_relationship}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Next of Kin Phone*</label>
              <input
                type="tel"
                name="next_of_kin_phone"
                value={formData.next_of_kin_phone}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn btn-outline-primary mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Edit Patient</h2>
          
          <form onSubmit={submitEditPatient}>
            <div className="form-group">
              <label className="form-label">Full Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Gender*</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone Number*</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Year of Birth</label>
              <input
                type="number"
                name="year_of_birth"
                value={formData.year_of_birth}
                onChange={handleInputChange}
                className="form-input"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Next of Kin Name*</label>
              <input
                type="text"
                name="next_of_kin_name"
                value={formData.next_of_kin_name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Next of Kin Relationship*</label>
              <input
                type="text"
                name="next_of_kin_relationship"
                value={formData.next_of_kin_relationship}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Next of Kin Phone*</label>
              <input
                type="tel"
                name="next_of_kin_phone"
                value={formData.next_of_kin_phone}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="btn btn-outline-primary mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
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
            <h1 className="text-2xl font-bold text-gray-800">Patient Management</h1>
            <button 
              onClick={handleAddPatient}
              className="btn btn-primary flex items-center"
            >
              <FaUserPlus className="mr-2" />
              Add Patient
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search patients..."
                className="form-input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="flex space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setViewMode('grid')}
                className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
              >
                List
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
