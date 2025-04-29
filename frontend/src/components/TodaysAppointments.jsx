import { useState, useEffect } from 'react';
import { getTodaysAppointments } from '../data/mockData';
import { FaCalendarAlt, FaPhone } from 'react-icons/fa';

function TodaysAppointments({ onViewPatient }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const todaysAppointments = await getTodaysAppointments();
        setAppointments(todaysAppointments);
      } catch (error) {
        console.error('Error fetching today\'s appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Function to format time for display (e.g., "09:00")
  const formatTime = (time) => {
    if (!time) return '09:00'; // Default time if none provided
    return time;
  };

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

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center mb-4">
        <FaCalendarAlt className="text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Today's Appointments</h2>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-pulse">Loading appointments...</div>
        </div>
      ) : appointments.length > 0 ? (
        <div className="space-y-2">
          {appointments.map((appointment) => (
            <div
              key={appointment._id || appointment.id}
              className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
              onClick={() => handleAppointmentClick(appointment)}
            >
              <div className="w-16 text-sm font-medium text-gray-700">
                {formatTime(appointment.time)}
              </div>
              <div className="flex-grow">
                <div className="font-medium">{appointment.patientName}</div>
                <div className="text-xs text-gray-500">{appointment.reason || 'Consultation'}</div>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
                {getPatientInitials(appointment.patientName)}
              </div>
              {appointment.phone && (
                <button 
                  className="ml-2 p-2 text-gray-500 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${appointment.phone}`;
                  }}
                >
                  <FaPhone size={14} />
                </button>
              )}
            </div>
          ))}
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
