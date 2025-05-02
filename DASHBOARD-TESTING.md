# UroHealth Dashboard Testing Guide

This guide provides instructions for testing the UroHealth Clinic Management System dashboards to ensure they are properly connected to the backend and functioning correctly.

## Prerequisites

- Backend server running
- Frontend development server running
- MongoDB database accessible

## Testing Tools

We've created several testing tools to help verify the functionality of the dashboards:

1. **dashboard-test.html** - A simple HTML page with UI for testing database connection, user authentication, and accessing dashboards
2. **test-dashboard-functionality.js** - JavaScript functions for testing backend connectivity and authentication
3. **verify-dashboard-components.js** - JavaScript functions for verifying dashboard components are properly loaded

## Testing Process

### Step 1: Test Database Connection and Authentication

1. Open the `dashboard-test.html` file in your browser
2. Click "Test Database Connection" to verify the backend is connected to the database
3. Click "Get Test Users" to retrieve test user credentials from the backend
4. Use the login form to test authentication with different user roles:
   - Admin: username `admin`, password `admin123`
   - Doctor: username `doctor`, password `doctor123`
   - Secretary: username `secretary`, password `secretary123`
5. Click "Run All Tests" to perform all tests at once

### Step 2: Access the Dashboards

After verifying connectivity and authentication, use the links in the "Dashboard Links" section to access each dashboard:

- Admin Dashboard: `/dashboard/admin`
- Doctor Dashboard: `/dashboard/doctor`
- Secretary Dashboard: `/dashboard/secretary`

### Step 3: Verify Dashboard Components

Once you're on a dashboard page, open the browser console and run the verification script:

```javascript
// Load the verification script
const script = document.createElement('script');
script.src = '/verify-dashboard-components.js';
document.head.appendChild(script);

// Wait for script to load, then run verification
setTimeout(() => {
  window.dashboardVerification.verifyAllComponents();
}, 1000);
```

This will check that all required dashboard components are present and functioning.

## Manual Testing Checklist

In addition to the automated tests, perform these manual checks:

### Admin Dashboard
- [ ] User management displays list of users
- [ ] Can add a new user
- [ ] Can edit an existing user
- [ ] Can delete a user
- [ ] Content management displays website content
- [ ] Can edit website content

### Doctor Dashboard
- [ ] Patient management displays list of patients
- [ ] Can view patient details
- [ ] Can add a new patient
- [ ] Can edit patient information
- [ ] Can delete a patient
- [ ] Appointment management displays appointments
- [ ] Can add a new appointment
- [ ] Can edit an appointment
- [ ] Can delete an appointment
- [ ] Notes management displays patient notes
- [ ] Can add a new note
- [ ] Can edit a note
- [ ] Can delete a note

### Secretary Dashboard
- [ ] Patient management displays list of patients
- [ ] Can view limited patient details
- [ ] Can add a new patient
- [ ] Can edit patient information
- [ ] Cannot delete a patient
- [ ] Appointment management displays appointments
- [ ] Can add a new appointment
- [ ] Can edit an appointment
- [ ] Can delete an appointment

## Troubleshooting

If you encounter issues during testing:

1. **Database Connection Failures**
   - Verify MongoDB is running
   - Check backend server logs for connection errors
   - Ensure environment variables are properly configured

2. **Authentication Failures**
   - Check that the user exists in the database
   - Verify the password is correct
   - Check backend logs for authentication errors

3. **Dashboard Component Issues**
   - Check browser console for JavaScript errors
   - Verify all required components are imported
   - Check network requests for API failures

## Next Steps

After successfully testing the dashboards:

1. Deploy the updated code to the production environment
2. Perform the same tests in the production environment
3. Monitor for any issues after deployment
