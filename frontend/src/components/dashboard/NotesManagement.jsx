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
  const [filterAppointment, setFilterAppointment] = useState('all');
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
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchNotes(),
        fetchAppointments(),
        fetchPatients()
      ]);
      setLoading(false);

      // Check if there's a selected appointment from the appointments page
      const selectedAppointmentId = sessionStorage.getItem('selectedAppointmentForNote');
      if (selectedAppointmentId) {
        // Clear the session storage to prevent it from persisting across page refreshes
        sessionStorage.removeItem('selectedAppointmentForNote');

        // Open the Add Note form with the selected appointment
        handleAddNoteForAppointment(selectedAppointmentId);
      }
    };

    fetchData();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await apiService.getDiagnoses();
      setNotes(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes. Please try again.');
      return [];
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await apiService.getAppointments();

      if (!data || data.length === 0) {
        console.log('No appointments found');
        setError('No appointments found. Please create an appointment first.');
        setAppointments([]);
        return [];
      }

      // Get all appointments but mark which ones are eligible for notes
      // We'll filter in the UI but keep all appointments available
      const appointmentsWithEligibility = data.map(appointment => ({
        ...appointment,
        isEligibleForNotes: appointment.status === 'Completed' || appointment.status === 'In-progress'
      }));

      setAppointments(appointmentsWithEligibility);
      setError(null); // Clear any previous errors
      return appointmentsWithEligibility;
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
      setAppointments([]);
      return [];
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await apiService.getPatients();
      setPatients(data);
      return data;
    } catch (err) {
      console.error('Error fetching patients:', err);
      return [];
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
    // Check if there are any appointments available
    if (!appointments || appointments.length === 0) {
      setError('No appointments available. Please create an appointment first before adding a note.');
      return;
    }

    // Check if there are any appointments eligible for notes
    const eligibleAppointments = appointments.filter(app => app.isEligibleForNotes);
    if (eligibleAppointments.length === 0) {
      setError('No completed or in-progress appointments found. Please complete an appointment before adding a note.');
    }

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

  const handleAddNoteForAppointment = async (appointmentId) => {
    // Find the appointment in the appointments array
    let appointment = appointments.find(app => app._id === appointmentId);

    // If appointment not found in the current list, try to fetch it directly
    if (!appointment) {
      try {
        // Refresh appointments list to make sure we have the latest data
        const refreshedAppointments = await fetchAppointments();
        appointment = refreshedAppointments.find(app => app._id === appointmentId);
      } catch (err) {
        console.error('Error refreshing appointments:', err);
      }
    }

    if (!appointment) {
      setError('Appointment not found. It may have been deleted or is no longer available.');
      return;
    }

    // Check if the appointment is eligible for notes
    if (appointment.status !== 'Completed' && appointment.status !== 'In-progress') {
      setError(`This appointment cannot have notes added because its status is "${appointment.status}". Only completed or in-progress appointments can have notes.`);
      return;
    }

    // Appointment exists and is eligible for notes
    setFormData({
      appointment_id: appointmentId,
      diagnosis_text: '',
      treatment_plan: '',
      follow_up: '',
      medications: []
    });
    setSelectedFile(null);
    setShowAddModal(true);
    // Clear any previous error
    setError(null);
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
      // Create note data with all fields
      const noteData = {
        appointment_id: formData.appointment_id,
        diagnosis_text: formData.diagnosis_text,
        treatment_plan: formData.treatment_plan,
        follow_up_instructions: formData.follow_up,
        medications: formData.medications
      };

      console.log('Submitting note with data:', noteData);

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
      // Create note data with all fields
      const noteData = {
        appointment_id: formData.appointment_id,
        diagnosis_text: formData.diagnosis_text,
        treatment_plan: formData.treatment_plan,
        follow_up_instructions: formData.follow_up,
        medications: formData.medications
      };

      console.log('Updating note with data:', noteData);

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

  // Filter notes based on search term, patient filter, and appointment filter
  const filteredNotes = notes.filter(note => {
    const patientName = note.appointment_id && note.appointment_id.patient_id &&
      typeof note.appointment_id.patient_id === 'object'
        ? note.appointment_id.patient_id.name
        : '';

    // Get appointment date if available
    const appointmentDate = note.appointment_id && note.appointment_id.appointment_date
      ? new Date(note.appointment_id.appointment_date).toLocaleDateString()
      : '';

    // Check if the search term matches patient name, diagnosis text, or appointment date
    const matchesSearch =
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.diagnosis_text && note.diagnosis_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
      appointmentDate.toLowerCase().includes(searchTerm.toLowerCase());

    // Check if the note matches the selected patient filter
    const matchesPatient = filterPatient === 'all' ||
      (note.appointment_id && note.appointment_id.patient_id &&
       note.appointment_id.patient_id._id === filterPatient);

    // Check if the note matches the selected appointment filter
    const matchesAppointment = filterAppointment === 'all' ||
      (note.appointment_id && note.appointment_id._id === filterAppointment);

    return matchesSearch && matchesPatient && matchesAppointment;
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
    // No notes found
    if (sortedNotes.length === 0) {
      // If there are no appointments at all
      if (!appointments || appointments.length === 0) {
        return (
          <div className="text-center py-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-2">No Appointments Available</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Before you can add notes, you need to create and complete an appointment.
            </p>
            <div className="flex flex-col space-y-3 max-w-md mx-auto text-left bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-blue-100 dark:border-blue-800">
              <p className="font-medium text-gray-800 dark:text-gray-200">Steps to add notes:</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>Go to the <span className="font-medium">Appointments</span> tab</li>
                <li>Create a new appointment or select an existing one</li>
                <li>Change the appointment status to <span className="font-medium">Completed</span></li>
                <li>Return to the <span className="font-medium">Notes</span> tab</li>
                <li>Click <span className="font-medium">Add Note</span> to create a note for the completed appointment</li>
              </ol>
            </div>
          </div>
        );
      }

      // If there are appointments but no eligible ones
      const eligibleAppointments = appointments.filter(app => app.isEligibleForNotes);
      if (eligibleAppointments.length === 0) {
        return (
          <div className="text-center py-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-300 mb-2">No Eligible Appointments</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You have {appointments.length} appointment(s), but none are eligible for notes yet.
            </p>
            <div className="flex flex-col space-y-3 max-w-md mx-auto text-left bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-yellow-100 dark:border-yellow-800">
              <p className="font-medium text-gray-800 dark:text-gray-200">To make an appointment eligible for notes:</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>Go to the <span className="font-medium">Appointments</span> tab</li>
                <li>Find the appointment you want to add notes for</li>
                <li>Change its status to <span className="font-medium">Completed</span> or <span className="font-medium">In-progress</span></li>
                <li>Return to this tab to add notes</li>
              </ol>
            </div>
          </div>
        );
      }

      // If there are eligible appointments but no notes yet
      return (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Notes Found</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You have {eligibleAppointments.length} appointment(s) eligible for notes.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Click the "Add Note" button above to create your first note.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedNotes.map(note => (
          <div key={note._id} className="dashboard-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {note.appointment_id && getPatientName(note.appointment_id)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-200">{formatDate(note.createdAt)}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditNote(note)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteNote(note._id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-600 dark:text-white line-clamp-3">
                {note.diagnosis_text}
              </p>
            </div>
            {note.diagnosis && note.diagnosis.medications && note.diagnosis.medications.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-700 dark:text-white">Medications:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {note.diagnosis.medications.map((med, index) => (
                    <span key={index} className="badge badge-blue text-xs dark:bg-blue-700 dark:text-white">
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

  // State for appointment search in modal
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState('');

  // Filter appointments based on search term
  const getFilteredAppointments = () => {
    if (!appointmentSearchTerm) return appointments;

    return appointments.filter(appointment => {
      const patientName = getPatientName(appointment).toLowerCase();
      const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString().toLowerCase();
      const searchLower = appointmentSearchTerm.toLowerCase();

      return patientName.includes(searchLower) || appointmentDate.includes(searchLower);
    });
  };

  // Add Note Modal
  const renderAddNoteModal = () => {
    const filteredAppointments = getFilteredAppointments();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Note</h2>

          <form onSubmit={submitAddNote}>
            <div className="form-group">
              <label className="form-label dark:text-gray-200">Appointment*</label>

              {/* Appointment search input */}
              <div className="search-input-container mb-2">
                <input
                  type="text"
                  placeholder="Search appointments by patient name or date..."
                  value={appointmentSearchTerm}
                  onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                  className="form-input"
                />
                <span className="search-icon">
                  <FaSearch />
                </span>
              </div>

              <select
                name="appointment_id"
                value={formData.appointment_id}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Select Appointment</option>
                {filteredAppointments.map(appointment => (
                  <option
                    key={appointment._id}
                    value={appointment._id}
                    disabled={!appointment.isEligibleForNotes}
                    className={!appointment.isEligibleForNotes ? 'text-gray-400' : ''}
                  >
                    {getPatientName(appointment)} - {new Date(appointment.appointment_date).toLocaleDateString()}
                    {!appointment.isEligibleForNotes ? ' (Not eligible - ' + appointment.status + ')' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label dark:text-gray-200">Diagnosis*</label>
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
              <label className="form-label dark:text-gray-200">Treatment Plan</label>
              <textarea
                name="treatment_plan"
                value={formData.treatment_plan}
                onChange={handleInputChange}
                className="form-input"
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label dark:text-gray-200">Follow-up Instructions</label>
              <textarea
                name="follow_up"
                value={formData.follow_up}
                onChange={handleInputChange}
                className="form-input"
                rows="2"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label dark:text-gray-200">Medications</label>

              <div className="mb-2">
                {formData.medications.map((med, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded mb-1">
                    <div>
                      <span className="font-medium dark:text-white">{med.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300"> - {med.dosage}, {med.frequency}</span>
                      {med.duration && <span className="text-sm text-gray-600 dark:text-gray-300"> for {med.duration}</span>}
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
              <label className="form-label dark:text-gray-200">Upload File (optional)</label>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Note</h2>

          <form onSubmit={submitEditNote}>
            <div className="form-group">
              <label className="form-label dark:text-gray-200">Appointment*</label>
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
              <label className="form-label dark:text-gray-200">Diagnosis*</label>
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
              <label className="form-label dark:text-gray-200">Treatment Plan</label>
              <textarea
                name="treatment_plan"
                value={formData.treatment_plan}
                onChange={handleInputChange}
                className="form-input"
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label dark:text-gray-200">Follow-up Instructions</label>
              <textarea
                name="follow_up"
                value={formData.follow_up}
                onChange={handleInputChange}
                className="form-input"
                rows="2"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label dark:text-gray-200">Medications</label>

              <div className="mb-2">
                {formData.medications.map((med, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded mb-1">
                    <div>
                      <span className="font-medium dark:text-white">{med.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300"> - {med.dosage}, {med.frequency}</span>
                      {med.duration && <span className="text-sm text-gray-600 dark:text-gray-300"> for {med.duration}</span>}
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
              <label className="form-label dark:text-gray-200">Upload File (optional)</label>
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Notes Management</h1>
        <button
          onClick={handleAddNote}
          className="btn btn-primary flex items-center dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          <FaFileMedical className="mr-2" />
          Add Note
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="font-medium dark:text-red-300">{error}</p>
            {error.includes('No appointments') && (
              <p className="text-sm mt-1 dark:text-red-200">
                Go to the Appointments tab to create an appointment first, then mark it as completed before adding notes.
              </p>
            )}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="search-input-container w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search notes..."
              className="form-input w-full dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="search-icon dark:text-gray-400" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={filterPatient}
              onChange={(e) => setFilterPatient(e.target.value)}
              className="form-input w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
