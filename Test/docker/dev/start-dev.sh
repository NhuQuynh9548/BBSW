#!/bin/bash

# Development startup script
# Usage: ./start-dev.sh

set -e

echo "=== BlueBolt Finance Platform - Development Environment ==="

# Navigate to dev directory
cd "$(dirname "$0")"

# Check if .env exists, create from example if not
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "Starting development containers..."
docker compose up -d --build

echo "Waiting for database to be ready..."
sleep 5

# Run migrations
echo "Running database migrations..."
docker compose exec -T backend npx prisma migrate dev --skip-generate 2>/dev/null || \
    docker compose exec -T backend npx prisma db push

echo ""
echo "=== Development Environment Ready ==="
echo "Frontend (Vite): http://localhost:4000"
echo "Backend API: http://localhost:4001/api"
echo "Database: localhost:5437"
echo ""
echo "View logs with: docker compose logs -f"
echo "Stop with: docker compose down"
