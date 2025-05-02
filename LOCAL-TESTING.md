# UroHealth Clinic Management System - Local Testing Guide

This guide provides instructions for setting up and testing the UroHealth Clinic Management System locally.

## Prerequisites

- Node.js (v18.x recommended)
- npm (v9.x or higher)
- MongoDB Atlas account (or local MongoDB instance)
- Git

## Setup Instructions

1. **Clone the repository**
   ```
   git clone https://github.com/alvozedd/ClinicManagementSystem.git
   cd ClinicManagementSystem
   ```

2. **Install dependencies**
   ```
   npm install
   cd frontend && npm install
   cd ..
   ```

3. **Configure environment variables**

   The backend `.env` file should contain:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

   The frontend `.env.development` file should contain:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Test database connection**
   ```
   npm run test:db
   ```

5. **Start the development servers**
   ```
   npm run dev
   ```
   This will start both the backend server on port 5000 and the frontend server on port 5173.

## Testing the Application

### Automated Tests

1. **Test database connection**
   ```
   npm run test:db
   ```

2. **Test API endpoints**
   ```
   npm run test:api
   ```

### Manual Testing

Use the `local-test-checklist.md` file to perform manual testing of all features:

1. Open the checklist:
   ```
   cat local-test-checklist.md
   ```

2. Follow the instructions to test each feature.

3. Mark each item as completed or note any issues found.

### Test User Credentials

Use these credentials to test different user roles:

| Role      | Username                | Password   |
|-----------|-------------------------|------------|
| Admin     | admin@urohealth.com     | admin123   |
| Doctor    | mbugua_pm               | doctor123  |
| Secretary | secretary@urohealth.com | secretary123 |

## Troubleshooting

### Backend Issues

- **Database Connection Errors**
  - Verify your MongoDB connection string in `backend/.env`
  - Ensure your IP address is whitelisted in MongoDB Atlas
  - Check that MongoDB service is running if using a local instance

- **Port Already in Use**
  - If port 5000 is already in use, change the PORT in `backend/.env`
  - Update the frontend API URL in `frontend/.env.development` accordingly

### Frontend Issues

- **API Connection Errors**
  - Verify the backend server is running
  - Check that `VITE_API_URL` in `frontend/.env.development` points to the correct backend URL
  - Look for CORS errors in the browser console

- **Build Errors**
  - Clear the node_modules folder and reinstall dependencies
  - Check for any version conflicts in package.json

## Next Steps

After successful local testing:

1. Fix any issues found during testing
2. Deploy the application to production
3. Test the production deployment

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite Documentation](https://vitejs.dev/guide/)
