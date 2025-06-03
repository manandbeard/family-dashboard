
#!/bin/bash

# Family Dashboard Raspberry Pi Startup Script
# Make this file executable: chmod +x pi-startup.sh

echo "Starting Family Dashboard on Raspberry Pi..."

# Set environment for production
export NODE_ENV=production

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the application
echo "Building application..."
npm run build

# Start the application
echo "Starting Family Dashboard on port 5000..."
npm start

# Keep the script running
wait
