FROM node:18-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
WORKDIR /app/backend
RUN npm install

# Expose the port
EXPOSE 5000

# Define build arguments with defaults (these should be overridden at build time)
ARG PORT=5000
ARG NODE_ENV=production

# Set environment variables (sensitive values should be provided at runtime)
ENV PORT=$PORT
ENV NODE_ENV=$NODE_ENV
# Note: MONGODB_URI and JWT_SECRET should be provided at runtime
# Do not hardcode sensitive credentials here

# Start the application
CMD ["sh", "-c", "node seedProduction.js && node server.js"]
