/**
 * Enhanced CORS middleware to ensure all necessary headers are allowed
 */

// List of allowed origins
const allowedOrigins = [
  // Netlify domains
  'https://urohealthltd.netlify.app',
  'https://www.urohealthltd.netlify.app',
  'http://urohealthltd.netlify.app',
  'http://www.urohealthltd.netlify.app',
  // Local development
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  // Other domains
  'https://urohealthcentral.netlify.app',
  'https://www.urohealthcentral.netlify.app',
  // Railway domain for server-to-server communication
  'https://clinicmanagementsystem-production-081b.up.railway.app'
];

// Always allow all origins to fix CORS issues
const ALLOW_ALL_ORIGINS = true;

// Debug flag to log detailed CORS information
const DEBUG_CORS = true;

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
 * Enhanced CORS middleware that allows all origins and handles preflight requests properly
 */
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  // Log the request for debugging
  if (DEBUG_CORS) {
    console.log(`CORS middleware processing request: ${req.method} ${req.path} from origin: ${origin || 'unknown'}`);
  }

  // Set the Vary header to inform caches that the response varies by Origin
  res.header('Vary', 'Origin');

  // Always allow the requesting origin
  if (origin) {
    // Always set the origin to the requesting origin
    res.header('Access-Control-Allow-Origin', origin);
    if (DEBUG_CORS) console.log(`Setting Access-Control-Allow-Origin: ${origin}`);
  } else {
    // No origin in request, set to wildcard
    res.header('Access-Control-Allow-Origin', '*');
    if (DEBUG_CORS) console.log('Setting Access-Control-Allow-Origin: *');
  }

  // Set credentials to true for all requests
  res.header('Access-Control-Allow-Credentials', 'true');

  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
  res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

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
