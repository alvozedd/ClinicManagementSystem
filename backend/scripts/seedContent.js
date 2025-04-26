const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Content = require('../models/contentModel');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Seed content data
const seedContent = async () => {
  try {
    await connectDB();

    // Clear existing content
    await Content.deleteMany({});
    console.log('Deleted existing content');

    // Create default content items
    const contentItems = [
      // Footer content
      {
        section: 'footer',
        category: 'UroHealth Central Ltd',
        type: 'text',
        label: 'About Text',
        value: 'Providing specialized urological care with a patient-centered approach since 2010.',
        order: 1,
        visible: true,
      },
      {
        section: 'footer',
        category: 'Quick Links',
        type: 'link',
        label: 'Book Appointment',
        url: '#booking',
        order: 1,
        visible: true,
      },
      {
        section: 'footer',
        category: 'Quick Links',
        type: 'link',
        label: 'Contact Us',
        url: '#contact',
        order: 2,
        visible: true,
      },
      {
        section: 'footer',
        category: 'Quick Links',
        type: 'link',
        label: 'Staff Login',
        url: '/login',
        order: 3,
        visible: true,
      },
      {
        section: 'footer',
        category: 'Contact',
        type: 'text',
        label: 'Address',
        value: '1st Floor, Gatemu House, Kimathi Way, Nyeri, Kenya',
        order: 1,
        visible: true,
      },
      {
        section: 'footer',
        category: 'Contact',
        type: 'text',
        label: 'Phone',
        value: '+254 722 396 296',
        order: 2,
        visible: true,
      },
      {
        section: 'footer',
        category: 'Contact',
        type: 'text',
        label: 'Email',
        value: 'info@urohealthcentral.com',
        order: 3,
        visible: true,
      },
      {
        section: 'footer',
        category: 'Legal',
        type: 'link',
        label: 'Privacy Policy',
        url: '#',
        order: 1,
        visible: true,
      },
      {
        section: 'footer',
        category: 'Legal',
        type: 'link',
        label: 'Terms of Service',
        url: '#',
        order: 2,
        visible: true,
      },
      {
        section: 'footer',
        category: 'Legal',
        type: 'text',
        label: 'Copyright',
        value: `© ${new Date().getFullYear()} UroHealth Central Ltd. All rights reserved.`,
        order: 3,
        visible: true,
      },
      
      // Header content
      {
        section: 'header',
        category: 'Branding',
        type: 'text',
        label: 'Site Title',
        value: 'UroHealth Central Ltd',
        order: 1,
        visible: true,
      },
      {
        section: 'header',
        category: 'Branding',
        type: 'text',
        label: 'Subtitle',
        value: 'Specialist Urological & Surgical Care',
        order: 2,
        visible: true,
      },
      {
        section: 'header',
        category: 'Navigation',
        type: 'link',
        label: 'Services',
        url: '#services',
        order: 1,
        visible: true,
      },
      {
        section: 'header',
        category: 'Navigation',
        type: 'link',
        label: 'Contact',
        url: '#contact',
        order: 2,
        visible: true,
      },
      {
        section: 'header',
        category: 'Navigation',
        type: 'link',
        label: 'Location',
        url: '#location',
        order: 3,
        visible: true,
      },
      
      // Homepage content
      {
        section: 'homepage',
        category: 'Hero',
        type: 'text',
        label: 'Hero Title',
        value: 'DR. PAUL MUCHAI MBUGUA - CONSULTANT SURGEON & UROLOGIST',
        order: 1,
        visible: true,
      },
      {
        section: 'homepage',
        category: 'Hero',
        type: 'text',
        label: 'Hero Subtitle',
        value: 'UROLOGIST',
        order: 2,
        visible: true,
      },
      {
        section: 'homepage',
        category: 'Contact',
        type: 'text',
        label: 'Mobile',
        value: '0722 396 296',
        order: 1,
        visible: true,
      },
      {
        section: 'homepage',
        category: 'Contact',
        type: 'text',
        label: 'Office',
        value: '0733 398 296',
        order: 2,
        visible: true,
      },
      {
        section: 'homepage',
        category: 'Contact',
        type: 'text',
        label: 'Email',
        value: 'info@urohealthcentral.com',
        order: 3,
        visible: true,
      },
      {
        section: 'homepage',
        category: 'About',
        type: 'longtext',
        label: 'About Text',
        value: 'Providing specialized urological care with a patient-centered approach since 2010.',
        order: 1,
        visible: true,
      },
      
      // Services content
      {
        section: 'services',
        category: 'Urological Services',
        type: 'text',
        label: 'Service Title',
        value: 'Urological Services',
        order: 1,
        visible: true,
      },
      {
        section: 'services',
        category: 'Urological Services',
        type: 'longtext',
        label: 'Service Description',
        value: 'Comprehensive urological care for various conditions.',
        order: 2,
        visible: true,
      },
      {
        section: 'services',
        category: 'General Surgery',
        type: 'text',
        label: 'Service Title',
        value: 'General Surgery',
        order: 1,
        visible: true,
      },
      {
        section: 'services',
        category: 'General Surgery',
        type: 'longtext',
        label: 'Service Description',
        value: 'Expert surgical care for a range of conditions.',
        order: 2,
        visible: true,
      },
      {
        section: 'services',
        category: 'Consultations',
        type: 'text',
        label: 'Service Title',
        value: 'Consultations',
        order: 1,
        visible: true,
      },
      {
        section: 'services',
        category: 'Consultations',
        type: 'longtext',
        label: 'Service Description',
        value: 'Professional medical consultations and advice.',
        order: 2,
        visible: true,
      },
      {
        section: 'services',
        category: 'Diagnostics',
        type: 'text',
        label: 'Service Title',
        value: 'Diagnostics',
        order: 1,
        visible: true,
      },
      {
        section: 'services',
        category: 'Diagnostics',
        type: 'longtext',
        label: 'Service Description',
        value: 'Advanced diagnostic services for accurate assessment.',
        order: 2,
        visible: true,
      },
    ];

    // Insert content items
    await Content.insertMany(contentItems);
    console.log(`${contentItems.length} content items inserted`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

// Run the function
seedContent();
