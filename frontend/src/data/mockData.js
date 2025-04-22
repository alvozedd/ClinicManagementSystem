// Mock data for the UroHealth Central application
import { STORAGE_KEYS, loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';

// Get current date for created/updated timestamps
const now = new Date().toISOString();

// Empty initial patients data (so user can add their own test data)
const initialPatients = [];

// Empty initial appointments data
const initialAppointments = [];

// Empty initial medical reports data
const initialReports = [];

// Today's appointments (for dashboard)
export const getTodaysAppointments = () => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

  // Get fresh appointments data from localStorage
  const currentAppointments = getAppointments();

  console.log('Today\'s date:', formattedDate);
  console.log('All appointments (fresh from localStorage):', currentAppointments);

  if (currentAppointments.length === 0) {
    return [];
  }

  // Filter appointments for today
  const todaysAppointments = currentAppointments.filter(appointment => {
    console.log(`Comparing appointment date: ${appointment.date} with today: ${formattedDate}`);
    return appointment.date === formattedDate;
  }).sort((a, b) => a.time.localeCompare(b.time));

  console.log('Today\'s appointments:', todaysAppointments);
  return todaysAppointments;
};

// Recent patients (for dashboard)
export const getRecentPatients = () => {
  // Get fresh patients data from localStorage
  const currentPatients = getPatients();

  console.log('Getting recent patients, total patients:', currentPatients.length);

  if (currentPatients.length === 0) {
    return [];
  }

  // Sort patients by last visit date (most recent first)
  return [...currentPatients].sort((a, b) =>
    new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0)
  ).slice(0, 5); // Get top 5
};

// Recent reports (for dashboard)
export const getRecentReports = () => {
  // Get fresh reports data from localStorage
  const currentReports = getReports();

  if (currentReports.length === 0) {
    return [];
  }

  // Sort reports by date (most recent first)
  return [...currentReports].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  ).slice(0, 5); // Get top 5
};

// Functions to get fresh data from localStorage
export const getPatients = () => loadFromLocalStorage(STORAGE_KEYS.PATIENTS, initialPatients);
export const getAppointments = () => loadFromLocalStorage(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
export const getReports = () => loadFromLocalStorage(STORAGE_KEYS.REPORTS, initialReports);

// For backward compatibility
export const patients = getPatients();
export const appointments = getAppointments();
export const reports = getReports();

// Save data to localStorage
export const savePatients = (data) => {
  saveToLocalStorage(STORAGE_KEYS.PATIENTS, data);
};

export const saveAppointments = (data) => {
  saveToLocalStorage(STORAGE_KEYS.APPOINTMENTS, data);
};

export const saveReports = (data) => {
  saveToLocalStorage(STORAGE_KEYS.REPORTS, data);
};
