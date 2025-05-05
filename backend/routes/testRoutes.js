const express = require('express');
const router = express.Router();
const { checkHealth } = require('../controllers/healthController');

// @route   GET /health
// @desc    Health check endpoint
// @access  Public
router.get('/health', checkHealth);

module.exports = router;
