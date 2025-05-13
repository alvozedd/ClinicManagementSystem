/**
 * Health check controller for monitoring system status
 */
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');
const os = require('os');

/**
 * @desc    Check API health status
 * @route   GET /api/health
 * @access  Public
 */
const checkHealth = asyncHandler(async (req, res) => {
  // Set CORS headers explicitly for health check endpoint
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log(`Setting explicit CORS headers for health check from origin: ${origin}`);
  }

  // Check MongoDB connection
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const isConnected = dbStatus === 'connected';

  // Get basic system info
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memoryUsage: {
      total: Math.round(os.totalmem() / (1024 * 1024)) + ' MB',
      free: Math.round(os.freemem() / (1024 * 1024)) + ' MB',
      process: Math.round(process.memoryUsage().rss / (1024 * 1024)) + ' MB'
    },
    uptime: {
      system: Math.round(os.uptime() / 60) + ' minutes',
      process: Math.round(process.uptime() / 60) + ' minutes'
    },
    cpus: os.cpus().length
  };

  // Get MongoDB connection info
  const dbInfo = {
    status: dbStatus,
    connected: isConnected,
    host: isConnected ? mongoose.connection.host : 'N/A',
    name: isConnected ? mongoose.connection.name : 'N/A',
    collections: isConnected ? Object.keys(mongoose.connection.collections).length : 0
  };

  // Try to get a count of users if connected
  let userCount = null;
  if (isConnected) {
    try {
      const User = mongoose.model('User');
      userCount = await User.countDocuments();
      dbInfo.userCount = userCount;
    } catch (error) {
      console.error('Error counting users:', error);
      dbInfo.userCount = 'Error counting users';
    }
  }

  // Return health status
  res.status(200).json({
    status: isConnected ? 'ok' : 'error',
    message: isConnected ? 'System is healthy' : 'Database connection issue',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbInfo,
    system: systemInfo
  });
});

module.exports = { checkHealth };
