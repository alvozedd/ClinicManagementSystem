import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaDownload, FaEye, FaTags, FaNotesMedical, FaPrescriptionBottleAlt, FaCalendarCheck, FaFilePdf, FaFileMedical } from 'react-icons/fa';
import apiService from '../../utils/apiService';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';
import NotesForm from './NotesForm';
import { formatDate } from '../../utils/formatters';
import './DashboardStyles.css';

const NotesView = ({ patientId, appointmentId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const { userInfo } = useSelector((state) => state.auth || {});
  // Default role to empty string if userInfo is null
  const userRole = userInfo?.role || '';

  // Fetch notes when component mounts or when patientId/appointmentId changes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        let fetchedNotes = [];
        let diagnosesFound = false;

        if (patientId) {
          console.log('Fetching notes for patient ID:', patientId);
          try {
            // First try to get diagnoses (which contain more detailed information)
            const diagnoses = await apiService.getDiagnosesByPatientId(patientId);
            console.log('Fetched diagnoses by patient ID:', diagnoses);

            // Check if we got valid diagnoses
            if (diagnoses && Array.isArray(diagnoses) && diagnoses.length > 0) {
              fetchedNotes = diagnoses;
              diagnosesFound = true;
              console.log('Using diagnoses for patient:', patientId, 'Count:', diagnoses.length);
            } else {
              console.log('No diagnoses found for patient:', patientId);
            }

            // If no diagnoses found, fall back to regular notes
            if (!diagnosesFound) {
              console.log('Falling back to regular notes for patient:', patientId);
              const notes = await apiService.getNotesByPatientId(patientId);
              console.log('Fetched notes by patient ID:', notes);

              if (notes && Array.isArray(notes) && notes.length > 0) {
                fetchedNotes = notes;
                console.log('Using regular notes for patient:', patientId, 'Count:', notes.length);
              } else {
                console.log('No regular notes found for patient:', patientId);
              }
            }
          } catch (err) {
            console.error('Error fetching notes by patient ID:', err);
            // Continue with empty array
          }
        } else if (appointmentId) {
          console.log('Fetching notes for appointment ID:', appointmentId);
          try {
            // First try to get diagnoses
            const diagnoses = await apiService.getDiagnosisByAppointmentId(appointmentId);
            console.log('Fetched diagnoses by appointment ID:', diagnoses);

            // Check if we got valid diagnoses
            if (diagnoses && Array.isArray(diagnoses) && diagnoses.length > 0) {
              fetchedNotes = diagnoses;
              diagnosesFound = true;
              console.log('Using diagnoses for appointment:', appointmentId, 'Count:', diagnoses.length);
            } else {
              console.log('No diagnoses found for appointment:', appointmentId);
            }

            // If no diagnoses found, fall back to regular notes
            if (!diagnosesFound) {
              console.log('Falling back to regular notes for appointment:', appointmentId);
              const notes = await apiService.getNotesByAppointmentId(appointmentId);
              console.log('Fetched notes by appointment ID:', notes);

              if (notes && Array.isArray(notes) && notes.length > 0) {
                fetchedNotes = notes;
                console.log('Using regular notes for appointment:', appointmentId, 'Count:', notes.length);
              } else {
                console.log('No regular notes found for appointment:', appointmentId);
              }
            }
          } catch (err) {
            console.error('Error fetching notes by appointment ID:', err);
            // Continue with empty array
          }
        } else {
          try {
            const allNotes = await apiService.getNotes();
            console.log('Fetched all notes:', allNotes);
            if (allNotes && Array.isArray(allNotes)) {
              fetchedNotes = allNotes;
            }
          } catch (err) {
            console.error('Error fetching all notes:', err);
            // Continue with empty array
          }
        }

        // Ensure we always have an array, even if the API returns null or undefined
        console.log('Final notes to display:', fetchedNotes ? fetchedNotes.length : 0);
        setNotes(Array.isArray(fetchedNotes) ? fetchedNotes : []);
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchNotes:', err);
        setError('Failed to fetch notes. Please try again later.');
        setNotes([]); // Set empty array on error
        setLoading(false);
      }
    };

    fetchNotes();
  }, [patientId, appointmentId]);

  // Filter notes based on search term and category
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory = filterCategory === '' || note.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle adding a new note
  const handleAddNote = () => {
    setShowAddModal(true);
  };

  // Handle editing a note
  const handleEditNote = (note) => {
    setCurrentNote(note);
    setShowEditModal(true);
  };

  // Handle viewing a note
  const handleViewNote = (note) => {
    setCurrentNote(note);
    setShowViewModal(true);
  };

  // Handle deleting a note
  const handleDeleteNote = (note) => {
    setCurrentNote(note);
    setShowDeleteModal(true);
  };

  // Submit add note form
  const submitAddNote = async (noteData) => {
    try {
      setLoading(true);
      await apiService.createNote(noteData);

      // Refresh notes list
      let fetchedNotes;
      if (patientId) {
        fetchedNotes = await apiService.getNotesByPatientId(patientId);
      } else if (appointmentId) {
        fetchedNotes = await apiService.getNotesByAppointmentId(appointmentId);
      } else {
        fetchedNotes = await apiService.getNotes();
      }

      setNotes(fetchedNotes);
      setShowAddModal(false);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to add note');
      setLoading(false);
    }
  };

  // Submit edit note form
  const submitEditNote = async (noteData) => {
    try {
      setLoading(true);
      await apiService.updateNote(currentNote._id, noteData);

      // Refresh notes list
      let fetchedNotes;
      if (patientId) {
        fetchedNotes = await apiService.getNotesByPatientId(patientId);
      } else if (appointmentId) {
        fetchedNotes = await apiService.getNotesByAppointmentId(appointmentId);
      } else {
        fetchedNotes = await apiService.getNotes();
      }

      setNotes(fetchedNotes);
      setShowEditModal(false);
      setCurrentNote(null);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to update note');
      setLoading(false);
    }
  };

  // Confirm delete note
  const confirmDeleteNote = async () => {
    try {
      setLoading(true);
      await apiService.deleteNote(currentNote._id);

      // Refresh notes list
      let fetchedNotes;
      if (patientId) {
        fetchedNotes = await apiService.getNotesByPatientId(patientId);
      } else if (appointmentId) {
        fetchedNotes = await apiService.getNotesByAppointmentId(appointmentId);
      } else {
        fetchedNotes = await apiService.getNotes();
      }

      setNotes(fetchedNotes);
      setShowDeleteModal(false);
      setCurrentNote(null);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to delete note');
      setLoading(false);
    }
  };

  // Get category badge color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'General':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Medication':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Lab Result':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Procedure':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Follow-up':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="notes-view">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Notes</h1>
        {userRole === 'doctor' && (
          <button
            onClick={handleAddNote}
            className="btn btn-primary flex items-center dark:bg-blue-700 dark:hover:bg-blue-600"
            title="Add Note"
          >
            <FaPlus className="sm:mr-2" />
            <span className="hidden sm:inline">Add Note</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:text-red-300 dark:border-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            className="pl-10 pr-4 py-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaFilter className="text-gray-400" />
          </div>
          <select
            className="pl-10 pr-4 py-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="General">General</option>
            <option value="Medication">Medication</option>
            <option value="Lab Result">Lab Result</option>
            <option value="Procedure">Procedure</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No notes found.</p>
          {searchTerm || filterCategory ? (
            <button
              className="text-blue-500 hover:underline mt-2"
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
              }}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredNotes.map((note) => {
            // Check if this is a diagnosis note (has diagnosis_text field)
            const isDiagnosis = note.diagnosis_text !== undefined;
            // Get the title - either from the note title or create one from the appointment
            const noteTitle = note.title ||
              (note.appointment_id ?
                `${note.appointment_id.type || 'Consultation'} - ${new Date(note.appointment_id.appointment_date).toLocaleDateString()}` :
                'Note');

            return (
              <div
                key={note._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {noteTitle}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(note.category || 'General')}`}>
                      {note.category || 'Consultation'}
                    </span>
                  </div>

                  {/* Enhanced note content display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Diagnosis/Notes Section */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center mb-2 text-blue-600 dark:text-blue-400">
                        <FaNotesMedical className="mr-2" />
                        <h4 className="font-medium">Diagnosis/Notes</h4>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">
                        {isDiagnosis ? note.diagnosis_text : note.content}
                      </p>
                    </div>

                    {/* Treatment Plan Section - Always show */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center mb-2 text-green-600 dark:text-green-400">
                        <FaPrescriptionBottleAlt className="mr-2" />
                        <h4 className="font-medium">Treatment Plan</h4>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">
                        {isDiagnosis && note.treatment_plan ? note.treatment_plan : 'No treatment plan specified'}
                      </p>
                    </div>

                    {/* Follow-up Section - Always show */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center mb-2 text-purple-600 dark:text-purple-400">
                        <FaCalendarCheck className="mr-2" />
                        <h4 className="font-medium">Follow-up</h4>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">
                        {isDiagnosis && note.follow_up_instructions ? note.follow_up_instructions : 'No follow-up instructions specified'}
                      </p>
                    </div>

                    {/* Medications Section - Always show */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center mb-2 text-yellow-600 dark:text-yellow-400">
                        <FaPrescriptionBottleAlt className="mr-2" />
                        <h4 className="font-medium">Medications</h4>
                      </div>
                      {isDiagnosis && note.medications && note.medications.length > 0 ? (
                        <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 text-sm">
                          {note.medications.map((med, idx) => (
                            <li key={idx}>
                              <strong>{med.name}</strong>
                              {med.dosage && ` - ${med.dosage}`}
                              {med.frequency && `, ${med.frequency}`}
                              {med.duration && `, ${med.duration}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 text-sm">No medications prescribed</p>
                      )}
                    </div>

                    {/* Files/Attachments Section - Only show if it exists */}
                    {((note.attachments && note.attachments.length > 0) || (note.files && note.files.length > 0)) && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center mb-2 text-red-600 dark:text-red-400">
                          <FaFilePdf className="mr-2" />
                          <h4 className="font-medium">Files</h4>
                        </div>
                        <ul className="text-gray-700 dark:text-gray-300 text-sm">
                          {note.attachments && note.attachments.map((attachment, idx) => (
                            <li key={`attachment-${idx}`} className="mb-1">
                              <a
                                href={`${import.meta.env.VITE_API_URL || 'https://clinicmanagementsystem-production-081b.up.railway.app'}/uploads/${attachment.filename}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline flex items-center"
                              >
                                <FaFileMedical className="mr-1" />
                                {attachment.originalname || 'Document'}
                              </a>
                            </li>
                          ))}
                          {note.files && note.files.map((file, idx) => (
                            <li key={`file-${idx}`} className="mb-1">
                              <a
                                href={file.url || `${import.meta.env.VITE_API_URL || 'https://clinicmanagementsystem-production-081b.up.railway.app'}/uploads/${file.filename}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline flex items-center"
                              >
                                <FaFileMedical className="mr-1" />
                                {file.name || file.originalname || 'Document'}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Tags Section */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center mb-3 flex-wrap">
                      <FaTags className="text-gray-400 mr-2" />
                      {note.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full mr-1 mb-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Note metadata */}
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      {note.created_by_user_id && note.created_by_user_id.name ? (
                        <span>By: {note.created_by_user_id.name}</span>
                      ) : (
                        <span>By: {note.created_by || 'Doctor'}</span>
                      )}
                    </div>
                    <div>{formatDate(note.createdAt || note.created_at)}</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex justify-end space-x-2">
                  <button
                    onClick={() => handleViewNote(note)}
                    className="btn-icon btn-view"
                    title="View Full Details"
                  >
                    <FaEye />
                  </button>

                  {((note.attachments && note.attachments.length > 0) || (note.files && note.files.length > 0)) && (
                    <button
                      onClick={() => {
                        const fileUrl = note.attachments && note.attachments.length > 0 ?
                          `${import.meta.env.VITE_API_URL || 'https://clinicmanagementsystem-production-081b.up.railway.app'}/uploads/${note.attachments[0].filename}` :
                          note.files[0].url || `${import.meta.env.VITE_API_URL || 'https://clinicmanagementsystem-production-081b.up.railway.app'}/uploads/${note.files[0].filename}`;
                        window.open(fileUrl, '_blank');
                      }}
                      className="btn-icon btn-download"
                      title="Download Attachment"
                    >
                      <FaDownload />
                    </button>
                  )}

                  {userRole === 'doctor' && (
                    <>
                      <button
                        onClick={() => handleEditNote(note)}
                        className="btn-icon btn-edit"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note)}
                        className="btn-icon btn-delete"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Note Modal */}
      {showAddModal && (
        <Modal
          title="Add Note"
          onClose={() => setShowAddModal(false)}
          size="lg"
        >
          <NotesForm
            onSubmit={submitAddNote}
            onCancel={() => setShowAddModal(false)}
            patientId={patientId}
            appointmentId={appointmentId}
          />
        </Modal>
      )}

      {/* Edit Note Modal */}
      {showEditModal && currentNote && (
        <Modal
          title="Edit Note"
          onClose={() => {
            setShowEditModal(false);
            setCurrentNote(null);
          }}
          size="lg"
        >
          <NotesForm
            onSubmit={submitEditNote}
            onCancel={() => {
              setShowEditModal(false);
              setCurrentNote(null);
            }}
            note={currentNote}
            isEditing={true}
          />
        </Modal>
      )}

      {/* View Note Modal */}
      {showViewModal && currentNote && (
        <Modal
          title={currentNote.title}
          onClose={() => {
            setShowViewModal(false);
            setCurrentNote(null);
          }}
          size="lg"
        >
          <div className="p-4">
            {/* Header with category and date */}
            <div className="mb-4 flex justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(currentNote.category || 'General')}`}>
                {currentNote.category || 'Consultation'}
              </span>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(currentNote.createdAt || currentNote.created_at)}
              </div>
            </div>

            {/* Enhanced note content display */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {/* Diagnosis/Notes Section */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center mb-3 text-blue-600 dark:text-blue-400">
                  <FaNotesMedical className="mr-2" />
                  <h4 className="font-medium">Diagnosis/Notes</h4>
                </div>
                <div className="whitespace-pre-wrap text-gray-800 dark:text-white">
                  {currentNote.diagnosis_text || currentNote.content || 'No diagnosis provided'}
                </div>
              </div>

              {/* Treatment Plan Section - Always show */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center mb-3 text-green-600 dark:text-green-400">
                  <FaPrescriptionBottleAlt className="mr-2" />
                  <h4 className="font-medium">Treatment Plan</h4>
                </div>
                <div className="whitespace-pre-wrap text-gray-800 dark:text-white">
                  {currentNote.treatment_plan || 'No treatment plan specified'}
                </div>
              </div>

              {/* Follow-up Section - Always show */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center mb-3 text-purple-600 dark:text-purple-400">
                  <FaCalendarCheck className="mr-2" />
                  <h4 className="font-medium">Follow-up</h4>
                </div>
                <div className="whitespace-pre-wrap text-gray-800 dark:text-white">
                  {currentNote.follow_up_instructions || 'No follow-up instructions specified'}
                </div>
              </div>

              {/* Medications Section - Always show */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center mb-3 text-yellow-600 dark:text-yellow-400">
                  <FaPrescriptionBottleAlt className="mr-2" />
                  <h4 className="font-medium">Medications</h4>
                </div>
                {currentNote.medications && currentNote.medications.length > 0 ? (
                  <ul className="list-disc pl-5 text-gray-800 dark:text-white">
                    {currentNote.medications.map((med, idx) => (
                      <li key={idx} className="mb-2">
                        <strong>{med.name}</strong>
                        <div className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                          {med.dosage && <div>Dosage: {med.dosage}</div>}
                          {med.frequency && <div>Frequency: {med.frequency}</div>}
                          {med.duration && <div>Duration: {med.duration}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-800 dark:text-white">No medications prescribed</p>
                )}
              </div>
            </div>

            {/* Tags Section */}
            {currentNote.tags && currentNote.tags.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tags:</h4>
                <div className="flex flex-wrap">
                  {currentNote.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full mr-1 mb-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Files Section - Combine attachments and files */}
            {((currentNote.attachments && currentNote.attachments.length > 0) || (currentNote.files && currentNote.files.length > 0)) && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Files:</h4>
                <ul className="space-y-2">
                  {currentNote.attachments && currentNote.attachments.map((attachment, index) => (
                    <li key={`attachment-${index}`} className="flex items-center">
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'https://clinicmanagementsystem-production-081b.up.railway.app'}/uploads/${attachment.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        <FaFileMedical className="mr-2" />
                        {attachment.originalname || 'Document'}
                      </a>
                    </li>
                  ))}
                  {currentNote.files && currentNote.files.map((file, index) => (
                    <li key={`file-${index}`} className="flex items-center">
                      <a
                        href={file.url || `${import.meta.env.VITE_API_URL || 'https://clinicmanagementsystem-production-081b.up.railway.app'}/uploads/${file.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        <FaFileMedical className="mr-2" />
                        {file.name || file.originalname || 'Document'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentNote.created_by_user_id && currentNote.created_by_user_id.name && (
                <div>Created by: {currentNote.created_by_user_id.name}</div>
              )}
              {currentNote.is_private && (
                <div className="mt-1 text-yellow-600 dark:text-yellow-400">
                  This note is private and only visible to doctors
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setCurrentNote(null);
                }}
                className="btn btn-secondary"
              >
                Close
              </button>

              {userRole === 'doctor' && (
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditNote(currentNote);
                  }}
                  className="btn btn-primary"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Note Confirmation Modal */}
      {showDeleteModal && currentNote && (
        <Modal
          title="Delete Note"
          onClose={() => {
            setShowDeleteModal(false);
            setCurrentNote(null);
          }}
          size="sm"
        >
          <div className="p-4">
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCurrentNote(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteNote}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NotesView;
