# Clinic Management System

A simple clinic booking and patient management system for UroHealth Central Ltd.

## Features

- Patient management
- Appointment scheduling
- Diagnosis records
- Role-based access control (Admin, Doctor, Secretary)
- Public booking form for patients

## Tech Stack

- MongoDB Atlas (cloud database)
- Express.js (backend)
- React (frontend)
- Node.js (runtime)
- Railway (backend hosting)
- Vercel (frontend hosting)

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
- `DELETE /api/patients/:id` - Delete patient (Doctor/Secretary)

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

## Deployment

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster (free tier M0 is sufficient)
3. Set up database access:
   - Create a database user with a secure password
   - Note: Use a different password than the one used for development
4. Configure network access:
   - For development: Allow access from anywhere (0.0.0.0/0)
   - For production: Restrict to your deployment platform's IP addresses
5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string and replace `<password>` with your database user's password

### Backend and Frontend Deployment on Render

1. Sign up for [Render](https://render.com/) using GitHub
2. Create a new "Blueprint" project:
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file
   - This will set up both the backend and frontend services
3. Set the following environment variables for the backend service:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string (use a generator like [randomkeygen.com](https://randomkeygen.com/))
4. Deploy the services

### Seeding the Production Database

After deployment, you'll need to seed the database with initial users:

1. Modify the `backend/utils/seeder.js` file to use more secure passwords
2. Connect to your production database using the MongoDB Atlas connection string
3. Run the seeder script once to create initial admin, doctor, and secretary users

## Alternative Hosting Options

### Backend Alternatives

- **Render**: Similar to Railway with a generous free tier
- **Fly.io**: Good for global deployments with a free tier
- **Heroku**: Paid option with excellent developer experience

### Frontend Alternatives

- **Netlify**: Similar to Vercel with automatic deployments
- **GitHub Pages**: Free static site hosting (requires additional configuration)
- **Firebase Hosting**: Google's hosting service with a generous free tier

### Database Alternatives

- **Supabase**: PostgreSQL database with a generous free tier
- **Firebase Firestore**: NoSQL database with real-time capabilities
- **PlanetScale**: MySQL-compatible serverless database

## Future Improvements

- Add more comprehensive form validation
- Implement appointment time slots
- Add email notifications
- Enhance UI/UX
- Add patient search functionality
- Implement pagination for large datasets
