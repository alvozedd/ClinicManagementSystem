import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaUserClock, FaEllipsisH } from 'react-icons/fa';
import apiService from '../utils/apiService';
import PatientSearchModal from './PatientSearchModal';
import AppointmentManagementModal from './AppointmentManagementModal';

function ModernTodaysAppointments({ onUpdateAppointment, onViewPatient }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Fetch today's appointments on component mount
  useEffect(() => {
    fetchTodaysAppointments();
  }, []);

  // Fetch today's appointments from API
  const fetchTodaysAppointments = async () => {
    setLoading(true);
    try {
      const allAppointments = await apiService.getAppointments();
      const today = new Date().toISOString().split('T')[0];
      
      // Filter for today's appointments
      const todaysAppointments = allAppointments.filter(appointment => 
        appointment.date === today
      );
      
      // Sort by status (Scheduled first, then others)
      todaysAppointments.sort((a, b) => {
        if (a.status === 'Scheduled' && b.status !== 'Scheduled') return -1;
        if (a.status !== 'Scheduled' && b.status === 'Scheduled') return 1;
        return 0;
      });
      
      setAppointments(todaysAppointments);
      setError(null);
    } catch (err) {
      console.error('Error fetching today\'s appointments:', err);
      setError('Failed to load appointments. Please try again.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle patient selection for new appointment
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    setShowAppointmentForm(true);
  };

  // Handle appointment creation
  const handleCreateAppointment = async (appointmentData) => {
    try {
      setLoading(true);
      
      // Create appointment object
      const newAppointment = {
        patientId: selectedPatient._id,
        patientName: selectedPatient.name,
        date: appointmentData.date,
        type: appointmentData.type,
        reason: appointmentData.reason,
        status: 'Scheduled',
        createdBy: 'doctor' // or 'secretary' based on user role
      };

      // Save appointment
      if (onUpdateAppointment) {
        await onUpdateAppointment(newAppointment);
      }

      // Refresh appointments
      await fetchTodaysAppointments();
      
      // Close form
      setShowAppointmentForm(false);
      setSelectedPatient(null);
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Failed to create appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment edit
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
  };

  // Handle appointment update
  const handleUpdateAppointment = async (updatedAppointment) => {
    try {
      setLoading(true);
      
      // Update appointment
      if (onUpdateAppointment) {
        await onUpdateAppointment(updatedAppointment);
      }

      // Refresh appointments
      await fetchTodaysAppointments();
      
      // Close form
      setEditingAppointment(null);
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'No-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle view patient
  const handleViewPatient = (patientId) => {
    if (onViewPatient) {
      onViewPatient(patientId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FaCalendarAlt className="text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Today's Appointments</h2>
        </div>
        <button
          onClick={() => setShowPatientSearch(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center shadow-sm hover:shadow-md transition-all duration-200"
        >
          <FaPlus className="mr-1" /> New Appointment
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading appointments...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-3">
          <p className="text-sm text-red-700">{error}</p>
          <button 
            onClick={fetchTodaysAppointments}
            className="mt-1 text-sm text-red-700 underline"
          >
            Try again
          </button>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-6 italic text-gray-500">
          No appointments for today.
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(appointment => (
            <div 
              key={appointment._id} 
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 
                    className="font-medium text-blue-700 hover:text-blue-800 cursor-pointer"
                    onClick={() => handleViewPatient(appointment.patientId)}
                  >
                    {appointment.patientName}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{appointment.type}</span>
                  </div>
                  {appointment.reason && (
                    <p className="text-xs text-gray-700 mt-1 truncate max-w-xs">
                      {appointment.reason}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => handleEditAppointment(appointment)}
                    className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    <FaEllipsisH className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Search Modal */}
      {showPatientSearch && (
        <PatientSearchModal
          show={showPatientSearch}
          onClose={() => setShowPatientSearch(false)}
          onSelect={handlePatientSelect}
        />
      )}
      
      {/* New Appointment Form */}
      {showAppointmentForm && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-blue-700 mb-4">New Appointment</h2>
            <p className="mb-4"><strong>Patient:</strong> {selectedPatient.name}</p>
            
            <AppointmentManagementModal
              isNew={true}
              isEmbedded={true}
              appointment={{
                patientId: selectedPatient._id,
                patientName: selectedPatient.name,
                date: new Date().toISOString().split('T')[0] // Set to today by default
              }}
              onSave={handleCreateAppointment}
              onClose={() => {
                setShowAppointmentForm(false);
                setSelectedPatient(null);
              }}
            />
          </div>
        </div>
      )}
      
      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <AppointmentManagementModal
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onSave={handleUpdateAppointment}
        />
      )}
    </div>
  );
}

export default ModernTodaysAppointments;
