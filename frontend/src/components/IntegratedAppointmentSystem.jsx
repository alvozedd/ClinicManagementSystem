import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import AuthContext from '../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaCalendarAlt, FaUserClock, FaUserMd, FaCheck, FaTrash, FaEdit, FaPlus, FaArrowRight, FaArrowLeft, FaSearch, FaChartBar } from 'react-icons/fa';
import apiService from '../utils/apiService';
import Loader from './Loader';
import Message from './Message';
import PatientSearchModal from './PatientSearchModal';
import AppointmentForm from './AppointmentForm';
import DiagnosisForm from './DiagnosisForm';
import QueueNotification from './QueueNotification';
import AppointmentSearch from './AppointmentSearch';
import AppointmentAnalytics from './AppointmentAnalytics';
import './IntegratedAppointmentSystem.css';

const IntegratedAppointmentSystem = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [queueEntries, setQueueEntries] = useState([]);
  const [queueStats, setQueueStats] = useState({
    totalAppointments: 0,
    checkedInCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    noShowCount: 0,
    walkInCount: 0,
    scheduledCount: 0,
    nextQueueNumber: 1,
    avgServiceTime: 0
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
      setError(null);
    } catch (err) {
      setError('Failed to fetch appointments: ' + (err.message || err));
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch queue entries
  const fetchQueueEntries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getTodaysQueue();
      setQueueEntries(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch queue: ' + (err.message || err));
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch queue statistics
  const fetchQueueStats = useCallback(async () => {
    try {
      const data = await apiService.getIntegratedQueueStats();
      setQueueStats(data);
    } catch (err) {
      console.error('Error fetching queue stats:', err);
    }
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchTodaysAppointments(),
      fetchQueueEntries(),
      fetchQueueStats()
    ]);
    setLoading(false);
  }, [fetchTodaysAppointments, fetchQueueEntries, fetchQueueStats]);

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

  // Handle check-in
  const handleCheckIn = async (appointmentId) => {
    try {
      setLoading(true);
      await apiService.checkInPatient(appointmentId);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError('Failed to check in patient: ' + (err.message || err));
      console.error('Error checking in patient:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle start appointment
  const handleStartAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      await apiService.startAppointment(appointmentId);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError('Failed to start appointment: ' + (err.message || err));
      console.error('Error starting appointment:', err);
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

  // Handle drag and drop for queue reordering
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(queueEntries);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the UI immediately
    setQueueEntries(items);

    // Prepare the data for the API
    const queueOrder = items.map((item, index) => ({
      id: item._id,
      position: index
    }));

    try {
      await apiService.reorderIntegratedQueue(queueOrder);
    } catch (err) {
      setError('Failed to reorder queue: ' + (err.message || err));
      console.error('Error reordering queue:', err);
      // Revert to the original order if the API call fails
      fetchQueueEntries();
    }
  };

  // Render appointment card
  const renderAppointmentCard = (appointment) => {
    const isScheduled = appointment.status === 'Scheduled';
    const isCheckedIn = appointment.status === 'Checked-in';
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
          <p><strong>Type:</strong> {appointment.type}</p>
          {appointment.reason && <p><strong>Reason:</strong> {appointment.reason}</p>}
          <p><strong>Phone:</strong> {appointment.patient_id.phone}</p>
          {appointment.queue_number && (
            <p><strong>Ticket #:</strong> {appointment.queue_number}</p>
          )}
        </div>

        <div className="appointment-actions">
          {isScheduled && (
            <button
              className="btn-check-in"
              onClick={() => handleCheckIn(appointment._id)}
              disabled={loading}
            >
              <FaUserClock /> Check In
            </button>
          )}

          {isCheckedIn && isDoctor && (
            <button
              className="btn-start"
              onClick={() => handleStartAppointment(appointment._id)}
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

  // Render queue entry
  const renderQueueEntry = (entry, index) => {
    return (
      <Draggable
        key={entry._id}
        draggableId={entry._id}
        index={index}
        isDragDisabled={!isSecretary || entry.status === 'In-progress'}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`queue-entry status-${entry.status.toLowerCase().replace(' ', '-')}`}
          >
            <div className="queue-entry-header">
              <span className="ticket-number">#{entry.queue_number}</span>
              <h3>{entry.patient_id.name}</h3>
              <span className="queue-status">{entry.status}</span>
            </div>

            <div className="queue-entry-details">
              <p><strong>Type:</strong> {entry.type}</p>
              {entry.reason && <p><strong>Reason:</strong> {entry.reason}</p>}
              <p><strong>Phone:</strong> {entry.patient_id.phone}</p>
            </div>

            <div className="queue-entry-actions">
              {entry.status === 'Checked-in' && isDoctor && (
                <button
                  className="btn-start"
                  onClick={() => handleStartAppointment(entry._id)}
                  disabled={loading}
                >
                  <FaUserMd /> Start
                </button>
              )}

              {entry.status === 'In-progress' && isDoctor && (
                <button
                  className="btn-complete"
                  onClick={() => {
                    setSelectedAppointment(entry);
                    setShowDiagnosisForm(true);
                  }}
                  disabled={loading}
                >
                  <FaCheck /> Complete
                </button>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="integrated-appointment-system">
      <div className="system-header">
        <h2>Appointment & Queue Management</h2>

        <div className="stats-panel">
          <div className="stat-item">
            <span className="stat-label">Total Today</span>
            <span className="stat-value">{queueStats.totalAppointments}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Waiting</span>
            <span className="stat-value">{queueStats.checkedInCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{queueStats.inProgressCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{queueStats.completedCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Next Ticket</span>
            <span className="stat-value">#{queueStats.nextQueueNumber}</span>
          </div>
          {queueStats.avgServiceTime > 0 && (
            <div className="stat-item">
              <span className="stat-label">Avg. Time</span>
              <span className="stat-value">{queueStats.avgServiceTime} min</span>
            </div>
          )}
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <FaCalendarAlt /> Appointments
          </button>
          <button
            className={`tab ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            <FaUserClock /> Queue
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

          <div className="notification-container">
            <QueueNotification queueEntries={queueEntries} />
          </div>
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
                appointments.map(appointment => renderAppointmentCard(appointment))
              )}
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="queue-section">
            <div className="section-header">
              <h3>Today's Queue</h3>
              <div className="queue-controls">
                <button
                  className="btn-refresh"
                  onClick={() => setRefreshTrigger(prev => prev + 1)}
                  disabled={loading}
                >
                  Refresh
                </button>
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="queue">
                {(provided) => (
                  <div
                    className="queue-list"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {queueEntries.length === 0 ? (
                      <p className="no-data-message">No patients in queue.</p>
                    ) : (
                      queueEntries.map((entry, index) => renderQueueEntry(entry, index))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="search-section">
            <AppointmentSearch
              onSelectAppointment={(appointment) => {
                setSelectedAppointmentForView(appointment);
                // If the appointment is in the queue, switch to queue tab
                if (appointment.status === 'Checked-in' || appointment.status === 'In-progress') {
                  setActiveTab('queue');
                } else {
                  setActiveTab('appointments');
                }
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
