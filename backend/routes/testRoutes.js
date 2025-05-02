const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { checkHealth } = require('../controllers/healthController');

// @route   GET /test-users
// @desc    Get test users for login
// @access  Public
router.get('/test-users', async (req, res) => {
  try {
    // Only return a limited set of test users with minimal information
    const testUsers = [
      { username: 'admin', role: 'admin', password: 'admin123' },
      { username: 'doctor', role: 'doctor', password: 'doctor123' },
      { username: 'secretary', role: 'secretary', password: 'secretary123' }
    ];

    res.json(testUsers);
  } catch (error) {
    console.error('Error fetching test users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /health
// @desc    Health check endpoint
// @access  Public
router.get('/health', checkHealth);

module.exports = router;
