const express = require('express');
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { protect, optionalAuth, admin, secretary, doctor } = require('../middleware/authMiddleware');
const { validatePatientCreation } = require('../middleware/validationMiddleware');
const { publicEndpointLimiter, apiLimiter } = require('../middleware/rateLimitMiddleware');
const { logPatientAccess, logBulkPhiAccess } = require('../middleware/phiAccessMiddleware');

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
  .get(protect, apiLimiter, logBulkPhiAccess, getPatients);
router
  .route('/:id')
  .get(protect, logPatientAccess, getPatientById)
  .put(protect, doctorOrSecretary, validatePatientCreation, logPatientAccess, updatePatient)
  .delete(protect, doctorOrSecretary, logPatientAccess, deletePatient);

module.exports = router;
