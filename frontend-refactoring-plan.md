# Frontend Refactoring Plan

## Directory Structure
1. Remove the old `frontend/` directory
2. Rename `new-frontend/` to `frontend/`

## Component Consolidation
1. Keep only one implementation of each dashboard:
   - `SimplifiedDoctorDashboard.jsx` for doctors
   - `SimplifiedSecretaryDashboard.jsx` for secretaries
   - `AdminDashboard.jsx` for admins

2. Remove duplicate components:
   - Remove `new-frontend/src/AdminDashboard.jsx` (keep only the one in components/)
   - Refactor `Dashboard.jsx` to be a simple router to the role-specific dashboards

## UI Improvements
1. Fix the login form to prevent page refresh issues (completed)
2. Simplify the patient management interface:
   - Reduce the number of tabs
   - Make the UI elements larger and easier to navigate
   - Improve the calendar view

## Data Management
1. Update the mock data to be more realistic
2. Ensure all components use the same data format
3. Implement proper error handling

## Authentication
1. Improve the authentication flow
2. Add proper token validation
3. Implement role-based access control

## Performance Optimization
1. Reduce unnecessary re-renders
2. Optimize large component trees
3. Implement code splitting for better load times
