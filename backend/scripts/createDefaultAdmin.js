const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define the User schema
const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'doctor', 'secretary'],
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if entered password matches the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use environment variable for MongoDB URI
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Create a default admin user
const createDefaultAdmin = async () => {
  try {
    const conn = await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@urohealth.com' });

    if (adminExists) {
      console.log('Admin user already exists');
    } else {
      // Create admin user with more secure password
      const admin = await User.create({
        email: 'admin@urohealth.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@UroHealth2024!',
        role: 'admin',
      });

      console.log('Admin user created:', admin);
    }

    // Create a doctor user
    const doctorExists = await User.findOne({ email: 'doctor@urohealth.com' });

    if (doctorExists) {
      console.log('Doctor user already exists');
    } else {
      // Create doctor user with more secure password
      const doctor = await User.create({
        email: 'doctor@urohealth.com',
        password: process.env.DOCTOR_PASSWORD || 'Doctor@UroHealth2024!',
        role: 'doctor',
      });

      console.log('Doctor user created:', doctor);
    }

    // Create a secretary user
    const secretaryExists = await User.findOne({ email: 'secretary@urohealth.com' });

    if (secretaryExists) {
      console.log('Secretary user already exists');
    } else {
      // Create secretary user with more secure password
      const secretary = await User.create({
        email: 'secretary@urohealth.com',
        password: process.env.SECRETARY_PASSWORD || 'Secretary@UroHealth2024!',
        role: 'secretary',
      });

      console.log('Secretary user created:', secretary);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

// Run the function
createDefaultAdmin();
