#!/bin/bash

# Recruiter Copilot Docker Deployment Script
# This script automates the Docker deployment process

set -e  # Exit on any error

echo "🚀 Starting Recruiter Copilot Docker Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed (as plugin)
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running. Please start Docker first."
    exit 1
fi

print_status "Docker and Docker Compose are available ✓"

# Check if .env file exists, if not create from docker.env
if [ ! -f .env ]; then
    if [ -f docker.env ]; then
        print_status "Creating .env file from docker.env template..."
        cp docker.env .env
        print_success ".env file created"
    else
        print_warning "No .env file found. Using default environment variables."
    fi
fi

# Stop any existing containers
print_status "Stopping any existing containers..."
docker compose down 2>/dev/null || true

# Remove old images (optional)
if [ "$1" = "--clean" ]; then
    print_status "Cleaning up old images..."
    docker compose down --rmi all --volumes --remove-orphans 2>/dev/null || true
    docker system prune -f
    print_success "Cleanup completed"
fi

# Build and start containers
print_status "Building and starting containers..."
docker compose up --build -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 10

# Check if services are running
print_status "Checking service status..."
if docker compose ps | grep -q "Up"; then
    print_success "Services are running!"
    
    # Display service information
    echo ""
    echo "📊 Service Status:"
    docker compose ps
    
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend: http://localhost"
    echo "   Backend API: http://localhost:3000"
    
    echo ""
    echo "📋 Useful Commands:"
    echo "   View logs: docker compose logs -f"
    echo "   Stop services: docker compose down"
    echo "   Restart services: docker compose restart"
    echo "   Check health: docker compose ps"
    
    echo ""
    print_success "Deployment completed successfully! 🎉"
    
else
    print_error "Some services failed to start. Check logs with: docker compose logs"
    exit 1
fi
