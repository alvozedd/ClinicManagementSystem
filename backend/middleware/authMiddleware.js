const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/userModel');

// Optional auth middleware - allows requests with or without authentication
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Check if this is a visitor booking
  const isVisitorBooking = req.body && req.body.createdBy === 'visitor';

  if (isVisitorBooking) {
    console.log('Visitor booking detected, skipping authentication');
    // For visitor bookings, we don't need authentication
    return next();
  }

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.error('Token verification failed, but continuing as visitor:', error.message);
      // Don't throw an error, just continue without setting req.user
    }
  }

  // Always proceed to the next middleware, even without a token
  next();
});

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Middleware to check if user has admin role
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

// Middleware to check if user has doctor role
const doctor = (req, res, next) => {
  if (req.user && (req.user.role === 'doctor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a doctor');
  }
};

// Middleware to check if user has secretary role
const secretary = (req, res, next) => {
  if (req.user && (req.user.role === 'secretary' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a secretary');
  }
};

// Middleware to check if user has doctor or secretary role
const doctorOrSecretary = (req, res, next) => {
  if (req.user && (req.user.role === 'doctor' || req.user.role === 'secretary' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a doctor or secretary');
  }
};

module.exports = { protect, optionalAuth, admin, doctor, secretary, doctorOrSecretary };
