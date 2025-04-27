const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Content = require('../models/contentModel');
const connectDB = require('../config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initial content data
// This data should match the structure in frontend/src/data/defaultContent.js
const contentData = [
  // Footer content
  {
    section: 'footer',
    category: 'Quick Links',
    type: 'link',
    label: 'Privacy Policy',
    url: '/privacy',
    order: 1,
    visible: true
  },
  {
    section: 'footer',
    category: 'Quick Links',
    type: 'link',
    label: 'Terms of Service',
    url: '/terms',
    order: 2,
    visible: true
  },
  {
    section: 'footer',
    category: 'Contact',
    type: 'text',
    label: 'Address',
    value: '1st Floor, Gatemu House, Kimathi Way, Nyeri, Kenya',
    order: 1,
    visible: true
  },
  {
    section: 'footer',
    category: 'Contact',
    type: 'text',
    label: 'Mobile',
    value: '+254 722 396 296',
    order: 2,
    visible: true
  },
  {
    section: 'footer',
    category: 'Contact',
    type: 'text',
    label: 'Office',
    value: '+254 733 398 296',
    order: 3,
    visible: true
  },
  {
    section: 'footer',
    category: 'Contact',
    type: 'text',
    label: 'Email',
    value: 'info@urohealthcentral.com',
    order: 4,
    visible: true
  },
  {
    section: 'footer',
    category: 'Legal',
    type: 'text',
    label: 'Copyright',
    value: `© ${new Date().getFullYear()} UroHealth Central Ltd. All rights reserved.`,
    order: 1,
    visible: true
  },

  // Header content
  {
    section: 'header',
    category: 'Branding',
    type: 'text',
    label: 'Site Title',
    value: 'UroHealth Central Ltd',
    order: 1,
    visible: true
  },
  {
    section: 'header',
    category: 'Branding',
    type: 'text',
    label: 'Subtitle',
    value: 'Specialist Urological & Surgical Care',
    order: 2,
    visible: true
  },

  // Homepage content
  {
    section: 'homepage',
    category: 'Hero',
    type: 'text',
    label: 'Hero Title',
    value: 'DR. PAUL MUCHAI MBUGUA - CONSULTANT SURGEON & UROLOGIST',
    order: 1,
    visible: true
  },
  {
    section: 'homepage',
    category: 'Hero',
    type: 'text',
    label: 'Hero Subtitle',
    value: 'UROLOGIST',
    order: 2,
    visible: true
  },
  {
    section: 'homepage',
    category: 'About',
    type: 'longtext',
    label: 'About Text',
    value: 'UroHealth Central Ltd is a leading urological clinic dedicated to providing comprehensive care for urological conditions. Our team of experienced specialists is committed to delivering personalized treatment with compassion and the highest standards of medical excellence.',
    order: 1,
    visible: true
  },
  {
    section: 'homepage',
    category: 'Features',
    type: 'text',
    label: 'Feature 1',
    value: 'Expert Specialists',
    order: 1,
    visible: true
  },
  {
    section: 'homepage',
    category: 'Features',
    type: 'text',
    label: 'Feature 2',
    value: 'Advanced Technology',
    order: 2,
    visible: true
  },
  {
    section: 'homepage',
    category: 'Features',
    type: 'text',
    label: 'Feature 3',
    value: 'Personalized Care',
    order: 3,
    visible: true
  },
  {
    section: 'homepage',
    category: 'Features',
    type: 'text',
    label: 'Feature 4',
    value: 'Comfortable Environment',
    order: 4,
    visible: true
  },

  // Contact content
  {
    section: 'contact',
    category: 'Office Hours',
    type: 'text',
    label: 'Working Hours',
    value: 'Mon-Fri: 8:00 AM - 5:00 PM',
    order: 1,
    visible: true
  },
  {
    section: 'contact',
    category: 'Location',
    type: 'text',
    label: 'Address',
    value: 'Catering Building, 1st Floor, P.O. Box 31-10100, Nyeri, Kenya',
    order: 1,
    visible: true
  },

  // Services content
  {
    section: 'services',
    category: 'Consultations',
    type: 'text',
    label: 'Title',
    value: 'Consultations',
    order: 1,
    visible: true
  },
  {
    section: 'services',
    category: 'Consultations',
    type: 'longtext',
    label: 'Description',
    value: 'Comprehensive evaluation and diagnosis of urological conditions by our expert consultants.',
    order: 2,
    visible: true
  },
  {
    section: 'services',
    category: 'Diagnostics',
    type: 'text',
    label: 'Title',
    value: 'Diagnostics',
    order: 1,
    visible: true
  },
  {
    section: 'services',
    category: 'Diagnostics',
    type: 'longtext',
    label: 'Description',
    value: 'Advanced diagnostic procedures including ultrasound, cystoscopy, and urodynamic studies.',
    order: 2,
    visible: true
  },
  {
    section: 'services',
    category: 'Treatments',
    type: 'text',
    label: 'Title',
    value: 'Treatments',
    order: 1,
    visible: true
  },
  {
    section: 'services',
    category: 'Treatments',
    type: 'longtext',
    label: 'Description',
    value: 'Comprehensive treatment options for various urological conditions, from medication to surgical interventions.',
    order: 2,
    visible: true
  }
];

// Import data to database
const importData = async () => {
  try {
    // Clear existing content
    await Content.deleteMany();

    // Insert new content
    await Content.insertMany(contentData);

    console.log('Content data imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete all data from database
const destroyData = async () => {
  try {
    await Content.deleteMany();

    console.log('Content data destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Determine which function to run based on command line argument
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
