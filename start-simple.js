// This file is used by Railway to start the application
const path = require('path');

console.log('Starting the application with simplified server...');

// Get the absolute path to the backend directory
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);

// Start the simplified server
console.log('Starting the simplified server...');
require('./backend/server-simple.js');
