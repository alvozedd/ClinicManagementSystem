/**
 * Request logging middleware
 * Logs all incoming requests and their responses
 */
const logger = require('../utils/logger');

/**
 * Log request details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const logRequest = (req, res, next) => {
  // Get the start time
  const startTime = Date.now();
  
  // Log the request
  logger.info(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    requestId: req.id,
    userAgent: req.headers['user-agent'],
    referrer: req.headers['referer'] || req.headers['referrer'],
  });
  
  // Create a function to log the response
  const logResponse = () => {
    // Calculate request duration
    const duration = Date.now() - startTime;
    
    // Get the status code
    const statusCode = res.statusCode;
    
    // Log based on status code
    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`${req.method} ${req.originalUrl} ${statusCode} ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      duration,
      requestId: req.id,
    });
    
    // Remove the listeners to prevent memory leaks
    res.removeListener('finish', logResponse);
    res.removeListener('close', logResponse);
  };
  
  // Listen for the response events
  res.on('finish', logResponse);
  res.on('close', logResponse);
  
  next();
};

/**
 * Skip logging for certain paths (like health checks)
 * @param {Object} req - Express request object
 * @returns {boolean} - Whether to skip logging
 */
const shouldSkipLogging = (req) => {
  const skipPaths = [
    '/health',
    '/favicon.ico',
  ];
  
  return skipPaths.some(path => req.path.startsWith(path));
};

/**
 * Middleware that conditionally logs requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const conditionalRequestLogger = (req, res, next) => {
  if (shouldSkipLogging(req)) {
    return next();
  }
  
  logRequest(req, res, next);
};

module.exports = {
  logRequest,
  conditionalRequestLogger,
};
