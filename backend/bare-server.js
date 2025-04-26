/**
 * Bare minimum server.js file with no middleware
 * This is a temporary solution to debug the path-to-regexp error
 */

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

console.log('Starting bare minimum server directly...');

// Load environment variables
dotenv.config();

// Set fallback values for critical environment variables
if (!process.env.MONGODB_URI) {
  console.log('Setting fallback MONGODB_URI');
  process.env.MONGODB_URI = 'mongodb+srv://clinic_admin:adminMuchai123@cluster0.jrm4jes.mongodb.net/clinic_management?retryWrites=true&w=majority';
}

if (!process.env.JWT_SECRET) {
  console.log('Setting fallback JWT_SECRET');
  process.env.JWT_SECRET = 'b8df259dfa44c3db20384347e8968581097e98324d253c1cb6f56cb9985ce1918665ac109f968389ae70c58de4e6e5548bcb9c6b6234c385a35f2ce2ca73c3ea';
}

// Load environment variables from .env.production if they're not already set
const loadEnvFromFile = () => {
  try {
    // Check if MONGODB_URI is already set
    if (process.env.MONGODB_URI) {
      return;
    }

    // Try to load from .env.production file
    const envPath = path.resolve(__dirname, '.env.production');
    if (fs.existsSync(envPath)) {
      console.log('Loading environment variables from .env.production file');
      const envFile = fs.readFileSync(envPath, 'utf8');
      const envVars = envFile.split('\n');

      envVars.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      });
    }
  } catch (error) {
    console.warn('Error loading .env.production file:', error.message);
  }
};

// Load environment variables from file if they're not set
loadEnvFromFile();

// Use environment variable or fallback
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://clinic_admin:adminMuchai123@cluster0.jrm4jes.mongodb.net/clinic_management?retryWrites=true&w=majority';

// Connect to MongoDB
const connectDB = async () => {
  if (!mongoURI) {
    console.error('MongoDB URI is not defined. Please set the MONGODB_URI environment variable.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Create Express app
const app = express();

// Improved CORS configuration
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://urohealthltd.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];

  const origin = req.headers.origin;

  // Check if the request origin is in our allowed list
  if (allowedOrigins.includes(origin)) {
    // Set the specific origin instead of wildcard
    res.header('Access-Control-Allow-Origin', origin);
    // Allow credentials
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Parse JSON bodies
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Bare API is running...');
});

// Status route
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Bare server is running',
  });
});

// Basic user login routes - adding both paths to match frontend requests
// Original API path
app.post('/api/users/login', (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt at /api/users/login:', email);

    // For now, just return a success response with a dummy token
    // This is just to test CORS, not for actual authentication
    res.status(200).json({
      _id: '123456789',
      name: 'Test User',
      email: email || 'test@example.com',
      role: 'doctor',
      token: 'dummy-jwt-token'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Path without /api prefix - matching the frontend request
app.post('/users/login', (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt at /users/login:', email);

    // For now, just return a success response with a dummy token
    // This is just to test CORS, not for actual authentication
    res.status(200).json({
      _id: '123456789',
      name: 'Test User',
      email: email || 'test@example.com',
      role: 'doctor',
      token: 'dummy-jwt-token'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Refresh token routes
app.post('/api/users/refresh-token', (req, res) => {
  res.status(200).json({
    token: 'refreshed-dummy-token'
  });
});

app.post('/users/refresh-token', (req, res) => {
  res.status(200).json({
    token: 'refreshed-dummy-token'
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

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Bare server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
