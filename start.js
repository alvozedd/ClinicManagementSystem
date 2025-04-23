// This file is used by Railway to start the application
const path = require('path');

console.log('Starting the application...');

// Get the absolute path to the backend directory
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);

// First run the seed script
console.log('Running seed script...');
try {
  require('./backend/seedProduction.js');
  console.log('Seed script completed successfully');
} catch (error) {
  console.error('Error running seed script:', error);
  // Continue anyway, as the seed script might fail if users already exist
}

// Start the server
console.log('Starting the server...');
require('./backend/server.js');
