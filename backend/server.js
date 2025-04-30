const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cron = require('node-cron');
const connectDB = require('./config/db');
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
const contentRoutes = require('./routes/contentRoutes');
const queueRoutes = require('./routes/queueRoutes');
const integratedAppointmentRoutes = require('./routes/integratedAppointmentRoutes');

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

// Set CORS headers for all responses
app.use((req, res, next) => {
  // Ensure the Vary header is set
  res.setHeader('Vary', 'Origin');

  // Ensure the response includes the CORS headers
  const oldSend = res.send;
  res.send = function(data) {
    // Check if CORS headers are already set
    if (!res.get('Access-Control-Allow-Origin')) {
      const origin = req.headers.origin;
      if (origin) {
        // Always allow the origin that sent the request
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        console.log(`Setting CORS headers for origin: ${origin}`);
      } else {
        res.header('Access-Control-Allow-Origin', '*');
        console.log('Setting CORS headers with wildcard origin');
      }
    }
    return oldSend.apply(res, arguments);
  };
  next();
});

// We're using our custom CORS middleware instead of the cors package
// This gives us more control over the CORS headers

// Handle preflight requests at the application level
app.options('*', (req, res) => {
  // Set CORS headers for OPTIONS requests
  const origin = req.headers.origin;

  // Use the imported allowedHeaders and allowedMethods

  // Set the Vary header
  res.header('Vary', 'Origin');

  // Set allowed origin
  if (origin) {
    const allowedOrigins = ['https://urohealthltd.netlify.app', 'https://www.urohealthltd.netlify.app', 'http://localhost:3000', 'http://localhost:5173', 'https://urohealthcentral.netlify.app', 'https://www.urohealthcentral.netlify.app'];

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development' || process.env.ALLOW_ALL_ORIGINS === 'true') {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }

  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
  res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  res.status(200).end();
  console.log(`Responded to OPTIONS request from ${origin || 'unknown origin'}`);
});

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// CSRF middleware completely removed
console.log('CSRF middleware completely removed');

// Helper function to add CORS headers to non-API routes
const addCorsHeaders = (req, res, next) => {
  const origin = req.headers.origin;

  // Log the request for debugging
  console.log(`CORS headers for non-API route: ${req.method} ${req.path} from origin: ${origin || 'unknown'}`);

  // Set the Vary header
  res.header('Vary', 'Origin');

  // Set allowed origin
  if (origin) {
    const allowedOrigins = [
      'https://urohealthltd.netlify.app',
      'https://www.urohealthltd.netlify.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ];

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development' || process.env.ALLOW_ALL_ORIGINS === 'true') {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      console.log(`CORS headers set for non-API route: ${req.path} from origin: ${origin}`);
    } else {
      console.log(`Non-API route ${req.path} accessed from non-allowed origin: ${origin}`);
    }
  } else {
    // For requests without origin, use wildcard
    res.header('Access-Control-Allow-Origin', '*');
    console.log(`CORS headers set for non-API route without origin: ${req.path}`);
  }

  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
  res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`Handling OPTIONS request for ${req.path}`);
    return res.status(200).end();
  }

  next();
};

// API Routes section

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/integrated-appointments', integratedAppointmentRoutes);

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

// OPTIONS handler for login route
app.options('/users/login', (req, res) => {
  console.log('Received OPTIONS request for /users/login');

  // Set explicit CORS headers for login route OPTIONS
  const origin = req.headers.origin;
  console.log('Login OPTIONS request origin:', origin);

  // Set the Vary header
  res.header('Vary', 'Origin');

  // Always allow the origin that sent the request for login
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log('CORS headers set for login OPTIONS from origin:', origin);
  } else {
    // For requests without origin (like server-to-server), use wildcard
    res.header('Access-Control-Allow-Origin', '*');
    console.log('CORS headers set for login OPTIONS without origin');
  }

  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Respond with 200 OK for OPTIONS
  res.status(200).end();
});

// Login route with explicit CORS handling
app.post('/users/login', (req, res) => {
  console.log('Received login request at /users/login, forwarding to controller directly');

  // Set explicit CORS headers for login route
  const origin = req.headers.origin;
  console.log('Login request origin:', origin);

  // Set the Vary header
  res.header('Vary', 'Origin');

  // Always allow the origin that sent the request for login
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log('CORS headers set for login route from origin:', origin);
  } else {
    // For requests without origin (like server-to-server), use wildcard
    res.header('Access-Control-Allow-Origin', '*');
    console.log('CORS headers set for login route without origin');
  }

  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Import the controller directly
  const { authUser } = require('./controllers/userController');
  // Call the controller function directly
  authUser(req, res);
});

// OPTIONS handler for refresh token route
app.options('/users/refresh-token', (req, res) => {
  console.log('Received OPTIONS request for /users/refresh-token');

  // Set explicit CORS headers for refresh token route OPTIONS
  const origin = req.headers.origin;
  console.log('Refresh token OPTIONS request origin:', origin);

  // Set the Vary header
  res.header('Vary', 'Origin');

  // Always allow the origin that sent the request for refresh token
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log('CORS headers set for refresh token OPTIONS from origin:', origin);
  } else {
    // For requests without origin (like server-to-server), use wildcard
    res.header('Access-Control-Allow-Origin', '*');
    console.log('CORS headers set for refresh token OPTIONS without origin');
  }

  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Respond with 200 OK for OPTIONS
  res.status(200).end();
});

// Refresh token route with explicit CORS handling
app.post('/users/refresh-token', (req, res) => {
  console.log('Received refresh token request at /users/refresh-token, forwarding to controller directly');

  // Set explicit CORS headers for refresh token route
  const origin = req.headers.origin;
  console.log('Refresh token request origin:', origin);

  // Set the Vary header
  res.header('Vary', 'Origin');

  // Always allow the origin that sent the request for refresh token
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log('CORS headers set for refresh token route from origin:', origin);
  } else {
    // For requests without origin (like server-to-server), use wildcard
    res.header('Access-Control-Allow-Origin', '*');
    console.log('CORS headers set for refresh token route without origin');
  }

  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

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

app.get('/integrated-appointments/queue', addCorsHeaders, (req, res) => {
  console.log('Received GET request at /integrated-appointments/queue, forwarding to controller directly');
  // Import the controller directly
  const { getTodaysQueue } = require('./controllers/integratedAppointmentController');
  // Add authentication middleware manually
  const { protect, doctorOrSecretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctorOrSecretary(req, res, () => getTodaysQueue(req, res)));
});

app.get('/integrated-appointments/queue/stats', addCorsHeaders, (req, res) => {
  console.log('Received GET request at /integrated-appointments/queue/stats, forwarding to controller directly');
  // Import the controller directly
  const { getQueueStats } = require('./controllers/integratedAppointmentController');
  // Add authentication middleware manually
  const { protect, doctorOrSecretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctorOrSecretary(req, res, () => getQueueStats(req, res)));
});

app.put('/integrated-appointments/queue/reorder', addCorsHeaders, (req, res) => {
  console.log('Received PUT request at /integrated-appointments/queue/reorder, forwarding to controller directly');
  // Import the controller directly
  const { reorderQueue } = require('./controllers/integratedAppointmentController');
  // Add authentication middleware manually
  const { protect, secretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => secretary(req, res, () => reorderQueue(req, res)));
});

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

// Content routes - Use the router instead of direct controller calls
app.use('/api/content', require('./routes/contentRoutes'));

// Fallback content route for direct API access without /api prefix
app.get('/content', (req, res) => {
  console.log('Received GET request at /content, redirecting to /api/content');
  // Set CORS headers explicitly for this route
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  // Import the controller directly
  const { getContent } = require('./controllers/contentController');
  // Call the controller function directly (public endpoint)
  getContent(req, res);
});

app.get('/content/:id', (req, res) => {
  console.log('Received GET request at /content/:id, redirecting to /api/content/:id');
  // Set CORS headers explicitly for this route
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  // Import the controller directly
  const { getContentById } = require('./controllers/contentController');
  // Call the controller function directly (public endpoint)
  getContentById(req, res);
});

app.put('/content/:id', (req, res) => {
  console.log('Received PUT request at /content/:id, forwarding to controller directly');
  // Import the controller directly
  const { updateContent } = require('./controllers/contentController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Only admins can update content
    if (req.user && req.user.role === 'admin') {
      updateContent(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as an admin');
    }
  });
});

app.delete('/content/:id', (req, res) => {
  console.log('Received DELETE request at /content/:id, forwarding to controller directly');
  // Import the controller directly
  const { deleteContent } = require('./controllers/contentController');
  // Add authentication middleware manually
  const { protect } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => {
    // Only admins can delete content
    if (req.user && req.user.role === 'admin') {
      deleteContent(req, res);
    } else {
      res.status(403);
      throw new Error('Not authorized as an admin');
    }
  });
});

// Queue routes without /api prefix
app.get('/queue', (req, res) => {
  console.log('Received GET request at /queue, forwarding to controller directly');
  // Set CORS headers explicitly for this route
  const origin = req.headers.origin;

  // Set the Vary header
  res.header('Vary', 'Origin');

  // Set allowed origin
  if (origin) {
    const allowedOrigins = ['https://urohealthltd.netlify.app', 'https://www.urohealthltd.netlify.app', 'http://localhost:3000', 'http://localhost:5173'];

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development' || process.env.ALLOW_ALL_ORIGINS === 'true') {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }

  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
  res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Import the controller directly
  const { getQueueEntries } = require('./controllers/queueController');
  // Add authentication middleware manually
  const { protect, doctorOrSecretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctorOrSecretary(req, res, () => getQueueEntries(req, res)));
});

app.post('/queue', (req, res) => {
  console.log('Received POST request at /queue, forwarding to controller directly');
  // Set CORS headers explicitly for this route
  const origin = req.headers.origin;

  // Set the Vary header
  res.header('Vary', 'Origin');

  // Set allowed origin
  if (origin) {
    const allowedOrigins = ['https://urohealthltd.netlify.app', 'https://www.urohealthltd.netlify.app', 'http://localhost:3000', 'http://localhost:5173'];

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development' || process.env.ALLOW_ALL_ORIGINS === 'true') {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }

  // Set other CORS headers
  res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));
  res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Import the controller directly
  const { addToQueue } = require('./controllers/queueController');
  // Add authentication middleware manually
  const { protect, doctorOrSecretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctorOrSecretary(req, res, () => addToQueue(req, res)));
});

app.get('/queue/stats', addCorsHeaders, (req, res) => {
  console.log('Received GET request at /queue/stats, forwarding to controller directly');
  // Import the controller directly
  const { getQueueStats } = require('./controllers/queueController');
  // Add authentication middleware manually
  const { protect, doctorOrSecretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctorOrSecretary(req, res, () => getQueueStats(req, res)));
});

app.get('/queue/next', addCorsHeaders, (req, res) => {
  console.log('Received GET request at /queue/next, forwarding to controller directly');
  // Import the controller directly
  const { getNextPatient } = require('./controllers/queueController');
  // Add authentication middleware manually
  const { protect, doctor } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctor(req, res, () => getNextPatient(req, res)));
});

app.put('/queue/reorder', addCorsHeaders, (req, res) => {
  console.log('Received PUT request at /queue/reorder, forwarding to controller directly');
  // Import the controller directly
  const { reorderQueue } = require('./controllers/queueController');
  // Add authentication middleware manually
  const { protect, secretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => secretary(req, res, () => reorderQueue(req, res)));
});

app.put('/queue/:id', addCorsHeaders, (req, res) => {
  console.log('Received PUT request at /queue/:id, forwarding to controller directly');
  // Import the controller directly
  const { updateQueueEntry } = require('./controllers/queueController');
  // Add authentication middleware manually
  const { protect, doctorOrSecretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => doctorOrSecretary(req, res, () => updateQueueEntry(req, res)));
});

app.delete('/queue/:id', addCorsHeaders, (req, res) => {
  console.log('Received DELETE request at /queue/:id, forwarding to controller directly');
  // Import the controller directly
  const { removeFromQueue } = require('./controllers/queueController');
  // Add authentication middleware manually
  const { protect, secretary } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => secretary(req, res, () => removeFromQueue(req, res)));
});

app.delete('/queue/reset', addCorsHeaders, (req, res) => {
  console.log('Received DELETE request at /queue/reset, forwarding to controller directly');
  // Import the controller directly
  const { resetQueue } = require('./controllers/queueController');
  // Add authentication middleware manually
  const { protect, admin } = require('./middleware/authMiddleware');
  // Call middleware then controller
  protect(req, res, () => admin(req, res, () => resetQueue(req, res)));
});

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Schedule queue reset at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running scheduled queue reset at midnight:', new Date().toISOString());
    // Reset the queue by calling the resetQueue endpoint
    const { resetQueue } = require('./controllers/queueController');

    // Call the resetQueue function directly without mock request/response
    const result = await resetQueue();

    if (result.success) {
      console.log('Queue reset completed successfully. Removed entries:', result.deletedCount);
    } else {
      console.error('Queue reset failed:', result.error);
    }

    // Double-check that the queue is empty
    const Queue = require('./models/queueModel');
    const count = await Queue.countDocuments({});
    console.log(`Queue entries after reset: ${count}`);

    if (count > 0) {
      console.log('Queue not fully reset. Attempting force reset...');
      await Queue.deleteMany({});
      const finalCount = await Queue.countDocuments({});
      console.log(`Queue entries after force reset: ${finalCount}`);
    }
  } catch (error) {
    console.error('Error in midnight queue reset cron job:', error);
  }
});

// Also schedule a check every hour to verify the queue reset worked
cron.schedule('5 * * * *', async () => {
  try {
    const now = new Date();
    // If it's between 00:00 and 00:10, check if the queue was reset
    if (now.getHours() === 0 && now.getMinutes() < 10) {
      console.log('Verifying midnight queue reset at:', now.toISOString());
      const Queue = require('./models/queueModel');
      const count = await Queue.countDocuments({});
      console.log(`Queue entries at verification check: ${count}`);

      // If there are still entries, force a reset
      if (count > 0) {
        console.log('Queue not properly reset at midnight. Forcing reset now...');
        await Queue.deleteMany({});
        const finalCount = await Queue.countDocuments({});
        console.log(`Queue entries after force reset: ${finalCount}`);
      }
    }
  } catch (error) {
    console.error('Error in queue reset verification job:', error);
  }
});
