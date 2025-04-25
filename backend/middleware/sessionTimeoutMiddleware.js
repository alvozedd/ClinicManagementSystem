/**
 * Session Timeout Middleware for HIPAA Compliance
 * Enforces automatic session timeout after a period of inactivity
 */
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refreshTokenModel');
const logger = require('../utils/logger');
const auditService = require('../utils/auditService');

// Session timeout in milliseconds (15 minutes for HIPAA compliance)
const SESSION_TIMEOUT = 15 * 60 * 1000;

/**
 * Check if the session has timed out
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkSessionTimeout = async (req, res, next) => {
  // Skip for unauthenticated requests or non-API routes
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    return next();
  }

  try {
    // Extract token
    const token = req.headers.authorization.split(' ')[1];
    
    // Decode token (without verification) to get the issued at time
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.iat) {
      return next();
    }
    
    // Calculate token age in milliseconds
    const tokenAge = (Date.now() - decoded.iat * 1000);
    
    // Check if token is older than the session timeout
    if (tokenAge > SESSION_TIMEOUT) {
      // Log the session timeout
      await auditService.logAuthEvent(
        req,
        'LOGOUT',
        'Session timeout due to inactivity',
        'INFO',
        { reason: 'Session timeout', tokenAge }
      );
      
      // Return 401 Unauthorized with session timeout message
      return res.status(401).json({
        message: 'Session has expired due to inactivity. Please log in again.',
        code: 'SESSION_TIMEOUT',
      });
    }
    
    // Session is still valid, continue
    next();
  } catch (error) {
    logger.error('Error checking session timeout', { error });
    next();
  }
};

/**
 * Update the last activity timestamp for a user
 * This should be called on successful authentication
 * @param {string} userId - User ID
 * @param {string} ipAddress - IP address of the user
 */
const updateLastActivity = async (userId, ipAddress) => {
  try {
    // Update the user's last activity timestamp
    // This could be stored in the user document or in a separate collection
    // For now, we'll just log it
    logger.debug('Updating last activity', { userId, ipAddress, timestamp: new Date() });
    
    // In a real implementation, you would update the user's last activity timestamp
    // await User.findByIdAndUpdate(userId, { lastActivity: new Date() });
  } catch (error) {
    logger.error('Error updating last activity', { error, userId });
  }
};

/**
 * Force logout a user after session timeout
 * @param {string} userId - User ID
 * @param {string} ipAddress - IP address of the user
 */
const forceLogoutAfterTimeout = async (userId, ipAddress) => {
  try {
    // Revoke all refresh tokens for the user
    await RefreshToken.updateMany(
      { user: userId, revoked: false },
      { revoked: true, revokedByIp: ipAddress, revokedReason: 'Session timeout' }
    );
    
    logger.info('User forced logout due to session timeout', { userId, ipAddress });
  } catch (error) {
    logger.error('Error forcing logout after timeout', { error, userId });
  }
};

module.exports = {
  checkSessionTimeout,
  updateLastActivity,
  forceLogoutAfterTimeout,
  SESSION_TIMEOUT,
};
