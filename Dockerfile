FROM node:18-alpine

WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN cd backend && npm install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 5000

# Start the application
CMD ["node", "backend/server.js"]
