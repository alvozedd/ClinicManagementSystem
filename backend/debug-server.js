const express = require('express');
const app = express();

// Super permissive CORS configuration
app.use((req, res, next) => {
  // Always allow all origins
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Log the request for debugging
  console.log(`CORS request: ${req.method} ${req.path} from origin: ${req.headers.origin || 'unknown'}`);
  console.log('Request headers:', req.headers);

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  next();
});

// Parse JSON bodies
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send('Debug API is running...');
});

// Status route
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Debug server is running',
  });
});

// Basic user login routes - adding both paths to match frontend requests
// Original API path
app.post('/api/users/login', (req, res) => {
  try {
    // Support both email and username fields
    const { email, username, password } = req.body;
    const userIdentifier = email || username;

    console.log('Login attempt at /api/users/login:', userIdentifier);
    console.log('Request body:', req.body);

    // For now, just return a success response with a dummy token
    // This is just to test CORS, not for actual authentication
    res.status(200).json({
      _id: '123456789',
      name: 'Test User',
      email: userIdentifier || 'test@example.com',
      role: 'doctor',
      token: 'dummy-jwt-token',
      sessionId: 'dummy-session-id'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Path without /api prefix - matching the frontend request
app.post('/users/login', (req, res) => {
  try {
    // Support both email and username fields
    const { email, username, password } = req.body;
    const userIdentifier = email || username;

    console.log('Login attempt at /users/login:', userIdentifier);
    console.log('Request body:', req.body);

    // For now, just return a success response with a dummy token
    // This is just to test CORS, not for actual authentication
    res.status(200).json({
      _id: '123456789',
      name: 'Test User',
      email: userIdentifier || 'test@example.com',
      role: 'doctor',
      token: 'dummy-jwt-token',
      sessionId: 'dummy-session-id'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Refresh token routes
app.post('/api/users/refresh-token', (req, res) => {
  console.log('Refresh token request at /api/users/refresh-token');
  console.log('Request body:', req.body);
  
  res.status(200).json({
    token: 'refreshed-dummy-token',
    sessionId: req.body.sessionId || 'dummy-session-id'
  });
});

app.post('/users/refresh-token', (req, res) => {
  console.log('Refresh token request at /users/refresh-token');
  console.log('Request body:', req.body);
  
  res.status(200).json({
    token: 'refreshed-dummy-token',
    sessionId: req.body.sessionId || 'dummy-session-id'
  });
});

// Catch-all route to log unmatched requests
app.use((req, res, next) => {
  console.log(`Unmatched request: ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  // If this is an API request, return a 404 JSON response
  if (req.originalUrl.includes('/api/') || req.originalUrl.includes('/users/')) {
    return res.status(404).json({ message: 'Endpoint not found' });
  }

  // Otherwise, pass to the next middleware
  next();
});

// Simple error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
});
