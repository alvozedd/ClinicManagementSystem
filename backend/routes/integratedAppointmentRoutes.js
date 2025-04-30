const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  getTodaysQueue,
  getQueueStats,
  updateAppointment,
  checkInPatient,
  startAppointment,
  completeAppointment,
  cancelAppointment,
  markNoShow,
  rescheduleAppointment,
  reorderQueue,
  deleteAppointment,
  resetQueue,
  getNextPatient
} = require('../controllers/integratedAppointmentController');
const {
  protect,
  optionalAuth,
  doctor,
  secretary,
  doctorOrSecretary,
  admin
} = require('../middleware/authMiddleware');
const { validateIntegratedAppointmentCreation, validateQueueReorder } = require('../middleware/validationMiddleware');
const { publicEndpointLimiter, apiLimiter } = require('../middleware/rateLimitMiddleware');

// Public routes (with optional authentication)
router.route('/')
  .post(optionalAuth, (req, res, next) => {
    // Apply different rate limiters based on whether it's a visitor booking
    if (req.body && req.body.createdBy === 'visitor') {
      publicEndpointLimiter(req, res, next);
    } else {
      apiLimiter(req, res, next);
    }
  }, validateIntegratedAppointmentCreation, createAppointment);

// Protected routes
router.route('/')
  .get(protect, apiLimiter, getAppointments);

// Queue management routes - these must come before the /:id routes
router.route('/queue')
  .get(protect, doctorOrSecretary, getTodaysQueue);

router.route('/queue/stats')
  .get(protect, doctorOrSecretary, getQueueStats);

router.route('/queue/next')
  .get(protect, doctor, getNextPatient);

router.route('/queue/reorder')
  .put(protect, secretary, validateQueueReorder, reorderQueue);

router.route('/queue/reset')
  .delete(protect, admin, resetQueue);

// Individual appointment routes
router.route('/:id')
  .get(protect, getAppointmentById)
  .put(protect, doctorOrSecretary, updateAppointment)
  .delete(protect, doctorOrSecretary, deleteAppointment);

// Appointment status change routes
router.route('/:id/check-in')
  .put(protect, doctorOrSecretary, checkInPatient);

router.route('/:id/start')
  .put(protect, doctor, startAppointment);

router.route('/:id/complete')
  .put(protect, doctor, completeAppointment);

router.route('/:id/cancel')
  .put(protect, doctorOrSecretary, cancelAppointment);

router.route('/:id/no-show')
  .put(protect, doctorOrSecretary, markNoShow);

router.route('/:id/reschedule')
  .put(protect, doctorOrSecretary, rescheduleAppointment);

module.exports = router;
