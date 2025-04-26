/**
 * Security middleware for enforcing HTTPS, implementing HSTS, and other security headers
 */
const crypto = require('crypto');

// Middleware to enforce HTTPS in production
const enforceHttps = (req, res, next) => {
  // Skip for local development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Check if request is already secure or is from a trusted proxy
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

  if (!isSecure) {
    // Redirect to HTTPS
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    return res.redirect(301, httpsUrl);
  }

  next();
};

// Generate a nonce for CSP
const generateNonce = () => {
  return crypto.randomBytes(16).toString('base64');
};

// Middleware to add security headers
const addSecurityHeaders = (req, res, next) => {
  // Generate a nonce for this request
  const nonce = generateNonce();
  // HTTP Strict Transport Security
  // Only add in production to avoid issues with local development
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS protection in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Restrict referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  // Temporarily simplified for debugging
  if (process.env.NODE_ENV === 'production') {
    // Simplified CSP to avoid potential issues
    res.setHeader(
      'Content-Security-Policy-Report-Only',
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
    );
  } else {
    // More permissive policy for development
    res.setHeader(
      'Content-Security-Policy-Report-Only',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "connect-src 'self' *; " +
      "img-src 'self' data: *; " +
      "style-src 'self' 'unsafe-inline' *; " +
      "font-src 'self' *;"
    );
  }

  // Store the nonce in the request object so it can be used in templates
  req.cspNonce = nonce;

  next();
};

// Middleware to set secure cookie options
const secureCoookieSettings = (req, res, next) => {
  // Set secure cookie options
  res.cookie = (name, value, options = {}) => {
    const secureOptions = {
      ...options,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };

    return res.cookie(name, value, secureOptions);
  };

  next();
};

module.exports = {
  enforceHttps,
  addSecurityHeaders,
  secureCoookieSettings,
  generateNonce,
};
