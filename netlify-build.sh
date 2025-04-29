#!/bin/bash
echo "Starting Netlify build process..."

# Navigate to frontend directory
cd frontend

# Clean up node_modules and package-lock.json
echo "Cleaning up previous installation..."
rm -rf node_modules
rm -f package-lock.json

# Create .npmrc file
echo "Creating .npmrc file..."
echo "legacy-peer-deps=true" > .npmrc
echo "strict-peer-dependencies=false" >> .npmrc

# Install dependencies
echo "Installing dependencies..."
npm install --no-package-lock

# Build the project
echo "Building the project..."
npm run build

echo "Build process completed!"
