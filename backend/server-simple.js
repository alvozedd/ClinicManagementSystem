const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes-simple');
const appointmentRoutes = require('./routes/appointmentRoutes-simple');
const diagnosisRoutes = require('./routes/diagnosisRoutes-simple');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Apply basic security middleware
app.use(helmet()); // Adds various security headers

// CORS configuration
app.use((req, res, next) => {
  // Get the origin from the request
  const origin = req.headers.origin;

  // Allow the specific origin that sent the request
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback for requests without origin header
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Service is running',
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/diagnoses', diagnosisRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
