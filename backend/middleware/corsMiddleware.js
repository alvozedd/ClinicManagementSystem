/**
 * Enhanced CORS middleware to ensure all necessary headers are allowed
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

// Comprehensive list of headers to allow
const allowedHeaders = [
  'Origin',
  'X-Requested-With',
  'Content-Type',
  'Accept',
  'Authorization',
  'Cache-Control',
  'Pragma',
  'Expires',
  'X-Auth-Token',
  'X-CSRF-Token',
  'X-XSRF-Token',
  'X-Requested-By',
  'If-Modified-Since',
  'Accept-Encoding',
  'Accept-Language',
  'Access-Control-Request-Headers',
  'Access-Control-Request-Method',
  'Connection',
  'Host',
  'Referer',
  'User-Agent',
  'DNT',
  'Sec-Fetch-Dest',
  'Sec-Fetch-Mode',
  'Sec-Fetch-Site'
];

// Comprehensive list of methods to allow
const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'];

/**
 * Enhanced CORS middleware that ensures headers are set for all responses
 * including error responses
 */
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  // Log the request for debugging
  console.log(`CORS middleware processing request: ${req.method} ${req.path} from origin: ${origin || 'unknown'}`);

  // Set the Vary header to inform caches that the response varies by Origin
  res.header('Vary', 'Origin');

  // In development or if ALLOW_ALL_ORIGINS is true, allow all origins
  if (ALLOW_ALL_ORIGINS) {
    // For requests with credentials, we must specify the exact origin
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      // For requests without origin, use wildcard
      res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
    res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours

    console.log('CORS: Development mode - allowing all origins');
  }
  // Check if the origin is in our allowed list
  else if (allowedOrigins.includes(origin)) {
    // Set CORS headers - never use wildcard with credentials
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
    res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours

    // Log CORS headers for debugging
    console.log(`CORS headers set for allowed origin: ${origin}`);
  } else {
    // For requests without origin (like curl) or non-allowed origins
    // We still need to set some CORS headers for OPTIONS requests to work
    res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
    res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));

    // For API testing tools and server-to-server requests
    if (!origin) {
      console.log('No origin in request, setting minimal CORS headers');
      // For requests without origin, use wildcard
      res.header('Access-Control-Allow-Origin', '*');
    } else {
      console.log(`Origin not allowed: ${origin}, but setting headers for OPTIONS requests`);
    }
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  next();
};

module.exports = {
  corsMiddleware,
  allowedHeaders,
  allowedMethods
};
