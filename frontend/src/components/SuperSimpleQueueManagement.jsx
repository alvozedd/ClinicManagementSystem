import { useState, useEffect } from 'react';
import { FaSync, FaUserCheck, FaUserTimes, FaPrint, FaPhone, FaArrowUp, FaArrowDown, FaTrash } from 'react-icons/fa';
import apiService from '../utils/apiService';
import SuperSimpleQueueCard from './SuperSimpleQueueCard';
import QueueTicketPrint from './QueueTicketPrint';
import { clearQueueStorage } from '../utils/clearQueueStorage';

function SuperSimpleQueueManagement({ patients, userRole }) {
  // State for queue management
  const [queueEntries, setQueueEntries] = useState([]);
  const [queueStats, setQueueStats] = useState({
    totalPatients: 0,
    waitingPatients: 0,
    inProgressPatients: 0,
    completedPatients: 0,
    nextTicketNumber: 1,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ticketToPrint, setTicketToPrint] = useState(null);

  // Fetch queue entries and stats
  const fetchQueueData = async () => {
    setLoading(true);
    try {
      // Clear any localStorage data before fetching
      clearQueueStorage();

      const [entriesResponse, statsResponse] = await Promise.all([
        apiService.getQueueEntries(),
        apiService.getQueueStats(),
      ]);

      // Validate that we have real data from the database
      if (!Array.isArray(entriesResponse)) {
        console.error('Invalid response from server - not an array');
        setQueueEntries([]);
        setQueueStats({
          totalPatients: 0,
          waitingPatients: 0,
          inProgressPatients: 0,
          completedPatients: 0,
          nextTicketNumber: 1,
        });
        setLoading(false);
        return;
      }

      // Filter out any entries that might not be from the database
      const validEntries = entriesResponse.filter(entry =>
        entry && entry._id &&
        !entry._id.startsWith('temp_') &&
        !entry._id.startsWith('fallback_')
      );

      if (validEntries.length !== entriesResponse.length) {
        console.warn(`Filtered out ${entriesResponse.length - validEntries.length} invalid entries`);
      }

      // Sort entries: Waiting first (by ticket number), then In Progress, then Completed
      // Use validEntries instead of entriesResponse to ensure we only use database data
      const sortedEntries = [...validEntries].sort((a, b) => {
        // First sort by status priority
        const statusPriority = { 'Waiting': 0, 'In Progress': 1, 'Completed': 2, 'No-show': 3, 'Cancelled': 4 };
        const statusDiff = statusPriority[a.status] - statusPriority[b.status];

        if (statusDiff !== 0) return statusDiff;

        // Then sort by ticket number within the same status
        return a.ticket_number - b.ticket_number;
      });

      setQueueEntries(sortedEntries);
      setQueueStats(statsResponse);

      // Fetch today's appointments that aren't in the queue yet
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointmentsResponse = await apiService.getAppointmentsByDateRange(today, tomorrow);

        if (!Array.isArray(appointmentsResponse)) {
          console.error('Invalid appointments response from server - not an array');
          setAppointments([]);
        } else {
          // Filter out any invalid appointments
          const validAppointments = appointmentsResponse.filter(appointment =>
            appointment && appointment._id && appointment.patient_id
          );

          setAppointments(validAppointments);
        }
      } catch (appointmentError) {
        console.error('Error fetching appointments:', appointmentError);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching queue data:', error);
      setQueueEntries([]);
      setQueueStats({
        totalPatients: 0,
        waitingPatients: 0,
        inProgressPatients: 0,
        completedPatients: 0,
        nextTicketNumber: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear all queue storage and refresh
  const handleClearQueueStorage = () => {
    if (window.confirm('This will clear all temporary queue data. Continue?')) {
      const clearedCount = clearQueueStorage();
      alert(`Cleared ${clearedCount} temporary queue entries. Refreshing data...`);
      fetchQueueData();
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchQueueData();
    // Set up polling to refresh queue data every 30 seconds
    const interval = setInterval(fetchQueueData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle updating a queue entry status
  const handleUpdateQueueStatus = async (entryId, newStatus) => {
    try {
      setLoading(true);
      await apiService.updateQueueEntry(entryId, { status: newStatus });
      await fetchQueueData();
    } catch (error) {
      console.error('Error updating queue entry:', error);
      alert('Failed to update queue status');
    } finally {
      setLoading(false);
    }
  };

  // Handle removing a queue entry
  const handleRemoveFromQueue = async (entryId) => {
    if (!window.confirm('Are you sure you want to remove this patient from the queue?')) return;

    try {
      setLoading(true);
      await apiService.removeFromQueue(entryId);
      await fetchQueueData();
    } catch (error) {
      console.error('Error removing from queue:', error);
      alert('Failed to remove patient from queue');
    } finally {
      setLoading(false);
    }
  };

  // Handle printing a ticket
  const handlePrintTicket = (queueEntry) => {
    setTicketToPrint(queueEntry);
  };



  // Handle checking in a patient with an appointment
  const handleCheckInAppointment = async (appointment) => {
    try {
      console.log('Checking in appointment:', appointment);

      // Step 1: Verify appointment and patient exist
      if (!appointment || (!appointment._id && !appointment.id)) {
        console.error('Invalid appointment data');
        alert('Invalid appointment data');
        return false;
      }

      const patientId = appointment.patient_id || appointment.patientId;
      if (!patientId) {
        console.error('No patient ID found for appointment');
        alert('No patient associated with this appointment');
        return false;
      }

      // Clear any existing queue entries from localStorage
      clearQueueStorage();
      console.log('Cleared existing queue entries before checking in appointment');

      // Step 2: Create queue data
      const queueData = {
        patient_id: patientId,
        appointment_id: appointment._id || appointment.id,
        is_walk_in: false,
        notes: `Checked in for ${appointment.type || 'appointment'}`
      };

      console.log('Adding appointment to queue with data:', queueData);

      // Step 3: Add to queue
      try {
        const newQueueEntry = await apiService.addToQueue(queueData);
        console.log('Added appointment to queue successfully:', newQueueEntry);

        if (!newQueueEntry || !newQueueEntry._id) {
          throw new Error('Invalid queue entry returned from server');
        }

        // Show the ticket for printing
        setTicketToPrint(newQueueEntry);

        // Refresh queue data
        await fetchQueueData();

        return true;
      } catch (queueError) {
        console.error('Error adding appointment to queue:', queueError);

        // Check if this is a duplicate entry error
        if (queueError.message && queueError.message.includes && queueError.message.includes('already in the queue')) {
          alert('This patient is already in the queue');
        } else {
          alert('Failed to check in patient. Please check your network connection and try again.');
        }
        return false;
      }
    } catch (error) {
      console.error('Error in appointment check-in workflow:', error);
      alert('An error occurred while checking in the patient. Please check your network connection and try again.');
      return false;
    }
  };

  // Handle moving a queue entry up in the list
  const handleMoveUp = async (entryId) => {
    try {
      setLoading(true);

      // Get only the waiting entries
      const waitingEntries = queueEntries.filter(entry => entry.status === 'Waiting');

      // Find the index of the entry to move
      const entryIndex = waitingEntries.findIndex(entry => entry._id === entryId);

      // If it's already at the top, do nothing
      if (entryIndex <= 0) return;

      // Create a new array with the reordered items
      const reorderedEntries = Array.from(waitingEntries);

      // Swap the entry with the one above it
      [reorderedEntries[entryIndex], reorderedEntries[entryIndex - 1]] =
      [reorderedEntries[entryIndex - 1], reorderedEntries[entryIndex]];

      // Update the queue entries with the new order
      const updatedQueueEntries = queueEntries.filter(entry => entry.status !== 'Waiting');
      updatedQueueEntries.push(...reorderedEntries);

      // Sort the updated entries
      const sortedEntries = [...updatedQueueEntries].sort((a, b) => {
        const statusPriority = { 'Waiting': 0, 'In Progress': 1, 'Completed': 2, 'No-show': 3, 'Cancelled': 4 };
        const statusDiff = statusPriority[a.status] - statusPriority[b.status];

        if (statusDiff !== 0) return statusDiff;

        return a.ticket_number - b.ticket_number;
      });

      setQueueEntries(sortedEntries);

      // Call the API to update the order in the database
      const queueOrder = reorderedEntries.map((entry, index) => ({
        id: entry._id,
        position: index
      }));
      await apiService.reorderQueue({ queueOrder });

    } catch (error) {
      console.error('Error reordering queue:', error);
      alert('Failed to reorder queue');
      // Refresh to get the original order
      await fetchQueueData();
    } finally {
      setLoading(false);
    }
  };

  // Handle moving a queue entry down in the list
  const handleMoveDown = async (entryId) => {
    try {
      setLoading(true);

      // Get only the waiting entries
      const waitingEntries = queueEntries.filter(entry => entry.status === 'Waiting');

      // Find the index of the entry to move
      const entryIndex = waitingEntries.findIndex(entry => entry._id === entryId);

      // If it's already at the bottom, do nothing
      if (entryIndex === -1 || entryIndex >= waitingEntries.length - 1) return;

      // Create a new array with the reordered items
      const reorderedEntries = Array.from(waitingEntries);

      // Swap the entry with the one below it
      [reorderedEntries[entryIndex], reorderedEntries[entryIndex + 1]] =
      [reorderedEntries[entryIndex + 1], reorderedEntries[entryIndex]];

      // Update the queue entries with the new order
      const updatedQueueEntries = queueEntries.filter(entry => entry.status !== 'Waiting');
      updatedQueueEntries.push(...reorderedEntries);

      // Sort the updated entries
      const sortedEntries = [...updatedQueueEntries].sort((a, b) => {
        const statusPriority = { 'Waiting': 0, 'In Progress': 1, 'Completed': 2, 'No-show': 3, 'Cancelled': 4 };
        const statusDiff = statusPriority[a.status] - statusPriority[b.status];

        if (statusDiff !== 0) return statusDiff;

        return a.ticket_number - b.ticket_number;
      });

      setQueueEntries(sortedEntries);

      // Call the API to update the order in the database
      const queueOrder = reorderedEntries.map((entry, index) => ({
        id: entry._id,
        position: index
      }));
      await apiService.reorderQueue({ queueOrder });

    } catch (error) {
      console.error('Error reordering queue:', error);
      alert('Failed to reorder queue');
      // Refresh to get the original order
      await fetchQueueData();
    } finally {
      setLoading(false);
    }
  };

  // Get today's appointments that aren't in the queue yet
  const getTodaysAppointments = () => {
    if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
      console.log('No appointments available');
      return [];
    }

    const today = new Date().toISOString().split('T')[0];
    console.log('Today is:', today);
    console.log('All appointments:', appointments.length);

    // Get all appointments for today with status 'Scheduled'
    const todaysAppointments = appointments.filter(appointment => {
      if (!appointment || !appointment.appointment_date) return false;

      const appointmentDate = new Date(appointment.appointment_date || appointment.date).toISOString().split('T')[0];
      const isToday = appointmentDate === today;
      const isScheduled = appointment.status === 'Scheduled';

      return isToday && isScheduled;
    });

    console.log('Today\'s scheduled appointments:', todaysAppointments.length);

    // Safely get IDs of appointments already in the queue
    const queueAppointmentIds = [];
    if (queueEntries && Array.isArray(queueEntries)) {
      queueEntries.forEach(entry => {
        if (entry && entry.appointment_id) {
          // Handle both populated and non-populated appointment_id
          const appointmentId = typeof entry.appointment_id === 'object' ?
            (entry.appointment_id?._id || entry.appointment_id?.id) :
            entry.appointment_id;

          if (appointmentId) queueAppointmentIds.push(appointmentId);
        }
      });
    }

    console.log('Queue appointment IDs:', queueAppointmentIds.length);

    // Filter out appointments already in the queue
    const appointmentsNotInQueue = todaysAppointments.filter(appointment => {
      if (!appointment) return false;

      const appointmentId = appointment._id || appointment.id;
      if (!appointmentId) return false;

      const isInQueue = queueAppointmentIds.includes(appointmentId);
      return !isInQueue;
    });

    console.log('Appointments not in queue:', appointmentsNotInQueue.length);
    return appointmentsNotInQueue;
  };

  // Check if there are any appointments that can be checked in
  const appointmentsToCheckIn = getTodaysAppointments();

  // Debug output
  console.log('Queue entries:', queueEntries);
  console.log('Queue stats:', queueStats);
  console.log('Appointments to check in:', appointmentsToCheckIn);

  // Check if we're showing fallback data
  const [showingFallbackData, setShowingFallbackData] = useState(false);

  // Check if any entries are fallbacks
  useEffect(() => {
    if (queueEntries.length > 0) {
      const hasFallbacks = queueEntries.some(entry =>
        entry._id?.startsWith('temp_') || entry._id?.startsWith('fallback_')
      );
      setShowingFallbackData(hasFallbacks);
    } else {
      setShowingFallbackData(false);
    }
  }, [queueEntries]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-blue-800 mb-1">Patient Queue</h2>
          {showingFallbackData && (
            <div className="text-red-600 text-sm font-medium bg-red-100 px-2 py-1 rounded-md inline-block">
              Warning: Showing cached data (not from database)
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">

          {appointmentsToCheckIn.length > 0 && (userRole === 'secretary' || userRole === 'admin') && (
            <button
              onClick={() => {
                // Clear any existing queue entries from localStorage before checking in all
                clearQueueStorage();
                console.log('Cleared existing queue entries before checking in all appointments');

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

          {/* Clear Queue Storage Button */}
          <button
            onClick={handleClearQueueStorage}
            className={`${showingFallbackData ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-red-100 hover:bg-red-200 text-red-700'} px-3 py-2 rounded-md text-sm font-medium flex items-center`}
            title="Clear temporary queue data"
          >
            <FaTrash className="mr-2" />
            {showingFallbackData ? 'Clear Cached Data!' : 'Clear Cache'}
          </button>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="text-sm text-blue-700">Total Patients</div>
          <div className="text-2xl font-bold">{queueStats.totalPatients || 0}</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
          <div className="text-sm text-yellow-700">Waiting</div>
          <div className="text-2xl font-bold">{queueStats.waitingPatients || 0}</div>
          {queueStats.todayAppointments > 0 && (
            <div className="text-xs text-yellow-600 mt-1">
              +{queueStats.todayAppointments} scheduled today
            </div>
          )}
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
          <div className="text-sm text-indigo-700">With Doctor</div>
          <div className="text-2xl font-bold">{queueStats.inProgressPatients || 0}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <div className="text-sm text-green-700">Completed</div>
          <div className="text-2xl font-bold">{queueStats.completedPatients || 0}</div>
        </div>
      </div>

      {/* Appointments to Check In */}
      {appointmentsToCheckIn.length > 0 && (userRole === 'secretary' || userRole === 'admin') && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Today's Appointments</h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="mb-3">
              There are <span className="font-bold">{appointmentsToCheckIn.length}</span> appointments today that haven't been checked in yet.
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
                    {appointment.type || 'Consultation'}
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

      {/* Display message when no appointments to check in */}
      {appointmentsToCheckIn.length === 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Today's Appointments</h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
            <p>No appointments to check in today.</p>
          </div>
        </div>
      )}

      {/* Queue List with Drag and Drop for Waiting Patients */}
      <div className="space-y-6">
        {/* In Progress Patients */}
        {queueEntries.filter(entry => entry.status === 'In Progress').length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">With Doctor</h3>
            <div className="space-y-3">
              {queueEntries
                .filter(entry => entry.status === 'In Progress')
                .map(entry => (
                  <SuperSimpleQueueCard
                    key={entry._id}
                    queueEntry={entry}
                    onUpdateStatus={(status) => handleUpdateQueueStatus(entry._id, status)}
                    onRemove={() => handleRemoveFromQueue(entry._id)}
                    onPrintTicket={() => handlePrintTicket(entry)}
                    userRole={userRole}
                    patients={patients}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Waiting Patients with Up/Down Buttons */}
        {queueEntries.filter(entry => entry.status === 'Waiting').length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Waiting</h3>
            <div className="space-y-3">
              {queueEntries
                .filter(entry => entry.status === 'Waiting')
                .map((entry, index) => (
                  <div key={entry._id} className="relative">
                    {(userRole === 'secretary' || userRole === 'admin') && (
                      <div className="absolute right-2 top-2 flex flex-col space-y-1 z-10">
                        <button
                          onClick={() => handleMoveUp(entry._id)}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                          title="Move up"
                        >
                          <FaArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(entry._id)}
                          disabled={index === queueEntries.filter(e => e.status === 'Waiting').length - 1}
                          className={`p-1 rounded ${index === queueEntries.filter(e => e.status === 'Waiting').length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                          title="Move down"
                        >
                          <FaArrowDown size={14} />
                        </button>
                      </div>
                    )}
                    <SuperSimpleQueueCard
                      queueEntry={entry}
                      onUpdateStatus={(status) => handleUpdateQueueStatus(entry._id, status)}
                      onRemove={() => handleRemoveFromQueue(entry._id)}
                      onPrintTicket={() => handlePrintTicket(entry)}
                      userRole={userRole}
                      patients={patients}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Completed Patients (collapsed by default) */}
        {queueEntries.filter(entry => entry.status === 'Completed').length > 0 && (
          <details className="mt-4">
            <summary className="text-lg font-semibold text-blue-800 mb-2 cursor-pointer">
              Completed ({queueEntries.filter(entry => entry.status === 'Completed').length})
            </summary>
            <div className="space-y-3 mt-2">
              {queueEntries
                .filter(entry => entry.status === 'Completed')
                .map(entry => (
                  <SuperSimpleQueueCard
                    key={entry._id}
                    queueEntry={entry}
                    onUpdateStatus={(status) => handleUpdateQueueStatus(entry._id, status)}
                    onRemove={() => handleRemoveFromQueue(entry._id)}
                    onPrintTicket={() => handlePrintTicket(entry)}
                    userRole={userRole}
                    patients={patients}
                  />
                ))}
            </div>
          </details>
        )}

        {/* Empty State */}
        {queueEntries.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No patients in the queue today</p>
          </div>
        )}
      </div>



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

export default SuperSimpleQueueManagement;
