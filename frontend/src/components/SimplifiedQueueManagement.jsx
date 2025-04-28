import { useState, useEffect } from 'react';
import { FaUserPlus, FaSync, FaUserClock, FaUserCheck, FaUserTimes, FaPrint, FaCalendarCheck, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import apiService from '../utils/apiService';
import SimplifiedQueueCard from './SimplifiedQueueCard';
import SimplifiedAddToQueueModal from './SimplifiedAddToQueueModal';
import QueueTicketPrint from './QueueTicketPrint';

function SimplifiedQueueManagement({ patients, appointments, userRole }) {
  const [queueEntries, setQueueEntries] = useState([]);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [queueStats, setQueueStats] = useState({
    totalPatients: 0,
    waitingPatients: 0,
    inProgressPatients: 0,
    completedPatients: 0,
    nextTicketNumber: 1,
  });
  const [loading, setLoading] = useState(false);
  const [showAddToQueueModal, setShowAddToQueueModal] = useState(false);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'appointments'
  const [ticketToPrint, setTicketToPrint] = useState(null);

  // Fetch queue entries and stats
  const fetchQueueData = async () => {
    setLoading(true);
    try {
      const [entriesResponse, statsResponse] = await Promise.all([
        apiService.getQueueEntries(),
        apiService.getQueueStats(),
      ]);
      setQueueEntries(entriesResponse);
      setQueueStats(statsResponse);
    } catch (error) {
      console.error('Error fetching queue data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter today's appointments
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    console.log('Filtering appointments for today:', today);
    console.log('Total appointments:', appointments.length);

    const filteredAppointments = appointments.filter(appointment => {
      // Get the appointment date, handling different formats
      let appointmentDate;
      if (appointment.appointment_date) {
        appointmentDate = new Date(appointment.appointment_date).toISOString().split('T')[0];
      } else if (appointment.date) {
        appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
      } else {
        return false; // Skip appointments without a date
      }

      // Check if the appointment is for today and not completed or cancelled
      const isToday = appointmentDate === today;
      const isActive = appointment.status !== 'Completed' && appointment.status !== 'Cancelled';

      if (isToday) {
        console.log('Found appointment for today:', appointment);
      }

      return isToday && isActive;
    });

    console.log('Filtered appointments for today:', filteredAppointments.length);

    // Check which appointments are already in the queue
    const appointmentsInQueue = queueEntries.map(entry => entry.appointment_id?._id || entry.appointment_id);
    console.log('Appointments already in queue:', appointmentsInQueue);

    // Mark appointments that are already in the queue
    const appointmentsWithQueueStatus = filteredAppointments.map(appointment => {
      const appointmentId = appointment._id || appointment.id;
      const isInQueue = appointmentsInQueue.includes(appointmentId);

      if (isInQueue) {
        console.log('Appointment already in queue:', appointmentId);
      }

      return {
        ...appointment,
        isInQueue
      };
    });

    setTodaysAppointments(appointmentsWithQueueStatus);
    console.log('Today\'s appointments set:', appointmentsWithQueueStatus);

    // If we're in the appointments tab and there are appointments not in the queue,
    // show a message or highlight them
    if (activeTab === 'appointments' && appointmentsWithQueueStatus.length > 0 &&
        appointmentsWithQueueStatus.filter(a => !a.isInQueue).length > 0) {
      console.log('Found appointments not in queue, they can be added manually');
    }
  }, [appointments, queueEntries, activeTab]);

  useEffect(() => {
    fetchQueueData();
    // Set up polling to refresh queue data every 30 seconds
    const interval = setInterval(fetchQueueData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle adding a patient to the queue
  const handleAddToQueue = async (queueData) => {
    try {
      const newQueueEntry = await apiService.addToQueue(queueData);
      setTicketToPrint(newQueueEntry);
      await fetchQueueData();
      setShowAddToQueueModal(false);
    } catch (error) {
      console.error('Error adding to queue:', error);
      alert(error.response?.data?.message || 'Failed to add patient to queue');
    }
  };

  // Handle updating a queue entry
  const handleUpdateQueueEntry = async (id, updatedData) => {
    try {
      await apiService.updateQueueEntry(id, updatedData);
      fetchQueueData();
    } catch (error) {
      console.error('Error updating queue entry:', error);
    }
  };

  // Handle removing a patient from the queue
  const handleRemoveFromQueue = async (id) => {
    if (window.confirm('Are you sure you want to remove this patient from the queue?')) {
      try {
        await apiService.removeFromQueue(id);
        fetchQueueData();
      } catch (error) {
        console.error('Error removing from queue:', error);
      }
    }
  };

  // Get next patient (for doctors)
  const handleGetNextPatient = async () => {
    try {
      const nextPatient = await apiService.getNextPatient();
      // Update the status to "In Progress"
      await apiService.updateQueueEntry(nextPatient._id, { status: 'In Progress' });
      fetchQueueData();
    } catch (error) {
      console.error('Error getting next patient:', error);
      alert('No patients waiting in queue');
    }
  };

  // Handle printing a ticket
  const handlePrintTicket = (queueEntry) => {
    setTicketToPrint(queueEntry);
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

  // Handle moving a queue entry up in the order
  const handleMoveUp = async (entryId) => {
    // Find the entry and its index
    const waitingEntries = queueEntries.filter(entry => entry.status === 'Waiting');
    const entryIndex = waitingEntries.findIndex(entry => entry._id === entryId);

    // If it's already at the top, do nothing
    if (entryIndex <= 0) return;

    // Create a copy of the waiting entries
    const updatedWaitingEntries = [...waitingEntries];

    // Swap the entry with the one above it
    const temp = updatedWaitingEntries[entryIndex];
    updatedWaitingEntries[entryIndex] = updatedWaitingEntries[entryIndex - 1];
    updatedWaitingEntries[entryIndex - 1] = temp;

    // Update the queue order in the UI immediately (optimistic update)
    const updatedEntries = [...queueEntries];
    const waitingIndices = updatedEntries.map((entry, index) => entry.status === 'Waiting' ? index : -1).filter(index => index !== -1);

    // Replace the waiting entries in the original array
    updatedWaitingEntries.forEach((entry, i) => {
      updatedEntries[waitingIndices[i]] = entry;
    });

    setQueueEntries(updatedEntries);

    try {
      // Update the queue order in the database
      // This would typically involve updating the priority or order field of each entry
      console.log('Queue entry moved up:', entryId);

      // In a real implementation, you would call an API to update the queue order
      // await apiService.updateQueueOrder(updatedWaitingEntries.map(e => e._id));
    } catch (error) {
      console.error('Error updating queue order:', error);
      // Revert to the original order if the update fails
      fetchQueueData();
    }
  };

  // Handle moving a queue entry down in the order
  const handleMoveDown = async (entryId) => {
    // Find the entry and its index
    const waitingEntries = queueEntries.filter(entry => entry.status === 'Waiting');
    const entryIndex = waitingEntries.findIndex(entry => entry._id === entryId);

    // If it's already at the bottom, do nothing
    if (entryIndex === -1 || entryIndex >= waitingEntries.length - 1) return;

    // Create a copy of the waiting entries
    const updatedWaitingEntries = [...waitingEntries];

    // Swap the entry with the one below it
    const temp = updatedWaitingEntries[entryIndex];
    updatedWaitingEntries[entryIndex] = updatedWaitingEntries[entryIndex + 1];
    updatedWaitingEntries[entryIndex + 1] = temp;

    // Update the queue order in the UI immediately (optimistic update)
    const updatedEntries = [...queueEntries];
    const waitingIndices = updatedEntries.map((entry, index) => entry.status === 'Waiting' ? index : -1).filter(index => index !== -1);

    // Replace the waiting entries in the original array
    updatedWaitingEntries.forEach((entry, i) => {
      updatedEntries[waitingIndices[i]] = entry;
    });

    setQueueEntries(updatedEntries);

    try {
      // Update the queue order in the database
      // This would typically involve updating the priority or order field of each entry
      console.log('Queue entry moved down:', entryId);

      // In a real implementation, you would call an API to update the queue order
      // await apiService.updateQueueOrder(updatedWaitingEntries.map(e => e._id));
    } catch (error) {
      console.error('Error updating queue order:', error);
      // Revert to the original order if the update fails
      fetchQueueData();
    }
  };

  // Sort queue entries by status and ticket number
  const sortedQueueEntries = [...queueEntries].sort((a, b) => {
    // First sort by status priority
    const statusPriority = { 'In Progress': 1, 'Waiting': 2, 'Completed': 3, 'No-show': 4, 'Cancelled': 5 };
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];

    if (statusDiff !== 0) return statusDiff;

    // Then sort by ticket number
    return a.ticket_number - b.ticket_number;
  });

  // Get only the waiting entries for drag and drop
  const waitingEntries = sortedQueueEntries.filter(entry => entry.status === 'Waiting');

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-bold text-blue-800 mb-3 md:mb-0">Patient Queue</h2>
        <div className="flex flex-wrap gap-2">
          {(userRole === 'secretary' || userRole === 'admin') && (
            <button
              onClick={() => setShowAddToQueueModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center shadow-sm hover:shadow-md transition-all duration-200"
            >
              <FaUserPlus className="mr-2" />
              Add to Queue
            </button>
          )}

          {userRole === 'doctor' && (
            <button
              onClick={handleGetNextPatient}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center shadow-sm hover:shadow-md transition-all duration-200"
              disabled={queueStats.waitingPatients === 0}
            >
              <FaUserClock className="mr-2" />
              Next Patient
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
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-col">
          <div className="text-blue-500 mb-1">
            <FaUserClock className="inline mr-1" />
            <span className="text-sm font-medium">Waiting</span>
          </div>
          <div className="text-2xl font-bold text-blue-800">{queueStats.waitingPatients}</div>
          <div className="text-xs text-blue-600 mt-1">Patients in waiting room</div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex flex-col">
          <div className="text-green-500 mb-1">
            <FaUserCheck className="inline mr-1" />
            <span className="text-sm font-medium">In Progress</span>
          </div>
          <div className="text-2xl font-bold text-green-800">{queueStats.inProgressPatients}</div>
          <div className="text-xs text-green-600 mt-1">Currently with doctor</div>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 flex flex-col">
          <div className="text-purple-500 mb-1">
            <FaCalendarCheck className="inline mr-1" />
            <span className="text-sm font-medium">Today's Total</span>
          </div>
          <div className="text-2xl font-bold text-purple-800">{queueStats.totalPatients}</div>
          <div className="text-xs text-purple-600 mt-1">Patients today</div>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex flex-col">
          <div className="text-yellow-500 mb-1">
            <FaUserPlus className="inline mr-1" />
            <span className="text-sm font-medium">Next Ticket</span>
          </div>
          <div className="text-2xl font-bold text-yellow-800">#{queueStats.nextTicketNumber}</div>
          <div className="text-xs text-yellow-600 mt-1">Next available number</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <div className="flex -mb-px">
          <button
            className={`mr-2 py-2 px-4 text-sm font-medium border-b-2 focus:outline-none ${
              activeTab === 'queue'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('queue')}
          >
            Current Queue
          </button>
          <button
            className={`mr-2 py-2 px-4 text-sm font-medium border-b-2 focus:outline-none ${
              activeTab === 'appointments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('appointments')}
          >
            Today's Appointments
          </button>
        </div>
      </div>

      {/* Queue List */}
      {activeTab === 'queue' && (
        <div className="space-y-3 mt-4">
          {sortedQueueEntries.length > 0 ? (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-blue-800">Current Queue</h3>
                <div className="flex space-x-2">
                  {userRole === 'secretary' && (
                    <button
                      onClick={() => setShowAddToQueueModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
                    >
                      <FaUserPlus className="mr-1" />
                      Add Patient
                    </button>
                  )}
                </div>
              </div>
              <div>
                {/* In Progress Patients */}
                {sortedQueueEntries.filter(entry => entry.status === 'In Progress').length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                      <FaUserCheck className="mr-1" /> In Progress
                    </h4>
                    <div className="space-y-3">
                      {sortedQueueEntries
                        .filter(entry => entry.status === 'In Progress')
                        .map(entry => (
                          <SimplifiedQueueCard
                            key={entry._id}
                            queueEntry={entry}
                            onUpdateStatus={(status) => handleUpdateQueueEntry(entry._id, { status })}
                            onRemove={() => handleRemoveFromQueue(entry._id)}
                            onPrintTicket={() => handlePrintTicket(entry)}
                            userRole={userRole}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Waiting Patients - Reorderable */}
                {waitingEntries.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-yellow-700 mb-2 flex items-center">
                      <FaUserClock className="mr-1" /> Waiting
                      {userRole === 'secretary' && (
                        <span className="ml-2 text-xs text-gray-500 flex items-center">
                          <FaArrowUp className="mr-1" /><FaArrowDown className="mr-1" /> Use arrows to reorder
                        </span>
                      )}
                    </h4>
                    <div className="space-y-3">
                      {waitingEntries.map((entry, index) => (
                        <div key={entry._id} className="relative">
                          {userRole === 'secretary' && (
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
                                disabled={index === waitingEntries.length - 1}
                                className={`p-1 rounded ${index === waitingEntries.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                title="Move down"
                              >
                                <FaArrowDown size={14} />
                              </button>
                            </div>
                          )}
                          <SimplifiedQueueCard
                            queueEntry={entry}
                            onUpdateStatus={(status) => handleUpdateQueueEntry(entry._id, { status })}
                            onRemove={() => handleRemoveFromQueue(entry._id)}
                            onPrintTicket={() => handlePrintTicket(entry)}
                            userRole={userRole}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed and Other Patients */}
                {sortedQueueEntries.filter(entry => entry.status !== 'In Progress' && entry.status !== 'Waiting').length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                      <FaUserCheck className="mr-1" /> Completed / Other
                    </h4>
                    <div className="space-y-3">
                      {sortedQueueEntries
                        .filter(entry => entry.status !== 'In Progress' && entry.status !== 'Waiting')
                        .map(entry => (
                          <SimplifiedQueueCard
                            key={entry._id}
                            queueEntry={entry}
                            onUpdateStatus={(status) => handleUpdateQueueEntry(entry._id, { status })}
                            onRemove={() => handleRemoveFromQueue(entry._id)}
                            onPrintTicket={() => handlePrintTicket(entry)}
                            userRole={userRole}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              {todaysAppointments.length > 0 ? (
                <div className="queue-message">
                  <p className="text-gray-500 mb-2">No patients in the queue yet</p>
                  <p className="text-blue-600 mb-4">
                    There {todaysAppointments.length === 1 ? 'is' : 'are'} {todaysAppointments.length} appointment{todaysAppointments.length !== 1 ? 's' : ''} scheduled for today.
                  </p>
                  {userRole === 'secretary' && (
                    <div className="flex justify-center space-x-4 mt-4">
                      <button
                        onClick={() => setActiveTab('appointments')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center"
                      >
                        <FaCalendarCheck className="mr-2" />
                        View Today's Appointments
                      </button>
                      <button
                        onClick={() => setShowAddToQueueModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center"
                      >
                        <FaUserPlus className="mr-2" />
                        Add Walk-in Patient
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-4">No patients in the queue today</p>
                  {userRole === 'secretary' && (
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
          )}

          {/* Show Today's Appointments in Queue Tab */}
          {todaysAppointments.length > 0 && sortedQueueEntries.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-blue-800">Today's Appointments</h3>
                {todaysAppointments.filter(a => !a.isInQueue).length > 0 && userRole === 'secretary' && (
                  <button
                    onClick={() => {
                      const promises = todaysAppointments
                        .filter(a => !a.isInQueue)
                        .map(appointment => handleCheckInAppointment(appointment));

                      Promise.all(promises).then(() => {
                        fetchQueueData();
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
                  >
                    <FaUserCheck className="mr-1" />
                    Check In All
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {todaysAppointments.map(appointment => {
                  const isInQueue = appointment.isInQueue;
                  const appointmentId = appointment._id || appointment.id;
                  const patientName = appointment.patientName || 'Patient';
                  const appointmentType = appointment.type || 'Consultation';
                  const appointmentTime = appointment.optional_time || appointment.time;
                  const appointmentReason = appointment.reason;

                  return (
                    <div
                      key={appointmentId}
                      className={`p-4 rounded-lg border ${isInQueue ? 'border-green-200 bg-green-50' : 'border-gray-200'} flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-all duration-300`}
                    >
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-semibold text-lg">{patientName}</h3>
                          {isInQueue && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Already in queue
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="inline-block mr-4">
                            <span className="font-medium">Type:</span> {appointmentType}
                          </span>
                          {appointmentTime && (
                            <span className="inline-block mr-4">
                              <span className="font-medium">Time:</span> {appointmentTime}
                            </span>
                          )}
                          {appointmentReason && (
                            <span className="inline-block">
                              <span className="font-medium">Reason:</span> {appointmentReason}
                            </span>
                          )}
                        </div>
                      </div>

                      {!isInQueue && userRole === 'secretary' && (
                        <button
                          onClick={() => handleCheckInAppointment(appointment)}
                          className="mt-3 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
                        >
                          <FaUserCheck className="mr-1" />
                          Check In
                        </button>
                      )}

                      {isInQueue && (
                        <button
                          onClick={() => {
                            const queueEntry = queueEntries.find(entry =>
                              (entry.appointment_id?._id || entry.appointment_id) === appointmentId
                            );
                            if (queueEntry) {
                              handlePrintTicket(queueEntry);
                            }
                          }}
                          className="mt-3 md:mt-0 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm font-medium flex items-center"
                        >
                          <FaPrint className="mr-1" />
                          Print Ticket
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Today's Appointments */}
      {activeTab === 'appointments' && (
        <div className="space-y-3 mt-4">
          {todaysAppointments.length > 0 ? (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-blue-800">Today's Appointments</h3>
                {todaysAppointments.filter(a => !a.isInQueue).length > 0 && userRole === 'secretary' && (
                  <button
                    onClick={() => {
                      const promises = todaysAppointments
                        .filter(a => !a.isInQueue)
                        .map(appointment => handleCheckInAppointment(appointment));

                      Promise.all(promises).then(() => {
                        fetchQueueData();
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
                  >
                    <FaUserCheck className="mr-1" />
                    Check In All
                  </button>
                )}
              </div>
              <div className="appointment-list">
                {todaysAppointments.map(appointment => {
                  const isInQueue = appointment.isInQueue;
                  const appointmentId = appointment._id || appointment.id;
                  const patientName = appointment.patientName || 'Patient';
                  const appointmentType = appointment.type || 'Consultation';
                  const appointmentTime = appointment.optional_time;
                  const appointmentReason = appointment.reason;

                  return (
                    <div
                      key={appointmentId}
                      className={`p-4 rounded-lg border ${isInQueue ? 'border-green-200 bg-green-50' : 'border-gray-200'} flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-all duration-300`}
                    >
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-semibold text-lg">{patientName}</h3>
                          {isInQueue && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Already in queue
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="inline-block mr-4">
                            <span className="font-medium">Type:</span> {appointmentType}
                          </span>
                          {appointmentTime && (
                            <span className="inline-block mr-4">
                              <span className="font-medium">Time:</span> {appointmentTime}
                            </span>
                          )}
                          {appointmentReason && (
                            <span className="inline-block">
                              <span className="font-medium">Reason:</span> {appointmentReason}
                            </span>
                          )}
                        </div>
                      </div>

                      {!isInQueue && userRole === 'secretary' && (
                        <button
                          onClick={() => handleCheckInAppointment(appointment)}
                          className="mt-3 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center"
                        >
                          <FaUserCheck className="mr-1" />
                          Check In & Print Ticket
                        </button>
                      )}

                      {isInQueue && (
                        <button
                          onClick={() => {
                            const queueEntry = queueEntries.find(entry =>
                              (entry.appointment_id?._id || entry.appointment_id) === appointmentId
                            );
                            if (queueEntry) {
                              handlePrintTicket(queueEntry);
                            }
                          }}
                          className="mt-3 md:mt-0 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm font-medium flex items-center"
                        >
                          <FaPrint className="mr-1" />
                          Print Ticket
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No appointments scheduled for today</p>
            </div>
          )}
        </div>
      )}

      {/* Add to Queue Modal */}
      {showAddToQueueModal && (
        <SimplifiedAddToQueueModal
          patients={patients}
          appointments={appointments}
          onClose={() => setShowAddToQueueModal(false)}
          onSave={handleAddToQueue}
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

export default SimplifiedQueueManagement;
