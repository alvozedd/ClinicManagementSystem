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
    console.log(`Saving to localStorage - Key: ${key}, Data:`, data);
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    console.log(`Data saved to localStorage - Key: ${key}, JSON length: ${jsonData.length}`);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

// Load data from local storage
export const loadFromLocalStorage = (key, defaultValue = []) => {
  try {
    console.log(`Loading from localStorage - Key: ${key}`);
    const storedData = localStorage.getItem(key);
    console.log(`Raw data from localStorage - Key: ${key}, Data:`, storedData);

    if (!storedData) {
      console.log(`No data found in localStorage for key: ${key}, using default value`);
      return defaultValue;
    }

    const parsedData = JSON.parse(storedData);
    console.log(`Parsed data from localStorage - Key: ${key}, Items: ${parsedData.length}`);
    return parsedData;
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
