/**
 * Health check controller for monitoring system status
 */
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');

/**
 * @desc    Check API health status
 * @route   GET /api/health
 * @access  Public
 */
const checkHealth = asyncHandler(async (req, res) => {
  // Check MongoDB connection
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  // Get basic system info
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };
  
  // Get MongoDB connection info
  const dbInfo = {
    status: dbStatus,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    collections: Object.keys(mongoose.connection.collections).length
  };
  
  // Return health status
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbInfo,
    system: systemInfo
  });
});

module.exports = { checkHealth };
