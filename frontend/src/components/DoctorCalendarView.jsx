import React, { useState, useCallback, useMemo } from 'react';
import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import SimplifiedDiagnosisModal from './SimplifiedDiagnosisModal';
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

function DoctorCalendarView({ appointments, onDiagnoseAppointment, onViewPatient }) {
  const [diagnosingAppointment, setDiagnosingAppointment] = useState(null);

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
    const hasDiagnosis = appointment.diagnosis !== undefined;

    // Define styles based on appointment status
    let statusStyles = {};
    switch(appointment.status) {
      case 'Completed':
        statusStyles = hasDiagnosis
          ? { container: 'bg-green-100 border-l-4 border-green-500', badge: 'bg-green-200 text-green-800' }
          : { container: 'bg-blue-100 border-l-4 border-blue-500', badge: 'bg-blue-200 text-blue-800' };
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
        className={`p-2 rounded ${statusStyles.container}`}
        style={{ overflow: 'visible' }}
      >
        <div className="font-medium text-sm text-black">{appointment.time} - {appointment.patientName}</div>
        <div className="text-sm text-black">{appointment.reason}</div>
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs px-1 py-0.5 rounded-full ${statusStyles.badge}`}>
            {appointment.status}
          </span>
          {isCompleted && !hasDiagnosis && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDiagnosingAppointment(appointment);
              }}
              className="text-xs bg-yellow-500 text-black px-1 py-0.5 rounded hover:bg-yellow-600 font-medium"
            >
              Add Diagnosis
            </button>
          )}
          {hasDiagnosis && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDiagnosingAppointment(appointment);
              }}
              className="text-xs bg-blue-500 text-black px-1 py-0.5 rounded hover:bg-blue-600 font-medium"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    );
  };

  // Handle saving diagnosis
  const handleSaveDiagnosis = (updatedAppointment) => {
    // Make sure the appointment status is set to Completed when adding a diagnosis
    const appointmentWithStatus = {
      ...updatedAppointment,
      status: 'Completed'
    };

    console.log('Saving diagnosis in DoctorCalendarView:', appointmentWithStatus);

    // Check if this is a new diagnosis or an update to an existing one
    const isNewDiagnosis = !diagnosingAppointment.diagnosis;

    // If this is a new diagnosis for an appointment that already has diagnoses,
    // we need to preserve the existing diagnoses array
    if (!isNewDiagnosis && diagnosingAppointment.diagnoses) {
      // Add the new diagnosis to the existing diagnoses array
      appointmentWithStatus.diagnoses = [
        appointmentWithStatus.diagnosis,
        ...diagnosingAppointment.diagnoses
      ];
    }

    onDiagnoseAppointment(appointmentWithStatus);
    setDiagnosingAppointment(null);

    // Force a re-render after a short delay to ensure the diagnosis is saved
    setTimeout(() => {
      // This is a no-op state update that will trigger a re-render
      setDiagnosingAppointment(null);
    }, 500);
  };

  return (
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Appointment Calendar</h2>
        <p className="text-sm text-gray-600">Click on an appointment to view patient details</p>
      </div>

      <div className="h-[600px]">
        <CustomCalendar
          localizer={localizer}
          events={events}
          onSelectEvent={handleSelectEvent}
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

      {/* Diagnosis Modal */}
      {diagnosingAppointment && (
        <SimplifiedDiagnosisModal
          appointment={diagnosingAppointment}
          onClose={() => setDiagnosingAppointment(null)}
          onSave={handleSaveDiagnosis}
        />
      )}
    </div>
  );
}

export default DoctorCalendarView;
