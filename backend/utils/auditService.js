/**
 * Audit Service for HIPAA Compliance
 * Logs all access to Protected Health Information (PHI)
 */
const AuditLog = require('../models/auditLogModel');
const logger = require('./logger');

/**
 * Log an audit event
 * @param {Object} options - Audit log options
 * @param {Object} options.req - Express request object
 * @param {string} options.action - Action performed (CREATE, READ, UPDATE, DELETE, etc.)
 * @param {string} options.description - Description of the action
 * @param {string} options.resourceType - Type of resource accessed (Patient, Appointment, etc.)
 * @param {string} options.resourceId - ID of the resource accessed
 * @param {string} options.status - Status of the action (SUCCESS, FAILURE, etc.)
 * @param {Object} options.details - Additional details about the action
 * @param {string} options.reason - Reason for access (if applicable)
 * @returns {Promise<Object>} - Created audit log
 */
const logAuditEvent = async (options) => {
  try {
    const { req, action, description, resourceType, resourceId, status, details, reason } = options;
    
    // Extract user information from request
    const user = req.user ? req.user._id : null;
    const userName = req.user ? (req.user.name || req.user.username || req.user.email) : null;
    const userRole = req.user ? req.user.role : null;
    
    // Extract IP address
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Extract request ID
    const requestId = req.id || null;
    
    // Extract user agent
    const userAgent = req.headers['user-agent'] || null;
    
    // Create audit log
    const auditLog = await AuditLog.create({
      user,
      userName,
      userRole,
      ipAddress,
      action,
      description,
      resourceType,
      resourceId,
      status,
      details,
      requestId,
      userAgent,
      reason,
    });
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Audit log created', { auditLog });
    }
    
    return auditLog;
  } catch (error) {
    // Log error but don't throw - audit logging should not break the application
    logger.error('Error creating audit log', { error, options });
    return null;
  }
};

/**
 * Log PHI access
 * @param {Object} req - Express request object
 * @param {string} resourceType - Type of resource accessed (Patient, Appointment, etc.)
 * @param {string} resourceId - ID of the resource accessed
 * @param {string} description - Description of the access
 * @param {string} reason - Reason for access (if applicable)
 * @returns {Promise<Object>} - Created audit log
 */
const logPhiAccess = async (req, resourceType, resourceId, description, reason = null) => {
  return logAuditEvent({
    req,
    action: 'PHI_ACCESS',
    description,
    resourceType,
    resourceId,
    status: 'SUCCESS',
    reason,
  });
};

/**
 * Log PHI disclosure
 * @param {Object} req - Express request object
 * @param {string} resourceType - Type of resource accessed (Patient, Appointment, etc.)
 * @param {string} resourceId - ID of the resource accessed
 * @param {string} description - Description of the disclosure
 * @param {Object} details - Details about the disclosure (recipient, method, etc.)
 * @param {string} reason - Reason for disclosure (if applicable)
 * @returns {Promise<Object>} - Created audit log
 */
const logPhiDisclosure = async (req, resourceType, resourceId, description, details, reason = null) => {
  return logAuditEvent({
    req,
    action: 'PHI_DISCLOSURE',
    description,
    resourceType,
    resourceId,
    status: 'SUCCESS',
    details,
    reason,
  });
};

/**
 * Log authentication event
 * @param {Object} req - Express request object
 * @param {string} action - Action (LOGIN, LOGOUT, LOGIN_FAILED)
 * @param {string} description - Description of the event
 * @param {string} status - Status of the action (SUCCESS, FAILURE)
 * @param {Object} details - Additional details
 * @returns {Promise<Object>} - Created audit log
 */
const logAuthEvent = async (req, action, description, status, details = null) => {
  return logAuditEvent({
    req,
    action,
    description,
    status,
    details,
  });
};

/**
 * Log system event
 * @param {Object} req - Express request object
 * @param {string} description - Description of the event
 * @param {Object} details - Additional details
 * @returns {Promise<Object>} - Created audit log
 */
const logSystemEvent = async (req, description, details = null) => {
  return logAuditEvent({
    req,
    action: 'SYSTEM_EVENT',
    description,
    status: 'INFO',
    details,
  });
};

module.exports = {
  logAuditEvent,
  logPhiAccess,
  logPhiDisclosure,
  logAuthEvent,
  logSystemEvent,
};
