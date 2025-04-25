const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentsByPatientId,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { protect, optionalAuth, secretary, doctor } = require('../middleware/authMiddleware');
const { validateAppointmentCreation } = require('../middleware/validationMiddleware');
const { publicEndpointLimiter, apiLimiter } = require('../middleware/rateLimitMiddleware');

// Create a middleware that allows both doctors and secretaries
const doctorOrSecretary = (req, res, next) => {
  if (req.user && (req.user.role === 'doctor' || req.user.role === 'secretary' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a doctor or secretary');
  }
};

// Use optionalAuth to allow both authenticated and unauthenticated requests
// Apply rate limiting to public endpoints
router.route('/')
  .post(optionalAuth, (req, res, next) => {
    // Apply different rate limiters based on whether it's a visitor booking
    if (req.body && req.body.createdBy === 'visitor') {
      publicEndpointLimiter(req, res, next);
    } else {
      apiLimiter(req, res, next);
    }
  }, validateAppointmentCreation, createAppointment)
  .get(protect, apiLimiter, getAppointments);

router.route('/patient/:id').get(protect, apiLimiter, getAppointmentsByPatientId);
router
  .route('/:id')
  .get(protect, getAppointmentById)
  .put(protect, doctorOrSecretary, validateAppointmentCreation, updateAppointment)
  .delete(protect, doctorOrSecretary, deleteAppointment);

module.exports = router;
