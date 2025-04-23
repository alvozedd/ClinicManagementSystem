// This file is kept for backward compatibility
// It now uses API calls instead of localStorage

import apiService from './apiService';

// Storage keys (kept for backward compatibility)
export const STORAGE_KEYS = {
  PATIENTS: 'clinic_patients',
  APPOINTMENTS: 'clinic_appointments',
  REPORTS: 'clinic_reports',
  USERS: 'clinic_users'
};

// These functions are deprecated and should not be used directly
// They are kept for backward compatibility

// Save data to API instead of localStorage
export const saveToLocalStorage = (key, data) => {
  console.warn('saveToLocalStorage is deprecated. Use API calls directly.');
  return false;
};

// Load data from API instead of localStorage
export const loadFromLocalStorage = (key, defaultValue = []) => {
  console.warn('loadFromLocalStorage is deprecated. Use API calls directly.');
  return defaultValue;
};

// Clear specific data - no longer needed with API
export const clearLocalStorage = (key) => {
  console.warn('clearLocalStorage is deprecated. Use API calls directly.');
  return false;
};

// Clear all clinic data - no longer needed with API
export const clearAllClinicData = () => {
  console.warn('clearAllClinicData is deprecated. Use API calls directly.');
  return false;
};
