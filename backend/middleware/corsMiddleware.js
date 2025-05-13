/**
 * Enhanced CORS middleware to ensure all necessary headers are allowed
 */

// List of allowed origins - simplified to avoid duplicates
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
  'https://clinicmanagementsystem-production-081b.up.railway.app',
  // Add any other domains that might be used
  'https://urohealth.netlify.app',
  'https://www.urohealth.netlify.app',
  'http://urohealth.netlify.app',
  'http://www.urohealth.netlify.app'
];

// Always allow all origins to fix CORS issues
const ALLOW_ALL_ORIGINS = true;

// Debug flag to log detailed CORS information
const DEBUG_CORS = true; // Set to true for debugging

// Log the allowed origins
console.log('CORS middleware will allow ALL origins due to ALLOW_ALL_ORIGINS=true');

console.log('CORS middleware initialized with allowed origins:', allowedOrigins.length);

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

  // IMPORTANT: When using credentials, we cannot use wildcard '*' for Access-Control-Allow-Origin
  // We must specify the exact origin or the browser will reject the response
  if (origin) {
    // Always allow the origin that sent the request
    res.header('Access-Control-Allow-Origin', origin);
    if (DEBUG_CORS) console.log(`Setting Access-Control-Allow-Origin: ${origin}`);
  } else {
    // For requests without origin (like from Postman or curl), use wildcard
    // Note: This won't work with credentials, but those tools don't send credentials by default
    res.header('Access-Control-Allow-Origin', '*');
    if (DEBUG_CORS) console.log('Setting Access-Control-Allow-Origin: * (no origin in request)');
  }

  // Set credentials to true for all requests
  res.header('Access-Control-Allow-Credentials', 'true');

  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
  res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Add additional headers to help with CORS issues
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-Request-Id');

  // Add additional headers that might help with CORS issues
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-XSS-Protection', '1; mode=block');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request from origin:', origin || 'unknown');
    // Make sure all necessary CORS headers are set for preflight
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
    res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(204).end(); // 204 No Content is the proper response for preflight
  }

  next();
};

module.exports = {
  corsMiddleware,
  allowedHeaders,
  allowedMethods
};
