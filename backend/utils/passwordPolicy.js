/**
 * Password policy utility for enforcing strong passwords
 */

// Password requirements
const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_REQUIRE_UPPERCASE = true;
const PASSWORD_REQUIRE_LOWERCASE = true;
const PASSWORD_REQUIRE_NUMBER = true;
const PASSWORD_REQUIRE_SPECIAL = true;
const PASSWORD_DISALLOW_COMMON = true;

// List of common passwords to disallow
const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '12345678', 'qwerty', 'admin', 
  'welcome', 'admin123', 'letmein', 'monkey', 'login', 'abc123',
  'football', 'iloveyou', 'master', 'sunshine', 'ashley', 'bailey',
  'passw0rd', 'shadow', 'superman', 'qazwsx', 'trustno1', 'dragon'
];

/**
 * Validate a password against the password policy
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and errors
 */
const validatePassword = (password) => {
  const errors = [];

  // Check password length
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  }

  // Check for uppercase letters
  if (PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letters
  if (PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (PASSWORD_REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (PASSWORD_REQUIRE_SPECIAL && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common passwords
  if (PASSWORD_DISALLOW_COMMON && COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common and easily guessable');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate a password strength score (0-100)
 * @param {string} password - Password to evaluate
 * @returns {number} - Password strength score (0-100)
 */
const getPasswordStrength = (password) => {
  let score = 0;

  // Base score from length (up to 40 points)
  score += Math.min(40, password.length * 4);

  // Bonus for character variety (up to 60 points)
  if (/[A-Z]/.test(password)) score += 10; // Uppercase
  if (/[a-z]/.test(password)) score += 10; // Lowercase
  if (/[0-9]/.test(password)) score += 10; // Numbers
  if (/[^A-Za-z0-9]/.test(password)) score += 15; // Special chars
  
  // Bonus for mixed character types (up to 15 points)
  const charTypes = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(regex => regex.test(password)).length;
  score += (charTypes - 1) * 5;

  // Penalty for common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    score = Math.min(score, 30); // Cap score at 30 for common passwords
  }

  return Math.min(100, score);
};

module.exports = {
  validatePassword,
  getPasswordStrength,
  PASSWORD_MIN_LENGTH,
};
