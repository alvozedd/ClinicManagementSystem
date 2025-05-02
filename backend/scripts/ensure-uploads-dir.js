/**
 * Script to ensure the uploads directory exists and has the correct permissions
 */
const fs = require('fs');
const path = require('path');

// Define the uploads directory path
const uploadsDir = path.join(__dirname, '../uploads');

console.log(`Checking uploads directory at: ${uploadsDir}`);

// Check if the directory exists
if (!fs.existsSync(uploadsDir)) {
  console.log('Uploads directory does not exist. Creating it...');
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created successfully.');
  } catch (error) {
    console.error('Error creating uploads directory:', error);
    process.exit(1);
  }
} else {
  console.log('Uploads directory already exists.');
}

// Check if the directory is writable
try {
  // Try to write a test file
  const testFilePath = path.join(uploadsDir, 'test-write-access.txt');
  fs.writeFileSync(testFilePath, 'Test write access');
  console.log('Successfully wrote test file. Directory is writable.');
  
  // Clean up the test file
  fs.unlinkSync(testFilePath);
  console.log('Test file removed.');
} catch (error) {
  console.error('Error writing to uploads directory:', error);
  console.error('The directory exists but is not writable. Please check permissions.');
  process.exit(1);
}

console.log('Uploads directory is ready for use.');
