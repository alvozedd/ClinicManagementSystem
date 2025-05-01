// Test script to check if the login functionality works locally
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create a simple Express server
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

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Mock user data
const users = [
  {
    _id: '123456789',
    name: 'Admin User',
    email: 'admin@urohealth.com',
    username: 'admin',
    password: '$2a$10$XFNYbGBdHFV/Xz7MUvH9eeJJL9qzUH6tANwEVwwpJHNRXwVscDNLe', // hashed 'admin123'
    role: 'admin'
  },
  {
    _id: '987654321',
    name: 'Doctor User',
    email: 'doctor@urohealth.com',
    username: 'doctor',
    password: '$2a$10$XFNYbGBdHFV/Xz7MUvH9eeJJL9qzUH6tANwEVwwpJHNRXwVscDNLe', // hashed 'admin123'
    role: 'doctor'
  },
  {
    _id: '456789123',
    name: 'Secretary User',
    email: 'secretary@urohealth.com',
    username: 'secretary',
    password: '$2a$10$XFNYbGBdHFV/Xz7MUvH9eeJJL9qzUH6tANwEVwwpJHNRXwVscDNLe', // hashed 'admin123'
    role: 'secretary'
  }
];

// JWT secret
const JWT_SECRET = 'test-secret';

// Login route with API prefix
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginIdentifier = username || email;

    console.log('Login attempt at /api/users/login:', loginIdentifier);
    console.log('Request body:', req.body);

    // Find user by username or email
    const user = users.find(u =>
      u.username === loginIdentifier || u.email === loginIdentifier
    );

    if (user) {
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch ? 'Yes' : 'No');

      if (isMatch) {
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
        console.log('Token generated successfully');

        // Return user data and token
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: token,
          sessionId: 'test-session-id'
        });
        return;
      }
    }

    // For testing, also allow any login with password 'admin123'
    if (password === 'admin123') {
      console.log('Using test credentials');
      const token = jwt.sign({ id: '123456789' }, JWT_SECRET, { expiresIn: '30d' });

      res.json({
        _id: '123456789',
        name: 'Test User',
        email: loginIdentifier || 'test@example.com',
        role: 'doctor',
        token: token,
        sessionId: 'test-session-id'
      });
      return;
    }

    console.log('Authentication failed');
    res.status(401).json({ message: 'Invalid username or password' });
  } catch (error) {
    console.error('Error in login route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route without API prefix
app.post('/users/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginIdentifier = username || email;

    console.log('Login attempt at /users/login:', loginIdentifier);
    console.log('Request body:', req.body);

    // Find user by username or email
    const user = users.find(u =>
      u.username === loginIdentifier || u.email === loginIdentifier
    );

    if (user) {
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch ? 'Yes' : 'No');

      if (isMatch) {
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
        console.log('Token generated successfully');

        // Return user data and token
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: token,
          sessionId: 'test-session-id'
        });
        return;
      }
    }

    // For testing, also allow any login with password 'admin123'
    if (password === 'admin123') {
      console.log('Using test credentials');
      const token = jwt.sign({ id: '123456789' }, JWT_SECRET, { expiresIn: '30d' });

      res.json({
        _id: '123456789',
        name: 'Test User',
        email: loginIdentifier || 'test@example.com',
        role: 'doctor',
        token: token,
        sessionId: 'test-session-id'
      });
      return;
    }

    console.log('Authentication failed');
    res.status(401).json({ message: 'Invalid username or password' });
  } catch (error) {
    console.error('Error in login route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Test API is running...');
});

// Start server
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Try logging in with username: admin@urohealth.com and password: admin123`);
});
