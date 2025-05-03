import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaUpload } from 'react-icons/fa';
import apiService from '../../utils/apiService';
import Spinner from '../common/Spinner';

const NotesForm = ({ onSubmit, onCancel, note, isEditing, patientId, appointmentId }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    title: '',
    content: '',
    diagnosis_text: '',
    treatment_plan: '',
    follow_up: '',
    medications: [],
    category: 'General',
    tags: [],
    is_private: false
  });

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);

  // Load data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        // If editing, populate form with note data
        if (isEditing && note) {
          setFormData({
            patient_id: note.patient_id?._id || note.patient_id || '',
            appointment_id: note.appointment_id ? note.appointment_id?._id || note.appointment_id : '',
            title: note.title || '',
            content: note.content || '',
            diagnosis_text: note.diagnosis_text || '',
            treatment_plan: note.treatment_plan || '',
            follow_up: note.follow_up_instructions || '',
            medications: note.medications || [],
            category: note.category || 'General',
            tags: note.tags || [],
            is_private: note.is_private || false
          });
        } else {
          // If patientId is provided, set it in the form
          if (patientId) {
            setFormData(prev => ({ ...prev, patient_id: patientId }));
          }

          // If appointmentId is provided, set it in the form
          if (appointmentId) {
            setFormData(prev => ({ ...prev, appointment_id: appointmentId }));
          }
        }

        // Fetch patients if not editing or if patientId is not provided
        if (!isEditing || !patientId) {
          try {
            const fetchedPatients = await apiService.getPatients();
            setPatients(Array.isArray(fetchedPatients) ? fetchedPatients : []);
          } catch (err) {
            console.error('Error fetching patients:', err);
            setPatients([]);
          }
        }

        // Fetch appointments for the selected patient if not editing or if appointmentId is not provided
        if ((!isEditing || !appointmentId) && (patientId || (isEditing && note && note.patient_id))) {
          try {
            const patId = patientId || (note && note.patient_id?._id) || (note && note.patient_id);
            if (patId) {
              const fetchedAppointments = await apiService.getAppointmentsByPatientId(patId);
              setAppointments(Array.isArray(fetchedAppointments) ? fetchedAppointments : []);
            }
          } catch (err) {
            console.error('Error fetching appointments:', err);
            setAppointments([]);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [isEditing, note, patientId, appointmentId]);

  // Handle patient change
  const handlePatientChange = async (e) => {
    const selectedPatientId = e.target.value;
    setFormData(prev => ({ ...prev, patient_id: selectedPatientId, appointment_id: '' }));

    // Fetch appointments for the selected patient
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      if (selectedPatientId) {
        try {
          const fetchedAppointments = await apiService.getAppointmentsByPatientId(selectedPatientId);
          setAppointments(Array.isArray(fetchedAppointments) ? fetchedAppointments : []);
        } catch (err) {
          console.error('Error fetching appointments for patient:', err);
          setAppointments([]);
        }
      } else {
        setAppointments([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error in handlePatientChange:', err);
      setError('Failed to load appointments. Please try again.');
      setAppointments([]);
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle tag input
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() !== '' && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setFileError('File size exceeds 10MB limit');
        setSelectedFile(null);
        e.target.value = null;
        return;
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        setFileError('Invalid file type. Only images, PDFs, and common document formats are allowed.');
        setSelectedFile(null);
        e.target.value = null;
        return;
      }

      setSelectedFile(file);
      setFileError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Create or update note
      let noteResponse;
      if (isEditing) {
        noteResponse = await onSubmit(formData);
      } else {
        noteResponse = await onSubmit(formData);
      }

      // If there's a file, upload it
      if (selectedFile && noteResponse) {
        const formDataObj = new FormData();
        formDataObj.append('file', selectedFile);

        // Use the note ID from the response if available, otherwise use the current note ID
        const noteId = noteResponse._id || (note && note._id);

        await apiService.uploadNoteAttachment(noteId, formDataObj);
      }

      setLoading(false);
      onCancel(); // Close the form
    } catch (err) {
      setError(err.message || 'Failed to save note');
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:text-red-300 dark:border-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Patient <span className="text-red-500">*</span>
          </label>
          <select
            name="patient_id"
            value={formData.patient_id}
            onChange={handlePatientChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            disabled={loading || patientId || isEditing}
          >
            <option value="">Select Patient</option>
            {patients.map(patient => (
              <option key={patient._id} value={patient._id}>
                {patient.name} ({patient.gender}, {new Date().getFullYear() - patient.year_of_birth} yrs)
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Appointment
          </label>
          <select
            name="appointment_id"
            value={formData.appointment_id}
            onChange={handleChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={loading || !formData.patient_id || appointmentId || isEditing}
          >
            <option value="">Select Appointment (Optional)</option>
            {appointments.map(appointment => (
              <option key={appointment._id} value={appointment._id}>
                {new Date(appointment.appointment_date).toLocaleDateString()} - {appointment.reason || 'No reason specified'}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            maxLength={200}
            placeholder="Note title"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Diagnosis/Notes <span className="text-red-500">*</span>
          </label>
          <textarea
            name="diagnosis_text"
            value={formData.diagnosis_text}
            onChange={handleChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={4}
            required
            maxLength={5000}
            placeholder="Enter diagnosis or general notes"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Treatment Plan
          </label>
          <textarea
            name="treatment_plan"
            value={formData.treatment_plan}
            onChange={handleChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={3}
            maxLength={2000}
            placeholder="Enter treatment plan details"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Follow-up Instructions
          </label>
          <textarea
            name="follow_up"
            value={formData.follow_up}
            onChange={handleChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={2}
            maxLength={1000}
            placeholder="Enter follow-up instructions"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Medications
          </label>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            {formData.medications.map((med, index) => (
              <div key={index} className="flex items-center mb-2 bg-white dark:bg-gray-700 p-2 rounded-md">
                <div className="flex-grow grid grid-cols-4 gap-2">
                  <div className="col-span-1">{med.name}</div>
                  <div className="col-span-1">{med.dosage}</div>
                  <div className="col-span-1">{med.frequency}</div>
                  <div className="col-span-1">{med.duration}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updatedMeds = [...formData.medications];
                    updatedMeds.splice(index, 1);
                    setFormData(prev => ({ ...prev, medications: updatedMeds }));
                  }}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            <div className="grid grid-cols-4 gap-2 mt-2">
              <input
                type="text"
                placeholder="Medication name"
                className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white col-span-1"
                id="med-name"
              />
              <input
                type="text"
                placeholder="Dosage (e.g., 10mg)"
                className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white col-span-1"
                id="med-dosage"
              />
              <input
                type="text"
                placeholder="Frequency (e.g., twice daily)"
                className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white col-span-1"
                id="med-frequency"
              />
              <input
                type="text"
                placeholder="Duration (e.g., 7 days)"
                className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white col-span-1"
                id="med-duration"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const name = document.getElementById('med-name').value.trim();
                const dosage = document.getElementById('med-dosage').value.trim();
                const frequency = document.getElementById('med-frequency').value.trim();
                const duration = document.getElementById('med-duration').value.trim();

                if (name) {
                  const newMed = { name, dosage, frequency, duration };
                  setFormData(prev => ({
                    ...prev,
                    medications: [...prev.medications, newMed]
                  }));

                  // Clear inputs
                  document.getElementById('med-name').value = '';
                  document.getElementById('med-dosage').value = '';
                  document.getElementById('med-frequency').value = '';
                  document.getElementById('med-duration').value = '';
                }
              }}
              className="mt-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 w-full"
            >
              Add Medication
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="General">General</option>
            <option value="Medication">Medication</option>
            <option value="Lab Result">Lab Result</option>
            <option value="Procedure">Procedure</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex">
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              className="flex-grow p-2 border rounded-l-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Add tags"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <button
              type="button"
              onClick={addTag}
              className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <FaPlus />
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm mr-2 mb-2 flex items-center dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Attachment
          </label>
          <div className="flex items-center">
            <label className="flex items-center justify-center bg-gray-100 text-gray-700 p-2 rounded-md cursor-pointer hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              <FaUpload className="mr-2" />
              <span>{selectedFile ? selectedFile.name : 'Choose File'}</span>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {selectedFile && (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <FaTimes />
              </button>
            )}
          </div>
          {fileError && (
            <p className="text-red-500 text-sm mt-1 dark:text-red-400">{fileError}</p>
          )}
          <p className="text-gray-500 text-xs mt-1 dark:text-gray-400">
            Max file size: 10MB. Allowed formats: Images, PDF, DOC, DOCX, XLS, XLSX, TXT
          </p>
        </div>

        <div className="mb-4">
          <label className="flex items-center text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="is_private"
              checked={formData.is_private}
              onChange={handleChange}
              className="mr-2"
            />
            Private note (only visible to doctors)
          </label>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : isEditing ? 'Update Note' : 'Save Note'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotesForm;
