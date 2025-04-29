/**
 * Custom CORS middleware to ensure CORS headers are always set
 */

// List of allowed origins
const allowedOrigins = [
  'https://urohealthltd.netlify.app',
  'https://www.urohealthltd.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

// For development, you can enable this to allow all origins
const ALLOW_ALL_ORIGINS = process.env.NODE_ENV === 'development' || process.env.ALLOW_ALL_ORIGINS === 'true';

/**
 * Custom CORS middleware that ensures headers are set for all responses
 * including error responses
 */
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  // In development, allow all origins if the flag is set
  if (ALLOW_ALL_ORIGINS) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
    res.header('Access-Control-Allow-Credentials', 'true');

    console.log('CORS: Development mode - allowing all origins');
  }
  // Check if the origin is in our allowed list
  else if (allowedOrigins.includes(origin)) {
    // Set CORS headers - never use wildcard with credentials
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Log CORS headers for debugging
    console.log('CORS headers set for allowed origin:', {
      origin,
      allowCredentials: 'true'
    });
  } else {
    // For requests without origin (like curl) or non-allowed origins
    // We still need to set some CORS headers for OPTIONS requests to work
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');

    // For API testing tools and server-to-server requests
    if (!origin) {
      console.log('No origin in request, setting minimal CORS headers');
    } else {
      console.log('Origin not allowed:', origin);
    }
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

module.exports = corsMiddleware;
