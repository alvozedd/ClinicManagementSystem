FROM node:18-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
WORKDIR /app/backend
RUN npm install

# Expose the port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
