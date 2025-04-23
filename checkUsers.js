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

// Check if there are any users in the database
const checkUsers = async () => {
  try {
    const conn = await connectDB();
    const users = await User.find({});
    console.log('Users in the database:');
    console.log(users);
    await conn.disconnect();
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

// Run the function
checkUsers();
