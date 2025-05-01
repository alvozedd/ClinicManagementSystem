#!/bin/bash

# Script to update the Railway deployment with the latest changes

echo "=== UPDATING RAILWAY DEPLOYMENT ==="
echo "This script will push the latest changes to the Railway deployment."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed. Please install git and try again."
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Error: This script must be run from the root directory of the project."
    exit 1
fi

# Make sure we have the latest changes
echo -e "\n--- Pulling latest changes from GitHub ---"
git pull

# Check if there are any changes to commit
if [ -n "$(git status --porcelain)" ]; then
    echo -e "\n--- Committing changes ---"
    git add .
    git commit -m "Update backend for Railway deployment"
    
    echo -e "\n--- Pushing changes to GitHub ---"
    git push
else
    echo -e "\n--- No changes to commit ---"
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "\n--- Railway CLI not found, installing... ---"
    npm i -g @railway/cli
fi

# Login to Railway (if needed)
echo -e "\n--- Logging in to Railway ---"
railway login

# Deploy to Railway
echo -e "\n--- Deploying to Railway ---"
railway up

echo -e "\n=== DEPLOYMENT COMPLETE ==="
echo "Your changes have been deployed to Railway."
echo "Visit https://clinicmanagementsystem-production-081b.up.railway.app/ to see your changes."
