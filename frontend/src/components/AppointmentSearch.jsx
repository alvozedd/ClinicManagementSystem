import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaCalendarAlt, FaUser, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import apiService from '../utils/apiService';
import './AppointmentSearch.css';

const AppointmentSearch = ({ onSelectAppointment }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Apply filters when search term or filters change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, startDate, endDate, statusFilter, typeFilter, appointments]);

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getIntegratedAppointments();
      
      // Sort appointments by date (newest first)
      const sortedAppointments = data.sort((a, b) => 
        new Date(b.scheduled_date) - new Date(a.scheduled_date)
      );
      
      setAppointments(sortedAppointments);
      setFilteredAppointments(sortedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to appointments
  const applyFilters = () => {
    let filtered = [...appointments];
    
    // Apply search term filter (patient name)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.patient_id?.name?.toLowerCase().includes(term)
      );
    }
    
    // Apply date range filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(appointment => 
        new Date(appointment.scheduled_date) >= start
      );
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(appointment => 
        new Date(appointment.scheduled_date) <= end
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(appointment => 
        appointment.status === statusFilter
      );
    }
    
    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(appointment => 
        appointment.type === typeFilter
      );
    }
    
    setFilteredAppointments(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStartDate(null);
    setEndDate(null);
    setStatusFilter('');
    setTypeFilter('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'status-scheduled';
      case 'Checked-in':
        return 'status-checked-in';
      case 'In-progress':
        return 'status-in-progress';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      case 'No-show':
        return 'status-no-show';
      case 'Rescheduled':
        return 'status-rescheduled';
      default:
        return '';
    }
  };

  return (
    <div className="appointment-search">
      <div className="search-header">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <FaTimes
              className="clear-search-icon"
              onClick={() => setSearchTerm('')}
            />
          )}
        </div>
        
        <button
          className="filter-toggle-button"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      {showFilters && (
        <div className="filters-container">
          <div className="filter-group">
            <label>Date Range</label>
            <div className="date-range-picker">
              <div className="date-picker-container">
                <FaCalendarAlt className="date-icon" />
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Start Date"
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
                  placeholderText="End Date"
                  className="date-picker"
                  dateFormat="MMM d, yyyy"
                />
              </div>
            </div>
          </div>
          
          <div className="filter-group">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Checked-in">Checked-in</option>
              <option value="In-progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-show">No-show</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="Consultation">Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Procedure">Procedure</option>
              <option value="Test">Test</option>
              <option value="Emergency">Emergency</option>
              <option value="Walk-in">Walk-in</option>
            </select>
          </div>
          
          <button
            className="clear-filters-button"
            onClick={clearFilters}
          >
            <FaTimes /> Clear Filters
          </button>
        </div>
      )}
      
      <div className="search-results">
        <div className="results-header">
          <span className="results-count">
            {filteredAppointments.length} {filteredAppointments.length === 1 ? 'appointment' : 'appointments'} found
          </span>
          <button
            className="refresh-button"
            onClick={fetchAppointments}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
        
        {loading ? (
          <div className="loading-message">Loading appointments...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="no-results-message">
            No appointments found. Try adjusting your search or filters.
          </div>
        ) : (
          <div className="appointment-list">
            {filteredAppointments.map(appointment => (
              <div
                key={appointment._id}
                className="appointment-card"
                onClick={() => onSelectAppointment(appointment)}
              >
                <div className="appointment-header">
                  <div className="patient-info">
                    <FaUser className="patient-icon" />
                    <span className="patient-name">{appointment.patient_id?.name || 'Unknown Patient'}</span>
                  </div>
                  <span className={`appointment-status ${getStatusClass(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                
                <div className="appointment-details">
                  <div className="appointment-date">
                    <FaCalendarAlt className="date-icon" />
                    <span>{formatDate(appointment.scheduled_date)}</span>
                  </div>
                  
                  <div className="appointment-type">
                    <span className="label">Type:</span>
                    <span>{appointment.type || 'Consultation'}</span>
                  </div>
                  
                  {appointment.reason && (
                    <div className="appointment-reason">
                      <span className="label">Reason:</span>
                      <span>{appointment.reason}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentSearch;
