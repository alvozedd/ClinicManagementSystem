# UroHealth Clinic Management System Deployment Guide

This guide will walk you through deploying the UroHealth Clinic Management System to Railway (backend) and Netlify (frontend).

## Prerequisites

- GitHub account (for pushing code)
- Railway account
- Netlify account
- MongoDB Atlas account (for database)

## Step 1: Push Your Code to GitHub

Before deploying, make sure all your changes are committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare for secure deployment"
git push origin main
```

## Step 2: Deploy Backend to Railway

### 2.1 Log in to Railway

1. Go to [Railway.app](https://railway.app/)
2. Log in with your account

### 2.2 Create a New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Select the branch you want to deploy (usually `main`)

### 2.3 Configure Environment Variables

1. After creating the project, click on your new project
2. Click on the "Variables" tab
3. Add the following environment variables:

```
MONGODB_URI=mongodb+srv://your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
PORT=5000
NODE_ENV=production
ADMIN_PASSWORD=Admin@UroHealth2024!
DOCTOR_PASSWORD=Doctor@UroHealth2024!
SECRETARY_PASSWORD=Secretary@UroHealth2024!
```

Replace `your_mongodb_connection_string` with your actual MongoDB connection string.
Replace `your_secure_jwt_secret` with a strong random string.

### 2.4 Verify Deployment

1. Wait for the deployment to complete
2. Click on the "Deployments" tab to see the deployment status
3. Once deployed, click on the domain URL to open your API
4. Try accessing the health endpoint: `https://your-railway-domain.up.railway.app/api/health`

## Step 3: Deploy Frontend to Netlify

### 3.1 Log in to Netlify

1. Go to [Netlify.com](https://www.netlify.com/)
2. Log in with your account

### 3.2 Create a New Site

1. Click "Add new site" → "Import an existing project"
2. Choose "Deploy with GitHub"
3. Select your repository
4. Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

### 3.3 Configure Environment Variables

1. After deployment starts, go to "Site settings" → "Environment variables"
2. Add the following environment variable:
   ```
   VITE_API_URL=https://your-railway-domain.up.railway.app/api
   ```
   Replace `your-railway-domain.up.railway.app` with your actual Railway domain.
3. Click "Save"
4. Go to "Deploys" and click "Trigger deploy" → "Clear cache and deploy site"

### 3.4 Set Up a Custom Domain (Optional)

1. Go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Enter your domain name and follow the instructions

## Step 4: Verify Full Deployment

1. Open your Netlify URL in a browser
2. Try logging in with the following credentials:
   - Username: `admin@urohealth.com`
   - Password: `Admin@UroHealth2024!`
3. Test the main functionality to ensure everything works

## Step 5: Security Verification

1. Check that HTTPS is working (padlock icon in browser)
2. Verify security headers are working:
   - Visit [securityheaders.com](https://securityheaders.com/)
   - Enter your frontend URL and click "Scan"
   - You should get an A or A+ rating
3. Test authentication and authorization:
   - Try accessing protected routes without logging in
   - Log in as different user roles to verify permissions

## Troubleshooting

### Backend Issues

1. **Deployment Fails**: Check the Railway logs for errors
2. **Database Connection Issues**: Verify your MongoDB connection string and make sure your IP is whitelisted
3. **CORS Errors**: Check the CORS configuration in `backend/server.js`

### Frontend Issues

1. **Build Fails**: Check the Netlify build logs for errors
2. **API Connection Issues**: Verify the `VITE_API_URL` environment variable is set correctly
3. **Login Issues**: Check the browser console for errors

## Maintenance

1. **Monitor Logs**:
   - Railway: Go to your service → "Logs" tab
   - Netlify: Go to "Deploys" → click on a deploy → "Deploy log"

2. **Update Dependencies**:
   - Regularly update your dependencies to patch security vulnerabilities
   - Run `npm audit` locally before deploying updates

3. **Backup Database**:
   - Set up regular backups of your MongoDB database
   - For MongoDB Atlas, enable automated backups

## Security Best Practices

1. **Rotate Secrets Regularly**:
   - Change the JWT_SECRET periodically
   - Update user passwords regularly

2. **Monitor for Suspicious Activity**:
   - Check logs for unusual patterns
   - Set up alerts for failed login attempts

3. **Keep Dependencies Updated**:
   - Run `npm audit` regularly
   - Update packages with security vulnerabilities

4. **Regular Security Scans**:
   - Use tools like OWASP ZAP to scan your application
   - Check for new vulnerabilities in your tech stack
