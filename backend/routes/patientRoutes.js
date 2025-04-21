const express = require('express');
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { protect, admin, secretary } = require('../middleware/authMiddleware');

router.route('/').post(protect, secretary, createPatient).get(protect, getPatients);
router
  .route('/:id')
  .get(protect, getPatientById)
  .put(protect, secretary, updatePatient)
  .delete(protect, admin, deletePatient);

module.exports = router;
