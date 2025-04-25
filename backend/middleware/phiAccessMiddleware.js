/**
 * PHI Access Middleware for HIPAA Compliance
 * Logs all access to Protected Health Information (PHI)
 */
const auditService = require('../utils/auditService');
const logger = require('../utils/logger');

/**
 * Middleware to log access to patient data (PHI)
 * @param {Object} options - Options for the middleware
 * @param {string} options.resourceType - Type of resource being accessed (Patient, Appointment, etc.)
 * @param {Function} options.getResourceId - Function to extract resource ID from request (defaults to req.params.id)
 * @param {string} options.action - Action being performed (READ, UPDATE, etc.)
 * @param {Function} options.getDescription - Function to generate description (defaults to standard format)
 * @returns {Function} Express middleware function
 */
const logPhiAccess = (options = {}) => {
  const {
    resourceType = 'Unknown',
    getResourceId = (req) => req.params.id,
    action = 'PHI_ACCESS',
    getDescription = (req, resourceType, resourceId) => 
      `${req.method} ${resourceType}${resourceId ? ` (ID: ${resourceId})` : ''}`,
  } = options;

  return async (req, res, next) => {
    try {
      // Extract resource ID
      const resourceId = getResourceId(req);
      
      // Generate description
      const description = getDescription(req, resourceType, resourceId);
      
      // Log the PHI access
      await auditService.logAuditEvent({
        req,
        action,
        description,
        resourceType,
        resourceId,
        status: 'SUCCESS',
      });
      
      // Continue with the request
      next();
    } catch (error) {
      // Log error but don't block the request
      logger.error('Error logging PHI access', { error, resourceType });
      next();
    }
  };
};

/**
 * Middleware to log access to patient data
 */
const logPatientAccess = logPhiAccess({
  resourceType: 'Patient',
  action: 'PHI_ACCESS',
});

/**
 * Middleware to log access to appointment data
 */
const logAppointmentAccess = logPhiAccess({
  resourceType: 'Appointment',
  action: 'PHI_ACCESS',
});

/**
 * Middleware to log access to diagnosis data
 */
const logDiagnosisAccess = logPhiAccess({
  resourceType: 'Diagnosis',
  action: 'PHI_ACCESS',
});

/**
 * Middleware to log bulk access to PHI
 */
const logBulkPhiAccess = logPhiAccess({
  resourceType: 'Multiple',
  getResourceId: () => null,
  action: 'PHI_ACCESS',
  getDescription: (req) => `Bulk access: ${req.method} ${req.originalUrl}`,
});

module.exports = {
  logPhiAccess,
  logPatientAccess,
  logAppointmentAccess,
  logDiagnosisAccess,
  logBulkPhiAccess,
};
