#!/bin/bash
# Setup script for AI Meeting project

echo "=== AI Meeting Setup Script ==="
echo ""

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Install functions dependencies
echo "Installing functions dependencies..."
cd functions
npm install
cd ..

# Build the project
echo "Building the project..."
npm run build

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Follow DEPLOYMENT.md for deployment instructions"
echo "2. Make sure you have your Gemini API key ready"
echo ""
