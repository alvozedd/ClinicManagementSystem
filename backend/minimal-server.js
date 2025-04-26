/**
 * Minimal server.js file to debug path-to-regexp error
 * This file contains only the essential functionality to get the server running
 */

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Load production environment variables if NODE_ENV is production
if (process.env.NODE_ENV === 'production') {
  try {
    dotenv.config({ path: '.env.production' });
    console.log('Loaded production environment variables');
  } catch (error) {
    console.warn('Error loading production environment variables:', error.message);
  }
}

// Fallback MongoDB URI in case environment variable is not set
const FALLBACK_MONGODB_URI = 'mongodb+srv://clinic_admin:adminMuchai123@cluster0.jrm4jes.mongodb.net/clinic_management?retryWrites=true&w=majority';

// Function to load environment variables from .env.production file if they're not already set
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
const mongoURI = process.env.MONGODB_URI || FALLBACK_MONGODB_URI;

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

// Improved CORS middleware
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

// Status route
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Minimal server is running',
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Minimal API is running...');
});

// Basic user login route
app.post('/api/users/login', (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', email);

    // For now, just return a success response with a dummy token
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

// Also support the route without /api prefix
app.post('/users/login', (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt (no /api prefix):', email);

    // For now, just return a success response with a dummy token
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

// Patient routes
app.get('/api/patients', (req, res) => {
  console.log('GET /api/patients request received');
  res.status(200).json([]);
});

app.get('/patients', (req, res) => {
  console.log('GET /patients request received');
  res.status(200).json([]);
});

// Appointment routes
app.get('/api/appointments', (req, res) => {
  console.log('GET /api/appointments request received');
  res.status(200).json([]);
});

app.get('/appointments', (req, res) => {
  console.log('GET /appointments request received');
  res.status(200).json([]);
});

// Diagnosis routes
app.get('/api/diagnoses', (req, res) => {
  console.log('GET /api/diagnoses request received');
  res.status(200).json([]);
});

app.get('/diagnoses', (req, res) => {
  console.log('GET /diagnoses request received');
  res.status(200).json([]);
});

// Refresh token routes
app.post('/api/users/refresh-token', (req, res) => {
  console.log('POST /api/users/refresh-token request received');
  res.status(200).json({
    token: 'refreshed-dummy-token'
  });
});

app.post('/users/refresh-token', (req, res) => {
  console.log('POST /users/refresh-token request received');
  res.status(200).json({
    token: 'refreshed-dummy-token'
  });
});

// Simple error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
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
      console.log(`Minimal server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
