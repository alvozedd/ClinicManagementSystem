/**
 * CSRF protection middleware
 */
const csrf = require('csurf');
const logger = require('../utils/logger');

// Configure CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600, // 1 hour
  },
});

// Error handler for CSRF errors
const handleCsrfError = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  // Log the CSRF error
  logger.warn('CSRF attack detected', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    headers: req.headers,
  });

  // Send a 403 Forbidden response
  res.status(403).json({
    message: 'Invalid or missing CSRF token. Form expired or possible CSRF attack.',
  });
};

// Middleware to provide CSRF token to the frontend
const provideCsrfToken = (req, res, next) => {
  // Add CSRF token to response locals for templates
  res.locals.csrfToken = req.csrfToken();
  
  // Also add it as a header for API requests
  res.setHeader('X-CSRF-Token', req.csrfToken());
  
  next();
};

// Middleware to exempt certain routes from CSRF protection
const exemptCsrf = (req, res, next) => {
  // Skip CSRF for these routes
  const exemptRoutes = [
    '/api/users/login',
    '/api/users/refresh-token',
    '/api/patients', // For visitor bookings
    '/api/appointments', // For visitor bookings
  ];
  
  // Skip CSRF for GET, HEAD, OPTIONS requests
  const exemptMethods = ['GET', 'HEAD', 'OPTIONS'];
  
  if (
    exemptRoutes.includes(req.path) ||
    exemptMethods.includes(req.method)
  ) {
    next();
  } else {
    csrfProtection(req, res, next);
  }
};

module.exports = {
  csrfProtection,
  handleCsrfError,
  provideCsrfToken,
  exemptCsrf,
};
