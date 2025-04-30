import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaUserClock, 
  FaUserMd, 
  FaCheck, 
  FaTimes, 
  FaExclamationTriangle,
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaDownload
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import apiService from '../utils/apiService';
import './AppointmentAnalytics.css';

const AppointmentAnalytics = () => {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch appointments on component mount and when date range changes
  useEffect(() => {
    fetchAppointments();
  }, [startDate, endDate]);

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Format dates for API query
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      const data = await apiService.getIntegratedAppointments({
        date_from: formattedStartDate,
        date_to: formattedEndDate
      });
      
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate overview statistics
  const calculateOverviewStats = () => {
    const totalAppointments = appointments.length;
    
    // Count by status
    const statusCounts = {
      Scheduled: 0,
      'Checked-in': 0,
      'In-progress': 0,
      Completed: 0,
      Cancelled: 0,
      'No-show': 0,
      Rescheduled: 0
    };
    
    // Count by type
    const typeCounts = {
      Consultation: 0,
      'Follow-up': 0,
      Procedure: 0,
      Test: 0,
      Emergency: 0,
      'Walk-in': 0
    };
    
    // Count by day of week
    const dayOfWeekCounts = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0
    };
    
    // Count by creator
    const creatorCounts = {
      doctor: 0,
      secretary: 0,
      visitor: 0,
      admin: 0
    };
    
    // Process each appointment
    appointments.forEach(appointment => {
      // Count by status
      if (statusCounts.hasOwnProperty(appointment.status)) {
        statusCounts[appointment.status]++;
      }
      
      // Count by type
      if (typeCounts.hasOwnProperty(appointment.type)) {
        typeCounts[appointment.type]++;
      }
      
      // Count by day of week
      const date = new Date(appointment.scheduled_date);
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
      dayOfWeekCounts[dayOfWeek]++;
      
      // Count by creator
      if (creatorCounts.hasOwnProperty(appointment.createdBy)) {
        creatorCounts[appointment.createdBy]++;
      }
    });
    
    // Calculate completion rate
    const completionRate = totalAppointments > 0 
      ? ((statusCounts.Completed / totalAppointments) * 100).toFixed(1) 
      : 0;
    
    // Calculate no-show rate
    const noShowRate = totalAppointments > 0 
      ? ((statusCounts['No-show'] / totalAppointments) * 100).toFixed(1) 
      : 0;
    
    // Calculate cancellation rate
    const cancellationRate = totalAppointments > 0 
      ? ((statusCounts.Cancelled / totalAppointments) * 100).toFixed(1) 
      : 0;
    
    return {
      totalAppointments,
      statusCounts,
      typeCounts,
      dayOfWeekCounts,
      creatorCounts,
      completionRate,
      noShowRate,
      cancellationRate
    };
  };

  // Calculate time-based statistics
  const calculateTimeStats = () => {
    // Group appointments by date
    const appointmentsByDate = {};
    
    appointments.forEach(appointment => {
      const dateStr = new Date(appointment.scheduled_date).toISOString().split('T')[0];
      
      if (!appointmentsByDate[dateStr]) {
        appointmentsByDate[dateStr] = [];
      }
      
      appointmentsByDate[dateStr].push(appointment);
    });
    
    // Calculate daily counts
    const dailyCounts = Object.keys(appointmentsByDate).map(date => ({
      date,
      count: appointmentsByDate[date].length
    }));
    
    // Sort by date
    dailyCounts.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate average appointments per day
    const avgAppointmentsPerDay = dailyCounts.length > 0
      ? (appointments.length / dailyCounts.length).toFixed(1)
      : 0;
    
    // Calculate busiest day
    let busiestDay = { date: null, count: 0 };
    
    dailyCounts.forEach(day => {
      if (day.count > busiestDay.count) {
        busiestDay = day;
      }
    });
    
    // Calculate average service time (if available)
    let totalServiceTime = 0;
    let serviceTimeCount = 0;
    
    appointments.forEach(appointment => {
      if (appointment.start_time && appointment.end_time) {
        const startTime = new Date(appointment.start_time);
        const endTime = new Date(appointment.end_time);
        const serviceTime = (endTime - startTime) / (1000 * 60); // in minutes
        
        totalServiceTime += serviceTime;
        serviceTimeCount++;
      }
    });
    
    const avgServiceTime = serviceTimeCount > 0
      ? (totalServiceTime / serviceTimeCount).toFixed(1)
      : 0;
    
    return {
      dailyCounts,
      avgAppointmentsPerDay,
      busiestDay,
      avgServiceTime
    };
  };

  // Calculate patient-based statistics
  const calculatePatientStats = () => {
    // Count appointments by patient
    const appointmentsByPatient = {};
    
    appointments.forEach(appointment => {
      const patientId = appointment.patient_id?._id;
      
      if (patientId) {
        if (!appointmentsByPatient[patientId]) {
          appointmentsByPatient[patientId] = {
            patientName: appointment.patient_id.name,
            count: 0,
            appointments: []
          };
        }
        
        appointmentsByPatient[patientId].count++;
        appointmentsByPatient[patientId].appointments.push(appointment);
      }
    });
    
    // Convert to array and sort by count (descending)
    const patientCounts = Object.values(appointmentsByPatient).sort((a, b) => b.count - a.count);
    
    // Get top 5 patients
    const topPatients = patientCounts.slice(0, 5);
    
    // Calculate number of unique patients
    const uniquePatients = Object.keys(appointmentsByPatient).length;
    
    // Calculate average appointments per patient
    const avgAppointmentsPerPatient = uniquePatients > 0
      ? (appointments.length / uniquePatients).toFixed(1)
      : 0;
    
    return {
      topPatients,
      uniquePatients,
      avgAppointmentsPerPatient
    };
  };

  // Generate CSV data for export
  const generateCSV = () => {
    // CSV header
    const header = [
      'Date',
      'Patient Name',
      'Type',
      'Status',
      'Created By',
      'Check-in Time',
      'Start Time',
      'End Time',
      'Notes'
    ].join(',');
    
    // CSV rows
    const rows = appointments.map(appointment => {
      const date = new Date(appointment.scheduled_date).toISOString().split('T')[0];
      const patientName = appointment.patient_id?.name || 'Unknown';
      const type = appointment.type || '';
      const status = appointment.status || '';
      const createdBy = appointment.createdBy || '';
      const checkInTime = appointment.check_in_time ? new Date(appointment.check_in_time).toISOString() : '';
      const startTime = appointment.start_time ? new Date(appointment.start_time).toISOString() : '';
      const endTime = appointment.end_time ? new Date(appointment.end_time).toISOString() : '';
      const notes = appointment.notes ? `"${appointment.notes.replace(/"/g, '""')}"` : '';
      
      return [
        date,
        patientName,
        type,
        status,
        createdBy,
        checkInTime,
        startTime,
        endTime,
        notes
      ].join(',');
    });
    
    // Combine header and rows
    return [header, ...rows].join('\n');
  };

  // Download CSV file
  const downloadCSV = () => {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `appointments_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get stats based on current data
  const overviewStats = calculateOverviewStats();
  const timeStats = calculateTimeStats();
  const patientStats = calculatePatientStats();

  return (
    <div className="appointment-analytics">
      <div className="analytics-header">
        <h2>Appointment Analytics</h2>
        
        <div className="date-range-selector">
          <div className="date-picker-container">
            <FaCalendarAlt className="date-icon" />
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate}
              className="date-picker"
              dateFormat="MMM d, yyyy"
            />
          </div>
          <span className="date-separator">to</span>
          <div className="date-picker-container">
            <FaCalendarAlt className="date-icon" />
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              className="date-picker"
              dateFormat="MMM d, yyyy"
            />
          </div>
          
          <button
            className="export-button"
            onClick={downloadCSV}
            disabled={loading || appointments.length === 0}
          >
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>
      
      <div className="analytics-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartPie /> Overview
        </button>
        <button
          className={`tab ${activeTab === 'time' ? 'active' : ''}`}
          onClick={() => setActiveTab('time')}
        >
          <FaChartLine /> Time Analysis
        </button>
        <button
          className={`tab ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          <FaChartBar /> Patient Analysis
        </button>
      </div>
      
      {loading ? (
        <div className="loading-message">Loading appointment data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="no-data-message">
          No appointments found for the selected date range.
        </div>
      ) : (
        <div className="analytics-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{overviewStats.totalAppointments}</div>
                    <div className="stat-label">Total Appointments</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaCheck />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{overviewStats.completionRate}%</div>
                    <div className="stat-label">Completion Rate</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaExclamationTriangle />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{overviewStats.noShowRate}%</div>
                    <div className="stat-label">No-show Rate</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaTimes />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{overviewStats.cancellationRate}%</div>
                    <div className="stat-label">Cancellation Rate</div>
                  </div>
                </div>
              </div>
              
              <div className="charts-container">
                <div className="chart-card">
                  <h3>Appointments by Status</h3>
                  <div className="bar-chart">
                    {Object.entries(overviewStats.statusCounts).map(([status, count]) => (
                      <div className="chart-item" key={status}>
                        <div className="chart-label">{status}</div>
                        <div className="chart-bar-container">
                          <div 
                            className={`chart-bar status-${status.toLowerCase().replace(' ', '-')}`}
                            style={{ width: `${count / overviewStats.totalAppointments * 100}%` }}
                          ></div>
                          <div className="chart-value">{count}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="chart-card">
                  <h3>Appointments by Type</h3>
                  <div className="bar-chart">
                    {Object.entries(overviewStats.typeCounts).map(([type, count]) => (
                      <div className="chart-item" key={type}>
                        <div className="chart-label">{type}</div>
                        <div className="chart-bar-container">
                          <div 
                            className="chart-bar"
                            style={{ width: `${count / overviewStats.totalAppointments * 100}%` }}
                          ></div>
                          <div className="chart-value">{count}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="chart-card">
                  <h3>Appointments by Day of Week</h3>
                  <div className="bar-chart">
                    {Object.entries(overviewStats.dayOfWeekCounts).map(([day, count]) => (
                      <div className="chart-item" key={day}>
                        <div className="chart-label">{day}</div>
                        <div className="chart-bar-container">
                          <div 
                            className="chart-bar"
                            style={{ width: `${count / overviewStats.totalAppointments * 100}%` }}
                          ></div>
                          <div className="chart-value">{count}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="chart-card">
                  <h3>Appointments by Creator</h3>
                  <div className="bar-chart">
                    {Object.entries(overviewStats.creatorCounts).map(([creator, count]) => (
                      <div className="chart-item" key={creator}>
                        <div className="chart-label">{creator}</div>
                        <div className="chart-bar-container">
                          <div 
                            className="chart-bar"
                            style={{ width: `${count / overviewStats.totalAppointments * 100}%` }}
                          ></div>
                          <div className="chart-value">{count}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'time' && (
            <div className="time-tab">
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{timeStats.avgAppointmentsPerDay}</div>
                    <div className="stat-label">Avg. Appointments/Day</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaUserClock />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {timeStats.busiestDay.date ? formatDate(timeStats.busiestDay.date) : 'N/A'}
                    </div>
                    <div className="stat-label">Busiest Day</div>
                    <div className="stat-subtitle">
                      {timeStats.busiestDay.count} appointments
                    </div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaUserMd />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{timeStats.avgServiceTime} min</div>
                    <div className="stat-label">Avg. Service Time</div>
                  </div>
                </div>
              </div>
              
              <div className="chart-card">
                <h3>Appointments by Date</h3>
                <div className="line-chart-container">
                  <div className="line-chart">
                    {timeStats.dailyCounts.map((day, index) => (
                      <div 
                        key={day.date} 
                        className="line-chart-bar"
                        style={{ 
                          height: `${day.count * 20}px`,
                          left: `${index * (100 / (timeStats.dailyCounts.length - 1 || 1))}%`
                        }}
                        title={`${formatDate(day.date)}: ${day.count} appointments`}
                      >
                        <div className="line-chart-tooltip">
                          {formatDate(day.date)}: {day.count}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="line-chart-axis">
                    {timeStats.dailyCounts.length > 0 && (
                      <>
                        <div className="axis-start">{formatDate(timeStats.dailyCounts[0].date)}</div>
                        <div className="axis-end">
                          {formatDate(timeStats.dailyCounts[timeStats.dailyCounts.length - 1].date)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'patients' && (
            <div className="patients-tab">
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaUser />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{patientStats.uniquePatients}</div>
                    <div className="stat-label">Unique Patients</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{patientStats.avgAppointmentsPerPatient}</div>
                    <div className="stat-label">Avg. Appointments/Patient</div>
                  </div>
                </div>
              </div>
              
              <div className="chart-card">
                <h3>Top Patients by Appointment Count</h3>
                <div className="bar-chart">
                  {patientStats.topPatients.map(patient => (
                    <div className="chart-item" key={patient.patientName}>
                      <div className="chart-label">{patient.patientName}</div>
                      <div className="chart-bar-container">
                        <div 
                          className="chart-bar"
                          style={{ width: `${patient.count / patientStats.topPatients[0].count * 100}%` }}
                        ></div>
                        <div className="chart-value">{patient.count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentAnalytics;
