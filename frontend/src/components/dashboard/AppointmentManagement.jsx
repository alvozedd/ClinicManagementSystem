import { useState, useEffect } from 'react';
import { FaCalendarPlus, FaSearch, FaEdit, FaTrash, FaFilter, FaCalendarAlt, FaUserPlus, FaCheck, FaFileMedical, FaNotesMedical, FaThLarge, FaList } from 'react-icons/fa';
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
  const [displayMode, setDisplayMode] = useState('grid'); // 'grid' or 'list'
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);

  // Form state for adding/editing appointments
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_date: '',
    notes: '',
    status: 'Scheduled',
    type: 'Consultation',
    reason: ''
  });

  // Form state for adding new patient
  const [patientFormData, setPatientFormData] = useState({
    name: '',
    gender: 'Male',
    phone: '',
    year_of_birth: '',
    next_of_kin_name: '',
    next_of_kin_relationship: '',
    next_of_kin_phone: ''
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

  const handlePatientInputChange = (e) => {
    const { name, value } = e.target;
    setPatientFormData({
      ...patientFormData,
      [name]: value
    });
  };

  const handlePatientSearch = (e) => {
    const searchTerm = e.target.value;
    setPatientSearchTerm(searchTerm);

    if (searchTerm.trim() === '') {
      setFilteredPatients([]);
      return;
    }

    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
    );

    setFilteredPatients(filtered);
  };

  const selectPatient = (patient) => {
    setFormData({
      ...formData,
      patient_id: patient._id
    });
    setPatientSearchTerm(patient.name);
    setFilteredPatients([]);
  };

  const handleAddNewPatient = () => {
    setPatientFormData({
      name: '',
      gender: 'Male',
      phone: '',
      year_of_birth: '',
      next_of_kin_name: '',
      next_of_kin_relationship: '',
      next_of_kin_phone: ''
    });
    setShowNewPatientModal(true);
  };

  const submitNewPatient = async (e) => {
    e.preventDefault();
    try {
      const newPatient = await apiService.createPatient(patientFormData);
      await fetchPatients();
      setShowNewPatientModal(false);

      // Select the newly created patient for the appointment
      setFormData({
        ...formData,
        patient_id: newPatient._id
      });
      setPatientSearchTerm(newPatient.name);
    } catch (err) {
      console.error('Error adding patient:', err);
      setError('Failed to add patient. Please try again.');
    }
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
    const patientId = appointment.patient_id._id || appointment.patient_id;
    const patientName = typeof appointment.patient_id === 'object' ?
      appointment.patient_id.name :
      getPatientName(appointment.patient_id);

    setCurrentAppointment(appointment);
    setFormData({
      patient_id: patientId,
      appointment_date: formattedDate,
      notes: appointment.notes || '',
      status: appointment.status,
      type: appointment.type,
      reason: appointment.reason || ''
    });
    setPatientSearchTerm(patientName);
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

  const markAppointmentCompleted = async (appointmentId) => {
    try {
      await apiService.updateAppointment(appointmentId, { status: 'Completed' });
      fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update appointment status. Please try again.');
    }
  };

  // Navigate to Notes tab with the appointment pre-selected
  const handleAddNotes = (appointmentId) => {
    // Store the appointment ID in sessionStorage
    sessionStorage.setItem('selectedAppointmentForNote', appointmentId);

    // Redirect to the Notes tab using the correct URL format
    const currentPath = window.location.pathname;
    window.location.href = `${currentPath}?tab=notes`;
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

    // Grid view for appointments
    if (displayMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAppointments.map(appointment => (
            <div
              key={appointment._id}
              className={`dashboard-card p-4 ${appointment.createdBy === 'visitor' ? 'visitor-appointment' : ''} ${appointment.status === 'Completed' ? 'completed-appointment' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{getPatientName(appointment.patient_id)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300">{formatDate(appointment.appointment_date)}</p>
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
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Type: {appointment.type}</p>
                {appointment.reason && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Reason: {appointment.reason}</p>
                )}
              </div>
              <div className="mt-3 flex justify-end space-x-2">
                {appointment.status !== 'Completed' && (
                  <button
                    onClick={() => markAppointmentCompleted(appointment._id)}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    title="Mark as Completed"
                  >
                    <FaCheck />
                  </button>
                )}
                {appointment.status === 'Completed' && role === 'doctor' && (
                  <button
                    onClick={() => handleAddNotes(appointment._id)}
                    className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                    title="Add Notes"
                  >
                    <FaNotesMedical />
                  </button>
                )}
                <button
                  onClick={() => handleEditAppointment(appointment)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Edit Appointment"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteAppointment(appointment._id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete Appointment"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // List view (table) for appointments
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Patient</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Date</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Type</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Reason</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedAppointments.map((appointment) => (
              <tr
                key={appointment._id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white ${appointment.createdBy === 'visitor' ? 'visitor-appointment' : ''} ${appointment.status === 'Completed' ? 'completed-appointment' : ''}`}
              >
                <td className="py-3 px-4 whitespace-nowrap dark:text-gray-200">
                  {getPatientName(appointment.patient_id)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap dark:text-gray-200">
                  {formatDate(appointment.appointment_date)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap dark:text-gray-200">
                  {appointment.type}
                </td>
                <td className="py-3 px-4 whitespace-nowrap dark:text-gray-200">
                  <span className={`status-indicator status-${appointment.status.toLowerCase()}`}></span>
                  {appointment.status}
                </td>
                <td className="py-3 px-4 dark:text-gray-200">
                  {appointment.reason || 'N/A'}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-right">
                  {appointment.status !== 'Completed' && (
                    <button
                      onClick={() => markAppointmentCompleted(appointment._id)}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mr-3"
                      title="Mark as Completed"
                    >
                      <FaCheck />
                    </button>
                  )}
                  {appointment.status === 'Completed' && role === 'doctor' && (
                    <button
                      onClick={() => handleAddNotes(appointment._id)}
                      className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 mr-3"
                      title="Add Notes"
                    >
                      <FaNotesMedical />
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAppointment(appointment)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                    title="Edit Appointment"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteAppointment(appointment._id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete Appointment"
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

  // Render Today's Appointments in Card or List View
  const renderTodayAppointments = () => {
    const todayAppointments = sortedAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      const today = new Date();
      return appointmentDate.toDateString() === today.toDateString();
    });

    if (todayAppointments.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-300">
          No appointments scheduled for today.
        </div>
      );
    }

    // Grid view for today's appointments
    if (displayMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todayAppointments.map(appointment => (
            <div key={appointment._id} className={`dashboard-card p-4 ${appointment.createdBy === 'visitor' ? 'visitor-appointment' : ''} ${appointment.status === 'Completed' ? 'completed-appointment' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{getPatientName(appointment.patient_id)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300">{formatDate(appointment.appointment_date)}</p>
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
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Type: {appointment.type}</p>
                {appointment.reason && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Reason: {appointment.reason}</p>
                )}
              </div>
              <div className="mt-3 flex justify-end space-x-2">
                {appointment.status !== 'Completed' && (
                  <button
                    onClick={() => markAppointmentCompleted(appointment._id)}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    title="Mark as Completed"
                  >
                    <FaCheck />
                  </button>
                )}
                {appointment.status === 'Completed' && role === 'doctor' && (
                  <button
                    onClick={() => handleAddNotes(appointment._id)}
                    className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                    title="Add Notes"
                  >
                    <FaNotesMedical />
                  </button>
                )}
                <button
                  onClick={() => handleEditAppointment(appointment)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Edit Appointment"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteAppointment(appointment._id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete Appointment"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // List view (table) for today's appointments
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Patient</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Date</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Type</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Reason</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-600 dark:text-gray-200 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {todayAppointments.map((appointment) => (
              <tr
                key={appointment._id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white ${appointment.createdBy === 'visitor' ? 'visitor-appointment' : ''} ${appointment.status === 'Completed' ? 'completed-appointment' : ''}`}
              >
                <td className="py-3 px-4 whitespace-nowrap dark:text-gray-200">
                  {getPatientName(appointment.patient_id)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap dark:text-gray-200">
                  {formatDate(appointment.appointment_date)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap dark:text-gray-200">
                  {appointment.type}
                </td>
                <td className="py-3 px-4 whitespace-nowrap dark:text-gray-200">
                  <span className={`status-indicator status-${appointment.status.toLowerCase()}`}></span>
                  {appointment.status}
                </td>
                <td className="py-3 px-4 dark:text-gray-200">
                  {appointment.reason || 'N/A'}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-right">
                  {appointment.status !== 'Completed' && (
                    <button
                      onClick={() => markAppointmentCompleted(appointment._id)}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mr-3"
                      title="Mark as Completed"
                    >
                      <FaCheck />
                    </button>
                  )}
                  {appointment.status === 'Completed' && role === 'doctor' && (
                    <button
                      onClick={() => handleAddNotes(appointment._id)}
                      className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 mr-3"
                      title="Add Notes"
                    >
                      <FaNotesMedical />
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAppointment(appointment)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                    title="Edit Appointment"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteAppointment(appointment._id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete Appointment"
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

  // Add Appointment Modal
  const renderAddAppointmentModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Appointment</h2>

          <form onSubmit={submitAddAppointment}>
            <div className="form-group">
              <label className="form-label">Patient*</label>
              <div className="search-input-container mb-2">
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="form-input"
                  value={patientSearchTerm}
                  onChange={handlePatientSearch}
                />
                <FaSearch className="search-icon" />
              </div>

              {filteredPatients.length > 0 && (
                <div className="patient-search-results mb-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded">
                  {filteredPatients.map(patient => (
                    <div
                      key={patient._id}
                      className="patient-search-item p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-gray-200"
                      onClick={() => selectPatient(patient)}
                    >
                      {patient.name} - {patient.phone}
                    </div>
                  ))}
                </div>
              )}

              <select
                name="patient_id"
                value={formData.patient_id}
                onChange={handleInputChange}
                className="form-input mb-2"
                required
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddNewPatient}
                className="btn btn-outline-primary w-full flex items-center justify-center"
              >
                <FaUserPlus className="mr-2" />
                New Patient
              </button>
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

  // New Patient Modal
  const renderNewPatientModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Patient</h2>

          <form onSubmit={submitNewPatient}>
            <div className="form-group">
              <label className="form-label">Name*</label>
              <input
                type="text"
                name="name"
                value={patientFormData.name}
                onChange={handlePatientInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender*</label>
              <select
                name="gender"
                value={patientFormData.gender}
                onChange={handlePatientInputChange}
                className="form-input"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number*</label>
              <input
                type="tel"
                name="phone"
                value={patientFormData.phone}
                onChange={handlePatientInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Year of Birth</label>
              <input
                type="text"
                name="year_of_birth"
                value={patientFormData.year_of_birth}
                onChange={handlePatientInputChange}
                className="form-input"
                placeholder="YYYY"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Next of Kin Name</label>
              <input
                type="text"
                name="next_of_kin_name"
                value={patientFormData.next_of_kin_name}
                onChange={handlePatientInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Next of Kin Relationship</label>
              <input
                type="text"
                name="next_of_kin_relationship"
                value={patientFormData.next_of_kin_relationship}
                onChange={handlePatientInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Next of Kin Phone</label>
              <input
                type="tel"
                name="next_of_kin_phone"
                value={patientFormData.next_of_kin_phone}
                onChange={handlePatientInputChange}
                className="form-input"
              />
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowNewPatientModal(false)}
                className="btn btn-outline-primary mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Add Patient
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Appointment</h2>

          <form onSubmit={submitEditAppointment}>
            <div className="form-group">
              <label className="form-label">Patient*</label>
              <div className="search-input-container mb-2">
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="form-input"
                  value={patientSearchTerm}
                  onChange={handlePatientSearch}
                />
                <FaSearch className="search-icon" />
              </div>

              {filteredPatients.length > 0 && (
                <div className="patient-search-results mb-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded">
                  {filteredPatients.map(patient => (
                    <div
                      key={patient._id}
                      className="patient-search-item p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-gray-200"
                      onClick={() => selectPatient(patient)}
                    >
                      {patient.name} - {patient.phone}
                    </div>
                  ))}
                </div>
              )}

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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Appointment Management</h1>
        <button
          onClick={handleAddAppointment}
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

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <div className="search-input-container w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search appointments..."
            className="form-input w-full dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="search-icon dark:text-gray-400" />
        </div>

        <div className="flex space-x-2 w-full sm:w-auto justify-end">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
            className={`tab-button ${viewMode === 'today' ? 'active' : ''} relative`}
          >
            Today's Appointments
            <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full">
              {appointments.filter(apt => new Date(apt.appointment_date).toDateString() === new Date().toDateString()).length}
            </span>
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`tab-button ${viewMode === 'all' ? 'active' : ''} relative`}
          >
            All Appointments
            <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
              {appointments.length}
            </span>
          </button>
          <div className="flex items-center ml-auto">
            {(viewMode === 'today' || viewMode === 'all') && (
              <div className="flex border rounded overflow-hidden mr-4">
                <button
                  onClick={() => setDisplayMode('grid')}
                  className={`p-2 ${displayMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'}`}
                  title="Grid View"
                >
                  <FaThLarge className={displayMode === 'grid' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'} />
                </button>
                <button
                  onClick={() => setDisplayMode('list')}
                  className={`p-2 ${displayMode === 'list' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'}`}
                  title="List View"
                >
                  <FaList className={displayMode === 'list' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'} />
                </button>
              </div>
            )}
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Upcoming:</div>
            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs font-semibold rounded-full">
              {appointments.filter(apt => {
                const aptDate = new Date(apt.appointment_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return aptDate > today && apt.status !== 'Completed' && apt.status !== 'Cancelled';
              }).length}
            </span>
          </div>
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
      {showNewPatientModal && renderNewPatientModal()}
    </div>
  );
};

export default AppointmentManagement;
