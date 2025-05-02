import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaGripVertical, FaCheck, FaTimes, FaEdit, FaNotesMedical } from 'react-icons/fa';
import apiService from '../../utils/apiService';
import './DashboardStyles.css';

const DraggableAppointments = ({ role }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch today's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);

        // Fetch today's appointments
        const today = new Date().toISOString().split('T')[0];
        const appointmentsData = await apiService.getAppointments();

        // Filter for today's appointments
        const todayAppointments = appointmentsData.filter(appointment => {
          const appointmentDate = appointment.appointment_date
            ? appointment.appointment_date.split('T')[0]
            : appointment.date;
          return appointmentDate === today;
        });

        // Add ticket numbers to appointments
        const appointmentsWithTickets = todayAppointments.map((appointment, index) => ({
          ...appointment,
          ticketNumber: index + 1
        }));

        setAppointments(appointmentsWithTickets);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Refresh appointments every 30 seconds
    const intervalId = setInterval(fetchAppointments, 30000);

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
      // Reorder the appointments locally first for immediate UI update
      const newAppointments = Array.from(appointments);
      const [removed] = newAppointments.splice(source.index, 1);
      newAppointments.splice(destination.index, 0, removed);

      // Update ticket numbers
      const updatedAppointments = newAppointments.map((appointment, index) => ({
        ...appointment,
        ticketNumber: index + 1
      }));

      setAppointments(updatedAppointments);

      // Save the new order to the backend
      const orderData = updatedAppointments.map((appointment, index) => ({
        id: appointment._id,
        position: index + 1
      }));

      try {
        await apiService.reorderAppointments(orderData);
        console.log('Appointment order saved successfully');
      } catch (orderError) {
        console.error('Failed to save appointment order:', orderError);
        setError('Failed to save the new appointment order. The visual order will be maintained but may reset on refresh.');
      }
    } catch (err) {
      console.error('Error reordering appointments:', err);
      setError('Failed to reorder appointments. Please try again.');
    }
  };

  // Mark appointment as completed
  const handleCompleteAppointment = async (appointmentId) => {
    try {
      // Update appointment status
      await apiService.updateAppointment(appointmentId, {
        status: 'Completed'
      });

      // Update local state
      setAppointments(appointments.map(appointment =>
        appointment._id === appointmentId
          ? { ...appointment, status: 'Completed' }
          : appointment
      ));
    } catch (err) {
      console.error('Error completing appointment:', err);
      setError('Failed to complete appointment. Please try again.');
    }
  };

  // Handle edit appointment
  const handleEditAppointment = (appointmentId) => {
    // Implement edit functionality or navigate to edit page
    console.log('Edit appointment:', appointmentId);
  };

  // Handle add notes
  const handleAddNotes = (appointmentId) => {
    // Store the appointment ID in sessionStorage
    sessionStorage.setItem('selectedAppointmentForNote', appointmentId);

    // Redirect to the Notes tab
    const currentPath = window.location.pathname;
    window.location.href = `${currentPath}?tab=notes`;
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get patient name
  const getPatientName = (appointment) => {
    return appointment.patientName ||
           appointment.patient_name ||
           (appointment.patient_id && appointment.patient_id.name) ||
           'Unknown Patient';
  };

  // Render appointment item
  const renderAppointmentItem = (appointment, index) => {
    const patientName = getPatientName(appointment);
    const isCompleted = appointment.status === 'Completed';

    return (
      <Draggable key={appointment._id} draggableId={appointment._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`appointment-card ${snapshot.isDragging ? 'dragging' : ''} ${
              isCompleted ? 'completed-appointment' : ''
            } ${appointment.createdBy === 'visitor' ? 'visitor-appointment' : ''}`}
          >
            {appointment.status === 'Scheduled' && (
              <div className="ticket-number">{appointment.ticketNumber}</div>
            )}
            <div className="appointment-grip" {...provided.dragHandleProps}>
              <FaGripVertical />
            </div>
            <div className="appointment-content">
              <div className="appointment-patient-name">{patientName}</div>
              <div className="appointment-info">
                <span>{appointment.type || 'Consultation'}</span>
                {appointment.reason && <span>{appointment.reason}</span>}
              </div>
            </div>
            <div className="appointment-status">
              <span className={`badge ${
                appointment.status === 'Scheduled' ? 'badge-blue' :
                appointment.status === 'Completed' ? 'badge-green' :
                appointment.status === 'Cancelled' ? 'badge-red' :
                'badge-gray'
              }`}>
                {appointment.status}
              </span>
            </div>
            <div className="appointment-actions">
              {!isCompleted && (
                <button
                  className="btn-icon btn-complete"
                  onClick={() => handleCompleteAppointment(appointment._id)}
                  title="Complete"
                >
                  <FaCheck />
                </button>
              )}
              <button
                className="btn-icon btn-edit"
                onClick={() => handleEditAppointment(appointment._id)}
                title="Edit"
              >
                <FaEdit />
              </button>
              {isCompleted && (
                <button
                  className="btn-icon btn-notes"
                  onClick={() => handleAddNotes(appointment._id)}
                  title="Add Notes"
                >
                  <FaNotesMedical />
                </button>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="draggable-appointments">
      <div className="appointments-header">
        <h2>Today's Appointments</h2>
        <div className="appointments-stats">
          <span className="appointments-count">
            {appointments.length} appointments
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : (
        <div className="appointments-container">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="appointments">
              {(provided) => (
                <div
                  className="appointments-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {appointments.length === 0 ? (
                    <div className="empty-appointments">No appointments for today</div>
                  ) : (
                    appointments.map((appointment, index) => renderAppointmentItem(appointment, index))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  );
};

export default DraggableAppointments;
