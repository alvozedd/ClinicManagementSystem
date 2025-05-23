import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaGripVertical, FaCheck, FaTimes, FaEdit, FaNotesMedical, FaArrowUp, FaArrowDown, FaUndo } from 'react-icons/fa';
import apiService from '../../utils/apiService';
import './DashboardStyles.css';

const DraggableAppointments = ({ role }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch today's appointments
  // Function to fetch appointments
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

      // Check if there's a saved order in sessionStorage first (for current session)
      let customOrder = null;
      const sessionSavedOrder = sessionStorage.getItem('appointmentOrder');

      if (sessionSavedOrder && userHasReordered) {
        try {
          customOrder = JSON.parse(sessionSavedOrder);
          console.log('Using saved appointment order from sessionStorage');
        } catch (e) {
          console.error('Error parsing saved appointment order from sessionStorage:', e);
          sessionStorage.removeItem('appointmentOrder');
        }
      }

      // If no order in sessionStorage, check localStorage
      if (!customOrder && userHasReordered) {
        const localSavedOrder = localStorage.getItem('appointmentOrder');
        if (localSavedOrder) {
          try {
            customOrder = JSON.parse(localSavedOrder);
            console.log('Using saved appointment order from localStorage');
            // Copy to sessionStorage for current session
            sessionStorage.setItem('appointmentOrder', localSavedOrder);
          } catch (e) {
            console.error('Error parsing saved appointment order from localStorage:', e);
            localStorage.removeItem('appointmentOrder');
          }
        }
      }

      let sortedAppointments;

      if (customOrder && customOrder.length > 0) {
        // Create a map of appointment IDs to their positions
        const positionMap = new Map(customOrder.map(item => [item.id, item.position]));

        // Sort appointments based on the saved positions
        sortedAppointments = [...todayAppointments].sort((a, b) => {
          // First, handle completed appointments (always at the bottom)
          if (a.status === 'Completed' && b.status !== 'Completed') return 1;
          if (a.status !== 'Completed' && b.status === 'Completed') return -1;

          // If both are completed or both are not completed, use the custom order
          const posA = positionMap.get(a._id) || Number.MAX_SAFE_INTEGER;
          const posB = positionMap.get(b._id) || Number.MAX_SAFE_INTEGER;
          return posA - posB;
        });

        // Update the saved order if we have new appointments that aren't in the saved order
        const newOrderNeeded = sortedAppointments.some(appt => !positionMap.has(appt._id));
        if (newOrderNeeded) {
          console.log('Updating saved order with new appointments');
          const updatedOrder = sortedAppointments.map((appointment, idx) => ({
            id: appointment._id,
            position: idx + 1
          }));
          sessionStorage.setItem('appointmentOrder', JSON.stringify(updatedOrder));
          localStorage.setItem('appointmentOrder', JSON.stringify(updatedOrder));
        }
      } else {
        // Default sorting - completed ones at the bottom
        sortedAppointments = [...todayAppointments].sort((a, b) => {
          if (a.status === 'Completed' && b.status !== 'Completed') return 1;
          if (a.status !== 'Completed' && b.status === 'Completed') return -1;
          return 0;
        });
      }

      // Add ticket numbers only to scheduled appointments
      let ticketCounter = 1;
      const appointmentsWithTickets = sortedAppointments.map(appointment => {
        if (appointment.status === 'Scheduled') {
          return {
            ...appointment,
            ticketNumber: ticketCounter++
          };
        }
        return {
          ...appointment,
          ticketNumber: null
        };
      });

      setAppointments(appointmentsWithTickets);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Track if user has manually reordered appointments
  const [userHasReordered, setUserHasReordered] = useState(false);

  useEffect(() => {
    // Initial fetch of appointments
    fetchAppointments();

    // Check if there's a saved order in sessionStorage first (for current session)
    const sessionSavedOrder = sessionStorage.getItem('appointmentOrder');
    if (sessionSavedOrder) {
      try {
        const parsedOrder = JSON.parse(sessionSavedOrder);
        console.log('Found saved appointment order in sessionStorage:', parsedOrder);
        setUserHasReordered(true);
      } catch (e) {
        console.error('Error parsing saved appointment order from sessionStorage:', e);
        sessionStorage.removeItem('appointmentOrder');
      }
    } else {
      // If not in sessionStorage, check localStorage (for persistence across sessions)
      const localSavedOrder = localStorage.getItem('appointmentOrder');
      if (localSavedOrder) {
        try {
          const parsedOrder = JSON.parse(localSavedOrder);
          console.log('Found saved appointment order in localStorage:', parsedOrder);
          // Copy to sessionStorage for current session
          sessionStorage.setItem('appointmentOrder', localSavedOrder);
          setUserHasReordered(true);
        } catch (e) {
          console.error('Error parsing saved appointment order from localStorage:', e);
          localStorage.removeItem('appointmentOrder');
        }
      }
    }

    // Refresh appointments every 30 seconds, but only if user hasn't reordered
    const intervalId = setInterval(() => {
      if (!userHasReordered) {
        console.log('Auto-refreshing appointments (no user reordering detected)');
        fetchAppointments();
      } else {
        console.log('Skipping auto-refresh because user has manually reordered appointments');
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [userHasReordered]);

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

      // Sort to keep completed appointments at the bottom
      const sortedAppointments = [...newAppointments].sort((a, b) => {
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        return 0;
      });

      // Update ticket numbers only for scheduled appointments
      let ticketCounter = 1;
      const updatedAppointments = sortedAppointments.map(appointment => {
        if (appointment.status === 'Scheduled') {
          return {
            ...appointment,
            ticketNumber: ticketCounter++
          };
        }
        return {
          ...appointment,
          ticketNumber: null
        };
      });

      setAppointments(updatedAppointments);

      // Save the new order to the backend
      const orderData = updatedAppointments.map((appointment, index) => ({
        id: appointment._id,
        position: index + 1
      }));

      try {
        const result = await apiService.reorderAppointments(orderData);
        console.log('Appointment order saved successfully', result);

        // Mark that user has manually reordered appointments
        setUserHasReordered(true);

        // If the result indicates it's local only, show a warning
        if (result._isLocalOnly) {
          setError('Changes saved locally. The order will be maintained but may reset if you clear your browser data.');
        }
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
      // Update appointment status in the backend
      await apiService.updateAppointment(appointmentId, {
        status: 'Completed'
      });

      // Update local state and resort
      const updatedAppointments = appointments.map(appointment =>
        appointment._id === appointmentId
          ? { ...appointment, status: 'Completed', ticketNumber: null }
          : appointment
      );

      // Sort to move completed to bottom
      const sortedAppointments = [...updatedAppointments].sort((a, b) => {
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        return 0;
      });

      // Reassign ticket numbers
      let ticketCounter = 1;
      const finalAppointments = sortedAppointments.map(appointment => {
        if (appointment.status === 'Scheduled') {
          return {
            ...appointment,
            ticketNumber: ticketCounter++
          };
        }
        return {
          ...appointment,
          ticketNumber: null
        };
      });

      setAppointments(finalAppointments);

      // Update the order data in localStorage to reflect the completed appointment
      if (userHasReordered) {
        try {
          const savedOrder = localStorage.getItem('appointmentOrder');
          if (savedOrder) {
            const parsedOrder = JSON.parse(savedOrder);
            // Update the order to reflect the new status (completed appointments at the bottom)
            const updatedOrder = finalAppointments.map((appointment, idx) => ({
              id: appointment._id,
              position: idx + 1
            }));
            localStorage.setItem('appointmentOrder', JSON.stringify(updatedOrder));
          }
        } catch (e) {
          console.error('Error updating saved appointment order:', e);
        }
      } else {
        // Only fetch appointments if user hasn't manually reordered
        setTimeout(() => {
          fetchAppointments();
        }, 1000);
      }
    } catch (err) {
      console.error('Error completing appointment:', err);
      setError('Failed to complete appointment. Please try again.');
    }
  };

  // Handle edit appointment
  const handleEditAppointment = (appointmentId) => {
    // Navigate to the main appointments tab with edit modal open
    const appointment = appointments.find(apt => apt._id === appointmentId);
    if (appointment) {
      // Store the appointment ID in sessionStorage to be picked up by AppointmentManagement
      sessionStorage.setItem('editAppointmentId', appointmentId);

      // Redirect to the appointments tab
      const currentPath = window.location.pathname;
      window.location.href = `${currentPath}?tab=appointments&view=all&edit=true`;
    }
  };

  // Handle add notes
  const handleAddNotes = (appointmentId) => {
    // Store the appointment ID in sessionStorage
    sessionStorage.setItem('selectedAppointmentForNote', appointmentId);

    // Redirect to the Notes tab
    const currentPath = window.location.pathname;
    window.location.href = `${currentPath}?tab=notes`;
  };

  // Move appointment up in the list
  const moveAppointmentUp = async (index) => {
    if (index <= 0) return; // Already at the top

    try {
      // Create a copy of the appointments array
      const newAppointments = Array.from(appointments);

      // Swap the appointment with the one above it
      [newAppointments[index], newAppointments[index - 1]] =
      [newAppointments[index - 1], newAppointments[index]];

      // Update ticket numbers for scheduled appointments
      let ticketCounter = 1;
      const updatedAppointments = newAppointments.map(appointment => {
        if (appointment.status === 'Scheduled') {
          return {
            ...appointment,
            ticketNumber: ticketCounter++
          };
        }
        return {
          ...appointment,
          ticketNumber: null
        };
      });

      setAppointments(updatedAppointments);

      // Save the new order to the backend
      const orderData = updatedAppointments.map((appointment, idx) => ({
        id: appointment._id,
        position: idx + 1
      }));

      const result = await apiService.reorderAppointments(orderData);

      // Mark that user has manually reordered appointments
      setUserHasReordered(true);

      // If the result indicates it's local only, show a warning
      if (result._isLocalOnly) {
        setError('Changes saved locally. The order will be maintained but may reset if you clear your browser data.');
      }
    } catch (err) {
      console.error('Error moving appointment up:', err);
      setError('Failed to reorder appointments. Please try again.');
    }
  };

  // Move appointment down in the list
  const moveAppointmentDown = async (index) => {
    if (index >= appointments.length - 1) return; // Already at the bottom

    try {
      // Create a copy of the appointments array
      const newAppointments = Array.from(appointments);

      // Swap the appointment with the one below it
      [newAppointments[index], newAppointments[index + 1]] =
      [newAppointments[index + 1], newAppointments[index]];

      // Update ticket numbers for scheduled appointments
      let ticketCounter = 1;
      const updatedAppointments = newAppointments.map(appointment => {
        if (appointment.status === 'Scheduled') {
          return {
            ...appointment,
            ticketNumber: ticketCounter++
          };
        }
        return {
          ...appointment,
          ticketNumber: null
        };
      });

      setAppointments(updatedAppointments);

      // Save the new order to the backend
      const orderData = updatedAppointments.map((appointment, idx) => ({
        id: appointment._id,
        position: idx + 1
      }));

      const result = await apiService.reorderAppointments(orderData);

      // Mark that user has manually reordered appointments
      setUserHasReordered(true);

      // If the result indicates it's local only, show a warning
      if (result._isLocalOnly) {
        setError('Changes saved locally. The order will be maintained but may reset if you clear your browser data.');
      }
    } catch (err) {
      console.error('Error moving appointment down:', err);
      setError('Failed to reorder appointments. Please try again.');
    }
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
      <Draggable
        key={appointment._id}
        draggableId={appointment._id}
        index={index}
        isDragDisabled={appointment.status === 'Completed'}
      >
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
                <>
                  <button
                    className="btn-icon btn-complete"
                    onClick={() => handleCompleteAppointment(appointment._id)}
                    title="Complete"
                    aria-label="Complete appointment"
                  >
                    <FaCheck />
                  </button>
                  <button
                    className="btn-icon btn-up"
                    onClick={() => moveAppointmentUp(index)}
                    title="Move Up"
                    aria-label="Move appointment up"
                    disabled={index === 0}
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    className="btn-icon btn-down"
                    onClick={() => moveAppointmentDown(index)}
                    title="Move Down"
                    aria-label="Move appointment down"
                    disabled={index === appointments.length - 1}
                  >
                    <FaArrowDown />
                  </button>
                </>
              )}
              <button
                className="btn-icon btn-edit"
                onClick={() => handleEditAppointment(appointment._id)}
                title="Edit"
                aria-label="Edit appointment"
              >
                <FaEdit />
              </button>
              {isCompleted && role === 'doctor' && (
                <button
                  className="btn-icon btn-notes"
                  onClick={() => handleAddNotes(appointment._id)}
                  title="Add Notes"
                  aria-label="Add notes to appointment"
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

  // Reset the custom order and fetch appointments with default order
  const resetOrder = () => {
    // Clear both localStorage and sessionStorage
    localStorage.removeItem('appointmentOrder');
    sessionStorage.removeItem('appointmentOrder');
    setUserHasReordered(false);
    fetchAppointments();
    setError(null);
  };

  return (
    <div className="draggable-appointments">
      <div className="appointments-header">
        <h2>Today's Appointments</h2>
        <div className="appointments-stats">
          <span className="appointments-count">
            {appointments.length} appointments
          </span>
          {userHasReordered && (
            <button
              onClick={resetOrder}
              className="btn btn-sm btn-outline-secondary ml-2"
              title="Reset to default order"
            >
              <FaUndo className="mr-1" /> Reset Order
            </button>
          )}
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
