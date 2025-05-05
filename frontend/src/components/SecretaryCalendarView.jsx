import React, { useState, useCallback, useMemo } from 'react';
import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import AppointmentManagementModal from './AppointmentManagementModal';
import CustomCalendar from './CustomCalendar';
import { transformAppointmentFromBackend } from '../utils/dataTransformers';

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

function SecretaryCalendarView({ appointments, onUpdateAppointment, onViewPatient }) {
  const [managingAppointment, setManagingAppointment] = useState(null);
  const [isNewAppointment, setIsNewAppointment] = useState(false);

  // Convert appointments to events format for the calendar
  const events = useMemo(() => {
    return appointments.map(appointment => {
      try {
        // Create proper date objects for start and end times
        let start, end;

        // We no longer use time for appointments
        // Just set all appointments to 9:00 AM for display purposes
        start = new Date(appointment.date || new Date());
        start.setHours(9, 0, 0, 0);

        // End time is 30 minutes after start time
        end = new Date(start);
        end.setMinutes(end.getMinutes() + 30);

        return {
          id: appointment.id,
          title: `${appointment.patientName || 'Unknown'} - ${appointment.reason || 'Consultation'}`,
          start,
          end,
          resource: appointment, // Store the original appointment data
        };
      } catch (error) {
        console.error('Error creating event for appointment:', appointment, error);
        return null;
      }
    }).filter(Boolean); // Remove any null events
  }, [appointments]);

  // Handle clicking on an event (appointment)
  const handleSelectEvent = useCallback((event) => {
    const appointment = event.resource;
    if (appointment) {
      if (onViewPatient) {
        onViewPatient(appointment.patientId);
      }
    }
  }, [onViewPatient]);

  // Custom event component to show appointment details
  const EventComponent = ({ event }) => {
    const appointment = event.resource;
    const isCompleted = appointment.status === 'Completed';

    // Define styles based on appointment status
    let statusStyles = {};
    switch(appointment.status) {
      case 'Completed':
        statusStyles = { container: 'bg-blue-50 border-l-4 border-blue-400', badge: 'bg-blue-100 text-blue-800' };
        break;
      case 'Scheduled':
        statusStyles = { container: 'bg-emerald-50 border-l-4 border-emerald-400', badge: 'bg-emerald-100 text-emerald-800' };
        break;
      case 'Cancelled':
        statusStyles = { container: 'bg-red-50 border-l-4 border-red-400', badge: 'bg-red-100 text-red-800' };
        break;
      case 'Rescheduled':
        statusStyles = { container: 'bg-purple-50 border-l-4 border-purple-400', badge: 'bg-purple-100 text-purple-800' };
        break;
      case 'Pending':
        statusStyles = { container: 'bg-amber-50 border-l-4 border-amber-400', badge: 'bg-amber-100 text-amber-800' };
        break;
      default:
        statusStyles = { container: 'bg-gray-50 border-l-4 border-gray-400', badge: 'bg-gray-100 text-gray-800' };
    }

    return (
      <div
        className={`p-2 rounded ${statusStyles.container}`}
        style={{ overflow: 'visible' }}
      >
        <div className="font-medium text-sm text-black">{appointment.patientName}</div>
        <div className="text-sm text-black">{appointment.reason}</div>
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs px-1 py-0.5 rounded-full ${statusStyles.badge}`}>
            {appointment.status}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setManagingAppointment(appointment);
              setIsNewAppointment(false);
            }}
            className="text-xs bg-blue-500 text-black px-1 py-0.5 rounded hover:bg-blue-600 font-medium"
          >
            Edit
          </button>
        </div>
      </div>
    );
  };

  // Handle saving appointment changes
  const handleSaveAppointment = (updatedAppointment) => {
    // Make sure we're passing the appointment with the correct format
    // The Dashboard component expects to receive the appointment and then transform it
    // No need to transform here as the Dashboard will handle that
    console.log('SecretaryCalendarView - Saving appointment:', updatedAppointment);
    onUpdateAppointment(updatedAppointment);
    setManagingAppointment(null);
    setIsNewAppointment(false);
  };

  // Handle selecting a slot to create a new appointment
  const handleSelectSlot = useCallback((slotInfo) => {
    try {
      // Make sure we're working with a proper Date object
      const startDate = new Date(slotInfo.start);

      // We no longer use time for appointments

      // Format the date as YYYY-MM-DD
      const formattedDate = startDate.toISOString().split('T')[0];

      console.log('Creating appointment for date:', formattedDate);

      setManagingAppointment({
        id: 'new-' + Date.now(),
        date: formattedDate,

        type: 'Consultation',
        reason: '',
        status: 'Scheduled'
      });
      setIsNewAppointment(true);
    } catch (error) {
      console.error('Error creating appointment from slot:', error);
      // Fallback to current date
      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];

      setManagingAppointment({
        id: 'new-' + Date.now(),
        date: formattedDate,

        type: 'Consultation',
        reason: '',
        status: 'Scheduled'
      });
      setIsNewAppointment(true);
    }
  }, []);

  return (
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Appointment Calendar</h2>
        <p className="text-sm text-gray-600">Click on an appointment to view patient details or click on an empty slot to create a new appointment</p>
      </div>

      <div className="h-[650px]">
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
              backgroundColor: event.resource?.status === 'Completed' ? '#93c5fd' : // darker blue for better contrast
                             event.resource?.status === 'Scheduled' ? '#6ee7b7' : // darker green for better contrast
                             event.resource?.status === 'Cancelled' ? '#fca5a5' : // darker red for better contrast
                             event.resource?.status === 'Pending' ? '#fcd34d' : // darker amber for better contrast
                             event.resource?.status === 'Rescheduled' ? '#c4b5fd' : // darker purple for better contrast
                             '#d1d5db', // darker gray for better contrast
              color: '#000000', // ensure text is black for contrast
              fontWeight: '600' // bolder text for better readability
            }
          })}
        />
      </div>

      {/* Appointment Management Modal */}
      {managingAppointment && (
        <AppointmentManagementModal
          appointment={managingAppointment}
          isNew={isNewAppointment}
          onClose={() => {
            setManagingAppointment(null);
            setIsNewAppointment(false);
          }}
          onSave={handleSaveAppointment}
        />
      )}
    </div>
  );
}

export default SecretaryCalendarView;
