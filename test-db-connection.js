/**
 * Database Connection Test Script
 * 
 * This script tests the connection to the MongoDB database.
 * Run with: node test-db-connection.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string - use the fallback if environment variable is not set
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://clinic_admin:adminMuchai123@cluster0.jrm4jes.mongodb.net/clinic_management?retryWrites=true&w=majority';

console.log('🔄 Attempting to connect to MongoDB...');
console.log(`URI: ${mongoURI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@')}`);

// Connect to MongoDB
mongoose.connect(mongoURI)
.then(() => {
  console.log('✅ Successfully connected to MongoDB!');
  
  // Check for collections
  return mongoose.connection.db.listCollections().toArray();
})
.then(collections => {
  console.log('\n📊 Database Collections:');
  collections.forEach(collection => {
    console.log(`- ${collection.name}`);
  });
  
  // Count documents in users collection
  return mongoose.connection.db.collection('users').countDocuments();
})
.then(userCount => {
  console.log(`\n👥 Number of users in database: ${userCount}`);
  
  if (userCount === 0) {
    console.warn('⚠️ Warning: No users found in the database.');
    console.warn('You may need to run the seeder script to create default users.');
  } else {
    console.log('✅ Users found in the database.');
  }
  
  // Close the connection
  return mongoose.connection.close();
})
.then(() => {
  console.log('\n🔌 Database connection closed.');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Error connecting to MongoDB:', err.message);
  console.error('Please check your connection string and ensure the MongoDB Atlas cluster is running.');
  process.exit(1);
});
