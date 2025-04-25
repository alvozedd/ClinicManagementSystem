/**
 * Middleware to add a unique request ID to each request
 * This helps with tracking requests through logs and debugging
 */
const { v4: uuidv4 } = require('uuid');

/**
 * Add a unique request ID to each request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const addRequestId = (req, res, next) => {
  // Generate a unique ID for this request
  const requestId = uuidv4();
  
  // Add it to the request object
  req.id = requestId;
  
  // Add it as a response header
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

module.exports = { addRequestId };
