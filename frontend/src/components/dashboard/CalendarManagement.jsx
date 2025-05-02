import { useState, useEffect, useMemo } from 'react';
import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { FaCalendarAlt, FaCalendarPlus } from 'react-icons/fa';
import apiService from '../../utils/apiService';
import CustomCalendar from '../CustomCalendar';
import './DashboardStyles.css';

// Setup the localizer for the calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarManagement = ({ role }) => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAppointments();
      setAppointments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await apiService.getPatients();
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  // Get patient name from patient ID
  const getPatientName = (patientId) => {
    if (!patientId) return 'Unknown Patient';
    
    if (typeof patientId === 'object' && patientId.name) {
      return patientId.name;
    }
    
    const patient = patients.find(p => p._id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  // Convert appointments to events format for the calendar
  const events = useMemo(() => {
    return appointments.map(appointment => {
      try {
        // Create proper date objects for start and end times
        let start, end;

        // Set all appointments to 9:00 AM for display purposes
        start = new Date(appointment.appointment_date || new Date());
        start.setHours(9, 0, 0, 0);

        // End time is 30 minutes after start time
        end = new Date(start);
        end.setMinutes(end.getMinutes() + 30);

        return {
          id: appointment._id,
          title: `${getPatientName(appointment.patient_id)} - ${appointment.type || 'Consultation'}`,
          start,
          end,
          resource: appointment, // Store the original appointment data
        };
      } catch (error) {
        console.error('Error converting appointment to event:', error, appointment);
        return null;
      }
    }).filter(Boolean); // Remove any null events
  }, [appointments, patients]);

  // Custom event component for the calendar
  const EventComponent = ({ event }) => {
    const appointment = event.resource;
    if (!appointment) return null;

    const statusStyles = {
      Scheduled: {
        container: 'bg-green-100',
        badge: 'bg-green-200 text-green-800'
      },
      Completed: {
        container: 'bg-blue-100',
        badge: 'bg-blue-200 text-blue-800'
      },
      Cancelled: {
        container: 'bg-red-100',
        badge: 'bg-red-200 text-red-800'
      },
      'In-progress': {
        container: 'bg-yellow-100',
        badge: 'bg-yellow-200 text-yellow-800'
      },
      'No-show': {
        container: 'bg-gray-100',
        badge: 'bg-gray-200 text-gray-800'
      },
      Rescheduled: {
        container: 'bg-purple-100',
        badge: 'bg-purple-200 text-purple-800'
      }
    };

    const status = appointment.status || 'Scheduled';
    const style = statusStyles[status] || statusStyles.Scheduled;
    const isCompleted = status === 'Completed';
    const isVisitorCreated = appointment.createdBy === 'visitor';

    return (
      <div
        className={`p-2 rounded ${style.container} ${isVisitorCreated ? 'border-l-2 border-amber-500' : ''}`}
        style={{ overflow: 'visible' }}
      >
        <div className="font-medium text-sm text-black">{getPatientName(appointment.patient_id)}</div>
        <div className="text-sm text-black">{appointment.reason || appointment.type || 'Consultation'}</div>
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs px-1 py-0.5 rounded-full ${style.badge}`}>
            {status}
          </span>
          {isCompleted && role === 'doctor' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddNotes(appointment._id);
              }}
              className="text-xs bg-purple-500 text-white px-1 py-0.5 rounded hover:bg-purple-600 font-medium"
            >
              Add Notes
            </button>
          )}
        </div>
      </div>
    );
  };

  // Handle selecting an event (appointment) on the calendar
  const handleSelectEvent = (event) => {
    const appointment = event.resource;
    if (!appointment) return;
    
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  // Handle selecting a slot (empty time) on the calendar
  const handleSelectSlot = ({ start }) => {
    const formattedDate = start.toISOString().split('T')[0];
    
    // Create a new appointment
    setSelectedAppointment({
      _id: null,
      patient_id: '',
      appointment_date: formattedDate,
      notes: '',
      status: 'Scheduled',
      type: 'Consultation',
      reason: ''
    });
    
    setShowAddModal(true);
  };

  // Handle adding notes to an appointment
  const handleAddNotes = (appointmentId) => {
    // Store the appointment ID in sessionStorage
    sessionStorage.setItem('selectedAppointmentForNote', appointmentId);

    // Redirect to the Notes tab using the correct URL format
    const currentPath = window.location.pathname;
    window.location.href = `${currentPath}?tab=notes`;
  };

  return (
    <div className="calendar-management">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Calendar</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          <FaCalendarPlus className="mr-2" />
          Add Appointment
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="h-[650px] bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <CustomCalendar
            localizer={localizer}
            events={events}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable={true}
            components={{
              event: EventComponent
            }}
            eventPropGetter={(event) => ({
              className: 'calendar-event',
              style: {
                backgroundColor: 'transparent', // We'll handle styling in the EventComponent
                color: '#000000' // ensure text is black for contrast
              }
            })}
          />
        </div>
      )}

      {/* We'll reuse the existing modals from AppointmentManagement */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Appointment</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Please go to the Appointments tab to add a new appointment.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-outline-primary mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  // Navigate to appointments tab
                  const currentPath = window.location.pathname;
                  window.location.href = `${currentPath}?tab=appointments`;
                }}
                className="btn btn-primary"
              >
                Go to Appointments
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Appointment Details</h2>
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-semibold">Patient:</span> {getPatientName(selectedAppointment.patient_id)}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-semibold">Date:</span> {new Date(selectedAppointment.appointment_date).toLocaleDateString()}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-semibold">Type:</span> {selectedAppointment.type}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-semibold">Status:</span> {selectedAppointment.status}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-semibold">Reason:</span> {selectedAppointment.reason || 'N/A'}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-semibold">Notes:</span> {selectedAppointment.notes || 'N/A'}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-outline-primary mr-2"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  // Navigate to appointments tab
                  const currentPath = window.location.pathname;
                  window.location.href = `${currentPath}?tab=appointments`;
                }}
                className="btn btn-primary"
              >
                Edit in Appointments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarManagement;
