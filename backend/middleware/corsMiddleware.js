/**
 * Custom CORS middleware to ensure CORS headers are always set
 */

// List of allowed origins
const allowedOrigins = [
  'https://urohealthltd.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

/**
 * Custom CORS middleware that ensures headers are set for all responses
 * including error responses
 */
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if the origin is in our allowed list
  if (allowedOrigins.includes(origin) || !origin) {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

module.exports = corsMiddleware;
