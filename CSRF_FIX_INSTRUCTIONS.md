# CSRF Middleware Fix Instructions

## The Issue

The error you're seeing is caused by a problem in the CSRF middleware:

```
TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError
```

This occurs because the `provideCsrfToken` middleware is trying to call `req.csrfToken()` even on routes that are exempt from CSRF protection, where the function doesn't exist.

## The Fix

We need to modify two middleware functions in the `csrfMiddleware.js` file:

1. **provideCsrfToken**: Add a check to ensure the csrfToken function exists before calling it
2. **exemptCsrf**: Improve route matching and add error handling

## How to Apply the Fix

### Option 1: Direct Edit in Railway

1. Log in to your Railway dashboard
2. Go to your project
3. Click on the "Files" tab
4. Navigate to `backend/middleware/csrfMiddleware.js`
5. Replace the content with the fixed version from `fix_csrf_middleware.sh`
6. Save the changes and redeploy

### Option 2: Local Fix and Deploy

1. Make the changes to `backend/middleware/csrfMiddleware.js` locally
2. Test locally to ensure it works
3. Deploy to Railway using the Railway CLI

## Environment Variables

Ensure these environment variables are set in your Railway project:

```
MONGODB_URI=mongodb+srv://clinic_admin:adminMuchai123@cluster0.jrm4jes.mongodb.net/clinic_management?retryWrites=true&w=majority
JWT_SECRET=b8df259dfa44c3db20384347e8968581097e98324d253c1cb6f56cb9985ce1918665ac109f968389ae70c58de4e6e5548bcb9c6b6234c385a35f2ce2ca73c3ea
PORT=5000
NODE_ENV=production
```

## Security Note

Remember to rotate your MongoDB credentials and JWT secret periodically for security. The values above should be considered temporary and should be changed after your application is working correctly.
