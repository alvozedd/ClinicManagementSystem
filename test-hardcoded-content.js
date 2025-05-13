/**
 * Test Hardcoded Content
 * 
 * This script tests that the hardcoded content is working correctly.
 * Run with: node test-hardcoded-content.js
 */

// Import the hardcoded content
const hardcodedContent = require('./frontend/src/data/hardcodedContent').default;

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
