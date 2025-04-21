const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const { connectDB } = require('../config/db-memory');

// Load environment variables
dotenv.config();

// Connect to MongoDB Memory Server
connectDB();

// Create initial admin user
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany();

    // Create admin user
    await User.create({
      email: 'admin@urohealth.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create doctor user
    await User.create({
      email: 'doctor@urohealth.com',
      password: 'doctor123',
      role: 'doctor',
    });

    // Create secretary user
    await User.create({
      email: 'secretary@urohealth.com',
      password: 'secretary123',
      role: 'secretary',
    });

    console.log('Users seeded successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedUsers();
