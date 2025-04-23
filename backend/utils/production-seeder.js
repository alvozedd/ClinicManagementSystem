const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');

// Load environment variables from production .env file
dotenv.config({ path: './.env.production' });

// Connect to MongoDB Atlas
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

// Create initial users
const seedUsers = async () => {
  try {
    await connectDB();

    // Check if users already exist
    const userCount = await User.countDocuments();

    if (userCount > 0) {
      console.log('Users already exist in the database. Skipping seeding.');
      process.exit(0);
    }

    console.log('Seeding users to production database...');

    // Create admin user with secure passwords for production
    await User.create({
      email: 'admin@urohealth.com',
      password: 'Admin@UroHealth2024',  // Secure production password
      role: 'admin',
    });

    // Create doctor user
    await User.create({
      email: 'doctor@urohealth.com',
      password: 'Doctor@UroHealth2024',  // Secure production password
      role: 'doctor',
    });

    // Create secretary user
    await User.create({
      email: 'secretary@urohealth.com',
      password: 'Secretary@UroHealth2024',  // Secure production password
      role: 'secretary',
    });

    console.log('Users seeded successfully to production database');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedUsers();
