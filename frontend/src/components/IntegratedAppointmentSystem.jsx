import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import AuthContext from '../context/AuthContext';
import { FaCalendarAlt, FaUserMd, FaCheck, FaTrash, FaEdit, FaPlus, FaArrowRight, FaArrowLeft, FaSearch, FaChartBar } from 'react-icons/fa';
import apiService from '../utils/apiService';
import Loader from './Loader';
import Message from './Message';
import PatientSearchModal from './PatientSearchModal';
import AppointmentForm from './AppointmentForm';
import DiagnosisForm from './DiagnosisForm';
import AppointmentSearch from './AppointmentSearch';
import AppointmentAnalytics from './AppointmentAnalytics';
import './IntegratedAppointmentSystem.css';

const IntegratedAppointmentSystem = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedCount: 0,
    cancelledCount: 0,
    noShowCount: 0,
    scheduledCount: 0
  });
  const [activeTab, setActiveTab] = useState('appointments');
  const [selectedAppointmentForView, setSelectedAppointmentForView] = useState(null);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get user info from context as primary source
  const { userInfo: contextUserInfo } = useContext(AuthContext);

  // Also try to get from Redux as fallback
  const reduxUserInfo = useSelector((state) => state.auth?.userInfo);

  // Use context user info if available, otherwise use Redux
  const userInfo = contextUserInfo || reduxUserInfo;

  const isDoctor = userInfo?.role === 'doctor';
  const isSecretary = userInfo?.role === 'secretary';

  // Fetch appointments for today
  const fetchTodaysAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getIntegratedAppointments({ today_only: true });
      setAppointments(data);

      // Calculate stats
      const totalAppointments = data.length;
      const completedCount = data.filter(a => a.status === 'Completed').length;
      const cancelledCount = data.filter(a => a.status === 'Cancelled').length;
      const noShowCount = data.filter(a => a.status === 'No-show').length;
      const scheduledCount = data.filter(a => a.status === 'Scheduled' || a.status === 'In-progress').length;

      setStats({
        totalAppointments,
        completedCount,
        cancelledCount,
        noShowCount,
        scheduledCount
      });

      setError(null);
    } catch (err) {
      setError('Failed to fetch appointments: ' + (err.message || err));
      console.error('Error fetching appointments:', err);
      // Set default stats on error
      setStats({
        totalAppointments: 0,
        completedCount: 0,
        cancelledCount: 0,
        noShowCount: 0,
        scheduledCount: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await fetchTodaysAppointments();
    setLoading(false);
  }, [fetchTodaysAppointments]);

  // Initial data load
  useEffect(() => {
    fetchAllData();

    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchAllData();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchAllData, refreshTrigger]);

  // Handle patient selection from search
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    setShowAppointmentForm(true);
  };

  // Handle appointment creation
  const handleCreateAppointment = async (appointmentData) => {
    try {
      setLoading(true);
      const data = await apiService.createIntegratedAppointment({
        ...appointmentData,
        patient_id: selectedPatient._id,
        createdBy: userInfo?.role || 'visitor'
      });

      setShowAppointmentForm(false);
      setSelectedPatient(null);
      setRefreshTrigger(prev => prev + 1);

      return data;
    } catch (err) {
      setError('Failed to create appointment: ' + (err.message || err));
      console.error('Error creating appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle update appointment status
  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      setLoading(true);
      await apiService.updateIntegratedAppointment(appointmentId, { status });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(`Failed to update appointment status: ${err.message || err}`);
      console.error('Error updating appointment status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle complete appointment
  const handleCompleteAppointment = async (appointmentId, diagnosisData) => {
    try {
      setLoading(true);
      await apiService.completeAppointment(appointmentId, diagnosisData);
      setShowDiagnosisForm(false);
      setSelectedAppointment(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError('Failed to complete appointment: ' + (err.message || err));
      console.error('Error completing appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sort appointments by time
  const sortAppointmentsByTime = (appointments) => {
    return [...appointments].sort((a, b) => {
      // First sort by date
      const dateA = new Date(a.scheduled_date);
      const dateB = new Date(b.scheduled_date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }

      // Then sort by time if dates are the same
      const timeA = a.appointment_time || '00:00';
      const timeB = b.appointment_time || '00:00';
      return timeA.localeCompare(timeB);
    });
  };

  // Render appointment card
  const renderAppointmentCard = (appointment) => {
    const isScheduled = appointment.status === 'Scheduled';
    const isInProgress = appointment.status === 'In-progress';
    const isCompleted = appointment.status === 'Completed';

    return (
      <div
        className={`appointment-card status-${appointment.status.toLowerCase().replace(' ', '-')}`}
        key={appointment._id}
      >
        <div className="appointment-header">
          <h3>{appointment.patient_id.name}</h3>
          <span className="appointment-status">{appointment.status}</span>
        </div>

        <div className="appointment-details">
          <p><strong>Time:</strong> {appointment.appointment_time || 'Not set'}</p>
          <p><strong>Type:</strong> {appointment.type}</p>
          {appointment.reason && <p><strong>Reason:</strong> {appointment.reason}</p>}
          <p><strong>Phone:</strong> {appointment.patient_id.phone}</p>
        </div>

        <div className="appointment-actions">
          {isScheduled && (
            <button
              className="btn-start"
              onClick={() => handleUpdateStatus(appointment._id, 'In-progress')}
              disabled={loading}
            >
              <FaUserMd /> Start
            </button>
          )}

          {isInProgress && isDoctor && (
            <button
              className="btn-complete"
              onClick={() => {
                setSelectedAppointment(appointment);
                setShowDiagnosisForm(true);
              }}
              disabled={loading}
            >
              <FaCheck /> Complete
            </button>
          )}
        </div>
      </div>
    );
  };

  // No queue entry rendering needed

  return (
    <div className="integrated-appointment-system">
      <div className="system-header">
        <h2>Appointment Management</h2>

        <div className="stats-panel">
          <div className="stat-item">
            <span className="stat-label">Total Today</span>
            <span className="stat-value">{stats.totalAppointments}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Scheduled</span>
            <span className="stat-value">{stats.scheduledCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{stats.completedCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cancelled</span>
            <span className="stat-value">{stats.cancelledCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">No-show</span>
            <span className="stat-value">{stats.noShowCount}</span>
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <FaCalendarAlt /> Appointments
          </button>
          <button
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <FaSearch /> Search
          </button>
          <button
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <FaChartBar /> Analytics
          </button>
        </div>
      </div>

      {error && <Message variant="danger">{error}</Message>}

      <div className="system-content">
        {loading && <Loader />}

        {activeTab === 'appointments' && (
          <div className="appointments-section">
            <div className="section-header">
              <h3>Today's Appointments</h3>
              <button
                className="btn-add"
                onClick={() => setShowPatientSearch(true)}
              >
                <FaPlus /> New Appointment
              </button>
            </div>

            <div className="appointments-list">
              {appointments.length === 0 ? (
                <p className="no-data-message">No appointments for today.</p>
              ) : (
                sortAppointmentsByTime(appointments).map(appointment => renderAppointmentCard(appointment))
              )}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="search-section">
            <AppointmentSearch
              onSelectAppointment={(appointment) => {
                setSelectedAppointmentForView(appointment);
                setActiveTab('appointments');
              }}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <AppointmentAnalytics />
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

      {/* Appointment Form Modal */}
      {showAppointmentForm && selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>New Appointment</h2>
            <p><strong>Patient:</strong> {selectedPatient.name}</p>

            <AppointmentForm
              onSubmit={handleCreateAppointment}
              onCancel={() => {
                setShowAppointmentForm(false);
                setSelectedPatient(null);
              }}
              isWalkIn={true}
            />
          </div>
        </div>
      )}

      {/* Diagnosis Form Modal */}
      {showDiagnosisForm && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Complete Appointment</h2>
            <p><strong>Patient:</strong> {selectedAppointment.patient_id.name}</p>

            <DiagnosisForm
              onSubmit={(diagnosisData) => handleCompleteAppointment(selectedAppointment._id, diagnosisData)}
              onCancel={() => {
                setShowDiagnosisForm(false);
                setSelectedAppointment(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedAppointmentSystem;
