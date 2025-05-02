/**
 * Database Connection Test Script
 * 
 * This script tests the connection to the MongoDB database.
 * Run with: node check-db-connection.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// MongoDB connection string
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ MongoDB URI not found in environment variables.');
  console.error('Please make sure the MONGODB_URI is set in the backend/.env file.');
  process.exit(1);
}

console.log('🔄 Attempting to connect to MongoDB...');
console.log(`URI: ${mongoURI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@')}`);

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
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
  
  if (err.message.includes('ENOTFOUND')) {
    console.error('\nThe database host could not be found. Possible reasons:');
    console.error('- You are not connected to the internet');
    console.error('- The database URI is incorrect');
    console.error('- The database server is down');
  } else if (err.message.includes('Authentication failed')) {
    console.error('\nAuthentication failed. Possible reasons:');
    console.error('- Username or password in the connection string is incorrect');
    console.error('- The user does not have access to the database');
  } else if (err.message.includes('timed out')) {
    console.error('\nConnection timed out. Possible reasons:');
    console.error('- The database server is not responding');
    console.error('- Network issues are preventing the connection');
  }
  
  process.exit(1);
});
