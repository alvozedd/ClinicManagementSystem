const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define the User schema
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
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
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    await connectDB();

    // Check if users already exist
    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      console.log('Users already exist in the database. Skipping seed.');
      existingUsers.forEach(user => {
        console.log({
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
        });
      });
      mongoose.connection.close();
      return;
    }

    // Create default users with more secure passwords
    const users = [
      {
        name: 'Admin User',
        username: 'admin',
        email: 'admin@urohealth.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@UroHealth2024!',
        role: 'admin',
      },
      {
        name: 'Dr. Paul Muchai',
        username: 'doctor',
        email: 'doctor@urohealth.com',
        password: process.env.DOCTOR_PASSWORD || 'Doctor@UroHealth2024!',
        role: 'doctor',
      },
      {
        name: 'Secretary User',
        username: 'secretary',
        email: 'secretary@urohealth.com',
        password: process.env.SECRETARY_PASSWORD || 'Secretary@UroHealth2024!',
        role: 'secretary',
      },
    ];

    // Hash passwords and create users one by one to trigger the pre-save middleware
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }

    console.log('Users created:');
    createdUsers.forEach(user => {
      console.log({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    });

    mongoose.connection.close();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

// Run the function
seedUsers();
