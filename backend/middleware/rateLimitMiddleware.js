/**
 * Rate limiting middleware to prevent brute force and DoS attacks
 */
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Common configuration for all rate limiters
const commonConfig = {
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Trust the X-Forwarded-For header from our reverse proxy
  trustProxy: true
};

// Create a limiter for general API requests
const apiLimiter = rateLimit({
  ...commonConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
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
  ...commonConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login attempts per hour
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
  ...commonConfig,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // Limit each IP to 5 registration attempts per day
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
  ...commonConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per hour for public endpoints
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
