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
  // Only provide CSRF token if the request has the csrfToken method
  // (it won't be available for exempt routes)
  if (req.csrfToken && typeof req.csrfToken === 'function') {
    try {
      const token = req.csrfToken();
      // Add CSRF token to response locals for templates
      res.locals.csrfToken = token;

      // Also add it as a header for API requests
      res.setHeader('X-CSRF-Token', token);
    } catch (error) {
      console.warn('Error generating CSRF token:', error.message);
    }
  }

  next();
};

// Middleware to exempt certain routes from CSRF protection
const exemptCsrf = (req, res, next) => {
  try {
    // Skip CSRF for these routes
    const exemptRoutes = [
      '/api/users/login',
      '/api/users/refresh-token',
      '/api/patients', // For visitor bookings
      '/api/appointments', // For visitor bookings
      '/api/health',
      '/api/health/detailed',
      '/'
    ];

    // Skip CSRF for GET, HEAD, OPTIONS requests
    const exemptMethods = ['GET', 'HEAD', 'OPTIONS'];

    // Check if the route is exempt
    const isExemptRoute = exemptRoutes.some(route =>
      req.path === route || req.path.startsWith(`${route}/`)
    );

    if (
      isExemptRoute ||
      exemptMethods.includes(req.method)
    ) {
      next();
    } else {
      csrfProtection(req, res, next);
    }
  } catch (error) {
    console.error('Error in CSRF middleware:', error);
    // If there's an error, skip CSRF protection as a fallback
    next();
  }
};

module.exports = {
  csrfProtection,
  handleCsrfError,
  provideCsrfToken,
  exemptCsrf,
};
