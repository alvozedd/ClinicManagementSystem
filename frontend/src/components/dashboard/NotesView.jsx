import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaDownload, FaEye, FaTags } from 'react-icons/fa';
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

        if (patientId) {
          try {
            fetchedNotes = await apiService.getNotesByPatientId(patientId);
          } catch (err) {
            console.error('Error fetching notes by patient ID:', err);
            fetchedNotes = []; // Use empty array on error
          }
        } else if (appointmentId) {
          try {
            fetchedNotes = await apiService.getNotesByAppointmentId(appointmentId);
          } catch (err) {
            console.error('Error fetching notes by appointment ID:', err);
            fetchedNotes = []; // Use empty array on error
          }
        } else {
          try {
            fetchedNotes = await apiService.getNotes();
          } catch (err) {
            console.error('Error fetching all notes:', err);
            fetchedNotes = []; // Use empty array on error
          }
        }

        // Ensure we always have an array, even if the API returns null or undefined
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                    {note.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(note.category)}`}>
                    {note.category}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
                  {note.content}
                </p>

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

                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    {note.created_by_user_id && note.created_by_user_id.name && (
                      <span>By: {note.created_by_user_id.name}</span>
                    )}
                  </div>
                  <div>{formatDate(note.createdAt)}</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex justify-end space-x-2">
                <button
                  onClick={() => handleViewNote(note)}
                  className="btn-icon btn-view"
                  title="View"
                >
                  <FaEye />
                </button>

                {note.attachments && note.attachments.length > 0 && (
                  <button
                    onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'https://clinicmanagementsystem-production-081b.up.railway.app'}/uploads/${note.attachments[0].filename}`, '_blank')}
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
          ))}
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
            <div className="mb-4 flex justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(currentNote.category)}`}>
                {currentNote.category}
              </span>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(currentNote.createdAt)}
              </div>
            </div>

            <div className="mb-6 whitespace-pre-wrap text-gray-800 dark:text-white">
              {currentNote.content}
            </div>

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

            {currentNote.attachments && currentNote.attachments.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Attachments:</h4>
                <ul className="space-y-2">
                  {currentNote.attachments.map((attachment, index) => (
                    <li key={index} className="flex items-center">
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'https://clinicmanagementsystem-production-081b.up.railway.app'}/uploads/${attachment.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        <FaDownload className="mr-2" />
                        {attachment.originalname}
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
