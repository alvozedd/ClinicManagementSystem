import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaArrowUp, FaArrowDown, FaCheck, FaTrash, FaPlus, FaCalendarPlus } from 'react-icons/fa';
import apiService from '../../utils/apiService';
import './DashboardStyles.css';

const QueueManagement = ({ role }) => {
  const [queueData, setQueueData] = useState({ queue: { appointments: [] }, availableAppointments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCount, setActiveCount] = useState(0);

  // Fetch queue data on component mount
  useEffect(() => {
    fetchQueueData();
  }, []);

  // Calculate active count whenever queue data changes
  useEffect(() => {
    if (queueData && queueData.queue && queueData.queue.appointments) {
      const count = queueData.queue.appointments.filter(item => item.active).length;
      setActiveCount(count);
    }
  }, [queueData]);

  // Fetch queue data from API
  const fetchQueueData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTodayQueue();
      setQueueData(data);
    } catch (err) {
      console.error('Error fetching queue data:', err);
      setError('Failed to load queue data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle drag end event
  const handleDragEnd = async (result) => {
    // Drop outside the list
    if (!result.destination) {
      return;
    }

    // No change in position
    if (result.destination.index === result.source.index) {
      return;
    }

    // Create a copy of the queue appointments
    const appointments = [...queueData.queue.appointments];
    
    // Get the dragged item
    const [reorderedItem] = appointments.splice(result.source.index, 1);
    
    // Insert the item at the new position
    appointments.splice(result.destination.index, 0, reorderedItem);
    
    // Update the local state immediately for a responsive UI
    setQueueData({
      ...queueData,
      queue: {
        ...queueData.queue,
        appointments
      }
    });

    // Get the appointment IDs in the new order
    const appointmentIds = appointments.map(item => item.appointment_id._id);
    
    try {
      // Update the queue order in the backend
      await apiService.reorderQueue(appointmentIds);
    } catch (err) {
      console.error('Error reordering queue:', err);
      setError('Failed to update queue order. Please try again.');
      // Revert to the original order if the API call fails
      fetchQueueData();
    }
  };

  // Add an appointment to the queue
  const handleAddToQueue = async (appointmentId) => {
    try {
      setLoading(true);
      await apiService.addToQueue(appointmentId);
      fetchQueueData();
    } catch (err) {
      console.error('Error adding to queue:', err);
      setError('Failed to add appointment to queue. Please try again.');
      setLoading(false);
    }
  };

  // Mark an appointment as completed
  const handleCompleteAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      await apiService.completeQueueAppointment(appointmentId);
      fetchQueueData();
    } catch (err) {
      console.error('Error completing appointment:', err);
      setError('Failed to mark appointment as completed. Please try again.');
      setLoading(false);
    }
  };

  // Remove an appointment from the queue
  const handleRemoveFromQueue = async (appointmentId) => {
    if (window.confirm('Are you sure you want to remove this appointment from the queue?')) {
      try {
        setLoading(true);
        await apiService.removeFromQueue(appointmentId);
        fetchQueueData();
      } catch (err) {
        console.error('Error removing from queue:', err);
        setError('Failed to remove appointment from queue. Please try again.');
        setLoading(false);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render the queue list
  const renderQueueList = () => {
    const activeAppointments = queueData.queue.appointments.filter(item => item.active);
    const completedAppointments = queueData.queue.appointments.filter(item => !item.active);

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">
          Queue ({activeCount} active)
        </h3>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="queue">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {activeAppointments.map((item, index) => (
                  <Draggable 
                    key={item.appointment_id._id} 
                    draggableId={item.appointment_id._id} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-3 rounded-lg border ${
                          snapshot.isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200 dark:border-gray-700'
                        } bg-white dark:bg-gray-800 flex items-center justify-between`}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-bold mr-3">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium dark:text-white">
                              {item.appointment_id.patient_id.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(item.appointment_id.appointment_date)}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCompleteAppointment(item.appointment_id._id)}
                            className="p-1.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full hover:bg-green-200 dark:hover:bg-green-800"
                            title="Mark as completed"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleRemoveFromQueue(item.appointment_id._id)}
                            className="p-1.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full hover:bg-red-200 dark:hover:bg-red-800"
                            title="Remove from queue"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {activeAppointments.length === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 italic">
            No active appointments in the queue.
          </div>
        )}

        {completedAppointments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">
              Completed ({completedAppointments.length})
            </h3>
            <div className="space-y-2">
              {completedAppointments.map((item, index) => (
                <div
                  key={item.appointment_id._id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between opacity-70"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full font-bold mr-3">
                      ✓
                    </div>
                    <div>
                      <div className="font-medium dark:text-gray-300">
                        {item.appointment_id.patient_id.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(item.appointment_id.appointment_date)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Completed at {new Date(item.completed_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render available appointments that can be added to the queue
  const renderAvailableAppointments = () => {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2 dark:text-white">
          Today's Appointments ({queueData.availableAppointments.length})
        </h3>
        
        {queueData.availableAppointments.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 italic">
            No more appointments available to add to the queue.
          </div>
        ) : (
          <div className="space-y-2">
            {queueData.availableAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium dark:text-white">
                    {appointment.patient_id.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(appointment.appointment_date)} - {appointment.type}
                  </div>
                </div>
                <button
                  onClick={() => handleAddToQueue(appointment._id)}
                  className="p-1.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                  title="Add to queue"
                >
                  <FaPlus />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white">Queue Management</h2>
        <button
          onClick={fetchQueueData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 dark:bg-red-900 dark:text-red-200">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            {renderQueueList()}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            {renderAvailableAppointments()}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueManagement;
