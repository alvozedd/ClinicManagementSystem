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
const { protect, secretary } = require('../middleware/authMiddleware');

router.route('/').post(protect, secretary, createAppointment).get(protect, getAppointments);
router.route('/patient/:id').get(protect, getAppointmentsByPatientId);
router
  .route('/:id')
  .get(protect, getAppointmentById)
  .put(protect, secretary, updateAppointment)
  .delete(protect, secretary, deleteAppointment);

module.exports = router;
