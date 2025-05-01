import { useState, useEffect } from 'react';
import { getTodaysAppointments, clearCache } from '../data/mockData';
import { FaCalendarAlt, FaPhone, FaUserPlus, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import apiService from '../utils/apiService';
import NewAppointmentButton from './NewAppointmentButton';

function TodaysAppointments({ onViewPatient, onEditAppointment, onDeleteAppointment, patients, onUpdatePatient, onDiagnoseAppointment }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Clear the appointments cache to get fresh data
      clearCache('appointments');
      const todaysAppointments = await getTodaysAppointments();

      // Validate appointments data before setting state
      if (Array.isArray(todaysAppointments)) {
        // Filter out any invalid appointments
        const validAppointments = todaysAppointments.filter(appointment => {
          if (!appointment) {
            console.warn('Found null or undefined appointment');
            return false;
          }
          if (!appointment._id && !appointment.id) {
            console.warn('Found appointment without ID:', appointment);
            return false;
          }
          return true;
        });

        setAppointments(validAppointments);
      } else {
        console.error('Invalid appointments data received:', todaysAppointments);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
      setAppointments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();

    // Set up polling to refresh appointments every 30 seconds
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  // Function to format time for display (e.g., "09:00")
  const formatTime = (time) => {
    if (!time) return '09:00'; // Default time if none provided
    return time;
  };

  // Sort appointments by time
  const sortedAppointments = [...appointments].sort((a, b) => {
    const timeA = a.time || a.optional_time || '09:00';
    const timeB = b.time || b.optional_time || '09:00';
    return timeA.localeCompare(timeB);
  });

  // Function to get patient initials
  const getPatientInitials = (name) => {
    if (!name) return '';

    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0);
    }

    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`;
  };

  // Handle clicking on an appointment
  const handleAppointmentClick = (appointment) => {
    if (onViewPatient && appointment.patientId) {
      onViewPatient(appointment.patientId);
    }
  };

  // Queue functionality has been removed

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FaCalendarAlt className="text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Today's Appointments</h2>
        </div>
        {patients && onUpdatePatient && onDiagnoseAppointment && (
          <NewAppointmentButton
            patients={patients}
            onSave={onDiagnoseAppointment}
            onAddPatient={onUpdatePatient}
          />
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-pulse">Loading appointments...</div>
        </div>
      ) : appointments.length > 0 ? (
        <div className="space-y-2">
          {sortedAppointments.map((appointment) => {
            // Skip rendering if appointment is invalid
            if (!appointment || (!appointment._id && !appointment.id)) {
              console.warn('Skipping invalid appointment in render:', appointment);
              return null;
            }

            return (
              <div
                key={appointment._id || appointment.id}
                className="flex items-center p-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors border border-gray-100 mb-2"
                onClick={() => handleAppointmentClick(appointment)}
              >
              <div className="flex-grow">
                <div className="font-medium">{appointment.patientName}</div>
                <div className="text-xs text-gray-500">
                  <span className="font-semibold">{formatTime(appointment.time || appointment.optional_time)}</span> - {appointment.reason || 'Consultation'}
                </div>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium mr-3">
                {getPatientInitials(appointment.patientName)}
              </div>
              <div className="flex space-x-2">
                {appointment.phone && (
                  <button
                    className="p-2 text-gray-500 hover:text-blue-600 bg-gray-100 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `tel:${appointment.phone}`;
                    }}
                    title="Call Patient"
                  >
                    <FaPhone size={14} />
                  </button>
                )}

                {onEditAppointment && (
                  <button
                    className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAppointment(appointment);
                    }}
                    title="Edit Appointment"
                  >
                    <FaEdit size={14} />
                  </button>
                )}
                {onDeleteAppointment && (
                  <button
                    className="p-2 text-red-600 hover:text-red-800 bg-red-50 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this appointment?')) {
                        onDeleteAppointment(appointment._id || appointment.id);
                      }
                    }}
                    title="Delete Appointment"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No appointments scheduled for today.
        </div>
      )}
    </div>
  );
}

export default TodaysAppointments;
