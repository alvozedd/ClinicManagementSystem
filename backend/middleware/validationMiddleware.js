/**
 * Middleware for validating request data
 * This provides a centralized way to validate inputs before they reach controllers
 */

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate phone number format
const isValidPhone = (phone) => {
  // Allow digits, spaces, dashes, parentheses, and plus sign
  const phoneRegex = /^[0-9\s\-\(\)\+]+$/;
  return phoneRegex.test(phone);
};

// Helper function to sanitize string input
const sanitizeString = (str) => {
  if (!str) return '';
  // Remove any potentially dangerous characters
  return String(str).replace(/[<>]/g, '');
};

// Validation middleware for user registration
const validateUserRegistration = (req, res, next) => {
  const { name, username, email, password, role } = req.body;
  const errors = [];

  // Validate name
  if (!name || name.trim() === '') {
    errors.push('Name is required');
  } else if (name.length < 2 || name.length > 50) {
    errors.push('Name must be between 2 and 50 characters');
  }

  // Validate username
  if (!username || username.trim() === '') {
    errors.push('Username is required');
  } else if (username.length < 3 || username.length > 30) {
    errors.push('Username must be between 3 and 30 characters');
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  // Validate email
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Invalid email format');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }

  // Validate role
  if (!role) {
    errors.push('Role is required');
  } else if (!['admin', 'doctor', 'secretary'].includes(role)) {
    errors.push('Role must be admin, doctor, or secretary');
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Sanitize inputs
  req.body.name = sanitizeString(name);
  req.body.username = sanitizeString(username);
  req.body.email = sanitizeString(email);

  next();
};

// Validation middleware for user login
const validateUserLogin = (req, res, next) => {
  const { username, password } = req.body;
  const errors = [];

  // Validate username/email
  if (!username || username.trim() === '') {
    errors.push('Username or email is required');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Sanitize inputs
  req.body.username = sanitizeString(username);

  next();
};

// Validation middleware for patient creation
const validatePatientCreation = (req, res, next) => {
  const {
    name,
    gender,
    phone,
    year_of_birth,
    next_of_kin_name,
    next_of_kin_relationship,
    next_of_kin_phone,
  } = req.body;
  
  const errors = [];

  // Validate name
  if (!name || name.trim() === '') {
    errors.push('Name is required');
  } else if (name.length < 2 || name.length > 100) {
    errors.push('Name must be between 2 and 100 characters');
  }

  // Validate gender
  if (!gender || gender.trim() === '') {
    errors.push('Gender is required');
  } else if (!['Male', 'Female', 'Other'].includes(gender)) {
    errors.push('Gender must be Male, Female, or Other');
  }

  // Validate phone
  if (!phone || phone.trim() === '') {
    errors.push('Phone number is required');
  } else if (!isValidPhone(phone)) {
    errors.push('Invalid phone number format');
  }

  // Validate year of birth if provided
  if (year_of_birth) {
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year_of_birth);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
      errors.push(`Year of birth must be between 1900 and ${currentYear}`);
    }
  }

  // Validate next of kin name
  if (!next_of_kin_name || next_of_kin_name.trim() === '') {
    errors.push('Next of kin name is required');
  }

  // Validate next of kin relationship
  if (!next_of_kin_relationship || next_of_kin_relationship.trim() === '') {
    errors.push('Next of kin relationship is required');
  }

  // Validate next of kin phone
  if (!next_of_kin_phone || next_of_kin_phone.trim() === '') {
    errors.push('Next of kin phone is required');
  } else if (!isValidPhone(next_of_kin_phone)) {
    errors.push('Invalid next of kin phone number format');
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Sanitize inputs
  req.body.name = sanitizeString(name);
  req.body.gender = sanitizeString(gender);
  req.body.phone = sanitizeString(phone);
  req.body.next_of_kin_name = sanitizeString(next_of_kin_name);
  req.body.next_of_kin_relationship = sanitizeString(next_of_kin_relationship);
  req.body.next_of_kin_phone = sanitizeString(next_of_kin_phone);

  next();
};

// Validation middleware for appointment creation
const validateAppointmentCreation = (req, res, next) => {
  const { patient_id, appointment_date, optional_time, notes, status, type, reason } = req.body;
  const errors = [];

  // Validate patient_id
  if (!patient_id) {
    errors.push('Patient ID is required');
  } else if (!patient_id.match(/^[0-9a-fA-F]{24}$/)) {
    errors.push('Invalid patient ID format');
  }

  // Validate appointment_date
  if (!appointment_date) {
    errors.push('Appointment date is required');
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(appointment_date)) {
      errors.push('Appointment date must be in YYYY-MM-DD format');
    } else {
      const date = new Date(appointment_date);
      if (isNaN(date.getTime())) {
        errors.push('Invalid appointment date');
      }
    }
  }

  // Validate optional_time if provided
  if (optional_time) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(optional_time)) {
      errors.push('Optional time must be in HH:MM format (24-hour)');
    }
  }

  // Validate status if provided
  if (status && !['Scheduled', 'Completed', 'Cancelled', 'No-show'].includes(status)) {
    errors.push('Status must be Scheduled, Completed, Cancelled, or No-show');
  }

  // Validate type if provided
  if (type && !['Consultation', 'Follow-up', 'Procedure', 'Test'].includes(type)) {
    errors.push('Type must be Consultation, Follow-up, Procedure, or Test');
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Sanitize inputs
  if (notes) req.body.notes = sanitizeString(notes);
  if (reason) req.body.reason = sanitizeString(reason);

  next();
};

// Validation middleware for diagnosis creation
const validateDiagnosisCreation = (req, res, next) => {
  const { appointment_id, diagnosis_text } = req.body;
  const errors = [];

  // Validate appointment_id
  if (!appointment_id) {
    errors.push('Appointment ID is required');
  } else if (!appointment_id.match(/^[0-9a-fA-F]{24}$/)) {
    errors.push('Invalid appointment ID format');
  }

  // Validate diagnosis_text
  if (!diagnosis_text || diagnosis_text.trim() === '') {
    errors.push('Diagnosis text is required');
  } else if (diagnosis_text.length > 2000) {
    errors.push('Diagnosis text must be less than 2000 characters');
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Sanitize inputs
  req.body.diagnosis_text = sanitizeString(diagnosis_text);

  next();
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePatientCreation,
  validateAppointmentCreation,
  validateDiagnosisCreation,
};
