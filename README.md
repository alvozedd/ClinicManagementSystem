# Clinic Management System

A simple clinic booking and patient management system for UroHealth Central Ltd.

## Features

- Patient management
- Appointment scheduling
- Diagnosis records
- Role-based access control (Admin, Doctor, Secretary)
- Public booking form for patients

## Tech Stack

- MongoDB (local database)
- Express.js (backend)
- React (frontend)
- Node.js (runtime)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ClinicManagement
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Set up environment variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clinic_management
JWT_SECRET=your_jwt_secret_key_here
```

## Running the Application

### 1. Start MongoDB locally

Make sure MongoDB is running on your local machine.

### 2. Seed the database with initial data

```bash
cd backend
node utils/seeder.js
```

This will create the following users:
- Admin: admin@urohealth.com / admin123
- Doctor: doctor@urohealth.com / doctor123
- Secretary: secretary@urohealth.com / secretary123

### 3. Start the backend server

```bash
cd backend
npm run dev
```

### 4. Start the frontend development server

```bash
cd frontend
npm run dev
```

The application should now be running at http://localhost:5173

## API Endpoints

### Users
- `POST /api/users/login` - User login
- `POST /api/users` - Register a new user (Admin only)
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Patients
- `POST /api/patients` - Create a new patient (Secretary only)
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient (Secretary only)
- `DELETE /api/patients/:id` - Delete patient (Admin only)

### Appointments
- `POST /api/appointments` - Create a new appointment (Secretary only)
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/patient/:id` - Get appointments by patient ID
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id` - Update appointment (Secretary only)
- `DELETE /api/appointments/:id` - Delete appointment (Secretary only)

### Diagnoses
- `POST /api/diagnoses` - Create a new diagnosis (Doctor only)
- `GET /api/diagnoses` - Get all diagnoses (Doctor only)
- `GET /api/diagnoses/appointment/:id` - Get diagnosis by appointment ID (Doctor only)
- `GET /api/diagnoses/:id` - Get diagnosis by ID (Doctor only)
- `PUT /api/diagnoses/:id` - Update diagnosis (Doctor only)
- `DELETE /api/diagnoses/:id` - Delete diagnosis (Doctor only)

## Future Improvements

- Add more comprehensive form validation
- Implement appointment time slots
- Add email notifications
- Enhance UI/UX
- Add patient search functionality
- Implement pagination for large datasets
