const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: function(origin, callback) {
    // Allow any origin
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Parse JSON request bodies
app.use(bodyParser.json());

// Add CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Handle OPTIONS requests
app.options('*', (req, res) => {
  res.status(200).end();
});

// Basic login route
app.post('/api/users/login', (req, res) => {
  console.log('Login request received at /api/users/login:', req.body);
  
  // Simple mock login
  res.status(200).json({
    _id: '123456789',
    name: 'Test User',
    email: req.body.username || 'test@example.com',
    role: 'admin',
    token: 'test-token-123',
    sessionId: 'test-session-123'
  });
});

// Also support the route without /api prefix
app.post('/users/login', (req, res) => {
  console.log('Login request received at /users/login:', req.body);
  
  // Simple mock login
  res.status(200).json({
    _id: '123456789',
    name: 'Test User',
    email: req.body.username || 'test@example.com',
    role: 'admin',
    token: 'test-token-123',
    sessionId: 'test-session-123'
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Minimal CORS test server is running');
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Minimal CORS test server running on port ${PORT}`);
});
