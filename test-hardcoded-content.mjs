/**
 * Test Hardcoded Content
 * 
 * This script tests that the hardcoded content is working correctly.
 * Run with: node test-hardcoded-content.mjs
 */

// Import the hardcoded content using dynamic import
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the hardcoded content file directly
const contentFilePath = resolve(__dirname, 'frontend/src/data/hardcodedContent.js');
const contentFileContent = fs.readFileSync(contentFilePath, 'utf8');

// Extract the hardcoded content object from the file
const contentMatch = contentFileContent.match(/const\s+hardcodedContent\s*=\s*({[\s\S]*?});/);
if (!contentMatch) {
  console.error('Could not find hardcodedContent in the file');
  process.exit(1);
}

// Evaluate the content object
const hardcodedContent = eval(`(${contentMatch[1]})`);

// Test that the content exists
console.log('Testing hardcoded content...');

// Check that the content has the expected sections
const expectedSections = ['header', 'footer', 'homepage', 'services', 'contact'];
const missingSections = expectedSections.filter(section => !hardcodedContent[section]);

if (missingSections.length > 0) {
  console.error(`Missing sections: ${missingSections.join(', ')}`);
} else {
  console.log('All expected sections are present.');
}

// Check that the phone numbers are correct
const mobilePhone = hardcodedContent.footer.Contact.find(item => item.label === 'Mobile')?.value;
const officePhone = hardcodedContent.footer.Contact.find(item => item.label === 'Office')?.value;

console.log(`Mobile phone: ${mobilePhone}`);
console.log(`Office phone: ${officePhone}`);

if (mobilePhone === '0722398296' && officePhone === '0722398296') {
  console.log('Phone numbers are correct.');
} else {
  console.error('Phone numbers are not correct.');
}

// Check that the contact section has the correct phone numbers
const contactMobile = hardcodedContent.contact['Contact Information'].find(item => item.label === 'Mobile')?.value;
const contactOffice = hardcodedContent.contact['Contact Information'].find(item => item.label === 'Office')?.value;

console.log(`Contact mobile: ${contactMobile}`);
console.log(`Contact office: ${contactOffice}`);

if (contactMobile === '0722398296' && contactOffice === '0722398296') {
  console.log('Contact phone numbers are correct.');
} else {
  console.error('Contact phone numbers are not correct.');
}

console.log('Test completed.');
