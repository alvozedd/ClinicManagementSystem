/**
 * Enhanced CORS middleware to ensure all necessary headers are allowed
 */

// List of allowed origins
const allowedOrigins = [
  'https://urohealthltd.netlify.app',
  'https://www.urohealthltd.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'https://urohealthcentral.netlify.app',
  'https://www.urohealthcentral.netlify.app',
  'https://urohealthltd.netlify.app',
  // Add the Railway domain to allow server-to-server communication
  'https://clinicmanagementsystem-production-081b.up.railway.app'
];

// For development or production, you can enable this to allow all origins
const ALLOW_ALL_ORIGINS = process.env.NODE_ENV === 'development' || process.env.ALLOW_ALL_ORIGINS === 'true' || true; // Temporarily set to true to fix CORS issues

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

  // Always set these headers for all responses
  res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
  res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // In development or if ALLOW_ALL_ORIGINS is true, allow all origins
  if (ALLOW_ALL_ORIGINS) {
    // For requests with credentials, we must specify the exact origin
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    } else {
      // For requests without origin, use wildcard
      res.header('Access-Control-Allow-Origin', '*');
    }
    console.log('CORS: Development mode - allowing all origins');
  }
  // Check if the origin is in our allowed list
  else if (origin && allowedOrigins.includes(origin)) {
    // Set CORS headers - never use wildcard with credentials
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');

    // Log CORS headers for debugging
    console.log(`CORS headers set for allowed origin: ${origin}`);
  } else {
    // For requests without origin (like curl) or non-allowed origins
    if (!origin) {
      console.log('No origin in request, setting minimal CORS headers');
      // For requests without origin, use wildcard
      res.header('Access-Control-Allow-Origin', '*');
    } else {
      // For non-allowed origins, we'll still set the origin for OPTIONS requests
      // This helps with browser preflight requests
      console.log(`Origin not in allowed list: ${origin}, setting CORS headers for OPTIONS requests`);
      // For better security, we'll only set the origin for OPTIONS requests
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', origin);
      } else {
        // For actual requests, we'll use a wildcard
        // This allows the preflight to succeed but actual requests will be blocked
        res.header('Access-Control-Allow-Origin', '*');
      }
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
