/**
 * Utility to check and validate required environment variables
 */

const checkRequiredEnvVars = () => {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missingVars = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.warn(`WARNING: Missing required environment variables: ${missingVars.join(', ')}`);
    console.warn('The application may not function correctly without these variables.');
    
    // Log the current environment for debugging
    console.log('Current environment:');
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`PORT: ${process.env.PORT}`);
    
    // Don't log sensitive variables, just their existence
    console.log(`MONGODB_URI set: ${!!process.env.MONGODB_URI}`);
    console.log(`JWT_SECRET set: ${!!process.env.JWT_SECRET}`);
  } else {
    console.log('All required environment variables are set.');
  }
};

module.exports = { checkRequiredEnvVars };
