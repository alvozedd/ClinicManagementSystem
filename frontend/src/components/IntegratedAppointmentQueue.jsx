import { useState, useEffect } from 'react';
import { FaUserPlus, FaSync, FaUserCheck, FaUserTimes, FaPrint, FaPhone, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import apiService from '../utils/apiService';
import AppointmentCard from './AppointmentCard';
import SuperSimpleAddToQueueModal from './SuperSimpleAddToQueueModal';
import QueueTicketPrint from './QueueTicketPrint';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function IntegratedAppointmentQueue({ patients, appointments, userRole, onUpdateAppointment, onViewPatient, onEditAppointment, onDeleteAppointment, onUpdatePatient }) {
  // State for queue management
  const [queueEntries, setQueueEntries] = useState([]);
  const [queueStats, setQueueStats] = useState({
    totalPatients: 0,
    waitingPatients: 0,
    inProgressPatients: 0,
    completedPatients: 0,
    nextTicketNumber: 1,
  });
  const [loading, setLoading] = useState(false);
  const [showAddToQueueModal, setShowAddToQueueModal] = useState(false);
  const [ticketToPrint, setTicketToPrint] = useState(null);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [queuedAppointments, setQueuedAppointments] = useState([]);

  // Fetch queue entries and stats
  const fetchQueueData = async () => {
    setLoading(true);
    try {
      const [entriesResponse, statsResponse] = await Promise.all([
        apiService.getQueueEntries(),
        apiService.getQueueStats(),
      ]);

      // Sort entries: Waiting first (by ticket number), then In Progress, then Completed
      const sortedEntries = [...entriesResponse].sort((a, b) => {
        // First sort by status priority
        const statusPriority = { 'Waiting': 0, 'In Progress': 1, 'Completed': 2, 'No-show': 3, 'Cancelled': 4 };
        const statusDiff = statusPriority[a.status] - statusPriority[b.status];

        if (statusDiff !== 0) return statusDiff;

        // Then sort by ticket number within the same status
        return a.ticket_number - b.ticket_number;
      });

      setQueueEntries(sortedEntries);
      setQueueStats(statsResponse);
    } catch (error) {
      console.error('Error fetching queue data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchQueueData();
    // Set up polling to refresh queue data every 30 seconds
    const interval = setInterval(fetchQueueData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Process appointments data
  useEffect(() => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Filter appointments for today
    const todaysAppts = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date || appointment.date).toISOString().split('T')[0];
      return appointmentDate === today;
    });

    setTodaysAppointments(todaysAppts);

    // Get IDs of appointments already in the queue
    const queueAppointmentIds = queueEntries
      .filter(entry => entry.appointment_id)
      .map(entry => {
        // Handle both populated and non-populated appointment_id
        return typeof entry.appointment_id === 'object' ?
          (entry.appointment_id._id || entry.appointment_id.id) :
          entry.appointment_id;
      });

    // Filter appointments that are already in the queue
    const queuedAppts = todaysAppts.filter(appointment => {
      const appointmentId = appointment._id || appointment.id;
      return queueAppointmentIds.includes(appointmentId);
    });

    setQueuedAppointments(queuedAppts);

  }, [appointments, queueEntries]);

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

  // Handle adding a walk-in patient
  const handleAddWalkIn = async (patientData) => {
    try {
      setLoading(true);

      // Create a new appointment for the walk-in patient
      const today = new Date();
      const appointmentData = {
        patient_id: patientData.patient_id,
        appointment_date: today,
        type: 'Walk-in',
        reason: patientData.reason || 'Walk-in visit',
        status: 'Scheduled',
        createdBy: 'secretary'
      };

      // Create the appointment in the database
      const newAppointment = await apiService.createAppointment(appointmentData);
      console.log('Created appointment for walk-in:', newAppointment);

      // Add to queue
      const queueData = {
        patient_id: patientData.patient_id,
        appointment_id: newAppointment._id,
        is_walk_in: true,
        notes: `Walk-in: ${patientData.reason || 'No reason provided'}`
      };

      const newQueueEntry = await apiService.addToQueue(queueData);
      setTicketToPrint(newQueueEntry);
      await fetchQueueData();

      return newQueueEntry;
    } catch (error) {
      console.error('Error adding walk-in patient to queue:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle checking in a patient with an appointment
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
      setTicketToPrint(newQueueEntry);
      await fetchQueueData();
    } catch (error) {
      console.error('Error checking in appointment:', error);
      alert('Failed to check in patient');
    }
  };

  // Handle drag and drop reordering
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    try {
      setLoading(true);

      // Get only the waiting entries
      const waitingEntries = queueEntries.filter(entry => entry.status === 'Waiting');

      // Create a new array with the reordered items
      const reorderedEntries = Array.from(waitingEntries);
      const [removed] = reorderedEntries.splice(sourceIndex, 1);
      reorderedEntries.splice(destinationIndex, 0, removed);

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
  const getAppointmentsToCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];

    // Get all appointments for today
    const todaysAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date || appointment.date).toISOString().split('T')[0];
      return appointmentDate === today;
    });

    // Get IDs of appointments already in the queue
    const queueAppointmentIds = queueEntries
      .filter(entry => entry.appointment_id)
      .map(entry => {
        // Handle both populated and non-populated appointment_id
        return typeof entry.appointment_id === 'object' ?
          (entry.appointment_id._id || entry.appointment_id.id) :
          entry.appointment_id;
      });

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

      {/* Queue List with Drag and Drop for Waiting Patients */}
      <div className="space-y-6">
        {/* In Progress Patients */}
        {queueEntries.filter(entry => entry.status === 'In Progress').length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">With Doctor</h3>
            <div className="space-y-3">
              {queueEntries
                .filter(entry => entry.status === 'In Progress')
                .map(entry => {
                  // Find the appointment for this queue entry
                  const appointmentId = typeof entry.appointment_id === 'object' ?
                    (entry.appointment_id._id || entry.appointment_id.id) :
                    entry.appointment_id;

                  const appointment = appointments.find(a =>
                    (a._id === appointmentId || a.id === appointmentId)
                  );

                  if (!appointment) {
                    return (
                      <div key={entry._id} className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                        <div className="flex items-center">
                          <div className="bg-blue-600 text-white font-bold text-xl rounded-full w-10 h-10 flex items-center justify-center mr-4">
                            {entry.ticket_number}
                          </div>
                          <div>
                            <div className="font-medium">
                              {entry.patient_id && typeof entry.patient_id === 'object' ? entry.patient_id.name : 'Unknown Patient'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {entry.is_walk_in ? 'Walk-in' : 'Appointment'}
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
                  }

                  return (
                    <div key={entry._id} className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                      <div className="flex items-center">
                        <div className="bg-blue-600 text-white font-bold text-xl rounded-full w-10 h-10 flex items-center justify-center mr-4">
                          {entry.ticket_number}
                        </div>
                        <div>
                          <div className="font-medium">
                            {appointment.patientName ||
                             (entry.patient_id && typeof entry.patient_id === 'object' ? entry.patient_id.name : 'Unknown Patient')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {appointment.type || 'Consultation'} - {appointment.reason || 'No reason provided'}
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

        {/* Waiting Patients with Drag and Drop */}
        {queueEntries.filter(entry => entry.status === 'Waiting').length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Waiting</h3>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="waiting-queue">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {queueEntries
                      .filter(entry => entry.status === 'Waiting')
                      .map((entry, index) => {
                        // Find the appointment for this queue entry
                        const appointmentId = typeof entry.appointment_id === 'object' ?
                          (entry.appointment_id._id || entry.appointment_id.id) :
                          entry.appointment_id;

                        const appointment = appointments.find(a =>
                          (a._id === appointmentId || a.id === appointmentId)
                        );

                        return (
                          <Draggable
                            key={entry._id}
                            draggableId={entry._id}
                            index={index}
                            isDragDisabled={userRole !== 'secretary' && userRole !== 'admin'}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 hover:shadow-md transition-all duration-300"
                              >
                                <div className="flex items-center">
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
                            )}
                          </Draggable>
                        );
                      })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
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
                .map(entry => {
                  // Find the appointment for this queue entry
                  const appointmentId = typeof entry.appointment_id === 'object' ?
                    (entry.appointment_id._id || entry.appointment_id.id) :
                    entry.appointment_id;

                  const appointment = appointments.find(a =>
                    (a._id === appointmentId || a.id === appointmentId)
                  );

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
                        <div className="ml-auto">
                          <button
                            onClick={() => handlePrintTicket(entry)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm font-medium flex items-center"
                          >
                            <FaPrint className="mr-1" />
                            Print
                          </button>
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

export default IntegratedAppointmentQueue;
