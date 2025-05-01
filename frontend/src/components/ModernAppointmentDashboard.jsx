import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaSearch, FaChartBar, FaPlus, FaFilter, FaCheck, FaTimes, FaRedo, FaEllipsisH } from 'react-icons/fa';
import apiService from '../utils/apiService';
import PatientSearchModal from './PatientSearchModal';
import AppointmentManagementModal from './AppointmentManagementModal';
import { transformAppointmentFromBackend } from '../utils/dataTransformers';

function ModernAppointmentDashboard({ onUpdateAppointment, onDeleteAppointment }) {
  // State for appointments and UI
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0
  });

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments when activeTab or appointments change
  useEffect(() => {
    filterAppointments();
  }, [activeTab, appointments, searchTerm]);

  // Calculate stats when appointments change
  useEffect(() => {
    calculateStats();
  }, [appointments]);

  // Fetch appointments from API
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAppointments();
      console.log('Fetched appointments:', response);
      setAppointments(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments based on active tab and search term
  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(appointment => {
        if (activeTab === 'today') {
          const today = new Date().toISOString().split('T')[0];
          return appointment.date === today;
        }
        return appointment.status.toLowerCase() === activeTab.toLowerCase();
      });
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => {
        const patientName = appointment.patientName?.toLowerCase() || '';
        const reason = appointment.reason?.toLowerCase() || '';
        const type = appointment.type?.toLowerCase() || '';
        return patientName.includes(term) || reason.includes(term) || type.includes(term);
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredAppointments(filtered);
  };

  // Calculate appointment statistics
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(a => a.date === today);

    const stats = {
      total: todaysAppointments.length,
      scheduled: todaysAppointments.filter(a => a.status === 'Scheduled').length,
      completed: todaysAppointments.filter(a => a.status === 'Completed').length,
      cancelled: todaysAppointments.filter(a => a.status === 'Cancelled').length,
      noShow: todaysAppointments.filter(a => a.status === 'No-show').length
    };

    setStats(stats);
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
      await fetchAppointments();
      
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
      await fetchAppointments();
      
      // Close form
      setEditingAppointment(null);
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment deletion
  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Delete appointment
      if (onDeleteAppointment) {
        await onDeleteAppointment(appointmentId);
      }

      // Refresh appointments
      await fetchAppointments();
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError('Failed to delete appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  // Render appointment card
  const renderAppointmentCard = (appointment) => {
    const isToday = appointment.date === new Date().toISOString().split('T')[0];
    
    return (
      <div 
        key={appointment._id} 
        className={`bg-white rounded-lg shadow-sm p-4 mb-3 border-l-4 hover:shadow-md transition-all duration-200 ${
          isToday ? 'border-blue-500' : 'border-gray-300'
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-800">{appointment.patientName}</h3>
            <p className="text-sm text-gray-600">{formatDate(appointment.date)}</p>
            <div className="flex items-center mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
              <span className="text-xs text-gray-500 ml-2">{appointment.type}</span>
            </div>
            {appointment.reason && (
              <p className="text-sm text-gray-700 mt-2">
                <span className="font-medium">Reason:</span> {appointment.reason}
              </p>
            )}
          </div>
          <div className="flex">
            <button
              onClick={() => handleEditAppointment(appointment)}
              className="text-blue-600 hover:text-blue-800 p-1"
              title="Edit Appointment"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={() => handleDeleteAppointment(appointment._id)}
              className="text-red-600 hover:text-red-800 p-1"
              title="Delete Appointment"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Appointment Management</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-3 text-center">
            <p className="text-sm text-gray-600">Total Today</p>
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 text-center">
            <p className="text-sm text-gray-600">Scheduled</p>
            <p className="text-xl font-bold text-blue-600">{stats.scheduled}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 text-center">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 text-center">
            <p className="text-sm text-gray-600">Cancelled</p>
            <p className="text-xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 text-center">
            <p className="text-sm text-gray-600">No Show</p>
            <p className="text-xl font-bold text-yellow-600">{stats.noShow}</p>
          </div>
        </div>
        
        {/* Tabs and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="flex space-x-1 mb-3 md:mb-0 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaCalendarAlt className="inline mr-1" /> Appointments
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'today' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Today's
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'scheduled' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'completed' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 shadow-sm"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button
              onClick={() => setShowPatientSearch(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center shadow-sm hover:shadow-md transition-all duration-200"
            >
              <FaPlus className="mr-1" /> New Appointment
            </button>
          </div>
        </div>
      </div>
      
      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {activeTab === 'all' ? 'All Appointments' : 
           activeTab === 'today' ? 'Today\'s Appointments' : 
           `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Appointments`}
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchAppointments}
              className="mt-2 text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No appointments found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map(renderAppointmentCard)}
          </div>
        )}
      </div>
      
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
                patientName: selectedPatient.name
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

export default ModernAppointmentDashboard;
