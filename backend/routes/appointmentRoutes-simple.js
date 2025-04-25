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

// Middleware for doctor or secretary access
const doctorOrSecretary = (req, res, next) => {
  if (req.user && (req.user.role === 'doctor' || req.user.role === 'secretary' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a doctor or secretary');
  }
};

// Use optionalAuth to allow both authenticated and unauthenticated requests
router.route('/')
  .post(optionalAuth, validateAppointmentCreation, createAppointment)
  .get(protect, getAppointments);

router.route('/patient/:id').get(protect, getAppointmentsByPatientId);
router
  .route('/:id')
  .get(protect, getAppointmentById)
  .put(protect, doctorOrSecretary, validateAppointmentCreation, updateAppointment)
  .delete(protect, doctorOrSecretary, deleteAppointment);

module.exports = router;
