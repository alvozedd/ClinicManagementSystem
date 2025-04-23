const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

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
  console.log('Comparing passwords:');
  console.log('Entered password:', enteredPassword);
  console.log('Stored password (hashed):', this.password);
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  console.log('Password match result:', isMatch);
  return isMatch;
};

const User = mongoose.model('User', userSchema);

// Check password
const checkPassword = async () => {
  try {
    await connectDB();
    
    // Find admin user
    const user = await User.findOne({ email: 'admin@urohealth.com' });
    
    if (!user) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Admin user found:', {
      _id: user._id,
      email: user.email,
      role: user.role,
    });
    
    // Check password
    const password = 'admin123';
    const isMatch = await user.matchPassword(password);
    
    console.log(`Password '${password}' match:`, isMatch);
    
    // Create a new hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('New hashed password:', hashedPassword);
    
    // Update user password
    user.password = hashedPassword;
    await user.save();
    
    console.log('User password updated');
    
    mongoose.connection.close();
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

// Run the function
checkPassword();
