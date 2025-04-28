import { useState, useEffect } from 'react';
import { FaUserPlus, FaSync, FaUserClock, FaUserCheck, FaUserTimes, FaPrint } from 'react-icons/fa';
import apiService from '../utils/apiService';
import QueueCard from './QueueCard';
import AddToQueueModal from './AddToQueueModal';
import QueueStats from './QueueStats';
import QueueTicketPrint from './QueueTicketPrint';

function QueueManagement({ patients, appointments, userRole }) {
  const [queueEntries, setQueueEntries] = useState([]);
  const [queueStats, setQueueStats] = useState({
    totalPatients: 0,
    waitingPatients: 0,
    inProgressPatients: 0,
    completedPatients: 0,
    walkInPatients: 0,
    appointmentPatients: 0,
    avgServiceTime: 0,
    nextTicketNumber: 1,
  });
  const [loading, setLoading] = useState(false);
  const [showAddToQueueModal, setShowAddToQueueModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
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

  // Filter queue entries based on status
  const filteredEntries = statusFilter === 'All'
    ? queueEntries
    : queueEntries.filter(entry => entry.status === statusFilter);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-bold text-blue-800 mb-3 md:mb-0">Patient Queue Management</h2>
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

      {/* Queue Statistics */}
      <QueueStats stats={queueStats} />

      {/* Status Filter */}
      <div className="mb-4 border-b border-gray-200">
        <div className="flex flex-wrap -mb-px">
          {['All', 'Waiting', 'In Progress', 'Completed', 'No-show', 'Cancelled'].map(status => (
            <button
              key={status}
              className={`mr-2 py-2 px-4 text-sm font-medium border-b-2 focus:outline-none ${
                statusFilter === status
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-3 mt-4">
        {filteredEntries.length > 0 ? (
          filteredEntries.map(entry => (
            <QueueCard
              key={entry._id}
              queueEntry={entry}
              onUpdateStatus={(status) => handleUpdateQueueEntry(entry._id, { status })}
              onRemove={() => handleRemoveFromQueue(entry._id)}
              onPrintTicket={() => handlePrintTicket(entry)}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No patients in the queue with status: {statusFilter}</p>
          </div>
        )}
      </div>

      {/* Add to Queue Modal */}
      {showAddToQueueModal && (
        <AddToQueueModal
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

export default QueueManagement;
