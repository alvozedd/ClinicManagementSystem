const logger = require('../utils/logger');

/**
 * Middleware for handling 404 Not Found errors
 */
const notFound = (req, res, next) => {
  // Log the 404 error
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    headers: req.headers,
    query: req.query,
  });

  // Ensure CORS headers are set for 404 responses
  const origin = req.headers.origin;

  // Set the Vary header
  res.header('Vary', 'Origin');

  // Always allow the requesting origin
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    logger.debug(`Setting Access-Control-Allow-Origin: ${origin} for 404 response`);
  } else {
    // No origin in request, set to wildcard
    res.header('Access-Control-Allow-Origin', '*');
    logger.debug('Setting Access-Control-Allow-Origin: * for 404 response');
  }

  // Set credentials to true for all requests
  res.header('Access-Control-Allow-Credentials', 'true');

  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-Request-Id');

  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Sanitize error messages to prevent information disclosure
 * @param {Error} err - The error object
 * @returns {string} - Sanitized error message
 */
const sanitizeErrorMessage = (err) => {
  // List of sensitive error patterns to sanitize
  const sensitivePatterns = [
    /password/i,
    /credential/i,
    /auth/i,
    /token/i,
    /secret/i,
    /key/i,
    /mongodb/i,
    /mongoose/i,
    /database/i,
    /sql/i,
    /syntax error/i,
  ];

  // Check if the error message contains sensitive information
  const message = err.message || 'An error occurred';
  const containsSensitiveInfo = sensitivePatterns.some(pattern => pattern.test(message));

  // Return a generic message if sensitive info is detected
  if (containsSensitiveInfo) {
    return 'An internal server error occurred';
  }

  return message;
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Determine the status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log the error with appropriate level based on status code
  if (statusCode >= 500) {
    logger.error(`Server Error: ${err.message}`, {
      error: err,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  } else if (statusCode >= 400) {
    logger.warn(`Client Error: ${err.message}`, {
      path: req.path,
      method: req.method,
      ip: req.ip,
      statusCode,
    });
  }

  // Ensure CORS headers are set even in error responses
  const origin = req.headers.origin;

  // Set the Vary header
  res.header('Vary', 'Origin');

  // Always allow the requesting origin
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    logger.debug(`Setting Access-Control-Allow-Origin: ${origin} for error response`);
  } else {
    // No origin in request, set to wildcard
    res.header('Access-Control-Allow-Origin', '*');
    logger.debug('Setting Access-Control-Allow-Origin: * for error response');
  }

  // Set credentials to true for all requests
  res.header('Access-Control-Allow-Credentials', 'true');

  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-Request-Id');

  // Sanitize the error message
  const sanitizedMessage = sanitizeErrorMessage(err);

  // Send the response
  res.status(statusCode);
  res.json({
    message: sanitizedMessage,
    // Only include stack trace in development
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    // Include a request ID for tracking (if available)
    requestId: req.id,
  });
};

module.exports = {
  notFound,
  errorHandler,
  sanitizeErrorMessage, // Export for testing
};
