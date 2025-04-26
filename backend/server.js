const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { enforceHttps, addSecurityHeaders, secureCoookieSettings } = require('./middleware/securityMiddleware');
// CSRF middleware completely removed
const { addRequestId } = require('./middleware/requestIdMiddleware');
const { conditionalRequestLogger } = require('./middleware/requestLoggingMiddleware');
const corsMiddleware = require('./middleware/corsMiddleware');
const { checkRequiredEnvVars } = require('./utils/checkEnv');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');

// Load environment variables
dotenv.config();

// Load production environment variables if NODE_ENV is production
if (process.env.NODE_ENV === 'production') {
  try {
    dotenv.config({ path: '.env.production' });
    console.log('Loaded production environment variables');
  } catch (error) {
    console.warn('Error loading production environment variables:', error.message);
  }
}

// Check required environment variables
checkRequiredEnvVars();

// Connect to MongoDB
connectDB();

const app = express();

// Add request ID to each request (do this first for complete request tracking)
app.use(addRequestId);

// Log all requests
app.use(conditionalRequestLogger);

// Apply security middleware
app.use(helmet()); // Adds various security headers
app.use(enforceHttps); // Redirect HTTP to HTTPS in production
app.use(addSecurityHeaders); // Add additional security headers
app.use(secureCoookieSettings); // Ensure cookies are secure

// Apply custom CORS middleware (must be before other middleware)
app.use(corsMiddleware);

// Also apply the cors package for good measure
app.use(cors({
  origin: ['https://urohealthltd.netlify.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// CSRF middleware completely removed
console.log('CSRF middleware completely removed');

// API Routes section

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/diagnoses', diagnosisRoutes);

// Create a special route just for login without the /api prefix
app.post('/users/login', (req, res, next) => {
  console.log('Received login request at /users/login, forwarding to /api/users/login');
  req.url = '/login'; // Change the URL to match what the router expects
  userRoutes(req, res, next); // Forward to the userRoutes router
});

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
