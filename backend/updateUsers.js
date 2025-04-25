const mongoose = require('mongoose');
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

// Update existing users
const updateUsers = async () => {
  try {
    await connectDB();
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);
    
    // Update each user
    for (const user of users) {
      // Skip users that already have name and username
      if (user.name && user.username) {
        console.log(`User ${user.email} already has name and username. Skipping.`);
        continue;
      }
      
      // Set default values based on role
      let name, username;
      
      if (user.role === 'admin') {
        name = 'Admin User';
        username = 'admin';
      } else if (user.role === 'doctor') {
        name = 'Dr. Paul Muchai';
        username = 'doctor';
      } else if (user.role === 'secretary') {
        name = 'Secretary User';
        username = 'secretary';
      } else {
        name = `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} User`;
        username = user.email.split('@')[0];
      }
      
      // Update user
      user.name = name;
      user.username = username;
      
      await user.save();
      console.log(`Updated user ${user.email} with name: ${name}, username: ${username}`);
    }
    
    console.log('All users updated successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

// Run the function
updateUsers();
