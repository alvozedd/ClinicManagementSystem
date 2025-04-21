import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarStyles.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import AppointmentManagementModal from './AppointmentManagementModal';

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
      // Create proper date objects for start and end times
      const [hours, minutes] = appointment.time.split(':').map(Number);
      const start = new Date(appointment.date);
      start.setHours(hours, minutes, 0, 0);

      // End time is 30 minutes after start time
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 30);

      return {
        id: appointment.id,
        title: `${appointment.patientName} - ${appointment.reason}`,
        start,
        end,
        resource: appointment, // Store the original appointment data
      };
    });
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

    return (
      <div
        className={`p-1 rounded ${
          isCompleted
            ? 'bg-blue-100 border-l-4 border-blue-500'
            : 'bg-yellow-100 border-l-4 border-yellow-500'
        }`}
      >
        <div className="font-medium text-xs">{appointment.time} - {appointment.patientName}</div>
        <div className="text-xs truncate">{appointment.reason}</div>
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs px-1 py-0.5 rounded-full ${
            isCompleted ? 'bg-blue-200 text-blue-800' : 'bg-yellow-200 text-yellow-800'
          }`}>
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
    onUpdateAppointment(updatedAppointment);
    setManagingAppointment(null);
    setIsNewAppointment(false);
  };

  // Handle selecting a slot to create a new appointment
  const handleSelectSlot = useCallback((slotInfo) => {
    // Make sure we're working with a proper Date object
    const startDate = new Date(slotInfo.start);

    // Format the time properly
    const hours = startDate.getHours().toString().padStart(2, '0');
    const minutes = startDate.getMinutes().toString().padStart(2, '0');

    // Format the date as YYYY-MM-DD
    const formattedDate = startDate.toISOString().split('T')[0];

    setManagingAppointment({
      id: 'new-' + Date.now(),
      date: formattedDate,
      time: `${hours}:${minutes}`,
      type: 'Consultation',
      reason: '',
      status: 'Scheduled'
    });
    setIsNewAppointment(true);
  }, []);

  return (
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Appointment Calendar</h2>
        <p className="text-sm text-gray-600">Click on an appointment to view patient details or click on an empty slot to create a new appointment</p>
      </div>

      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['month', 'week', 'day']}
          defaultView="week"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable={true}
          min={new Date(0, 0, 0, 8, 0, 0)} // 8:00 AM
          max={new Date(0, 0, 0, 17, 0, 0)} // 5:00 PM
          step={30} // 30 minute intervals
          timeslots={1} // 1 slot per step (30 minutes)
          popup={true} // Enable popup for events
          components={{
            event: EventComponent
          }}
          formats={{
            timeGutterFormat: (date, culture, localizer) =>
              localizer.format(date, 'h:mm a', culture),
            dayFormat: (date, culture, localizer) =>
              localizer.format(date, 'ddd DD', culture),
            eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
              `${localizer.format(start, 'h:mm a', culture)} - ${localizer.format(end, 'h:mm a', culture)}`
          }}
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
