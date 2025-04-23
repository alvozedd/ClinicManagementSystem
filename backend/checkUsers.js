const mongoose = require('mongoose');
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

// Check if users exist
const checkUsers = async () => {
  try {
    await connectDB();
    
    // Find all users
    const users = await User.find({});
    
    console.log('Total users found:', users.length);
    
    // Print user details (excluding password)
    users.forEach(user => {
      console.log({
        _id: user._id,
        email: user.email,
        role: user.role,
      });
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

// Run the function
checkUsers();
