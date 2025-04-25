#!/bin/bash

# UroHealth Clinic Management System Deployment Script
echo "UroHealth Clinic Management System Deployment Script"
echo "==================================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install git and try again."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo "Not in a git repository. Please run this script from your project directory."
    exit 1
fi

# Add all changes
echo "Adding all changes to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Prepare for secure deployment with HIPAA compliance"

# Push to GitHub
echo "Pushing changes to GitHub..."
git push origin main

echo "Changes pushed to GitHub successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Railway using the instructions in DEPLOYMENT_GUIDE.md"
echo "2. Deploy frontend to Netlify using the instructions in DEPLOYMENT_GUIDE.md"
echo ""
echo "For detailed instructions, please refer to DEPLOYMENT_GUIDE.md"
