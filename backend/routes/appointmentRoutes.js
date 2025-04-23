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
const { protect, secretary, doctor } = require('../middleware/authMiddleware');

// Create a middleware that allows both doctors and secretaries
const doctorOrSecretary = (req, res, next) => {
  if (req.user && (req.user.role === 'doctor' || req.user.role === 'secretary' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a doctor or secretary');
  }
};

router.route('/').post(protect, doctorOrSecretary, createAppointment).get(protect, getAppointments);
router.route('/patient/:id').get(protect, getAppointmentsByPatientId);
router
  .route('/:id')
  .get(protect, getAppointmentById)
  .put(protect, doctorOrSecretary, updateAppointment)
  .delete(protect, doctorOrSecretary, deleteAppointment);

module.exports = router;
