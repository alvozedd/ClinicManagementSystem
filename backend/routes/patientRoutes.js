const express = require('express');
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { getDiagnosesByPatientId } = require('../controllers/diagnosisController');
const { protect, optionalAuth, admin, secretary, doctor } = require('../middleware/authMiddleware');
const { validatePatientCreation } = require('../middleware/validationMiddleware');
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
  }, validatePatientCreation, createPatient)
  .get(protect, apiLimiter, getPatients);
router
  .route('/:id')
  .get(protect, getPatientById)
  .put(protect, doctorOrSecretary, validatePatientCreation, updatePatient)
  .delete(protect, doctorOrSecretary, deletePatient);

// Route for getting diagnoses by patient ID
router.route('/:id/diagnoses').get(protect, getDiagnosesByPatientId);

module.exports = router;
