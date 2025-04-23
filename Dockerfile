FROM node:18-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
WORKDIR /app/backend
RUN npm install

# Expose the port
EXPOSE 5000

# Set environment variables
ENV MONGODB_URI=mongodb+srv://clinic_admin:adminMuchai123@cluster0.jrm4jes.mongodb.net/clinic_management?retryWrites=true&w=majority
ENV JWT_SECRET=UroHealthSecureJWTSecret2024
ENV PORT=5000

# Create a startup script
RUN echo '#!/bin/sh\nnode seedProduction.js\nnode server.js' > /app/backend/start.sh
RUN chmod +x /app/backend/start.sh

# Start the application
CMD ["/app/backend/start.sh"]
