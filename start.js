// Simple script to start the backend server
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting backend server...');

// Get the absolute path to the backend directory
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);

// Start the server
require('./backend/server.js');
