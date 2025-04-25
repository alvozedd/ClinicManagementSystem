/**
 * HIPAA Compliance Routes
 */
const express = require('express');
const router = express.Router();
const {
  getAuditLogs,
  exportPatientData,
  reportBreach,
  getComplianceStatus,
} = require('../controllers/hipaaController');
const { protect, admin, doctor } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

// Middleware for doctor or admin access
const doctorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'doctor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a doctor or admin');
  }
};

// Audit log routes
router.get('/audit-logs', protect, admin, apiLimiter, getAuditLogs);

// Data export routes
router.get('/export/patient/:id', protect, doctorOrAdmin, apiLimiter, exportPatientData);

// Breach reporting routes
router.post('/breach-report', protect, apiLimiter, reportBreach);

// Compliance status routes
router.get('/compliance-status', protect, admin, apiLimiter, getComplianceStatus);

module.exports = router;
