const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { enforceHttps, addSecurityHeaders, secureCoookieSettings } = require('./middleware/securityMiddleware');
const { handleCsrfError, exemptCsrf, provideCsrfToken } = require('./middleware/csrfMiddleware');
const { addRequestId } = require('./middleware/requestIdMiddleware');
const { conditionalRequestLogger } = require('./middleware/requestLoggingMiddleware');
const corsMiddleware = require('./middleware/corsMiddleware');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Load environment variables
dotenv.config();

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

// CSRF protection
app.use(exemptCsrf);
app.use(handleCsrfError);
app.use(provideCsrfToken);

// Health check routes (should be before other routes for quick response)
app.use('/api/health', healthRoutes);

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
