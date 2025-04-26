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

// Trust proxy - needed for Railway deployment, but only in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', true);
}

// Add request ID to each request (do this first for complete request tracking)
app.use(addRequestId);

// Log all requests
app.use(conditionalRequestLogger);

// Apply security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP from helmet as we have our own
}));
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

// Create compatibility routes without the /api prefix
// User routes
app.get('/users', (req, res) => {
  console.log('Received GET request at /users, forwarding to controller directly');
  // Import the controller directly
  const { getUsers } = require('./controllers/userController');
  // Add authentication middleware manually
  const { protect, admin } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Check if user is admin
    if (req.user && req.user.role === 'admin') {
      getUsers(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as an admin');
    }
  });
});

app.get('/users/:id', (req, res) => {
  console.log('Received GET request at /users/:id, forwarding to controller directly');
  // Import the controller directly
  const { getUserById } = require('./controllers/userController');
  // Add authentication middleware manually
  const { protect, admin } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Check if user is admin
    if (req.user && req.user.role === 'admin') {
      getUserById(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as an admin');
    }
  });
});

app.post('/users', (req, res) => {
  console.log('Received POST request at /users, forwarding to controller directly');
  // Import the controller directly
  const { registerUser } = require('./controllers/userController');
  // Add authentication middleware manually
  const { protect, admin } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Check if user is admin
    if (req.user && req.user.role === 'admin') {
      registerUser(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as an admin');
    }
  });
});

app.put('/users/:id', (req, res) => {
  console.log('Received PUT request at /users/:id, forwarding to controller directly');
  // Import the controller directly
  const { updateUser } = require('./controllers/userController');
  // Add authentication middleware manually
  const { protect, admin } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Check if user is admin
    if (req.user && req.user.role === 'admin') {
      updateUser(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as an admin');
    }
  });
});

app.delete('/users/:id', (req, res) => {
  console.log('Received DELETE request at /users/:id, forwarding to controller directly');
  // Import the controller directly
  const { deleteUser } = require('./controllers/userController');
  // Add authentication middleware manually
  const { protect, admin } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Check if user is admin
    if (req.user && req.user.role === 'admin') {
      deleteUser(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as an admin');
    }
  });
});

// Login route
app.post('/users/login', (req, res) => {
  console.log('Received login request at /users/login, forwarding to controller directly');
  // Import the controller directly
  const { authUser } = require('./controllers/userController');
  // Call the controller function directly
  authUser(req, res);
});

// Refresh token route
app.post('/users/refresh-token', (req, res) => {
  console.log('Received refresh token request at /users/refresh-token, forwarding to controller directly');
  // Import the controller directly
  const { refreshToken } = require('./controllers/userController');
  // Call the controller function directly
  refreshToken(req, res);
});

// Logout route
app.post('/users/logout', (req, res) => {
  console.log('Received logout request at /users/logout, forwarding to controller directly');
  // Import the controller directly
  const { logoutUser } = require('./controllers/userController');
  // Call the controller function directly
  logoutUser(req, res);
});

// Patient routes
app.get('/patients', (req, res) => {
  console.log('Received GET request at /patients, forwarding to controller directly');
  // Import the controller directly
  const { getPatients } = require('./controllers/patientController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getPatients(req, res));
});

app.get('/patients/:id', (req, res) => {
  console.log('Received GET request at /patients/:id, forwarding to controller directly');
  // Import the controller directly
  const { getPatientById } = require('./controllers/patientController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getPatientById(req, res));
});

app.post('/patients', (req, res) => {
  console.log('Received POST request at /patients, forwarding to controller directly');
  // Import the controller directly
  const { createPatient } = require('./controllers/patientController');
  // Add authentication middleware manually
  const { optionalAuth } = require('./middleware/authMiddleware');
  // Call middleware then controller
  optionalAuth(req, res, () => createPatient(req, res));
});

app.put('/patients/:id', (req, res) => {
  console.log('Received PUT request at /patients/:id, forwarding to controller directly');
  // Import the controller directly
  const { updatePatient } = require('./controllers/patientController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Check if user is doctor or secretary
    if (req.user && (req.user.role === 'doctor' || req.user.role === 'secretary' || req.user.role === 'admin')) {
      updatePatient(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as a doctor or secretary');
    }
  });
});

app.delete('/patients/:id', (req, res) => {
  console.log('Received DELETE request at /patients/:id, forwarding to controller directly');
  // Import the controller directly
  const { deletePatient } = require('./controllers/patientController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Check if user is doctor or secretary
    if (req.user && (req.user.role === 'doctor' || req.user.role === 'secretary' || req.user.role === 'admin')) {
      deletePatient(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as a doctor or secretary');
    }
  });
});

// Appointment routes
app.get('/appointments', (req, res) => {
  console.log('Received GET request at /appointments, forwarding to controller directly');
  // Import the controller directly
  const { getAppointments } = require('./controllers/appointmentController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getAppointments(req, res));
});

// Get appointments by patient ID
app.get('/patients/:id/appointments', (req, res) => {
  console.log('Received GET request at /patients/:id/appointments, forwarding to controller directly');
  // Import the controller directly
  const { getAppointmentsByPatientId } = require('./controllers/appointmentController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getAppointmentsByPatientId(req, res));
});

app.post('/appointments', (req, res) => {
  console.log('Received POST request at /appointments, forwarding to controller directly');
  // Import the controller directly
  const { createAppointment } = require('./controllers/appointmentController');
  // Add authentication middleware manually
  const { optionalAuth } = require('./middleware/authMiddleware');
  // Call middleware then controller
  optionalAuth(req, res, () => createAppointment(req, res));
});

app.get('/appointments/:id', (req, res) => {
  console.log('Received GET request at /appointments/:id, forwarding to controller directly');
  // Import the controller directly
  const { getAppointmentById } = require('./controllers/appointmentController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getAppointmentById(req, res));
});

app.put('/appointments/:id', (req, res) => {
  console.log('Received PUT request at /appointments/:id, forwarding to controller directly');
  // Import the controller directly
  const { updateAppointment } = require('./controllers/appointmentController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Check if user is doctor or secretary
    if (req.user && (req.user.role === 'doctor' || req.user.role === 'secretary' || req.user.role === 'admin')) {
      updateAppointment(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as a doctor or secretary');
    }
  });
});

app.delete('/appointments/:id', (req, res) => {
  console.log('Received DELETE request at /appointments/:id, forwarding to controller directly');
  // Import the controller directly
  const { deleteAppointment } = require('./controllers/appointmentController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Check if user is doctor or secretary
    if (req.user && (req.user.role === 'doctor' || req.user.role === 'secretary' || req.user.role === 'admin')) {
      deleteAppointment(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as a doctor or secretary');
    }
  });
});

// Diagnosis routes
app.get('/diagnoses', (req, res) => {
  console.log('Received GET request at /diagnoses, forwarding to controller directly');
  // Import the controller directly
  const { getDiagnoses } = require('./controllers/diagnosisController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getDiagnoses(req, res));
});

// Get diagnoses by patient ID
app.get('/patients/:id/diagnoses', (req, res) => {
  console.log('Received GET request at /patients/:id/diagnoses, forwarding to controller directly');
  // Import the controller directly
  const { getDiagnosesByPatientId } = require('./controllers/diagnosisController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getDiagnosesByPatientId(req, res));
});

// Get diagnoses by appointment ID
app.get('/diagnoses/appointment/:id', (req, res) => {
  console.log('Received GET request at /diagnoses/appointment/:id, forwarding to controller directly');
  // Import the controller directly
  const { getDiagnosisByAppointmentId } = require('./controllers/diagnosisController');
  // Add authentication middleware manually
  const { protect, doctor } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Only doctors can view diagnoses by appointment
    if (req.user && (req.user.role === 'doctor' || req.user.role === 'admin')) {
      getDiagnosisByAppointmentId(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as a doctor');
    }
  });
});

app.post('/diagnoses', (req, res) => {
  console.log('Received POST request at /diagnoses, forwarding to controller directly');
  // Import the controller directly
  const { createDiagnosis } = require('./controllers/diagnosisController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Only doctors can create diagnoses
    if (req.user && (req.user.role === 'doctor' || req.user.role === 'admin')) {
      createDiagnosis(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as a doctor');
    }
  });
});

app.get('/diagnoses/:id', (req, res) => {
  console.log('Received GET request at /diagnoses/:id, forwarding to controller directly');
  // Import the controller directly
  const { getDiagnosisById } = require('./controllers/diagnosisController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getDiagnosisById(req, res));
});

app.put('/diagnoses/:id', (req, res) => {
  console.log('Received PUT request at /diagnoses/:id, forwarding to controller directly');
  // Import the controller directly
  const { updateDiagnosis } = require('./controllers/diagnosisController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Only doctors can update diagnoses
    if (req.user && (req.user.role === 'doctor' || req.user.role === 'admin')) {
      updateDiagnosis(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as a doctor');
    }
  });
});

app.delete('/diagnoses/:id', (req, res) => {
  console.log('Received DELETE request at /diagnoses/:id, forwarding to controller directly');
  // Import the controller directly
  const { deleteDiagnosis } = require('./controllers/diagnosisController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Only doctors can delete diagnoses
    if (req.user && (req.user.role === 'doctor' || req.user.role === 'admin')) {
      deleteDiagnosis(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as a doctor');
    }
  });
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
