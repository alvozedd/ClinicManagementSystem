# UroHealth Local Testing Checklist

Use this checklist to verify that all core functionality works correctly after removing unnecessary files.

## Setup

1. Start the local development environment:
   ```
   ./start-local-dev.sh
   ```
2. Open your browser and navigate to: http://localhost:5173

## Authentication Tests

- [ ] **Login Page Loads**
  - Navigate to http://localhost:5173/login
  - Verify the login form is displayed correctly

- [ ] **Login with Admin Credentials**
  - Username: admin@urohealth.com
  - Password: admin123
  - Should redirect to admin dashboard

- [ ] **Login with Doctor Credentials**
  - Username: mbugua_pm
  - Password: doctor123
  - Should redirect to doctor dashboard

- [ ] **Login with Secretary Credentials**
  - Username: secretary@urohealth.com
  - Password: secretary123
  - Should redirect to secretary dashboard

- [ ] **Logout Functionality**
  - Click the logout button
  - Should redirect to homepage
  - Should not be able to access dashboard without logging in again

## Admin Dashboard Tests

- [ ] **Dashboard Loads**
  - After login, verify admin dashboard loads correctly
  - Sidebar navigation should be visible
  - User management section should be visible

- [ ] **User Management**
  - View list of users
  - Try to add a new user
  - Try to edit an existing user
  - Try to delete a user

- [ ] **Content Management**
  - View website content
  - Try to edit content
  - Verify changes appear on the website

## Doctor Dashboard Tests

- [ ] **Dashboard Loads**
  - After login, verify doctor dashboard loads correctly
  - Sidebar navigation should be visible
  - Patient management section should be visible

- [ ] **Patient Management**
  - View list of patients
  - Search for a patient
  - View patient details
  - Add a new patient
  - Edit patient information
  - Delete a patient

- [ ] **Appointment Management**
  - View list of appointments
  - Filter appointments by status
  - Add a new appointment
  - Edit an appointment
  - Delete an appointment

- [ ] **Notes Management**
  - View list of notes
  - Add a new note
  - Edit a note
  - Delete a note

## Secretary Dashboard Tests

- [ ] **Dashboard Loads**
  - After login, verify secretary dashboard loads correctly
  - Sidebar navigation should be visible
  - Patient management section should be visible

- [ ] **Patient Management**
  - View list of patients
  - Search for a patient
  - View patient details (limited)
  - Add a new patient
  - Edit patient information
  - Verify cannot delete patients

- [ ] **Appointment Management**
  - View list of appointments
  - Filter appointments by status
  - Add a new appointment
  - Edit an appointment
  - Delete an appointment

## Homepage Tests

- [ ] **Homepage Loads**
  - Navigate to http://localhost:5173
  - Verify the homepage loads correctly
  - All sections should be visible

- [ ] **Navigation**
  - Click on navigation links
  - Should navigate to correct sections

- [ ] **Contact Form**
  - Fill out the contact form
  - Submit the form
  - Should show success message

## Responsive Design Tests

- [ ] **Desktop View**
  - Test all pages on desktop resolution
  - All elements should be properly aligned

- [ ] **Tablet View**
  - Resize browser to tablet dimensions
  - Layout should adjust accordingly
  - All functionality should work

- [ ] **Mobile View**
  - Resize browser to mobile dimensions
  - Layout should adjust accordingly
  - Mobile menu should work
  - All functionality should work

## Performance Tests

- [ ] **Page Load Time**
  - All pages should load quickly
  - No visible lag when navigating

- [ ] **API Response Time**
  - Actions like fetching patients or appointments should be quick
  - No long waiting times for data

## Issues Found

Document any issues found during testing:

1.
2.
3.

## Next Steps

After completing local testing:

1. Fix any issues found
2. Deploy to production
3. Test in production environment
