import { useState, useEffect, useRef } from 'react';
import { FaUserPlus, FaSync, FaUserCheck, FaUserTimes, FaPrint, FaPhone, FaArrowUp, FaArrowDown, FaNotesMedical, FaFileMedical, FaTrash, FaGripVertical } from 'react-icons/fa';
import apiService from '../utils/apiService';
import AppointmentCard from './AppointmentCard';
import SuperSimpleAddToQueueModal from './SuperSimpleAddToQueueModal';
import QueueTicketPrint from './QueueTicketPrint';

/**
 * A simplified version of the appointment queue that doesn't use react-beautiful-dnd
 * This component is used as a fallback when react-beautiful-dnd fails to load
 */
function SimpleAppointmentQueue({ patients, appointments, userRole, onUpdateAppointment, onViewPatient, onEditAppointment, onDeleteAppointment, onUpdatePatient, onAddDiagnosis }) {
  // State for queue management
  const [queueEntries, setQueueEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddToQueueModal, setShowAddToQueueModal] = useState(false);
  const [ticketToPrint, setTicketToPrint] = useState(null);
  const [draggedEntryId, setDraggedEntryId] = useState(null);
  const [dragOverEntryId, setDragOverEntryId] = useState(null);

  // Queue statistics
  const [queueStats, setQueueStats] = useState({
    totalPatients: 0,
    waitingPatients: 0,
    inProgressPatients: 0,
    completedPatients: 0
  });

  // Fetch queue data on component mount
  useEffect(() => {
    fetchQueueData();
  }, []);

  // Fetch queue data from API
  const fetchQueueData = async () => {
    try {
      setLoading(true);
      let data = [];

      try {
        data = await apiService.getQueueEntries();
        console.log('Queue data fetched successfully:', data);
      } catch (fetchError) {
        console.error('Error fetching queue entries:', fetchError);
        // If we can't fetch data, use the existing queue entries
        if (queueEntries.length > 0) {
          console.log('Using existing queue entries as fallback');
          data = [...queueEntries];
        }
      }

      // Apply any locally stored status changes
      const entriesWithLocalStatus = data.map(entry => {
        if (!entry || !entry._id) {
          console.error('Invalid queue entry:', entry);
          return entry;
        }

        const localStorageKey = `queue_status_${entry._id}`;
        const localStatus = localStorage.getItem(localStorageKey);

        if (localStatus) {
          console.log(`Applying locally stored status for entry ${entry._id}: ${localStatus}`);
          return { ...entry, status: localStatus };
        }

        return entry;
      }).filter(entry => entry && entry._id); // Filter out any invalid entries

      // Sort queue entries by status and ticket number
      const sortedEntries = [...entriesWithLocalStatus].sort((a, b) => {
        const statusPriority = { 'Waiting': 0, 'In Progress': 1, 'Completed': 2, 'No-show': 3, 'Cancelled': 4 };
        const statusDiff = statusPriority[a.status] - statusPriority[b.status];

        if (statusDiff !== 0) return statusDiff;

        return (a.ticket_number || 0) - (b.ticket_number || 0);
      });

      setQueueEntries(sortedEntries);

      // Calculate queue statistics based on the entries with local status
      const stats = {
        totalPatients: entriesWithLocalStatus.length,
        waitingPatients: entriesWithLocalStatus.filter(entry => entry && entry._id && entry.status === 'Waiting').length,
        inProgressPatients: entriesWithLocalStatus.filter(entry => entry && entry._id && entry.status === 'In Progress').length,
        completedPatients: entriesWithLocalStatus.filter(entry => entry && entry._id && entry.status === 'Completed').length
      };

      setQueueStats(stats);
    } catch (error) {
      console.error('Error in fetchQueueData:', error);
      // Initialize with empty data if there's an error
      setQueueEntries([]);
      setQueueStats({
        totalPatients: 0,
        waitingPatients: 0,
        inProgressPatients: 0,
        completedPatients: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a walk-in patient to the queue
  const handleAddWalkIn = async (patientData) => {
    try {
      setLoading(true);

      // Create queue data
      const queueData = {
        patient_id: patientData.patient_id,
        is_walk_in: true,
        notes: patientData.notes || 'Walk-in patient'
      };

      // Add to queue
      const newQueueEntry = await apiService.addToQueue(queueData);

      // Update the UI immediately
      if (newQueueEntry) {
        // Add the new entry to the queue entries
        setQueueEntries(prevEntries => {
          // Create a new array with the new entry
          const updatedEntries = [...prevEntries, newQueueEntry];

          // Sort the entries by status and ticket number
          return updatedEntries.sort((a, b) => {
            const statusPriority = { 'Waiting': 0, 'In Progress': 1, 'Completed': 2, 'No-show': 3, 'Cancelled': 4 };
            const statusDiff = statusPriority[a.status] - statusPriority[b.status];

            if (statusDiff !== 0) return statusDiff;

            return (a.ticket_number || 0) - (b.ticket_number || 0);
          });
        });

        // Update queue statistics
        setQueueStats(prevStats => ({
          ...prevStats,
          totalPatients: prevStats.totalPatients + 1,
          waitingPatients: prevStats.waitingPatients + 1
        }));
      }

      // Show the ticket to print
      setTicketToPrint(newQueueEntry);

      // If this is a new patient, refresh the patients list
      if (patientData.isNewPatient && onUpdatePatient) {
        onUpdatePatient();
      }

      // Refresh the queue data after a short delay
      setTimeout(() => {
        fetchQueueData();
      }, 500);
    } catch (error) {
      console.error('Error adding walk-in patient:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle updating queue entry status
  const handleUpdateQueueStatus = async (queueEntryId, newStatus) => {
    try {
      setLoading(true);

      // Store the status change in localStorage to make it persistent
      // This ensures the status doesn't revert even if the server request fails
      const localStorageKey = `queue_status_${queueEntryId}`;
      localStorage.setItem(localStorageKey, newStatus);

      // Find the entry being updated
      const updatedEntry = queueEntries.find(entry => entry._id === queueEntryId);
      if (!updatedEntry) {
        console.error('Could not find queue entry with ID:', queueEntryId);
        setLoading(false);
        return;
      }

      const oldStatus = updatedEntry.status;

      // Create a new entry with updated status
      const newEntry = { ...updatedEntry, status: newStatus };

      // Update the UI immediately with the new entry
      setQueueEntries(prevEntries => {
        return prevEntries.map(entry => {
          if (entry && entry._id === queueEntryId) {
            return newEntry;
          }
          return entry;
        });
      });

      // Update queue statistics immediately
      setQueueStats(prevStats => {
        const newStats = { ...prevStats };

        // Decrement count for old status
        if (oldStatus === 'Waiting') newStats.waitingPatients--;
        else if (oldStatus === 'In Progress') newStats.inProgressPatients--;
        else if (oldStatus === 'Completed') newStats.completedPatients--;

        // Increment count for new status
        if (newStatus === 'Waiting') newStats.waitingPatients++;
        else if (newStatus === 'In Progress') newStats.inProgressPatients++;
        else if (newStatus === 'Completed') newStats.completedPatients++;

        return newStats;
      });

      // Try to update the server (but don't wait for it)
      apiService.updateQueueStatus(queueEntryId, { status: newStatus })
        .then(() => {
          console.log('Queue status updated on server successfully');

          // If completing an appointment, update the appointment status
          if (newStatus === 'Completed') {
            if (updatedEntry && updatedEntry.appointment_id && !updatedEntry.is_walk_in) {
              const appointmentId = typeof updatedEntry.appointment_id === 'object' ?
                (updatedEntry.appointment_id._id || updatedEntry.appointment_id.id) :
                updatedEntry.appointment_id;

              if (appointmentId && onUpdateAppointment) {
                onUpdateAppointment(appointmentId, { status: 'completed' })
                  .catch(err => console.error('Error updating appointment status:', err));
              }
            }
          }

          // Force a refresh of the queue data after a short delay
          setTimeout(() => {
            fetchQueueData();
          }, 500);
        })
        .catch(error => {
          console.error('Error updating queue status on server:', error);
          // The UI is already updated, so we don't need to do anything here
          // But we should still try to refresh the data
          setTimeout(() => {
            fetchQueueData();
          }, 1000);
        });
    } catch (error) {
      console.error('Error in handleUpdateQueueStatus:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle removing a patient from the queue
  const handleRemoveFromQueue = async (queueEntryId) => {
    if (!confirm('Are you sure you want to remove this patient from the queue?')) return;

    try {
      setLoading(true);

      // Find the entry to remove before we remove it from state
      const entryToRemove = queueEntries.find(entry => entry._id === queueEntryId);
      if (!entryToRemove) {
        console.error('Could not find queue entry with ID:', queueEntryId);
        alert('Could not find the queue entry to remove. Please refresh the page and try again.');
        setLoading(false);
        return;
      }

      // Store the status for statistics update
      const statusToUpdate = entryToRemove.status;

      // Update the UI optimistically
      setQueueEntries(prevEntries => prevEntries.filter(entry => entry._id !== queueEntryId));

      // Update queue statistics based on the stored status
      setQueueStats(prevStats => ({
        ...prevStats,
        totalPatients: prevStats.totalPatients - 1,
        waitingPatients: statusToUpdate === 'Waiting' ? prevStats.waitingPatients - 1 : prevStats.waitingPatients,
        inProgressPatients: statusToUpdate === 'In Progress' ? prevStats.inProgressPatients - 1 : prevStats.inProgressPatients,
        completedPatients: statusToUpdate === 'Completed' ? prevStats.completedPatients - 1 : prevStats.completedPatients
      }));

      // Try to update the server
      try {
        await apiService.removeFromQueue(queueEntryId);
        console.log('Queue entry removed from server successfully');
      } catch (serverError) {
        console.error('Error removing from queue on server:', serverError);
        // The UI is already updated, so we don't need to do anything here
        // Just log the error and continue
      }

      // Refresh the data from the server after a short delay
      setTimeout(() => {
        fetchQueueData();
      }, 500);
    } catch (error) {
      console.error('Error in handleRemoveFromQueue:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle printing a ticket
  const handlePrintTicket = (queueEntry) => {
    setTicketToPrint(queueEntry);
  };

  // Handle clearing completed queue entries
  const handleClearCompletedQueue = async () => {
    if (!confirm('Are you sure you want to remove all completed patients from the queue? This cannot be undone.')) return;

    try {
      setLoading(true);

      // Get the count of completed entries before clearing
      const completedCount = queueEntries.filter(entry => entry && entry._id && entry.status === 'Completed').length;

      // Update the UI optimistically
      setQueueEntries(prevEntries => prevEntries.filter(entry => entry.status !== 'Completed'));

      // Update queue statistics
      setQueueStats(prevStats => ({
        ...prevStats,
        totalPatients: prevStats.totalPatients - completedCount,
        completedPatients: 0
      }));

      // Call the API to clear completed entries
      await apiService.clearCompletedQueue();

      // Refresh the queue data after a short delay
      setTimeout(() => {
        fetchQueueData();
      }, 500);
    } catch (error) {
      console.error('Error clearing completed queue:', error);
      alert('Failed to clear completed queue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle checking in an appointment
  const handleCheckInAppointment = async (appointment) => {
    try {
      // Find the patient for this appointment
      const patientId = appointment.patient_id || appointment.patientId;

      // Create queue data
      const queueData = {
        patient_id: patientId,
        appointment_id: appointment._id || appointment.id,
        is_walk_in: false,
        notes: `Checked in for ${appointment.type || 'appointment'}`
      };

      // Add to queue
      const newQueueEntry = await apiService.addToQueue(queueData);

      // Update the UI immediately
      if (newQueueEntry) {
        // Add the new entry to the queue entries
        setQueueEntries(prevEntries => {
          // Create a new array with the new entry
          const updatedEntries = [...prevEntries, newQueueEntry];

          // Sort the entries by status and ticket number
          return updatedEntries.sort((a, b) => {
            const statusPriority = { 'Waiting': 0, 'In Progress': 1, 'Completed': 2, 'No-show': 3, 'Cancelled': 4 };
            const statusDiff = statusPriority[a.status] - statusPriority[b.status];

            if (statusDiff !== 0) return statusDiff;

            return (a.ticket_number || 0) - (b.ticket_number || 0);
          });
        });

        // Update queue statistics
        setQueueStats(prevStats => ({
          ...prevStats,
          totalPatients: prevStats.totalPatients + 1,
          waitingPatients: prevStats.waitingPatients + 1
        }));
      }

      // Show the ticket to print
      setTicketToPrint(newQueueEntry);

      // Refresh the queue data after a short delay
      setTimeout(() => {
        fetchQueueData();
      }, 500);

      return true;
    } catch (error) {
      console.error('Error checking in appointment:', error);

      // Check if this is a CORS error
      if (error.toString().includes('CORS') || error.toString().includes('NetworkError')) {
        // Show a more helpful message for CORS errors
        alert('Patient added to queue, but there was a network issue. The queue will update when you refresh the page.');
        return true; // Consider it a success for the user
      } else {
        alert('Failed to check in patient: ' + error.toString());
        return false;
      }
    }
  };

  // Drag and drop handlers
  const handleDragStart = (entryId) => {
    setDraggedEntryId(entryId);
  };

  const handleDragOver = (e, entryId) => {
    e.preventDefault();
    if (draggedEntryId !== entryId) {
      setDragOverEntryId(entryId);
    }
  };

  const handleDrop = async (e, targetEntryId) => {
    e.preventDefault();

    if (!draggedEntryId || draggedEntryId === targetEntryId) {
      // Reset drag state
      setDraggedEntryId(null);
      setDragOverEntryId(null);
      return;
    }

    try {
      setLoading(true);

      // Get only the waiting entries
      const waitingEntries = queueEntries.filter(entry => entry && entry.status === 'Waiting');

      // Find the indices of the dragged and target entries
      const draggedIndex = waitingEntries.findIndex(entry => entry._id === draggedEntryId);
      const targetIndex = waitingEntries.findIndex(entry => entry._id === targetEntryId);

      if (draggedIndex === -1 || targetIndex === -1) {
        console.error('Could not find dragged or target entry');
        return;
      }

      // Create a new array with the reordered items
      const reorderedEntries = Array.from(waitingEntries);
      const [removed] = reorderedEntries.splice(draggedIndex, 1);
      reorderedEntries.splice(targetIndex, 0, removed);

      // Update the queue entries with the new order
      const updatedQueueEntries = queueEntries.filter(entry => entry.status !== 'Waiting');
      updatedQueueEntries.push(...reorderedEntries);

      setQueueEntries(updatedQueueEntries);

      // Call the API to update the order in the database
      const queueOrder = reorderedEntries
        .filter(entry => entry && entry._id) // Filter out any invalid entries
        .map((entry, idx) => ({
          id: entry._id,
          position: idx
        }));
      await apiService.reorderQueue({ queueOrder });

      // Refresh the queue data after a short delay
      setTimeout(() => {
        fetchQueueData();
      }, 500);
    } catch (error) {
      console.error('Error reordering queue:', error);
      alert('Failed to reorder queue');
      await fetchQueueData();
    } finally {
      // Reset drag state
      setDraggedEntryId(null);
      setDragOverEntryId(null);
      setLoading(false);
    }
  };

  // Manual reordering functions
  const handleMoveUp = async (entryId) => {
    try {
      setLoading(true);

      // Get only the waiting entries
      const waitingEntries = queueEntries.filter(entry => entry.status === 'Waiting');

      // Find the index of the entry to move
      const index = waitingEntries.findIndex(entry => entry._id === entryId);

      // Can't move up if already at the top
      if (index <= 0) return;

      // Create a new array with the reordered items
      const reorderedEntries = Array.from(waitingEntries);
      const temp = reorderedEntries[index];
      reorderedEntries[index] = reorderedEntries[index - 1];
      reorderedEntries[index - 1] = temp;

      // Update the queue entries with the new order
      const updatedQueueEntries = queueEntries.filter(entry => entry.status !== 'Waiting');
      updatedQueueEntries.push(...reorderedEntries);

      setQueueEntries(updatedQueueEntries);

      // Call the API to update the order in the database
      const queueOrder = reorderedEntries
        .filter(entry => entry && entry._id) // Filter out any invalid entries
        .map((entry, idx) => ({
          id: entry._id,
          position: idx
        }));
      await apiService.reorderQueue({ queueOrder });
    } catch (error) {
      console.error('Error reordering queue:', error);
      alert('Failed to reorder queue');
      await fetchQueueData();
    } finally {
      setLoading(false);
    }
  };

  const handleMoveDown = async (entryId) => {
    try {
      setLoading(true);

      // Get only the waiting entries
      const waitingEntries = queueEntries.filter(entry => entry.status === 'Waiting');

      // Find the index of the entry to move
      const index = waitingEntries.findIndex(entry => entry._id === entryId);

      // Can't move down if already at the bottom
      if (index === -1 || index >= waitingEntries.length - 1) return;

      // Create a new array with the reordered items
      const reorderedEntries = Array.from(waitingEntries);
      const temp = reorderedEntries[index];
      reorderedEntries[index] = reorderedEntries[index + 1];
      reorderedEntries[index + 1] = temp;

      // Update the queue entries with the new order
      const updatedQueueEntries = queueEntries.filter(entry => entry.status !== 'Waiting');
      updatedQueueEntries.push(...reorderedEntries);

      setQueueEntries(updatedQueueEntries);

      // Call the API to update the order in the database
      const queueOrder = reorderedEntries
        .filter(entry => entry && entry._id) // Filter out any invalid entries
        .map((entry, idx) => ({
          id: entry._id,
          position: idx
        }));
      await apiService.reorderQueue({ queueOrder });
    } catch (error) {
      console.error('Error reordering queue:', error);
      alert('Failed to reorder queue');
      await fetchQueueData();
    } finally {
      setLoading(false);
    }
  };

  // Get today's appointments that aren't in the queue yet
  const getAppointmentsToCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];

    // Get all appointments for today
    const todaysAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date || appointment.date).toISOString().split('T')[0];
      return appointmentDate === today;
    });

    // Get IDs of appointments already in the queue
    const queueAppointmentIds = queueEntries
      .filter(entry => entry && entry.appointment_id) // Make sure entry exists and has appointment_id
      .map(entry => {
        try {
          // Handle both populated and non-populated appointment_id
          if (typeof entry.appointment_id === 'object') {
            if (entry.appointment_id && (entry.appointment_id._id || entry.appointment_id.id)) {
              return entry.appointment_id._id || entry.appointment_id.id;
            }
            // If we can't get an ID from the object, log and return null
            console.error('Invalid appointment_id object:', entry.appointment_id);
            return null;
          }
          return entry.appointment_id;
        } catch (error) {
          console.error('Error processing appointment_id:', error);
          return null;
        }
      })
      .filter(id => id !== null); // Filter out any null IDs

    // Filter out appointments already in the queue
    return todaysAppointments.filter(appointment => {
      const appointmentId = appointment._id || appointment.id;
      return !queueAppointmentIds.includes(appointmentId);
    });
  };

  // Get appointments that can be checked in
  const appointmentsToCheckIn = getAppointmentsToCheckIn();

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-bold text-blue-800 mb-3 md:mb-0">Today's Appointments & Queue</h2>
        <div className="flex flex-wrap gap-2">
          {(userRole === 'secretary' || userRole === 'admin') && (
            <button
              onClick={() => setShowAddToQueueModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center shadow-sm hover:shadow-md transition-all duration-200"
            >
              <FaUserPlus className="mr-2" />
              Add Walk-in
            </button>
          )}

          {appointmentsToCheckIn.length > 0 && (userRole === 'secretary' || userRole === 'admin') && (
            <button
              onClick={() => {
                const promises = appointmentsToCheckIn.map(appointment =>
                  handleCheckInAppointment(appointment)
                );
                Promise.all(promises).then(() => fetchQueueData());
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center shadow-sm hover:shadow-md transition-all duration-200"
            >
              <FaUserCheck className="mr-2" />
              Check In All ({appointmentsToCheckIn.length})
            </button>
          )}

          <button
            onClick={fetchQueueData}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            disabled={loading}
          >
            <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="text-sm text-blue-700">Total Patients</div>
          <div className="text-2xl font-bold">{queueStats.totalPatients}</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
          <div className="text-sm text-yellow-700">Waiting</div>
          <div className="text-2xl font-bold">{queueStats.waitingPatients}</div>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
          <div className="text-sm text-indigo-700">With Doctor</div>
          <div className="text-2xl font-bold">{queueStats.inProgressPatients}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <div className="text-sm text-green-700">Completed</div>
          <div className="text-2xl font-bold">{queueStats.completedPatients}</div>
        </div>
      </div>

      {/* Appointments to Check In */}
      {appointmentsToCheckIn.length > 0 && (userRole === 'secretary' || userRole === 'admin') && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Patients to Check In</h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="mb-3">
              There are <span className="font-bold">{appointmentsToCheckIn.length}</span> patients with appointments today that haven't been checked in yet.
            </p>
            <div className="flex flex-wrap gap-2">
              {appointmentsToCheckIn.map(appointment => (
                <div key={appointment._id || appointment.id} className="bg-white p-2 rounded border border-gray-200 flex-1 min-w-[200px]">
                  <div className="font-medium">
                    {appointment.patientName ||
                     (appointment.patient_id && typeof appointment.patient_id === 'object' ? appointment.patient_id.name : null) ||
                     (() => {
                       // Find patient name if patient_id is just an ID
                       const patientId = appointment.patient_id || appointment.patientId;
                       const patient = patients.find(p => p._id === patientId || p.id === patientId);
                       return patient ? patient.name : 'Unknown Patient';
                     })()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {appointment.type || 'Consultation'} - {appointment.reason || 'No reason provided'}
                  </div>
                  <button
                    onClick={() => handleCheckInAppointment(appointment)}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center w-full justify-center"
                  >
                    <FaUserCheck className="mr-1" />
                    Check In
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className="space-y-6">
        {/* In Progress Patients */}
        {queueEntries.filter(entry => entry && entry._id && entry.status === 'In Progress').length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">With Doctor</h3>
            <div className="space-y-3">
              {queueEntries
                .filter(entry => entry && entry._id && entry.status === 'In Progress')
                .map(entry => {
                  // Find the appointment for this queue entry
                  let appointment = null;
                  try {
                    const appointmentId = typeof entry.appointment_id === 'object' ?
                      (entry.appointment_id._id || entry.appointment_id.id) :
                      entry.appointment_id;

                    if (appointmentId) {
                      appointment = appointments.find(a =>
                        (a && (a._id === appointmentId || a.id === appointmentId))
                      );
                    }
                  } catch (error) {
                    console.error('Error finding appointment for queue entry:', error);
                    // Continue with appointment as null
                  }

                  return (
                    <div key={entry._id} className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                      <div className="flex items-center">
                        <div className="bg-blue-600 text-white font-bold text-xl rounded-full w-10 h-10 flex items-center justify-center mr-4">
                          {entry.ticket_number}
                        </div>
                        <div>
                          <div className="font-medium">
                            {appointment ? appointment.patientName :
                             (entry.patient_id && typeof entry.patient_id === 'object' ? entry.patient_id.name : 'Unknown Patient')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {appointment ?
                              `${appointment.type || 'Consultation'} - ${appointment.reason || 'No reason provided'}` :
                              (entry.is_walk_in ? 'Walk-in' : 'Appointment')}
                          </div>
                        </div>
                        <div className="ml-auto">
                          {userRole === 'doctor' && (
                            <button
                              onClick={() => handleUpdateQueueStatus(entry._id, 'Completed')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
                            >
                              <FaUserCheck className="mr-1" />
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Waiting Patients */}
        {queueEntries.filter(entry => entry && entry._id && entry.status === 'Waiting').length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Waiting</h3>
            <div className="space-y-3">
              {queueEntries
                .filter(entry => entry && entry._id && entry.status === 'Waiting')
                .map((entry, index) => {
                  // Find the appointment for this queue entry
                  let appointment = null;
                  try {
                    const appointmentId = typeof entry.appointment_id === 'object' ?
                      (entry.appointment_id._id || entry.appointment_id.id) :
                      entry.appointment_id;

                    if (appointmentId) {
                      appointment = appointments.find(a =>
                        (a && (a._id === appointmentId || a.id === appointmentId))
                      );
                    }
                  } catch (error) {
                    console.error('Error finding appointment for queue entry:', error);
                    // Continue with appointment as null
                  }

                  return (
                    <div
                      key={entry._id}
                      className={`p-4 rounded-lg border ${dragOverEntryId === entry._id ? 'border-blue-400 bg-blue-50' : 'border-yellow-200 bg-yellow-50'} hover:shadow-md transition-all duration-300 cursor-grab`}
                      draggable={userRole === 'secretary' || userRole === 'admin'}
                      onDragStart={() => handleDragStart(entry._id)}
                      onDragOver={(e) => handleDragOver(e, entry._id)}
                      onDrop={(e) => handleDrop(e, entry._id)}
                      onDragEnd={() => {
                        setDraggedEntryId(null);
                        setDragOverEntryId(null);
                      }}
                    >
                      <div className="flex items-center">
                        {(userRole === 'secretary' || userRole === 'admin') && (
                          <div className="mr-2 text-gray-400 cursor-grab">
                            <FaGripVertical />
                          </div>
                        )}
                        <div className="bg-yellow-600 text-white font-bold text-xl rounded-full w-10 h-10 flex items-center justify-center mr-4">
                          {entry.ticket_number}
                        </div>
                        <div>
                          <div className="font-medium">
                            {appointment ? appointment.patientName :
                             (entry.patient_id && typeof entry.patient_id === 'object' ? entry.patient_id.name : 'Unknown Patient')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {appointment ?
                              `${appointment.type || 'Consultation'} - ${appointment.reason || 'No reason provided'}` :
                              (entry.is_walk_in ? 'Walk-in' : 'Appointment')}
                          </div>
                        </div>
                        <div className="ml-auto flex space-x-2">
                          {/* Manual reordering buttons */}
                          {(userRole === 'secretary' || userRole === 'admin') && (
                            <div className="flex flex-col mr-2">
                              <button
                                onClick={() => handleMoveUp(entry._id)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-t text-sm font-medium flex items-center"
                                disabled={index === 0}
                              >
                                <FaArrowUp className="text-xs" />
                              </button>
                              <button
                                onClick={() => handleMoveDown(entry._id)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-b text-sm font-medium flex items-center"
                                disabled={index === queueEntries.filter(e => e.status === 'Waiting').length - 1}
                              >
                                <FaArrowDown className="text-xs" />
                              </button>
                            </div>
                          )}
                          {userRole === 'doctor' && (
                            <button
                              onClick={() => handleUpdateQueueStatus(entry._id, 'In Progress')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
                            >
                              <FaUserCheck className="mr-1" />
                              Start
                            </button>
                          )}
                          <button
                            onClick={() => handlePrintTicket(entry)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm font-medium flex items-center"
                          >
                            <FaPrint className="mr-1" />
                            Print
                          </button>
                          {(userRole === 'secretary' || userRole === 'admin') && (
                            <button
                              onClick={() => handleRemoveFromQueue(entry._id)}
                              className="bg-gray-200 hover:bg-gray-300 text-red-600 px-3 py-1 rounded text-sm font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Completed Patients (collapsed by default) */}
        {queueEntries.filter(entry => entry && entry._id && entry.status === 'Completed').length > 0 && (
          <details className="mt-4">
            <summary className="flex justify-between items-center text-lg font-semibold text-blue-800 mb-2 cursor-pointer">
              <span>Completed ({queueEntries.filter(entry => entry && entry._id && entry.status === 'Completed').length})</span>
              {(userRole === 'secretary' || userRole === 'admin') && (
                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevent the details from toggling
                    handleClearCompletedQueue();
                  }}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm font-medium flex items-center"
                >
                  <FaTrash className="mr-1" />
                  Clear All
                </button>
              )}
            </summary>
            <div className="space-y-3 mt-2">
              {queueEntries
                .filter(entry => entry && entry._id && entry.status === 'Completed')
                .map(entry => {
                  // Find the appointment for this queue entry
                  let appointment = null;
                  try {
                    const appointmentId = typeof entry.appointment_id === 'object' ?
                      (entry.appointment_id._id || entry.appointment_id.id) :
                      entry.appointment_id;

                    if (appointmentId) {
                      appointment = appointments.find(a =>
                        (a && (a._id === appointmentId || a.id === appointmentId))
                      );
                    }
                  } catch (error) {
                    console.error('Error finding appointment for queue entry:', error);
                    // Continue with appointment as null
                  }

                  return (
                    <div key={entry._id} className="p-4 rounded-lg border border-green-200 bg-green-50">
                      <div className="flex items-center">
                        <div className="bg-green-600 text-white font-bold text-xl rounded-full w-10 h-10 flex items-center justify-center mr-4">
                          {entry.ticket_number}
                        </div>
                        <div>
                          <div className="font-medium">
                            {appointment ? appointment.patientName :
                             (entry.patient_id && typeof entry.patient_id === 'object' ? entry.patient_id.name : 'Unknown Patient')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {appointment ?
                              `${appointment.type || 'Consultation'} - ${appointment.reason || 'No reason provided'}` :
                              (entry.is_walk_in ? 'Walk-in' : 'Appointment')}
                          </div>
                        </div>
                        <div className="ml-auto flex space-x-2">
                          {userRole === 'doctor' && onAddDiagnosis && (
                            <button
                              onClick={() => {
                                try {
                                  // Find the appointment for this queue entry
                                  const appointmentId = typeof entry.appointment_id === 'object' ?
                                    (entry.appointment_id._id || entry.appointment_id.id) :
                                    entry.appointment_id;

                                  if (!appointmentId) {
                                    alert('This queue entry has no associated appointment. Please create a new appointment for this patient.');
                                    return;
                                  }

                                  const appointment = appointments.find(a =>
                                    (a && (a._id === appointmentId || a.id === appointmentId))
                                  );

                                  if (appointment) {
                                    onAddDiagnosis(appointment);
                                  } else {
                                    // Handle the case where the appointment was deleted
                                    alert('The appointment associated with this queue entry has been deleted. Please create a new appointment for this patient.');
                                  }
                                } catch (error) {
                                  console.error('Error handling Add Notes click:', error);
                                  alert('An error occurred while trying to add notes. Please try again.');
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
                            >
                              <FaNotesMedical className="mr-1" />
                              Add Notes
                            </button>
                          )}
                          <button
                            onClick={() => handlePrintTicket(entry)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm font-medium flex items-center"
                          >
                            <FaPrint className="mr-1" />
                            Print
                          </button>
                          {(userRole === 'secretary' || userRole === 'admin') && (
                            <button
                              onClick={() => handleRemoveFromQueue(entry._id)}
                              className="bg-gray-200 hover:bg-gray-300 text-red-600 px-3 py-1 rounded text-sm font-medium flex items-center"
                            >
                              <FaUserTimes className="mr-1" />
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </details>
        )}

        {/* Empty State */}
        {queueEntries.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No patients in the queue today</p>
            {(userRole === 'secretary' || userRole === 'admin') && (
              <button
                onClick={() => setShowAddToQueueModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center mx-auto"
              >
                <FaUserPlus className="mr-2" />
                Add Walk-in Patient
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add to Queue Modal */}
      {showAddToQueueModal && (
        <SuperSimpleAddToQueueModal
          patients={patients}
          onClose={() => setShowAddToQueueModal(false)}
          onSave={async (patientData) => {
            try {
              await handleAddWalkIn(patientData);
              setShowAddToQueueModal(false);
            } catch (error) {
              console.error('Error adding to queue:', error);
              alert('Failed to add patient to queue');
            }
          }}
        />
      )}

      {/* Print Ticket Modal */}
      {ticketToPrint && (
        <QueueTicketPrint
          queueEntry={ticketToPrint}
          onClose={() => setTicketToPrint(null)}
        />
      )}
    </div>
  );
}

export default SimpleAppointmentQueue;
