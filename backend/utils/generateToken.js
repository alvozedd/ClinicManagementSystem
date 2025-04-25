const jwt = require('jsonwebtoken');

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

module.exports = generateToken;
