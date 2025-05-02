import { useState, useEffect } from 'react';
import { FaCalendarPlus, FaSearch, FaEdit, FaTrash, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import apiService from '../../utils/apiService';
import './DashboardStyles.css';

const AppointmentManagement = ({ role }) => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('today'); // 'today', 'all', 'calendar'

  // Form state for adding/editing appointments
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_date: '',
    notes: '',
    status: 'Scheduled',
    type: 'Consultation',
    reason: ''
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddAppointment = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    setFormData({
      patient_id: '',
      appointment_date: formattedDate,
      notes: '',
      status: 'Scheduled',
      type: 'Consultation',
      reason: ''
    });
    setShowAddModal(true);
  };

  const handleEditAppointment = (appointment) => {
    const formattedDate = new Date(appointment.appointment_date).toISOString().split('T')[0];

    setCurrentAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id._id || appointment.patient_id,
      appointment_date: formattedDate,
      notes: appointment.notes || '',
      status: appointment.status,
      type: appointment.type,
      reason: appointment.reason || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await apiService.deleteAppointment(appointmentId);
        fetchAppointments();
      } catch (err) {
        console.error('Error deleting appointment:', err);
        setError('Failed to delete appointment. Please try again.');
      }
    }
  };

  const submitAddAppointment = async (e) => {
    e.preventDefault();
    try {
      const appointmentData = {
        ...formData,
        createdBy: role.toLowerCase()
      };
      await apiService.createAppointment(appointmentData);
      setShowAddModal(false);
      fetchAppointments();
    } catch (err) {
      console.error('Error adding appointment:', err);
      setError('Failed to add appointment. Please try again.');
    }
  };

  const submitEditAppointment = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateAppointment(currentAppointment._id, formData);
      setShowEditModal(false);
      fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment. Please try again.');
    }
  };

  // Filter appointments based on search term, status, and view mode
  const filteredAppointments = appointments.filter(appointment => {
    const patientName = appointment.patient_id && typeof appointment.patient_id === 'object'
      ? appointment.patient_id.name
      : '';

    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.reason && appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;

    const appointmentDate = new Date(appointment.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = appointmentDate.toDateString() === today.toDateString();

    if (viewMode === 'today') {
      return matchesSearch && matchesStatus && isToday;
    } else {
      return matchesSearch && matchesStatus;
    }
  });

  // Sort appointments by date (most recent first)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    return new Date(b.appointment_date) - new Date(a.appointment_date);
  });

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get patient name from ID
  const getPatientName = (patientId) => {
    if (typeof patientId === 'object' && patientId !== null) {
      return patientId.name;
    }

    const patient = patients.find(p => p._id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  // Render Appointment List
  const renderAppointmentList = () => {
    if (sortedAppointments.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No appointments found. Try a different search term or add a new appointment.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedAppointments.map((appointment) => (
              <tr key={appointment._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 whitespace-nowrap">
                  {getPatientName(appointment.patient_id)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {formatDate(appointment.appointment_date)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {appointment.type}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className={`status-indicator status-${appointment.status.toLowerCase()}`}></span>
                  {appointment.status}
                </td>
                <td className="py-3 px-4">
                  {appointment.reason || 'N/A'}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleEditAppointment(appointment)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteAppointment(appointment._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render Today's Appointments in Card View
  const renderTodayAppointments = () => {
    const todayAppointments = sortedAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      const today = new Date();
      return appointmentDate.toDateString() === today.toDateString();
    });

    if (todayAppointments.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No appointments scheduled for today.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {todayAppointments.map(appointment => (
          <div key={appointment._id} className="dashboard-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{getPatientName(appointment.patient_id)}</h3>
                <p className="text-sm text-gray-500">{formatDate(appointment.appointment_date)}</p>
              </div>
              <span className={`badge ${
                appointment.status === 'Scheduled' ? 'badge-blue' :
                appointment.status === 'Completed' ? 'badge-green' :
                appointment.status === 'Cancelled' ? 'badge-red' :
                appointment.status === 'In-progress' ? 'badge-yellow' : 'badge-gray'
              }`}>
                {appointment.status}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">Type: {appointment.type}</p>
              {appointment.reason && (
                <p className="text-sm text-gray-600 mt-1">Reason: {appointment.reason}</p>
              )}
            </div>
            <div className="mt-3 flex justify-end space-x-2">
              <button
                onClick={() => handleEditAppointment(appointment)}
                className="text-blue-600 hover:text-blue-800"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDeleteAppointment(appointment._id)}
                className="text-red-600 hover:text-red-800"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Add Appointment Modal
  const renderAddAppointmentModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Add New Appointment</h2>

          <form onSubmit={submitAddAppointment}>
            <div className="form-group">
              <label className="form-label">Patient*</label>
              <select
                name="patient_id"
                value={formData.patient_id}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Appointment Date*</label>
              <input
                type="date"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Type*</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Procedure">Procedure</option>
                <option value="Test">Test</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status*</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="No-show">No-show</option>
                <option value="In-progress">In-progress</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reason</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-input"
                rows="3"
              ></textarea>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn btn-outline-primary mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Add Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit Appointment Modal
  const renderEditAppointmentModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Edit Appointment</h2>

          <form onSubmit={submitEditAppointment}>
            <div className="form-group">
              <label className="form-label">Patient*</label>
              <select
                name="patient_id"
                value={formData.patient_id}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Appointment Date*</label>
              <input
                type="date"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Type*</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Procedure">Procedure</option>
                <option value="Test">Test</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status*</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="No-show">No-show</option>
                <option value="In-progress">In-progress</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reason</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-input"
                rows="3"
              ></textarea>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="btn btn-outline-primary mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Update Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="appointment-management">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Appointment Management</h1>
        <button
          onClick={handleAddAppointment}
          className="btn btn-primary flex items-center"
        >
          <FaCalendarPlus className="mr-2" />
          Add Appointment
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search appointments..."
            className="form-input pl-14 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex space-x-2 w-full sm:w-auto justify-end">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input"
          >
            <option value="all">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="No-show">No-show</option>
            <option value="In-progress">In-progress</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('today')}
            className={`tab-button ${viewMode === 'today' ? 'active' : ''}`}
          >
            Today's Appointments
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`tab-button ${viewMode === 'all' ? 'active' : ''}`}
          >
            All Appointments
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {viewMode === 'today' ? renderTodayAppointments() : renderAppointmentList()}
        </>
      )}

      {showAddModal && renderAddAppointmentModal()}
      {showEditModal && renderEditAppointmentModal()}
    </div>
  );
};

export default AppointmentManagement;
