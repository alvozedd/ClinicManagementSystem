const express = require('express');
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { protect, admin, secretary, doctor } = require('../middleware/authMiddleware');

// Create a middleware that allows both doctors and secretaries
const doctorOrSecretary = (req, res, next) => {
  if (req.user && (req.user.role === 'doctor' || req.user.role === 'secretary' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a doctor or secretary');
  }
};

router.route('/').post(protect, doctorOrSecretary, createPatient).get(protect, getPatients);
router
  .route('/:id')
  .get(protect, getPatientById)
  .put(protect, doctorOrSecretary, updatePatient)
  .delete(protect, admin, deletePatient);

module.exports = router;
