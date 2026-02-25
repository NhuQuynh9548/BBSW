#!/bin/bash

# Deploy script for production
# Usage: ./deploy.sh

set -e

echo "=== BlueBolt Finance Platform - Production Deployment ==="

# Navigate to prod directory
cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it."
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

# Load environment variables
source .env

# Validate required variables
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" == "YOUR_SECURE_JWT_SECRET_HERE_MIN_32_CHARS" ]; then
    echo "Error: Please set a secure JWT_SECRET in .env"
    exit 1
fi

echo "Building and starting containers..."
docker compose down 2>/dev/null || true
docker compose up -d --build

echo "Waiting for services to be healthy..."
sleep 10

# Check container status
echo "Container status:"
docker compose ps

echo ""
echo "=== Deployment Complete ==="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5001/api"
echo ""
echo "View logs with: docker compose logs -f"
