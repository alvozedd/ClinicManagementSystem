/**
 * Utility function to clear all queue-related localStorage entries
 * This helps resolve issues with phantom queue entries appearing when the database is empty
 */

export const clearQueueStorage = () => {
  console.log('Clearing all queue-related localStorage entries');

  // Get all localStorage keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Check if the key is related to queue entries
    if (key && (
      key.startsWith('temp_queue_entry_') ||
      key.startsWith('queue_status_') ||
      key.includes('queue') ||
      key.includes('ticket')
    )) {
      keysToRemove.push(key);
    }
  }

  // Remove all identified keys
  keysToRemove.forEach(key => {
    console.log(`Removing localStorage key: ${key}`);
    localStorage.removeItem(key);
  });

  // Disable queue fallbacks to prevent phantom entries
  localStorage.setItem('use_queue_fallbacks', 'false');
  console.log('Disabled queue fallbacks to prevent phantom entries');

  console.log(`Cleared ${keysToRemove.length} queue-related localStorage entries`);
  return keysToRemove.length;
};

export default clearQueueStorage;
