const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/refreshTokenModel');

/**
 * Generate a JWT token for authentication
 * @param {string} id - User ID to include in the token
 * @param {boolean} isRefreshToken - Whether this is a refresh token (longer expiry) or access token
 * @returns {string} JWT token
 */
const generateToken = (id, isRefreshToken = false) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: isRefreshToken ? '7d' : '1h', // 1 hour for access tokens, 7 days for refresh tokens
      // Add additional security options
      audience: 'urohealth-api',
      issuer: 'urohealth-auth',
    }
  );
};

/**
 * Generate a unique session ID
 * @returns {string} Unique session ID
 */
const generateSessionId = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Generate refresh token and save to database
 * @param {Object} user - User object
 * @param {string} ipAddress - IP address of the client
 * @param {boolean} enforceSingleSession - Whether to enforce single session per user
 * @returns {Promise<Object>} Refresh token object and session ID
 */
const generateRefreshToken = async (user, ipAddress, enforceSingleSession = true) => {
  // Create a refresh token that expires in 7 days
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Generate a random token string
  const tokenValue = crypto.randomBytes(40).toString('hex');

  // Generate a unique session ID
  const sessionId = generateSessionId();

  // Create and save refresh token to database
  const refreshToken = await RefreshToken.create({
    user: user._id,
    token: tokenValue,
    expires,
    createdByIp: ipAddress,
    sessionId,
  });

  // If single session enforcement is enabled, revoke all other sessions for this user
  if (enforceSingleSession) {
    await RefreshToken.revokeOtherSessions(user._id, sessionId);
  }

  return { refreshToken, sessionId };
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      audience: 'urohealth-api',
      issuer: 'urohealth-auth',
    });
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

/**
 * Revoke a refresh token
 * @param {string} token - Refresh token to revoke
 * @param {string} ipAddress - IP address of the client
 * @returns {Promise<boolean>} True if token was revoked, false otherwise
 */
const revokeToken = async (token, ipAddress) => {
  const refreshToken = await RefreshToken.findOne({ token });

  if (!refreshToken || !refreshToken.isActive()) {
    return false;
  }

  // Revoke token
  refreshToken.revoked = true;
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();

  return true;
};

/**
 * Revoke all refresh tokens for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of tokens revoked
 */
const revokeAllUserTokens = async (userId) => {
  const result = await RefreshToken.updateMany(
    { user: userId, revoked: false },
    { revoked: true }
  );

  return result.modifiedCount;
};

/**
 * Replace an old refresh token with a new one
 * @param {string} oldToken - Old refresh token to replace
 * @param {string} newToken - New refresh token
 * @param {string} sessionId - Session ID to maintain
 * @returns {Promise<boolean>} True if token was replaced, false otherwise
 */
const replaceToken = async (oldToken, newToken, sessionId) => {
  const refreshToken = await RefreshToken.findOne({ token: oldToken });

  if (!refreshToken || !refreshToken.isActive()) {
    return false;
  }

  // Replace token
  refreshToken.revoked = true;
  refreshToken.replacedByToken = newToken;
  await refreshToken.save();

  return true;
};

/**
 * Check if a user has an active session
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} True if user has an active session, false otherwise
 */
const hasActiveSession = async (userId) => {
  const activeToken = await RefreshToken.findOne({
    user: userId,
    revoked: false,
    expires: { $gt: new Date() }
  });

  return !!activeToken;
};

/**
 * Get active session ID for a user
 * @param {string} userId - User ID to check
 * @returns {Promise<string|null>} Session ID if found, null otherwise
 */
const getActiveSessionId = async (userId) => {
  const activeToken = await RefreshToken.findOne({
    user: userId,
    revoked: false,
    expires: { $gt: new Date() }
  });

  return activeToken ? activeToken.sessionId : null;
};

module.exports = {
  generateToken,
  generateSessionId,
  generateRefreshToken,
  verifyToken,
  revokeToken,
  revokeAllUserTokens,
  replaceToken,
  hasActiveSession,
  getActiveSessionId,
};
