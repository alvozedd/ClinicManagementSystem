import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaGripVertical, FaCheck, FaTimes, FaUserClock } from 'react-icons/fa';
import apiService from '../../utils/apiService';
import './DashboardStyles.css';

const QueueList = ({ role }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);

  // Fetch today's queue and appointments
  useEffect(() => {
    const fetchQueueAndAppointments = async () => {
      try {
        setLoading(true);
        
        // Fetch today's queue
        const queueData = await apiService.getTodayQueue();
        setQueue(queueData);
        
        // Fetch today's appointments that are not in the queue
        const today = new Date().toISOString().split('T')[0];
        const appointmentsData = await apiService.getIntegratedAppointments({
          today_only: true
        });
        
        // Filter out appointments that are already in the queue
        const queueIds = queueData.map(item => item._id);
        const notInQueue = appointmentsData.filter(
          appointment => !queueIds.includes(appointment._id) && 
                        appointment.status === 'Scheduled'
        );
        
        setTodayAppointments(notInQueue);
      } catch (err) {
        console.error('Error fetching queue data:', err);
        setError('Failed to load queue data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQueueAndAppointments();
    
    // Refresh queue every 30 seconds
    const intervalId = setInterval(fetchQueueAndAppointments, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Handle drag end event
  const handleDragEnd = async (result) => {
    const { destination, source } = result;
    
    // If dropped outside the list or no movement
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    try {
      // Reorder the queue locally first for immediate UI update
      const newQueue = Array.from(queue);
      const [removed] = newQueue.splice(source.index, 1);
      newQueue.splice(destination.index, 0, removed);
      
      // Update queue positions
      const updatedQueue = newQueue.map((item, index) => ({
        ...item,
        queue_position: index + 1
      }));
      
      setQueue(updatedQueue);
      
      // Prepare data for API call
      const queueOrder = updatedQueue.map((item, index) => ({
        id: item._id,
        position: index + 1
      }));
      
      // Call API to update queue order
      await apiService.reorderQueue(queueOrder);
    } catch (err) {
      console.error('Error reordering queue:', err);
      setError('Failed to reorder queue. Please try again.');
      
      // Refresh queue to get the correct order
      const queueData = await apiService.getTodayQueue();
      setQueue(queueData);
    }
  };

  // Add appointment to queue
  const handleAddToQueue = async (appointmentId) => {
    try {
      // Call API to add appointment to queue
      const updatedAppointment = await apiService.addToQueue(appointmentId);
      
      // Update local state
      const updatedTodayAppointments = todayAppointments.filter(
        appointment => appointment._id !== appointmentId
      );
      setTodayAppointments(updatedTodayAppointments);
      
      // Refresh queue
      const queueData = await apiService.getTodayQueue();
      setQueue(queueData);
    } catch (err) {
      console.error('Error adding to queue:', err);
      setError('Failed to add appointment to queue. Please try again.');
    }
  };

  // Remove appointment from queue
  const handleRemoveFromQueue = async (appointmentId) => {
    try {
      // Call API to remove appointment from queue
      await apiService.removeFromQueue(appointmentId);
      
      // Refresh queue and appointments
      const queueData = await apiService.getTodayQueue();
      setQueue(queueData);
      
      const today = new Date().toISOString().split('T')[0];
      const appointmentsData = await apiService.getIntegratedAppointments({
        today_only: true
      });
      
      // Filter out appointments that are already in the queue
      const queueIds = queueData.map(item => item._id);
      const notInQueue = appointmentsData.filter(
        appointment => !queueIds.includes(appointment._id) && 
                      appointment.status === 'Scheduled'
      );
      
      setTodayAppointments(notInQueue);
    } catch (err) {
      console.error('Error removing from queue:', err);
      setError('Failed to remove appointment from queue. Please try again.');
    }
  };

  // Mark appointment as completed
  const handleCompleteAppointment = async (appointmentId) => {
    try {
      // Call API to complete appointment
      await apiService.updateIntegratedAppointment(appointmentId, {
        status: 'Completed'
      });
      
      // Remove from queue
      await apiService.removeFromQueue(appointmentId);
      
      // Refresh queue
      const queueData = await apiService.getTodayQueue();
      setQueue(queueData);
    } catch (err) {
      console.error('Error completing appointment:', err);
      setError('Failed to complete appointment. Please try again.');
    }
  };

  // Reset queue
  const handleResetQueue = async () => {
    if (window.confirm('Are you sure you want to reset the queue? This will remove all patients from the queue.')) {
      try {
        await apiService.resetQueue();
        
        // Refresh queue and appointments
        const queueData = await apiService.getTodayQueue();
        setQueue(queueData);
        
        const today = new Date().toISOString().split('T')[0];
        const appointmentsData = await apiService.getIntegratedAppointments({
          today_only: true
        });
        
        setTodayAppointments(appointmentsData);
      } catch (err) {
        console.error('Error resetting queue:', err);
        setError('Failed to reset queue. Please try again.');
      }
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render queue item
  const renderQueueItem = (item, index) => {
    const patientName = item.patient_id?.name || 'Unknown Patient';
    const patientGender = item.patient_id?.gender || '';
    const patientPhone = item.patient_id?.phone || '';
    
    return (
      <Draggable key={item._id} draggableId={item._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`queue-item ${snapshot.isDragging ? 'dragging' : ''} ${
              item.status === 'Completed' ? 'completed' : ''
            }`}
          >
            <div className="queue-number">{index + 1}</div>
            <div className="queue-grip" {...provided.dragHandleProps}>
              <FaGripVertical />
            </div>
            <div className="queue-content">
              <div className="queue-patient-name">{patientName}</div>
              <div className="queue-patient-info">
                {patientGender && <span>{patientGender}</span>}
                {patientPhone && <span>{patientPhone}</span>}
              </div>
              <div className="queue-appointment-info">
                {item.reason && <span>{item.reason}</span>}
                {item.check_in_time && (
                  <span>Checked in: {formatTime(item.check_in_time)}</span>
                )}
              </div>
            </div>
            <div className="queue-actions">
              <button
                className="btn-icon btn-complete"
                onClick={() => handleCompleteAppointment(item._id)}
                title="Complete"
              >
                <FaCheck />
              </button>
              <button
                className="btn-icon btn-remove"
                onClick={() => handleRemoveFromQueue(item._id)}
                title="Remove from queue"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  // Render appointment item that can be added to queue
  const renderAppointmentItem = (appointment) => {
    const patientName = appointment.patient_id?.name || 'Unknown Patient';
    
    return (
      <div key={appointment._id} className="appointment-item">
        <div className="appointment-content">
          <div className="appointment-patient-name">{patientName}</div>
          <div className="appointment-info">
            {appointment.reason && <span>{appointment.reason}</span>}
            {appointment.type && <span>{appointment.type}</span>}
          </div>
        </div>
        <div className="appointment-actions">
          <button
            className="btn-icon btn-add"
            onClick={() => handleAddToQueue(appointment._id)}
            title="Add to queue"
          >
            <FaUserClock />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="queue-management">
      <div className="queue-header">
        <h2>Today's Queue</h2>
        <div className="queue-stats">
          <span className="queue-count">
            {queue.filter(item => item.status !== 'Completed').length} active
          </span>
          <button className="btn btn-reset" onClick={handleResetQueue}>
            Reset Queue
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading queue...</div>
      ) : (
        <div className="queue-container">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="queue">
              {(provided) => (
                <div
                  className="queue-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {queue.length === 0 ? (
                    <div className="empty-queue">No patients in queue</div>
                  ) : (
                    queue.map((item, index) => renderQueueItem(item, index))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="appointments-section">
            <h3>Today's Appointments</h3>
            {todayAppointments.length === 0 ? (
              <div className="empty-appointments">No appointments available</div>
            ) : (
              <div className="appointments-list">
                {todayAppointments.map(renderAppointmentItem)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueList;
