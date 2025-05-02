#!/bin/bash

# Start local development environment for UroHealth Clinic Management System

echo "Starting UroHealth Clinic Management System in development mode..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js to continue."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm to continue."
    exit 1
fi

# Function to check if a port is in use
is_port_in_use() {
    if command -v lsof &> /dev/null; then
        lsof -i:"$1" &> /dev/null
        return $?
    elif command -v netstat &> /dev/null; then
        netstat -tuln | grep -q ":$1 "
        return $?
    else
        echo "Warning: Cannot check if port $1 is in use. Please ensure it's available."
        return 1
    fi
}

# Check if ports are available
if is_port_in_use 5000; then
    echo "Error: Port 5000 is already in use. Please free up this port for the backend server."
    exit 1
fi

if is_port_in_use 5173; then
    echo "Error: Port 5173 is already in use. Please free up this port for the frontend server."
    exit 1
fi

# Create a new terminal for backend
start_backend() {
    echo "Starting backend server on port 5000..."
    cd backend
    npm install
    npm start
}

# Create a new terminal for frontend
start_frontend() {
    echo "Starting frontend server on port 5173..."
    cd frontend
    npm install
    npm run dev
}

# Start backend in background
start_backend &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 5

# Start frontend in background
start_frontend &
FRONTEND_PID=$!

echo "Both servers are starting..."
echo "Backend server will be available at: http://localhost:5000"
echo "Frontend server will be available at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Handle script termination
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Servers stopped.'; exit 0" INT TERM

# Keep script running
wait
