// Local storage keys
export const STORAGE_KEYS = {
  PATIENTS: 'clinic_patients',
  APPOINTMENTS: 'clinic_appointments',
  REPORTS: 'clinic_reports',
  USERS: 'clinic_users'
};

// Save data to local storage
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

// Load data from local storage
export const loadFromLocalStorage = (key, defaultValue = []) => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

// Clear specific data from local storage
export const clearLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error clearing localStorage (${key}):`, error);
    return false;
  }
};

// Clear all clinic data from local storage
export const clearAllClinicData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error clearing all clinic data:', error);
    return false;
  }
};
