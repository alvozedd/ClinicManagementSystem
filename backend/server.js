const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const connectDB = require('./config/db');
const fs = require('fs');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { enforceHttps, addSecurityHeaders, secureCoookieSettings } = require('./middleware/securityMiddleware');
// CSRF middleware completely removed
const { addRequestId } = require('./middleware/requestIdMiddleware');
const { conditionalRequestLogger } = require('./middleware/requestLoggingMiddleware');
const { corsMiddleware, allowedHeaders, allowedMethods } = require('./middleware/corsMiddleware');
const { checkRequiredEnvVars } = require('./utils/checkEnv');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');
const noteRoutes = require('./routes/noteRoutes');
// Content routes removed - using hardcoded content
const integratedAppointmentRoutes = require('./routes/integratedAppointmentRoutes');
const queueRoutes = require('./routes/queueRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const testRoutes = require('./routes/testRoutes');

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

// We're now using our enhanced corsMiddleware for all routes
// No need for additional CORS handling here

// We're using our custom CORS middleware instead of the cors package
// This gives us more control over the CORS headers

// Let corsMiddleware handle all preflight requests
app.options('*', (req, res) => {
  console.log(`Global OPTIONS handler for request from origin: ${req.headers.origin || 'unknown'}`);
  // The corsMiddleware will have already set the appropriate headers
  res.status(200).end();
});

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// CSRF middleware completely removed
console.log('CSRF middleware completely removed');

// Helper function to add CORS headers to non-API routes
// This is a simplified version that just logs the request and passes it to the next middleware
// The corsMiddleware will handle all the CORS headers
const addCorsHeaders = (req, res, next) => {
  console.log(`Non-API route request: ${req.method} ${req.path} from origin: ${req.headers.origin || 'unknown'}`);
  next();
};

// API Routes section

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/notes', noteRoutes);
// Content routes removed - using hardcoded content
app.use('/api/integrated-appointments', integratedAppointmentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// Test routes - no authentication required
app.use('/', testRoutes);
app.use('/api', testRoutes);

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

// Login route - CORS is handled by the corsMiddleware
app.post('/users/login', (req, res) => {
  console.log('Received login request at /users/login, forwarding to controller directly');
  // Import the controller directly
  const { authUser } = require('./controllers/userController');
  // Call the controller function directly
  authUser(req, res);
});

// Refresh token route - CORS is handled by the corsMiddleware
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
app.get('/patients', addCorsHeaders, (req, res) => {
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

app.post('/patients', addCorsHeaders, (req, res) => {
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
app.get('/appointments', addCorsHeaders, (req, res) => {
  console.log('Received GET request at /appointments, forwarding to controller directly');

  // Import the controller directly
  const { getAppointments } = require('./controllers/appointmentController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getAppointments(req, res));
});

// Get appointments by patient ID
app.get('/patients/:id/appointments', addCorsHeaders, (req, res) => {
  console.log('Received GET request at /patients/:id/appointments, forwarding to controller directly');
  // Import the controller directly
  const { getAppointmentsByPatientId } = require('./controllers/appointmentController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getAppointmentsByPatientId(req, res));
});

// Direct route for appointments by patient ID
app.get('/appointments/patient/:id', addCorsHeaders, (req, res) => {
  console.log('Received GET request at /appointments/patient/:id, forwarding to controller directly');
  // Import the controller directly
  const { getAppointmentsByPatientId } = require('./controllers/appointmentController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getAppointmentsByPatientId(req, res));
});

app.post('/appointments', addCorsHeaders, (req, res) => {
  console.log('Received POST request at /appointments, forwarding to controller directly');

  // Import the controller directly
  const { createAppointment } = require('./controllers/appointmentController');
  // Add authentication middleware manually
  const { optionalAuth } = require('./middleware/authMiddleware');
  // Call middleware then controller
  optionalAuth(req, res, () => createAppointment(req, res));
});

app.get('/appointments/:id', addCorsHeaders, (req, res) => {
  console.log('Received GET request at /appointments/:id, forwarding to controller directly');
  // Import the controller directly
  const { getAppointmentById } = require('./controllers/appointmentController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getAppointmentById(req, res));
});

app.put('/appointments/:id', addCorsHeaders, (req, res) => {
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

app.delete('/appointments/:id', addCorsHeaders, (req, res) => {
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

// Integrated Appointment routes
app.get('/integrated-appointments', addCorsHeaders, (req, res) => {
  console.log('Received GET request at /integrated-appointments, forwarding to controller directly');
  // Import the controller directly
  const { getAppointments } = require('./controllers/integratedAppointmentController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getAppointments(req, res));
});

app.post('/integrated-appointments', addCorsHeaders, (req, res) => {
  console.log('Received POST request at /integrated-appointments, forwarding to controller directly');
  // Import the controller directly
  const { createAppointment } = require('./controllers/integratedAppointmentController');
  // Add authentication middleware manually
  const { optionalAuth } = require('./middleware/authMiddleware');
  // Call middleware then controller
  optionalAuth(req, res, () => createAppointment(req, res));
});

// Queue-related endpoints have been removed

app.put('/integrated-appointments/:id/check-in', addCorsHeaders, (req, res) => {
  console.log('Received PUT request at /integrated-appointments/:id/check-in, forwarding to controller directly');
  // Import the controller directly
  const { checkInPatient } = require('./controllers/integratedAppointmentController');
  // Add authentication middleware manually
  const { protect, doctorOrSecretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctorOrSecretary(req, res, () => checkInPatient(req, res)));
});

app.put('/integrated-appointments/:id/start', addCorsHeaders, (req, res) => {
  console.log('Received PUT request at /integrated-appointments/:id/start, forwarding to controller directly');
  // Import the controller directly
  const { startAppointment } = require('./controllers/integratedAppointmentController');
  // Add authentication middleware manually
  const { protect, doctor } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctor(req, res, () => startAppointment(req, res)));
});

app.put('/integrated-appointments/:id/complete', addCorsHeaders, (req, res) => {
  console.log('Received PUT request at /integrated-appointments/:id/complete, forwarding to controller directly');
  // Import the controller directly
  const { completeAppointment } = require('./controllers/integratedAppointmentController');
  // Add authentication middleware manually
  const { protect, doctor } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctor(req, res, () => completeAppointment(req, res)));
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

// Notes routes
app.get('/notes/patient/:id', addCorsHeaders, (req, res) => {
  console.log('Received GET request at /notes/patient/:id, forwarding to controller directly');
  // Import the controller directly
  const { getNotesByPatientId } = require('./controllers/noteController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getNotesByPatientId(req, res));
});

// Content routes removed - using hardcoded content

// File upload routes
app.post('/uploads', addCorsHeaders, (req, res) => {
  console.log('Received POST request at /uploads, forwarding to controller directly');
  // Import multer and configure it
  const multer = require('multer');
  const path = require('path');
  const { v4: uuidv4 } = require('uuid');

  // Configure multer storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Generate a unique filename with original extension
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      cb(null, fileName);
    }
  });

  // File filter to only allow certain file types
  const fileFilter = (req, file, cb) => {
    // Accept images, PDFs, and common document formats
    const allowedFileTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
    }
  };

  // Configure multer upload
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
  });

  // Import the controller directly
  const { uploadFile } = require('./controllers/uploadController');
  // Add authentication middleware manually
  const { protect, doctor } = require('./middleware/authMiddleware');

  // Process the upload
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }

    // Call middleware then controller
    protect(req, res, () => {
      // Only doctors can upload files
      if (req.user && (req.user.role === 'doctor' || req.user.role === 'admin')) {
        uploadFile(req, res);
      } else {
        res.status(403);
        throw new Error('Not authorized as a doctor');
      }
    });
  });
});

app.get('/uploads/:filename', addCorsHeaders, (req, res) => {
  console.log('Received GET request at /uploads/:filename, forwarding to controller directly');
  // Import the controller directly
  const { getFile } = require('./controllers/uploadController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => getFile(req, res));
});

// Content routes removed - using hardcoded content

// Queue routes
app.get('/queue/today', addCorsHeaders, (req, res) => {
  console.log('Received GET request at /queue/today, forwarding to controller directly');
  // Import the controller directly
  const { getTodayQueue } = require('./controllers/queueController');
  // Add authentication middleware manually
  const { protect, doctorOrSecretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctorOrSecretary(req, res, () => getTodayQueue(req, res)));
});

app.post('/queue/add/:id', addCorsHeaders, (req, res) => {
  console.log('Received POST request at /queue/add/:id, forwarding to controller directly');
  // Import the controller directly
  const { addToQueue } = require('./controllers/queueController');
  // Add authentication middleware manually
  const { protect, doctorOrSecretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctorOrSecretary(req, res, () => addToQueue(req, res)));
});

app.delete('/queue/remove/:id', addCorsHeaders, (req, res) => {
  console.log('Received DELETE request at /queue/remove/:id, forwarding to controller directly');
  // Import the controller directly
  const { removeFromQueue } = require('./controllers/queueController');
  // Add authentication middleware manually
  const { protect, doctorOrSecretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctorOrSecretary(req, res, () => removeFromQueue(req, res)));
});

app.put('/queue/reorder', addCorsHeaders, (req, res) => {
  console.log('Received PUT request at /queue/reorder, forwarding to controller directly');
  // Import the controller directly
  const { reorderQueue } = require('./controllers/queueController');
  // Add authentication middleware manually
  const { protect, doctorOrSecretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctorOrSecretary(req, res, () => reorderQueue(req, res)));
});

app.post('/queue/reset', addCorsHeaders, (req, res) => {
  console.log('Received POST request at /queue/reset, forwarding to controller directly');
  // Import the controller directly
  const { resetQueue } = require('./controllers/queueController');
  // Add authentication middleware manually
  const { protect, doctorOrSecretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctorOrSecretary(req, res, () => resetQueue(req, res)));
});

// Root route - corsMiddleware will handle CORS headers
app.get('/', (req, res) => {
  console.log(`Root route request from origin: ${req.headers.origin || 'unknown'}`);
  res.send('API is running...');
});

// Import health controller
const { checkHealth } = require('./controllers/healthController');

// Health check endpoint - corsMiddleware will handle CORS headers
app.get('/health', (req, res, next) => {
  console.log(`Health check request from origin: ${req.headers.origin || 'unknown'}`);
  next();
}, checkHealth);

// API health check endpoint - corsMiddleware will handle CORS headers
app.get('/api/health', (req, res, next) => {
  console.log(`API Health check request from origin: ${req.headers.origin || 'unknown'}`);
  next();
}, checkHealth);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Automatically reset queue at midnight
const cron = require('node-cron');
const IntegratedAppointment = require('./models/integratedAppointmentModel');

// Schedule a task to run at midnight every day
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled task: Resetting queue at midnight');
  try {
    // Reset all queue positions
    await IntegratedAppointment.updateMany(
      { in_queue: true },
      { in_queue: false, queue_position: 0 }
    );
    console.log('Queue reset successfully');
  } catch (error) {
    console.error('Error resetting queue:', error);
  }
});
