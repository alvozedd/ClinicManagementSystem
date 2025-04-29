// Data service for the UroHealth Central application
import apiService from '../utils/apiService';
import { transformAppointmentsFromBackend } from '../utils/dataTransformers';

// Get current date for created/updated timestamps
const now = new Date().toISOString();

// Empty initial data arrays (used as fallbacks)
const initialPatients = [];
const initialAppointments = [];
const initialReports = [];

// Cache for API data to reduce API calls
let patientsCache = [];
let appointmentsCache = [];
let reportsCache = [];
let lastFetchTime = {
  patients: 0,
  appointments: 0,
  reports: 0
};

// Cache expiration times (in milliseconds)
const CACHE_EXPIRATION = {
  // Default expiration time (30 seconds)
  DEFAULT: 30 * 1000,

  // Short expiration for frequently changing data (5 seconds)
  SHORT: 5 * 1000,

  // Long expiration for rarely changing data (2 minutes)
  LONG: 2 * 60 * 1000
};

// Today's appointments (for dashboard)
export const getTodaysAppointments = async () => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    // Get fresh appointments data from API
    const currentAppointments = await getAppointments();

    console.log('Today\'s date:', formattedDate);
    console.log('All appointments (from API):', currentAppointments);

    if (!currentAppointments || currentAppointments.length === 0) {
      return [];
    }

    // Filter appointments for today
    const todaysAppointments = currentAppointments
      .filter(appointment => {
        try {
          // Skip invalid appointments
          if (!appointment || !appointment.date) {
            console.warn('Skipping invalid appointment in today\'s filter:', appointment);
            return false;
          }

          // Use the date field which is already in YYYY-MM-DD format in our transformed data
          console.log(`Comparing appointment date: ${appointment.date} with today: ${formattedDate}`);
          return appointment.date === formattedDate;
        } catch (err) {
          console.error('Error filtering appointment:', err, appointment);
          return false;
        }
      })
      .sort((a, b) => {
        try {
          // Sort by time
          if (a.time && b.time) {
            return a.time.localeCompare(b.time);
          }
          return 0;
        } catch (err) {
          console.error('Error sorting appointments:', err);
          return 0;
        }
      });

    console.log('Today\'s appointments:', todaysAppointments);
    return todaysAppointments;
  } catch (error) {
    console.error('Error getting today\'s appointments:', error);
    return [];
  }
};

// Recent patients (for dashboard)
export const getRecentPatients = async () => {
  try {
    // Get fresh patients data from API
    const currentPatients = await getPatients();

    console.log('Getting recent patients, total patients:', currentPatients.length);

    if (!currentPatients || currentPatients.length === 0) {
      return [];
    }

    // Sort patients by createdAt date (most recent first)
    return [...currentPatients].sort((a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    ).slice(0, 5); // Get top 5
  } catch (error) {
    console.error('Error getting recent patients:', error);
    return [];
  }
};

// Recent reports (for dashboard)
export const getRecentReports = async () => {
  try {
    // Get fresh reports data from API
    const currentReports = await getReports();

    if (!currentReports || currentReports.length === 0) {
      return [];
    }

    // Sort reports by createdAt date (most recent first)
    return [...currentReports].sort((a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    ).slice(0, 5); // Get top 5
  } catch (error) {
    console.error('Error getting recent reports:', error);
    return [];
  }
};

// Functions to get fresh data from API with caching
export const getPatients = async () => {
  try {
    // Check if cache is valid
    const now = Date.now();
    if (patientsCache.length > 0 && (now - lastFetchTime.patients) < CACHE_EXPIRATION.LONG) {
      return patientsCache;
    }

    // Fetch from API
    const patients = await apiService.getPatients();

    // Update cache
    patientsCache = patients;
    lastFetchTime.patients = now;

    return patients;
  } catch (error) {
    console.error('Error fetching patients from API:', error);
    return patientsCache.length > 0 ? patientsCache : initialPatients;
  }
};

export const getAppointments = async () => {
  try {
    // Check if cache is valid
    const now = Date.now();
    if (appointmentsCache.length > 0 && (now - lastFetchTime.appointments) < CACHE_EXPIRATION.SHORT) {
      return appointmentsCache;
    }

    // Fetch from API
    const appointmentsResponse = await apiService.getAppointments();

    // Transform appointments to frontend format
    const appointments = transformAppointmentsFromBackend(appointmentsResponse);

    // Update cache
    appointmentsCache = appointments;
    lastFetchTime.appointments = now;

    return appointments;
  } catch (error) {
    console.error('Error fetching appointments from API:', error);
    return appointmentsCache.length > 0 ? appointmentsCache : initialAppointments;
  }
};

export const getReports = async () => {
  try {
    // Check if cache is valid
    const now = Date.now();
    if (reportsCache.length > 0 && (now - lastFetchTime.reports) < CACHE_EXPIRATION.DEFAULT) {
      return reportsCache;
    }

    // Fetch from API
    const reports = await apiService.getDiagnoses();

    // Update cache
    reportsCache = reports;
    lastFetchTime.reports = now;

    return reports;
  } catch (error) {
    console.error('Error fetching reports from API:', error);
    return reportsCache.length > 0 ? reportsCache : initialReports;
  }
};

// Function to clear all caches - call this after data modifications
export const clearAllCaches = () => {
  console.log('Clearing all data caches');
  patientsCache = [];
  appointmentsCache = [];
  reportsCache = [];
  lastFetchTime.patients = 0;
  lastFetchTime.appointments = 0;
  lastFetchTime.reports = 0;
};

// Function to clear specific cache - use this for targeted refreshes
export const clearCache = (cacheType) => {
  console.log(`Clearing ${cacheType} cache`);
  switch (cacheType) {
    case 'patients':
      patientsCache = [];
      lastFetchTime.patients = 0;
      break;
    case 'appointments':
      appointmentsCache = [];
      lastFetchTime.appointments = 0;
      break;
    case 'reports':
    case 'diagnoses':
      reportsCache = [];
      lastFetchTime.reports = 0;
      break;
    default:
      console.warn(`Unknown cache type: ${cacheType}`);
  }
};

// Save functions now use API calls
export const savePatients = async (data) => {
  console.warn('savePatients is deprecated. Use apiService directly.');
  return false;
};

export const saveAppointments = async (data) => {
  console.warn('saveAppointments is deprecated. Use apiService directly.');
  return false;
};

export const saveReports = async (data) => {
  console.warn('saveReports is deprecated. Use apiService directly.');
  return false;
};
