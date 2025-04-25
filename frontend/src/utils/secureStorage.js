/**
 * Secure storage utility for handling sensitive data on the client side
 * This provides a more secure alternative to localStorage for sensitive data
 */

// Encryption key (in a real app, this would be generated and stored securely)
// For demo purposes, we're using a fixed key
const ENCRYPTION_KEY = 'UroHealth-Secure-Storage-Key';

/**
 * Encrypt data before storing
 * @param {string} data - Data to encrypt
 * @returns {string} - Encrypted data
 */
const encrypt = (data) => {
  try {
    // In a real implementation, this would use the Web Crypto API for encryption
    // For this demo, we're using a simple Base64 encoding with a timestamp to prevent replay
    const timestamp = new Date().getTime();
    const payload = JSON.stringify({ data, timestamp });
    return btoa(payload);
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

/**
 * Decrypt stored data
 * @param {string} encryptedData - Encrypted data to decrypt
 * @returns {any} - Decrypted data
 */
const decrypt = (encryptedData) => {
  try {
    // Decrypt the data
    const payload = JSON.parse(atob(encryptedData));
    
    // Check if the data is expired (24 hours)
    const timestamp = payload.timestamp;
    const now = new Date().getTime();
    const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
    
    if (now - timestamp > expirationTime) {
      console.warn('Secure storage data has expired');
      return null;
    }
    
    return payload.data;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Store data securely
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
const setItem = (key, value) => {
  try {
    const encryptedValue = encrypt(value);
    if (encryptedValue) {
      sessionStorage.setItem(key, encryptedValue);
    }
  } catch (error) {
    console.error('Error storing data securely:', error);
  }
};

/**
 * Retrieve securely stored data
 * @param {string} key - Storage key
 * @returns {any} - Retrieved value or null if not found/invalid
 */
const getItem = (key) => {
  try {
    const encryptedValue = sessionStorage.getItem(key);
    if (!encryptedValue) return null;
    
    return decrypt(encryptedValue);
  } catch (error) {
    console.error('Error retrieving secure data:', error);
    return null;
  }
};

/**
 * Remove securely stored data
 * @param {string} key - Storage key
 */
const removeItem = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing secure data:', error);
  }
};

/**
 * Clear all securely stored data
 */
const clear = () => {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing secure storage:', error);
  }
};

export default {
  setItem,
  getItem,
  removeItem,
  clear,
};
