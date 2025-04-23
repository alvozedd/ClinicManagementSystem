// Test script to check if the login functionality works locally
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create a simple Express server
const app = express();
app.use(cors());
app.use(express.json());

// Mock user data
const users = [
  {
    _id: '1',
    email: 'admin@urohealth.com',
    password: '$2a$10$XFNYbGBdHFV/Xz7MUvH9eeJJL9qzUH6tANwEVwwpJHNRXwVscDNLe', // hashed 'admin123'
    role: 'admin'
  }
];

// JWT secret
const JWT_SECRET = 'test-secret';

// Login route
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt with username:', username);
    
    // Find user by username (which is stored in the email field)
    const user = users.find(u => u.email === username);
    
    console.log('User found:', user ? 'Yes' : 'No');
    
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
          username: user.email,
          role: user.role,
          token: token
        });
        return;
      }
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
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Try logging in with username: admin@urohealth.com and password: admin123`);
});
