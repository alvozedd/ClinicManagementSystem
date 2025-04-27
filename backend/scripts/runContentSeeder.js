/**
 * Script to run the content seeder
 * This script is used to populate the database with initial content
 * It can be run from the command line with: node scripts/runContentSeeder.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Running content seeder...');

// Get the path to the content seeder
const seederPath = path.join(__dirname, '../seeder/contentSeeder.js');

// Spawn a child process to run the seeder
const seeder = spawn('node', [seederPath], {
  stdio: 'inherit', // Inherit stdio from parent process
});

// Handle process exit
seeder.on('close', (code) => {
  if (code === 0) {
    console.log('Content seeder completed successfully');
  } else {
    console.error(`Content seeder exited with code ${code}`);
  }
});

// Handle process error
seeder.on('error', (err) => {
  console.error('Failed to start content seeder:', err);
});
