#!/bin/bash

# Build script for Render deployment
set -e

echo "🚀 Starting Render build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations (only in production)
if [ "$NODE_ENV" = "production" ]; then
  echo "🗄️ Running database migrations..."
  npx prisma migrate deploy
fi

# Build the Next.js application
echo "🏗️ Building Next.js application..."
npm run build

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p /tmp/logs
mkdir -p /tmp/backups

echo "✅ Build completed successfully!"
