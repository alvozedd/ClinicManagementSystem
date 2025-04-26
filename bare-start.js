// This file is used by Railway to start a bare minimum application
// with no middleware to avoid the path-to-regexp error
const path = require('path');
const fs = require('fs');

console.log('Starting bare minimum application...');

// Get the absolute path to the backend directory
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);

// Load environment variables from .env.production if it exists
const envPath = path.join(__dirname, 'backend', '.env.production');
if (fs.existsSync(envPath)) {
  console.log('Loading environment variables from .env.production file');
  try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = envFile.split('\n');
    
    envVars.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
        console.log(`Set environment variable: ${key.trim()}`);
      }
    });
  } catch (error) {
    console.warn('Error loading .env.production file:', error.message);
  }
} else {
  console.log('.env.production file not found, using environment variables from Railway');
}

// Fallback values for critical environment variables
if (!process.env.MONGODB_URI) {
  console.log('Setting fallback MONGODB_URI');
  process.env.MONGODB_URI = 'mongodb+srv://clinic_admin:adminMuchai123@cluster0.jrm4jes.mongodb.net/clinic_management?retryWrites=true&w=majority';
}

if (!process.env.JWT_SECRET) {
  console.log('Setting fallback JWT_SECRET');
  process.env.JWT_SECRET = 'b8df259dfa44c3db20384347e8968581097e98324d253c1cb6f56cb9985ce1918665ac109f968389ae70c58de4e6e5548bcb9c6b6234c385a35f2ce2ca73c3ea';
}

// Start the bare server
console.log('Starting the bare server...');
require('./backend/bare-server.js');
