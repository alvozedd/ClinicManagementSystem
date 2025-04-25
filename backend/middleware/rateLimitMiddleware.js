/**
 * Rate limiting middleware to prevent brute force and DoS attacks
 */
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Create a limiter for general API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      path: req.path,
      method: req.method,
      headers: req.headers,
    });
    res.status(options.statusCode).json({
      message: options.message,
    });
  },
});

// Create a stricter limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts from this IP, please try again after an hour',
  handler: (req, res, next, options) => {
    logger.warn(`Authentication rate limit exceeded for IP: ${req.ip}`, {
      path: req.path,
      method: req.method,
      username: req.body.username,
    });
    res.status(options.statusCode).json({
      message: options.message,
    });
  },
});

// Create a limiter for user registration
const registrationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // Limit each IP to 5 registration attempts per day
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many registration attempts from this IP, please try again after 24 hours',
  handler: (req, res, next, options) => {
    logger.warn(`Registration rate limit exceeded for IP: ${req.ip}`, {
      path: req.path,
      method: req.method,
    });
    res.status(options.statusCode).json({
      message: options.message,
    });
  },
});

// Create a limiter for public endpoints (like visitor bookings)
const publicEndpointLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per hour for public endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after an hour',
  handler: (req, res, next, options) => {
    logger.warn(`Public endpoint rate limit exceeded for IP: ${req.ip}`, {
      path: req.path,
      method: req.method,
    });
    res.status(options.statusCode).json({
      message: options.message,
    });
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  registrationLimiter,
  publicEndpointLimiter,
};
