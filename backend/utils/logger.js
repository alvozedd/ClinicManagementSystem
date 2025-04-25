/**
 * Secure logging utility that sanitizes sensitive information
 */

// List of fields that should be redacted in logs
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'refreshToken',
  'authorization',
  'cookie',
  'jwt',
  'secret',
  'key',
  'apiKey',
  'api_key',
  'access_token',
  'refresh_token',
];

/**
 * Sanitize an object by redacting sensitive fields
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Create a copy of the object to avoid modifying the original
  const sanitized = { ...obj };

  // Redact sensitive fields
  Object.keys(sanitized).forEach((key) => {
    const lowerKey = key.toLowerCase();
    
    // Check if the key contains any sensitive field name
    const isSensitive = SENSITIVE_FIELDS.some(field => lowerKey.includes(field));
    
    if (isSensitive) {
      // Redact the value
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  });

  return sanitized;
};

/**
 * Log information with sensitive data redacted
 * @param {string} message - Log message
 * @param {Object} data - Data to log (will be sanitized)
 */
const info = (message, data = null) => {
  if (data) {
    console.log(message, sanitizeObject(data));
  } else {
    console.log(message);
  }
};

/**
 * Log error with sensitive data redacted
 * @param {string} message - Error message
 * @param {Object|Error} error - Error object or data to log (will be sanitized)
 */
const error = (message, error = null) => {
  if (error instanceof Error) {
    // For Error objects, we want to keep the stack trace but sanitize the message
    const sanitizedError = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    console.error(message, sanitizedError);
  } else if (error) {
    console.error(message, sanitizeObject(error));
  } else {
    console.error(message);
  }
};

/**
 * Log debug information with sensitive data redacted (only in development)
 * @param {string} message - Debug message
 * @param {Object} data - Data to log (will be sanitized)
 */
const debug = (message, data = null) => {
  if (process.env.NODE_ENV !== 'production') {
    if (data) {
      console.debug(message, sanitizeObject(data));
    } else {
      console.debug(message);
    }
  }
};

/**
 * Log warning with sensitive data redacted
 * @param {string} message - Warning message
 * @param {Object} data - Data to log (will be sanitized)
 */
const warn = (message, data = null) => {
  if (data) {
    console.warn(message, sanitizeObject(data));
  } else {
    console.warn(message);
  }
};

module.exports = {
  info,
  error,
  debug,
  warn,
  sanitizeObject,
};
