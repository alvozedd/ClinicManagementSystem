const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const { corsMiddleware } = require('./middleware/corsMiddleware');
const userRoutes = require('./routes/userRoutes');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Apply security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Apply CORS middleware
app.use(corsMiddleware);

// Global CORS handler for all routes
app.use((req, res, next) => {
  // Set CORS headers for all responses
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`Handling OPTIONS request for ${req.path}`);
    return res.status(200).end();
  }
  
  next();
});

// Special handler for login route without /api prefix
app.options('/users/login', (req, res) => {
  console.log('Handling OPTIONS request for /users/login');
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Respond with 200 OK
  res.status(200).end();
});

// Special handler for login route with /api prefix
app.options('/api/users/login', (req, res) => {
  console.log('Handling OPTIONS request for /api/users/login');
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Respond with 200 OK
  res.status(200).end();
});

// Mount API routes
app.use('/api/users', userRoutes);

// Special handler for login route without /api prefix
app.post('/users/login', (req, res) => {
  console.log('Received login request at /users/login, forwarding to controller');
  
  // Import the controller directly
  const { authUser } = require('./controllers/userController');
  
  // Call the controller function directly
  authUser(req, res);
});

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
