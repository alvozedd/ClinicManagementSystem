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

        // Handle time parsing safely
        try {
          const [hours, minutes] = (appointment.time || '09:00').split(':').map(Number);
          start = new Date(appointment.date || new Date());
          start.setHours(hours || 9, minutes || 0, 0, 0);

          // End time is 30 minutes after start time
          end = new Date(start);
          end.setMinutes(end.getMinutes() + 30);
        } catch (error) {
          console.warn('Error parsing date/time for appointment:', appointment.id, error);
          // Fallback to current date/time
          start = new Date();
          end = new Date(start);
          end.setMinutes(end.getMinutes() + 30);
        }

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
        statusStyles = { container: 'bg-blue-100 border-l-4 border-blue-500', badge: 'bg-blue-200 text-blue-800' };
        break;
      case 'Scheduled':
        statusStyles = { container: 'bg-yellow-100 border-l-4 border-yellow-500', badge: 'bg-yellow-200 text-yellow-800' };
        break;
      case 'Cancelled':
        statusStyles = { container: 'bg-red-100 border-l-4 border-red-500', badge: 'bg-red-200 text-red-800' };
        break;
      case 'Rescheduled':
        statusStyles = { container: 'bg-purple-100 border-l-4 border-purple-500', badge: 'bg-purple-200 text-purple-800' };
        break;
      default:
        statusStyles = { container: 'bg-gray-100 border-l-4 border-gray-500', badge: 'bg-gray-200 text-gray-800' };
    }

    return (
      <div
        className={`p-1 rounded ${statusStyles.container}`}
        style={{ overflow: 'hidden' }}
      >
        <div className="font-medium text-xs">{appointment.time} - {appointment.patientName}</div>
        <div className="text-xs truncate">{appointment.reason}</div>
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
            className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded hover:bg-blue-600"
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

      // Format the time properly
      const hours = startDate.getHours().toString().padStart(2, '0');
      const minutes = startDate.getMinutes().toString().padStart(2, '0');

      // Format the date as YYYY-MM-DD
      const formattedDate = startDate.toISOString().split('T')[0];

      console.log('Creating appointment for date:', formattedDate, 'time:', `${hours}:${minutes}`);

      setManagingAppointment({
        id: 'new-' + Date.now(),
        date: formattedDate,
        time: `${hours}:${minutes}`,
        type: 'Consultation',
        reason: '',
        status: 'Scheduled'
      });
      setIsNewAppointment(true);
    } catch (error) {
      console.error('Error creating appointment from slot:', error);
      // Fallback to current date/time
      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');

      setManagingAppointment({
        id: 'new-' + Date.now(),
        date: formattedDate,
        time: `${hours}:${minutes}`,
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

      <div className="h-[500px]">
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
              backgroundColor: event.resource?.status === 'Completed' ? '#3B82F6' :
                             event.resource?.status === 'Scheduled' ? '#10B981' :
                             event.resource?.status === 'Cancelled' ? '#EF4444' :
                             event.resource?.status === 'Pending' ? '#F59E0B' :
                             event.resource?.status === 'Rescheduled' ? '#8B5CF6' : '#9CA3AF'
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
