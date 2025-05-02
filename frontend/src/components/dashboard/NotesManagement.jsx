import { useState, useEffect } from 'react';
import { FaFileMedical, FaSearch, FaEdit, FaTrash, FaDownload, FaUpload, FaFilter } from 'react-icons/fa';
import apiService from '../../utils/apiService';
import './DashboardStyles.css';

const NotesManagement = () => {
  const [notes, setNotes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPatient, setFilterPatient] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Form state for adding/editing notes
  const [formData, setFormData] = useState({
    appointment_id: '',
    diagnosis_text: '',
    treatment_plan: '',
    follow_up: '',
    medications: []
  });

  // State for medication inputs
  const [medicationInput, setMedicationInput] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: ''
  });

  useEffect(() => {
    fetchNotes();
    fetchAppointments();
    fetchPatients();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await apiService.getDiagnoses();
      setNotes(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await apiService.getAppointments();
      // Filter to only completed appointments without notes
      const completedAppointments = data.filter(
        appointment => appointment.status === 'Completed' || appointment.status === 'In-progress'
      );
      setAppointments(completedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await apiService.getPatients();
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleMedicationInputChange = (e) => {
    const { name, value } = e.target;
    setMedicationInput({
      ...medicationInput,
      [name]: value
    });
  };

  const handleAddMedication = () => {
    if (medicationInput.name && medicationInput.dosage && medicationInput.frequency) {
      setFormData({
        ...formData,
        medications: [
          ...formData.medications,
          { ...medicationInput }
        ]
      });

      // Reset medication input
      setMedicationInput({
        name: '',
        dosage: '',
        frequency: '',
        duration: ''
      });
    }
  };

  const handleRemoveMedication = (index) => {
    const updatedMedications = [...formData.medications];
    updatedMedications.splice(index, 1);
    setFormData({
      ...formData,
      medications: updatedMedications
    });
  };

  const handleAddNote = () => {
    setFormData({
      appointment_id: '',
      diagnosis_text: '',
      treatment_plan: '',
      follow_up: '',
      medications: []
    });
    setSelectedFile(null);
    setShowAddModal(true);
  };

  const handleEditNote = (note) => {
    setCurrentNote(note);

    // Parse the diagnosis text to extract structured data if available
    let diagnosisText = note.diagnosis_text;
    let treatmentPlan = '';
    let followUp = '';
    let medications = [];

    // Check if the diagnosis text contains structured data
    if (note.diagnosis && typeof note.diagnosis === 'object') {
      diagnosisText = note.diagnosis.text || diagnosisText;
      treatmentPlan = note.diagnosis.treatment_plan || '';
      followUp = note.diagnosis.follow_up_instructions || '';
      medications = note.diagnosis.medications || [];
    }

    setFormData({
      appointment_id: note.appointment_id._id || note.appointment_id,
      diagnosis_text: diagnosisText,
      treatment_plan: treatmentPlan,
      follow_up: followUp,
      medications: medications
    });

    setShowEditModal(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await apiService.deleteDiagnosis(noteId);
        fetchNotes();
      } catch (err) {
        console.error('Error deleting note:', err);
        setError('Failed to delete note. Please try again.');
      }
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const submitAddNote = async (e) => {
    e.preventDefault();
    try {
      // Create structured diagnosis data
      const diagnosisData = {
        text: formData.diagnosis_text,
        treatment_plan: formData.treatment_plan,
        follow_up_instructions: formData.follow_up,
        medications: formData.medications
      };

      // Create note with structured data
      const noteData = {
        appointment_id: formData.appointment_id,
        diagnosis_text: formData.diagnosis_text,
        diagnosis: diagnosisData
      };

      await apiService.createDiagnosis(noteData);

      // If there's a file, upload it
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('appointment_id', noteData.appointment_id);

        await apiService.uploadFile(formData);
      }

      setShowAddModal(false);
      fetchNotes();
      fetchAppointments(); // Refresh appointments to update status
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note. Please try again.');
    }
  };

  const submitEditNote = async (e) => {
    e.preventDefault();
    try {
      // Create structured diagnosis data
      const diagnosisData = {
        text: formData.diagnosis_text,
        treatment_plan: formData.treatment_plan,
        follow_up_instructions: formData.follow_up,
        medications: formData.medications
      };

      // Create note with structured data
      const noteData = {
        appointment_id: formData.appointment_id,
        diagnosis_text: formData.diagnosis_text,
        diagnosis: diagnosisData
      };

      await apiService.updateDiagnosis(currentNote._id, noteData);

      // If there's a file, upload it
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('appointment_id', noteData.appointment_id);

        await apiService.uploadFile(formData);
      }

      setShowEditModal(false);
      fetchNotes();
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note. Please try again.');
    }
  };

  // Filter notes based on search term and patient filter
  const filteredNotes = notes.filter(note => {
    const patientName = note.appointment_id && note.appointment_id.patient_id &&
      typeof note.appointment_id.patient_id === 'object'
        ? note.appointment_id.patient_id.name
        : '';

    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.diagnosis_text && note.diagnosis_text.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPatient = filterPatient === 'all' ||
      (note.appointment_id && note.appointment_id.patient_id &&
       note.appointment_id.patient_id._id === filterPatient);

    return matchesSearch && matchesPatient;
  });

  // Sort notes by date (most recent first)
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get patient name from appointment
  const getPatientName = (appointment) => {
    if (!appointment) return 'Unknown Patient';

    if (appointment.patient_id && typeof appointment.patient_id === 'object') {
      return appointment.patient_id.name;
    }

    const patient = patients.find(p => p._id === appointment.patient_id);
    return patient ? patient.name : 'Unknown Patient';
  };

  // Render Notes List
  const renderNotesList = () => {
    if (sortedNotes.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No notes found. Try a different search term or add a new note.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedNotes.map(note => (
          <div key={note._id} className="dashboard-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {note.appointment_id && getPatientName(note.appointment_id)}
                </h3>
                <p className="text-sm text-gray-500">{formatDate(note.createdAt)}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditNote(note)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteNote(note._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-600 line-clamp-3">
                {note.diagnosis_text}
              </p>
            </div>
            {note.diagnosis && note.diagnosis.medications && note.diagnosis.medications.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-700">Medications:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {note.diagnosis.medications.map((med, index) => (
                    <span key={index} className="badge badge-blue text-xs">
                      {med.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Add Note Modal
  const renderAddNoteModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Add New Note</h2>

          <form onSubmit={submitAddNote}>
            <div className="form-group">
              <label className="form-label">Appointment*</label>
              <select
                name="appointment_id"
                value={formData.appointment_id}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Select Appointment</option>
                {appointments.map(appointment => (
                  <option key={appointment._id} value={appointment._id}>
                    {getPatientName(appointment)} - {new Date(appointment.appointment_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Diagnosis*</label>
              <textarea
                name="diagnosis_text"
                value={formData.diagnosis_text}
                onChange={handleInputChange}
                className="form-input"
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Treatment Plan</label>
              <textarea
                name="treatment_plan"
                value={formData.treatment_plan}
                onChange={handleInputChange}
                className="form-input"
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Follow-up Instructions</label>
              <textarea
                name="follow_up"
                value={formData.follow_up}
                onChange={handleInputChange}
                className="form-input"
                rows="2"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Medications</label>

              <div className="mb-2">
                {formData.medications.map((med, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-1">
                    <div>
                      <span className="font-medium">{med.name}</span>
                      <span className="text-sm text-gray-600"> - {med.dosage}, {med.frequency}</span>
                      {med.duration && <span className="text-sm text-gray-600"> for {med.duration}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  name="name"
                  value={medicationInput.name}
                  onChange={handleMedicationInputChange}
                  placeholder="Medication name"
                  className="form-input"
                />
                <input
                  type="text"
                  name="dosage"
                  value={medicationInput.dosage}
                  onChange={handleMedicationInputChange}
                  placeholder="Dosage (e.g., 10mg)"
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  name="frequency"
                  value={medicationInput.frequency}
                  onChange={handleMedicationInputChange}
                  placeholder="Frequency (e.g., twice daily)"
                  className="form-input"
                />
                <input
                  type="text"
                  name="duration"
                  value={medicationInput.duration}
                  onChange={handleMedicationInputChange}
                  placeholder="Duration (e.g., 7 days)"
                  className="form-input"
                />
              </div>

              <button
                type="button"
                onClick={handleAddMedication}
                className="btn btn-outline-primary w-full"
              >
                Add Medication
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Upload File (optional)</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="form-input"
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
                Add Note
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit Note Modal
  const renderEditNoteModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Edit Note</h2>

          <form onSubmit={submitEditNote}>
            <div className="form-group">
              <label className="form-label">Appointment*</label>
              <select
                name="appointment_id"
                value={formData.appointment_id}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled
              >
                <option value="">Select Appointment</option>
                {appointments.map(appointment => (
                  <option key={appointment._id} value={appointment._id}>
                    {getPatientName(appointment)} - {new Date(appointment.appointment_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Diagnosis*</label>
              <textarea
                name="diagnosis_text"
                value={formData.diagnosis_text}
                onChange={handleInputChange}
                className="form-input"
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Treatment Plan</label>
              <textarea
                name="treatment_plan"
                value={formData.treatment_plan}
                onChange={handleInputChange}
                className="form-input"
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Follow-up Instructions</label>
              <textarea
                name="follow_up"
                value={formData.follow_up}
                onChange={handleInputChange}
                className="form-input"
                rows="2"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Medications</label>

              <div className="mb-2">
                {formData.medications.map((med, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-1">
                    <div>
                      <span className="font-medium">{med.name}</span>
                      <span className="text-sm text-gray-600"> - {med.dosage}, {med.frequency}</span>
                      {med.duration && <span className="text-sm text-gray-600"> for {med.duration}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  name="name"
                  value={medicationInput.name}
                  onChange={handleMedicationInputChange}
                  placeholder="Medication name"
                  className="form-input"
                />
                <input
                  type="text"
                  name="dosage"
                  value={medicationInput.dosage}
                  onChange={handleMedicationInputChange}
                  placeholder="Dosage (e.g., 10mg)"
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  name="frequency"
                  value={medicationInput.frequency}
                  onChange={handleMedicationInputChange}
                  placeholder="Frequency (e.g., twice daily)"
                  className="form-input"
                />
                <input
                  type="text"
                  name="duration"
                  value={medicationInput.duration}
                  onChange={handleMedicationInputChange}
                  placeholder="Duration (e.g., 7 days)"
                  className="form-input"
                />
              </div>

              <button
                type="button"
                onClick={handleAddMedication}
                className="btn btn-outline-primary w-full"
              >
                Add Medication
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Upload File (optional)</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="form-input"
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
                Update Note
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="notes-management">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notes Management</h1>
        <button
          onClick={handleAddNote}
          className="btn btn-primary flex items-center"
        >
          <FaFileMedical className="mr-2" />
          Add Note
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
            placeholder="Search notes..."
            className="form-input pl-14 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={filterPatient}
            onChange={(e) => setFilterPatient(e.target.value)}
            className="form-input w-full"
          >
            <option value="all">All Patients</option>
            {patients.map(patient => (
              <option key={patient._id} value={patient._id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        renderNotesList()
      )}

      {showAddModal && renderAddNoteModal()}
      {showEditModal && renderEditNoteModal()}
    </div>
  );
};

export default NotesManagement;
